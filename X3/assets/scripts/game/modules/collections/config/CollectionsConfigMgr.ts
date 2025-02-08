import { DEBUG } from "cc/env";
import BaseSingleton from "../../../../core/base/BaseSingleton";
import G from "../../../../core/comm/G";
import { Logger } from "../../../../core/log/Logger";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import GIns from "db://assets/scripts/game/GIns";
import { ECollectiblesSkillTargetType } from "../const/UICollectionsConfig";

declare global {
    namespace XJ {
        namespace collections {
            interface IAccuEff {
                one?: AttrConfigEffect  //单阶段属性
                max?: AttrConfigEffect  //满阶段属性
                cur?: AttrConfigEffect  //当前阶段属性
            }
        }
    }
}

interface IInBattleSkillInfo {
    id: string //table.collectibles.CollectiblesSkillEffectConfig 表的id
    unlockStar: number //解锁星级
    cfgInfo: Readonly<table.collectibles.CollectiblesSkillEffectConfig>
}


let hasInitSuitCfg = false

/** 收藏品据管理 */
export class CollectionsConfigMgr extends BaseSingleton {
    //key CollectiblesSuitConfig.id
    private suitId2SuitSetCfg: Map<number, table.collectibles.CollectiblesConfig[]>;
    private cacheAllSuitStarAttrs: Record<number, Readonly<XJ.collections.ISetStarEff>[]> = {};

    private _quality2LVCfgs: Map<number, table.collectibles.CollectiblesLevelConfig[]>;
    private _quality2LV2Cfgs: Map<number, Map<number, table.collectibles.CollectiblesLevelConfig>> = new Map();

    private _quality2StarCfgs: Map<number, table.collectibles.CollectiblesStarConfig[]>;
    private _quality2Star2Cfgs: Map<number, Map<number, table.collectibles.CollectiblesStarConfig>> = new Map();

    /** 所有收藏品配置，key：收藏品id */
    private _allCollectionsCfg: Map<number, table.collectibles.CollectiblesConfig>
    /** key 收藏品碎片id，value 收藏品id */
    private _collFragementId2CollId: Map<number, number>

    /**收藏品技能描述缓存 避免每次都去读取*/
    protected _collSkillDesMap: Map<string, string> = new Map();

    protected _lvCostIds: number[]

    get allCollectionsCfg() {
        return this._allCollectionsCfg;
    }

    get collFragementId2CollId() {
        return this._collFragementId2CollId;
    }

    get lvCostIds(): Readonly<number>[] {
        if (!this._lvCostIds) {
            let idSet = new Set<number>();
            G.TableManager.getAllData(table.collectibles.CollectiblesLevelConfig).forEach(v => {
                idSet.add(v.costItems[0].k);
            })
            this._lvCostIds = Array.from(idSet.keys());
        }
        return this._lvCostIds;
    }

    protected onInit() {
        this._allCollectionsCfg = new Map();
        this._collFragementId2CollId = new Map();
        G.TableManager.getAllData(table.collectibles.CollectiblesConfig).forEach(n => {
            this._collFragementId2CollId.set(n.fragmentItemId, n.id);
            this._allCollectionsCfg.set(n.id, n);
        });
    }

    protected get quality2LVCfgs() {
        if (!this._quality2LVCfgs) {
            this._quality2LVCfgs = G.TableManager.getAllData(table.collectibles.CollectiblesLevelConfig).toDataStream().groupBy(n => {
                return n.quality;
            });
            this.quality2LVCfgs.forEach(v => {
                v.sort((a, b) => {
                    return a.level - b.level;
                });
            })
        }
        return this._quality2LVCfgs;
    }

    protected get quality2StarCfgs() {
        if (!this._quality2StarCfgs) {
            this._quality2StarCfgs = G.TableManager.getAllData(table.collectibles.CollectiblesStarConfig).toDataStream().groupBy(n => {
                return n.quality;
            });
            this.quality2StarCfgs.forEach(v => {
                v.sort((a, b) => {
                    return a.star - b.star;
                });
            })

        }
        return this._quality2StarCfgs;

    }

    /**
     * 获取指定套装配置
     * @param suitId
     */
    getSuit(suitId: number): Readonly<Readonly<table.collectibles.CollectiblesConfig>[]> {
        if (hasInitSuitCfg == false) {
            this._initSuitCfg();
            hasInitSuitCfg = true;
        }

        return this.suitId2SuitSetCfg.get(suitId);
    }

