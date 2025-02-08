import G from "../../../../core/comm/G"
import { Logger } from "../../../../core/log/Logger";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { ECollectiblesSkillTargetType } from "../const/UICollectionsConfig";

/**
 * 收藏品信息
 */
export class CollectionsVo implements Omit<XJ.collections.collectionsVo, "fragment"> {
    /**
     * 唯一Id
     */
    get id(): number {
        return this._vo.id;
    }

    /**
     * 基础配置Id
     */
    get baseId(): number {
        return this._vo.baseId;
    }

    /**
     * 是否激活
     */
    get active(): boolean {
        return this._vo.active
    }

    // /**
    //  * 碎片数量 碎片数量只在背包拿
    //  */
    // get fragment(): number {
    //     return this._vo.fragment;
    // }

    /**
     * 星级
     */
    get star(): number {
        return this._vo.star;
    }

    /**
     * 等级
     */
    get level(): number {
        return this._vo.level;
    }

    /**
     * 失效时间戳，>=0生效
     */
    get expiredTime(): number {
        return this._vo.expiredTime;
    }

    private _vo: XJ.collections.collectionsVo
    private _collectionCfg: table.collectibles.CollectiblesConfig

    private _collStarSkillCfg: Readonly<{
        star: number,   //技能解锁星级
        collskillEffCfgId: string //table.collectibles.CollectiblesSkillEffectConfig 表的id
    }>[];
    get collStarSkillCfg() {
        if (!this._collStarSkillCfg) {
            this._collStarSkillCfg = [];
            for (let s of this._collectionCfg.skillInfo.split(";")) {
                let strArr_star_skill = s.split(":");
                if (strArr_star_skill.length == 2) {
                    this._collStarSkillCfg.push({
                        star: strArr_star_skill[0].toInt(),
                        collskillEffCfgId: strArr_star_skill[1]
                    });
                }
            }
        }
        return this._collStarSkillCfg
    }

    constructor(vo: XJ.collections.collectionsVo) {
        this.updateVo(vo)
        this._collectionCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, this.baseId);
    }

    updateVo(vo: XJ.collections.collectionsVo) {
        this._vo = vo;
    }

    /**
     * 是否满星
     */
    isMaxStar() {
        return this.star >= GIns.collectionsCfgMgr.getMaxStar(this._collectionCfg.quality);

    }

    /**
     * 是否满级
     */
    isMaxLV() {
        return this.level >= GIns.collectionsCfgMgr.getMaxLV(this._collectionCfg.quality);
    }

    /**
     * 获取指定职业收藏品解锁的所有技能，包括上阵的收藏品技能跟拥有收藏品就就生效的技能
     * @param inBattle 是否上阵收藏品
     * @param targetType 技能作用对象
     * @param out_skill  输出参数，解锁的所有技能
     */
    getAllUnLockSkill(
        inBattle: boolean,
        targetType: ECollectiblesSkillTargetType,
        out_skill: Readonly<table.collectibles.CollectiblesSkillEffectConfig>[]
    ) {
        if (!out_skill) {
            out_skill = [];
        }
        //收藏品未激活
        if (this.active == false) return out_skill;

        let isTimeLimitColl = GIns.collectionsCfgMgr.isTimeLimitColl(this.baseId);
        if (isTimeLimitColl && GIns.collectionsModel.context.isValidTimeLimitCollection(this.baseId) == false) {
            //过期的限时收藏品
            return out_skill;
        }

        this.collStarSkillCfg.forEach(v => {
            if (
                v.star.toInt() <= this.star || //普通收藏品需要判断技能生效星级
                isTimeLimitColl //限时收藏品不需要判断技能生效星级
            ) {
                let skillEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, v.collskillEffCfgId);
                if (skillEffCfg) {
                    if (skillEffCfg.targetType != targetType) {
                        //生效目标不一致，判断下一个
                        return;
                    }

                    if (!skillEffCfg.inBattle) {
                        //不上阵就可以生效的技能
                        out_skill.push(skillEffCfg);
                    } else if (inBattle) {
                        //上阵生效技能
                        out_skill.push(skillEffCfg);
                    }
                } else {
                    Logger.error(`collectibles.CollectiblesSkillEffectConfig 表找不到id ${v.collskillEffCfgId}`);
                }
            }
        });

        return out_skill;
    }

    /**
     * 获取解锁的主动技能
     */
    getUnlockBattleSkill() {
        let unlockBattleSkills: string[] = []
        this.collStarSkillCfg.forEach(v => {
            if (this.star >= v.star) {
                let collSkillCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, v.collskillEffCfgId);
                if (collSkillCfg.inBattle) {
                    unlockBattleSkills.push(v.collskillEffCfgId);
                }
            }
        })
        return unlockBattleSkills;
    }
}