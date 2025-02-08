import G from "db://assets/scripts/core/comm/G";
import { TableConstUtils } from "../../../../core/utils/TableConstUtils";

export interface ICaptainFetterData {
    fetterId: number;
    captainId: number;
    captainLv: number;
}

export interface ICaptainLevelData {
    cfg: table.captain.CaptainLevelConfig
    totalCost: Map<number, { k: number, v: number }>;
}

export interface ICaptainFetterSkillData {
    passiveId: number;
    captainSkillId: number;
    captainId: number
    captainLv: number;
}

export class CaptainSkillUtils {

    private static _skillLvMap: Map<string, ICaptainLevelData> = new Map();
    protected static _fetterMap: Map<number, ICaptainFetterData> = new Map();
    protected static _skillFettersMap: Map<number, ICaptainFetterData[]> = new Map();
    protected static _skillFetterSkillsMap: Map<number, ICaptainFetterSkillData[]> = new Map();
    protected static _headerItemIds: number[] = [];

    protected static _unlockBuildingId: number;
    protected static _resetCdMinutes: number;
    protected static _notFirstResetCosts: { k: number, v: number }[];
    protected static _showUnlockSkillCnt: number = 3;
    protected static _coreHeaderItemIds: number[] = [];

    /**初始化*/
    static onInit(): void {
        if (this._skillLvMap.size <= 0) {
            //静态配置解析
            this._unlockBuildingId = TableConstUtils.getConstConfigToNumber(table.captain.CaptainConstantConfig, 'CAPTAIN:BUILDING_CONFIG_ID');
            this._resetCdMinutes = TableConstUtils.getConstConfigToNumber(table.captain.CaptainConstantConfig, 'CAPTAIN:RESET_CD_MINUTES');
            this._notFirstResetCosts = TableConstUtils.getConstConfigToKV(table.captain.CaptainConstantConfig, 'CAPTAIN:NOT_FIRST_RESET_COSTS');
            this._showUnlockSkillCnt = TableConstUtils.getConstConfigToNumber(table.captain.CaptainConstantConfig, 'CAPTAIN:SHOW_UNLOCK_SKILL_CNT');
            this._coreHeaderItemIds = TableConstUtils.getConstConfigToNumberArray(table.captain.CaptainConstantConfig, 'CAPTAIN:CORE_HEADER_ITEM_IDS');

            //等级配置解析
            let allCfgs = G.TableManager.getAllData(table.captain.CaptainLevelConfig);
            allCfgs.forEach((cfg) => {
                //计算等级配置和累计消耗
                let key = this.getLvKey(cfg.captainSkillId, cfg.lv);
                let lastTotalCost: Map<number, { k: number, v: number }> = null;
                if (cfg.lv > 0) {
                    //不是等级0就需要加上上一级的总消耗
                    let lastKey: string = this.getLvKey(cfg.captainSkillId, cfg.lv - 1);
                    if (this._skillLvMap.has(lastKey)) {
                        lastTotalCost = this._skillLvMap.get(lastKey).totalCost;
                    }
                }
                let totalCost: Map<number, { k: number, v: number }> = new Map();
                cfg.costItems?.forEach((value) => {
                    totalCost.set(value.k, { k: value.k, v: value.v });
                    if (this._headerItemIds.indexOf(value.k) == -1) {
                        this._headerItemIds.push(value.k);
                    }
                })
                if (lastTotalCost && lastTotalCost.size > 0) {
                    lastTotalCost.forEach((value) => {
                        if (totalCost.has(value.k)) {
                            totalCost.get(value.k).v += value.v;
                        } else {
                            totalCost.set(value.k, { k: value.k, v: value.v });
                        }
                    })
                }
                let data: ICaptainLevelData = {
                    cfg: cfg,
                    totalCost: totalCost
                }
                this._skillLvMap.set(key, data);

                //计算触发羁绊配置
                cfg.activeFetterIds?.forEach((fetterId: number) => {
                    if (this._fetterMap.has(fetterId)) {
                        let data = this._fetterMap.get(fetterId);
                        if (data.captainId == cfg.captainSkillId && data.captainLv > cfg.lv) {
                            data.captainLv = cfg.lv;
                        }
                    } else {
                        let data: ICaptainFetterData = {
                            fetterId: fetterId,
                            captainId: cfg.captainSkillId,
                            captainLv: cfg.lv
                        }
                        this._fetterMap.set(fetterId, data);

                        let arr = null;
                        if (this._skillFettersMap.has(cfg.captainSkillId)) {
                            arr = this._skillFettersMap.get(cfg.captainSkillId);
                        } else {
                            arr = [];
                            this._skillFettersMap.set(cfg.captainSkillId, arr)
                        }
                        arr.push(data);
                    }
                })
            })
            this._skillFettersMap?.forEach((list, key) => {
                //按照等级从小到大排序
                list.sort((a, b) => {
                    return a.captainLv - b.captainLv;
                })
                let arr: ICaptainFetterSkillData[] = []
                this._skillFetterSkillsMap.set(key, arr)
                list.forEach((value) => {
                    //计算出具体的技能配置
                    let cfg = G.TableManager.getDataById(table.formation.FormationGroupConfig, value.fetterId);
                    if (cfg) {
                        if (cfg.passiveId) {
                            let data: ICaptainFetterSkillData = {
                                passiveId: cfg.passiveId,
                                captainSkillId: 0,
                                captainId: value.captainId,
                                captainLv: value.captainLv,
                            }
                            arr.push(data)
                        }
                        if (cfg.captainSkillId) {
                            let data: ICaptainFetterSkillData = {
                                passiveId: 0,
                                captainSkillId: cfg.captainSkillId,
                                captainId: value.captainId,
                                captainLv: value.captainLv,
                            }
                            arr.push(data)
                        }
                    }
                })
            })
            //消耗道具id排序
            this._headerItemIds.sort((a, b) => {
                return a - b;
            })
        }
    }