    /**
     * 获取指定套装的收藏品id
     * @param suitId
     */
    getSuitCollectionsId(suitId: number) {
        return this.getSuit(suitId).map(a => {
            return a.suitId;
        });
    }

    /**
     * 获取指定套装所有星级效果
     * @param suitId
     * @return 返回从低星到高星按顺序的套装效果
     */
    getSuitAllStarEffs(suitId: number): Readonly<Readonly<XJ.collections.ISetStarEff>[]> {
        let starEffs = this.cacheAllSuitStarAttrs[suitId];
        if (!starEffs) {
            let suitCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, suitId);

            //星级解锁属性
            starEffs = [];
            if (suitCfg.activeStar1) {
                starEffs.push({
                    star: suitCfg.activeStar1,
                    starAttrs: suitCfg.starAttrs1,
                });
            }
            if (suitCfg.activeStar2) {
                starEffs.push({
                    star: suitCfg.activeStar2,
                    starAttrs: suitCfg.starAttrs2,
                });
            }
            if (suitCfg.activeStar3) {
                starEffs.push({
                    star: suitCfg.activeStar3,
                    starAttrs: suitCfg.starAttrs3,
                });
            }

            //星级解锁技能
            let star_skills: Map<string, string[]> = new Map();
            suitCfg.skillInfo.split(";").forEach(v => {
                if (!v) return;
                let star_skill = v.split(":");
                if (star_skill.length != 2) return;

                let skills = star_skills.get(star_skill[0]);
                if (!skills) {
                    skills = [];
                    star_skills.set(star_skill[0], skills);
                }
                skills.push(star_skill[1]);
            });
            star_skills.forEach((skills, star) => {
                starEffs.push({
                    star: star.toInt(),
                    unlockSkills: skills,
                });
            })

            starEffs.sort((a, b) => {
                return a.star - b.star
            });

            this.cacheAllSuitStarAttrs[suitId] = starEffs;
        }
        return starEffs;
    }

    /**
     * 收藏品满级数值
     * @param quality
     */
    getMaxLV(quality: number) {
        let cfgs = this.quality2LVCfgs.get(quality);
        if (!cfgs) return 0;
        let maxLV = cfgs[cfgs.length - 1].level;
        return maxLV;
    }

    /**
     * 收藏品满星数值
     * @param quality
     */
    getMaxStar(quality: number) {
        let cfgs = this.quality2StarCfgs.get(quality);
        if (!cfgs) return 0;
        let maxStar = cfgs[cfgs.length - 1].star;
        return maxStar;
    }

    /**
     * 获取收藏品主动技能信息
     * @param collectionCfgId
     */
    getBattleSkill(collectionCfgId: number): IInBattleSkillInfo | null {
        let collCfg = this._allCollectionsCfg.get(collectionCfgId);
        for (let str of collCfg.skillInfo.split(";")) {
            if (!str) return;
            let arr_star_skill = str.split(":");
            if (arr_star_skill.length != 2) return
            let collSkillEffCfgId = arr_star_skill[1];
            let collSkillEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, collSkillEffCfgId);
            if (collSkillEffCfg.inBattle) {
                return {
                    id: collSkillEffCfgId,
                    unlockStar: arr_star_skill[0].toInt(),
                    cfgInfo: collSkillEffCfg,
                }
            }
        }
        return null;
    }

    /**
     * 获取指定品质指定等级的数据
     * @param quality
     * @param level
     */
    getLVCfg(quality: number, level: number) {
        let LV2Cfgs = this._quality2LV2Cfgs.get(quality);
        if (!LV2Cfgs) {
            LV2Cfgs = new Map();
            this._quality2LV2Cfgs.set(quality, LV2Cfgs);
        }

        let cfg = LV2Cfgs.get(level);
        if (cfg !== undefined) return cfg;

        cfg = this.quality2LVCfgs.get(quality).find(v => {
            return v.level == level;
        });
        LV2Cfgs.set(level, cfg);
        return cfg;
    }

    /**
     * 获取指定品质指定星级的数据
     * @param quality
     * @param star
     */
    getStarCfg(quality: number, star: number) {
        let star2Cfgs = this._quality2Star2Cfgs.get(quality);
        if (!star2Cfgs) {
            star2Cfgs = new Map();
            this._quality2Star2Cfgs.set(quality, star2Cfgs);
        }

        let cfg = star2Cfgs.get(star);
        if (cfg !== undefined) return cfg;

        cfg = this._quality2StarCfgs.get(quality).find(v => {
            return v.star == star
        });
        star2Cfgs.set(star, cfg);
        return cfg;
    }

    getEffTypeDesc(strEffectType: keyof typeof ServerEnums.CollectiblesEffectType | string, effDesc: string) {
        if (strEffectType === "" || strEffectType === "ALL") {
            //没配置的话就是全体
            return `全体${effDesc}`;
        }
        let CollectiblesEffectType = ServerEnums.CollectiblesEffectType;
        let effectType = CollectiblesEffectType[strEffectType];
        switch (effectType) {
            case CollectiblesEffectType.TANK:
                return `守护${effDesc}`;
            case CollectiblesEffectType.FIGHTER:
                return `格斗${effDesc}`;
            case CollectiblesEffectType.MAGE:
                return `异能${effDesc}`;
            case CollectiblesEffectType.MARKSMAN:
                return `射击${effDesc}`;
            case CollectiblesEffectType.RIDER:
                return `重骑${effDesc}`;
            case CollectiblesEffectType.SUPPORT:
                return `辅助${effDesc}`;
            case CollectiblesEffectType.MELEE:
                return `近战${effDesc}`;
            case CollectiblesEffectType.RANGED:
                return `远程${effDesc}`;
        }
    }

    /**
     * 获取基础效果描述
     * @param collectionCfgId
     * @param level
     */
    getBaseEffDesc(collectionCfgId: number, level: number): string {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        let baseEffs = this.getBaseEffs(collectionCfgId, level);
        let effDesc = baseEffs.map(baseEff => {
            return `${baseEff.config.attrName} ${baseEff.getShowValueTextWithSymbol()}`;
        }).join(",");
        return this.getEffTypeDesc(collCfg.effectType, effDesc);
    }

    getBaseEffs(collectionCfgId: number, level: number): AttrConfigEffect[] {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);

        let allBaseAttrs: { k: number, v: number }[];
        if (collCfg.growAttrs) {
            allBaseAttrs = collCfg.growAttrs.map(v => {
                return { k: v.k, v: v.v * level };
            }).concat(collCfg.baseAttrs);
        } else {
            allBaseAttrs = collCfg.baseAttrs;
        }

        return AttrUtils.parseKvArrayToAttrArray(allBaseAttrs);
    }

    /**
     * 获取额外效果描述
     * @param collectionCfgId
     */
    getExtraEffDesc(collectionCfgId: number) {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        let dec1 = "";
        let star = GIns.collectionsModel.context.getCollectionStar(collectionCfgId);
        let extraEffKV =  this.getExtraEff(collectionCfgId, star);

        if (extraEffKV) {
            let attCfgEff = AttrUtils.parseKvArrayToAttrArray(extraEffKV);
            dec1 = attCfgEff.map(v => {
                return `${v.config.attrName} ${v.getShowValueTextWithSymbol()}`;
            }).join(",");
            if (collCfg.extraEffectType) {
                dec1 = this.getEffTypeDesc(collCfg.extraEffectType, dec1);
            }
        }
        return dec1;
    }

    getExtraEff(collectionCfgId: number, star: number) {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        if (collCfg.extraAttrs) { //不配置的话就没这个属性显示
            let allExtraAttrs: Readonly<{ k: any, v: any }>[];
            if (collCfg.starAttrs) {
                //有星级属性就基础属性 + 星级属性 * 星级
                allExtraAttrs = collCfg.starAttrs.map(v => {
                    return {
                        k: v.k,
                        v: v.v * star
                    }
                }).concat(collCfg.extraAttrs);
            } else {
                //无星级属性就只返回基础属性
                allExtraAttrs = collCfg.extraAttrs;
            }
            return allExtraAttrs
        }
        return null;
    }

    /**
     * 获得累积特性描述
     * @param taskAttrCfgId table.collectibles.CollectiblesTaskAttrConfig 表的id
     * @param star
     */
    getAccuEffDesc(taskAttrCfgId: number, star: number) {
        // ${key0}\n当前生效${key1}/${key2},合计加成${key3}
        if (!taskAttrCfgId) return "";
        let collTaskCfg = G.TableManager.getDataById(table.collectibles.CollectiblesTaskAttrConfig, taskAttrCfgId);
        if (!collTaskCfg) {
            Logger.error(`collectibles.CollectiblesTaskAttrConfig 表找不到收藏品的累积特性 id：${taskAttrCfgId}`);
            return "";
        }
        let curProgress = GIns.collectionsModel.context.getTaskProgress(taskAttrCfgId)
        let maxProgress = collTaskCfg.validLimit;

        let ae: XJ.collections.IAccuEff = {
            one: null,
            cur: null
        }
        this.getCollAccuEff(taskAttrCfgId, star, ae);

        if (ae.one) {
            let effDesc = `${ae.one.config.attrName}: ${ae.one.getShowValueTextWithSymbol()}`
            let curAccuDesc = `${ae.cur.config.attrName}: ${ae.cur.getShowValueTextWithSymbol()}`

            let content = G.I18nManager.lang(collTaskCfg.desc, effDesc, collTaskCfg.progress);
            if (DEBUG) {
                if (content == "i18nNotFound") {
                    Logger.error(`collectibles.CollectiblesTaskAttrConfig id: ${taskAttrCfgId}, 没配置 desc 字段`)
                }
            }

            return `${content}\n当前生效${curProgress}/${maxProgress},合计加成[color=#66FF66]${curAccuDesc}[/color]`
        }

        return "";
    }

    /**
     * 获取收藏品阶段累加属性
     * @param taskAttrCfgId
     * @param star
     * @param out_accuEff
     */
    getCollAccuEff(taskAttrCfgId: number, star: number, out_accuEff: XJ.collections.IAccuEff) {
        //当前星级下累累加特效加成的属性
        let collTaskCfg = G.TableManager.getDataById(table.collectibles.CollectiblesTaskAttrConfig, taskAttrCfgId);
        if (!collTaskCfg || !collTaskCfg.growAttrs || !collTaskCfg.baseAttrs) return out_accuEff;

        let curAccuAttr = collTaskCfg.growAttrs.map(v => {
            return { k: v.k, v: v.v * star };
        }).concat(collTaskCfg.baseAttrs);

        if ("one" in out_accuEff) {
            out_accuEff.one = AttrUtils.parseKvArrayToAttrArray(curAccuAttr)[0];
        }
        if ("max" in out_accuEff) {
            out_accuEff.max = AttrUtils.parseKvArrayToAttrArray(curAccuAttr)[0];
            out_accuEff.max.value *= collTaskCfg.validLimit;
        }
        if ("cur" in out_accuEff) {
            out_accuEff.cur = AttrUtils.parseKvArrayToAttrArray(curAccuAttr)[0];
            let curProgress = GIns.collectionsModel.context.getTaskProgress(taskAttrCfgId);
            out_accuEff.cur.value *= Math.min(curProgress, collTaskCfg.validLimit)
        }
        return out_accuEff;
    }

    /**
     * 收藏品指定星级下，有解锁技能的话，获取技能
     * @param collectionCfgId
     * @param star
     * @return 返回null表示没有解锁技能，返回 collectibles.CollectiblesSkillEffectConfig 表的id
     */
    getCollUnlockSkill(collectionCfgId: number, star: number) {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        for (let s of collCfg.skillInfo.split(";")) {
            let strArr_star_skill = s.split(":");
            if (strArr_star_skill.length == 2) {
                if (strArr_star_skill[0].toInt() == star) {
                    return strArr_star_skill[1];
                }
            }
        }
        return null
    }

    //regoin 判断
    /**
     * 是否限时道具
     * @param collectionCfgId
     */
    isTimeLimitColl(collectionCfgId: number) {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        return collCfg.validHours > 0;
    }

    private _initSuitCfg() {
        if (!this.suitId2SuitSetCfg) {
            this.suitId2SuitSetCfg = G.TableManager.getAllData(table.collectibles.CollectiblesConfig)
                .toDataStream()
                .groupBy(a => {
                    return a.suitId;
                });
        }
    }

    /**获取技能描述*/
    public getSkillDesByEffectId(effectId: string): string {
        if (this._collSkillDesMap.has(effectId)) {
            return this._collSkillDesMap.get(effectId);
        }
        let desc: string = ''
        let skillEffectCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, effectId);
        if (skillEffectCfg) {
            if (skillEffectCfg.targetType == ECollectiblesSkillTargetType.HERO) {
                //读技能表
                let skillCfg = G.TableManager.getDataById(table.battle.SkillConfig, skillEffectCfg.skillId);
                desc = skillCfg ? skillCfg.desc : '';
            } else if (skillEffectCfg.targetType == ECollectiblesSkillTargetType.COLLECTIBLES) {
                let collSkillCfg = G.TableManager.getDataById(table.battle.CollectionSkillConfig, skillEffectCfg.skillId);
                desc = collSkillCfg ? G.I18nManager.lang(collSkillCfg.desc) : '';
            }
        }
        this._collSkillDesMap.set(effectId, desc);
        return desc;
    }
}