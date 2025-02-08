import { TableManager } from "db://assets/scripts/core/table/TableManager";
import G from "db://assets/scripts/core/comm/G";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";

export class CaptainSkillConfigManager {
    private static _skillIdToLvToConfigMap: Map<number, Map<number, table.captain.CaptainLevelConfig>>;



    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        // 初始化等级配置
        const allData = G.TableManager.getAllData(table.captain.CaptainLevelConfig);
        this._skillIdToLvToConfigMap = MapUtils.toLevel2Map(
            allData,
            it => it.captainSkillId,
            it => it.lv,
            (v1, v2) => v2
        )
        // console.info("战队技能. init", this._skillIdToLvToConfigMap)
    }


    /**
     * 技能项
     */
    static getCaptainSkillConfigArray(): table.captain.CaptainConfig[] {
        return TableManager.getAllData(table.captain.CaptainConfig);
    }

    /**
     * 获取技能等级配置
     * @param captainSkillId
     * @param lv
     */
    static getLvUpConfig(captainSkillId: number, lv: number): table.captain.CaptainLevelConfig {
        const lvToConfigMap = this._skillIdToLvToConfigMap.get(captainSkillId);
        if (!lvToConfigMap) {
            return null;
        }
        return lvToConfigMap.get(lv);
    }

    static getConfig(captainSkillId: number): table.captain.CaptainConfig {
        return TableManager.getDataById(table.captain.CaptainConfig, captainSkillId);
    }
}