    /**获取羁绊限制*/
    static getFetterData(fetterId: number): ICaptainFetterData {
        if (this._fetterMap.has(fetterId)) {
            return this._fetterMap.get(fetterId);
        }
        return null;
    }

    /**解锁建筑*/
    static getUnlockBuildingId(): number {
        return this._unlockBuildingId;
    }

    /**重置cd(分钟)*/
    static getResetCdMinutes(): number {
        return this._resetCdMinutes
    }

    /**非首次重置消耗*/
    static getNotFirstResetCosts(): { k: number, v: number }[] {
        return this._notFirstResetCosts
    }

    /**展示未解锁技能条数*/
    static getShowUnlockSkillCnt(): number {
        return this._showUnlockSkillCnt;
    }

    static getLvKey(id: number, lv: number): string {
        return id + '_' + lv;
    }

    /**获取头部道具id列表*/
    static getHeaderItemIds(): number[] {
        return this._headerItemIds;
    }

    /**获取核心头部道具id列表*/
    static getCoreHeaderItemIds(): number[] {
        return this._coreHeaderItemIds;
    }

    /**
     * 技能项
     */
    static getCaptainSkillConfigArray(): table.captain.CaptainConfig[] {
        return G.TableManager.getAllData(table.captain.CaptainConfig);
    }

    /**
     * 获取技能配置
     * @param skillId
     */
    static getCaptainSkillConfig(skillId: number): table.captain.CaptainConfig {
        return G.TableManager.getDataById(table.captain.CaptainConfig, skillId);
    }

    /**从0开始的技能总消耗*/
    static getCaptainSkillTotalCostFromZero(captainSkillId: number, toLv: number): Map<number, { k: number, v: number }> {
        let key = this.getLvKey(captainSkillId, toLv);
        if (this._skillLvMap.has(key)) {
            return this._skillLvMap.get(key)?.totalCost;
        }
        return new Map();
    }

    /**获取技能等级总消耗*/
    static getCaptainSkillTotalCostMap(captainSkillId: number, toLv: number, fromLv: number = 0): Map<number, { k: number, v: number }> {
        if (fromLv <= 0) {
            return this.getCaptainSkillTotalCostFromZero(captainSkillId, toLv);
        }
        let totalCostMap: Map<number, { k: number, v: number }> = new Map();
        let fromTotalCost: Map<number, { k: number, v: number }> = this.getCaptainSkillTotalCostFromZero(captainSkillId, fromLv);
        let toTotalCost: Map<number, { k: number, v: number }> = this.getCaptainSkillTotalCostFromZero(captainSkillId, toLv);
        toTotalCost.forEach((value) => {
            let addValue: number = value.v;
            if (fromTotalCost.has(value.k)) {
                addValue -= fromTotalCost.get(value.k).v;
            }
            if (totalCostMap.has(value.k)) {
                totalCostMap.get(value.k).v += addValue;
            } else {
                totalCostMap.set(value.k, { k: value.k, v: addValue });
            }
        })
        return totalCostMap;
    }

    /**
     * 获取技能等级配置
     * @param captainSkillId
     * @param lv
     */
    static getCaptainSkillLvConfigByIdAndLv(captainSkillId: number, lv: number): table.captain.CaptainLevelConfig {
        let key = this.getLvKey(captainSkillId, lv);
        if (this._skillLvMap.has(key)) {
            return this._skillLvMap.get(key).cfg;
        }
        return null;
    }

    /**获取战队科技技能特效列表*/
    static getCaptainSkillEffects(captainSkillId: number): ICaptainFetterSkillData[] {
        if (this._skillFetterSkillsMap.has(captainSkillId)) {
            return this, this._skillFetterSkillsMap.get(captainSkillId);
        }
        return [];
    }

    /**
     * 获取技能id, 有技能变化的等级配置
     */
    static getLvUpConfigWithSkillArrayByCaptainSkillId(captainSkillId: number): table.captain.CaptainLevelConfig[] {
        return [];
        // lazy load
        // CaptainSkillUtils.initLevelConfigCacheLazy();
        // const lvToConfigMap = this._skillIdToLvToConfigMap.get(captainSkillId);
        // if (!lvToConfigMap) {
        //     return [];
        // }
        // // 有技能变化的等级配置
        // return Array.from(lvToConfigMap.values())
        //     .filter(it => {
        //         const desc = I18nManager.ins().translateOrBlank(it.desc);
        //         return StringUtils.isNotBlank(desc);
        //     });
    }

    /**
     * 是否满级
     * @param skillId 技能id
     * @param lv 等级
     */
    static isMaxLv(skillId: number, lv: number) {
        // 没有下一级 = 满级
        const lvConfig = this.getCaptainSkillLvConfigByIdAndLv(skillId, lv + 1);
        return !lvConfig;
    }
}