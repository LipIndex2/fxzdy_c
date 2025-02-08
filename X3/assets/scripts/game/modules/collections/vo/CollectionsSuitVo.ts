import G from "../../../../core/comm/G";
import { Logger } from "../../../../core/log/Logger";
import GIns from "../../../GIns";
import { ECollectiblesSkillTargetType } from "../const/UICollectionsConfig";

/**
 * 收藏品套装信息
 */
export class CollectionsSuitVo implements XJ.collections.CollectionsSuitVo {
    /**
     * 套装配置Id
     */
    get suitId(): number {
        return this.vo.suitId;
    }

    /**
     * 是否激活
     */
    get activated(): boolean {
        return this.vo.activated;
    }

    /**
     * 当前激活星数
     */
    get activateStarNum(): number {
        return this.vo.activateStarNum;
    }

    /**
     * 获取套装星级数
     */
    get suitStar() {
        let star = 0
        GIns.collectionsCfgMgr.getSuit(this.suitId).forEach(n => {
            let collVo = GIns.collectionsModel.context.getCollectionById(n.id);
            if (collVo) {
                star += collVo.star;
            }
        })
        return star;
    }

    private vo: Vo.collectibles.CollectiblesSuitVo
    private suitCfg: table.collectibles.CollectiblesSuitConfig

    private _skillInfo: Readonly<{
        star: number,   //技能解锁星级
        collskillEffCfgId: string //table.collectibles.CollectiblesSkillEffectConfig 表的id
    }>[];
    get skillInfo() {
        if (!this._skillInfo) {
            this._skillInfo = [];
            for (let s of this.suitCfg.skillInfo.split(";")) {
                let strArr_star_skill = s.split(":");
                if (strArr_star_skill.length == 2) {
                    this._skillInfo.push({
                        star: strArr_star_skill[0].toInt(),
                        collskillEffCfgId: strArr_star_skill[1]
                    });
                }
            }
        }
        return this._skillInfo;
    }

    constructor(vo: Vo.collectibles.CollectiblesSuitVo) {
        this._updateSuitVo(vo);
        this.suitCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, this.suitId);
    }

    _updateSuitVo(vo: Vo.collectibles.CollectiblesSuitVo) {
        this.vo = vo;
    }

    /**
     * 套装效果是否激活/指定星级效果是否激活
     * @param star 如果为0的话，就是返回是否激活套装，其他的话就是指定星级是否激活星级效果,
     *             ！！！这个star是对应 CollectiblesSuitConfig 表配置的套装的所有 activeStar* 字段
     */
    isStarEffActived(star: number) {
        if (star == 0) {
            return this.vo.activated;
        }
        return this.vo.activateStarNum >= star;
    }

    /**
     * 指定套装是否满星激活
     */
    isSetMaxStarEff() {
        if (!this.vo.activated) return false;
        let suitAllStarEffs = GIns.collectionsCfgMgr.getSuitAllStarEffs(this.suitId);
        let activateStarNum = this.vo.activateStarNum;
        for (let i = 0; i < suitAllStarEffs.length; i++) {
            let suitEff = suitAllStarEffs[i];
            if (activateStarNum < suitEff.star) return false;
        }
        return true;
    }

    /**
     * 获取激活的星级效果
     */
    getAllActiveSuitStar(): number[] {
        let allActiveStar: number[] = [];
        let vo = this.vo;
        if (vo.activated) {
            allActiveStar.push(0);
        }
        let suitAllStarEffs = GIns.collectionsCfgMgr.getSuitAllStarEffs(this.suitId);
        let activateStarNum = this.vo.activateStarNum;
        suitAllStarEffs.forEach(v => {
            if (activateStarNum >= v.star) {
                allActiveStar.push(v.star);
            }
        });
        return allActiveStar;
    }

    /**
     * 获取所有生效的套装技能
     * @param targetType 技能作用对象
     * @param out_activedSkills 输出参数，解锁的所有技能
     */
    getAllActiveSkill(targetType: ECollectiblesSkillTargetType, out_activedSkills?: Readonly<table.collectibles.CollectiblesSkillEffectConfig>[]) {
        if (out_activedSkills == undefined) {
            out_activedSkills = [];
        }

        if (!this.suitCfg.skillInfo) return out_activedSkills;

        let suitStar = this.activateStarNum;
        this.skillInfo.forEach(v => {
            if (suitStar >= v.star) {
                let skillEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, v.collskillEffCfgId);
                if (skillEffCfg) {
                    if (skillEffCfg.targetType == targetType) {
                        out_activedSkills.push(skillEffCfg);
                    }
                } else {
                    Logger.error(`collectibles.CollectiblesSkillEffectConfig 表找不到id $v.collskillEffCfgId`);
                }
            }
        });

        return out_activedSkills
    }
}