import { TableManager } from "db://assets/scripts/core/table/TableManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { FightType } from "../enum/FightType";
import { BattleSettingConfig } from "../interface/BattleSettingConfig";
import G from "../../../../core/comm/G";

export class BattleConfigManager {

    // 失败 spine
    private static _failResultSpineAssetPath: string = "";
    // 胜利 spine
    private static _winResultSpineAssetPath: string = "";
    private static _init: boolean = false;

    static init() {
        if (this._init) {
            return;
        }
        this._init = true;

        this._failResultSpineAssetPath = TableManager.getDataById(table.battle.BattleConstantConfig, "BATTLE:failResultSpineAssetPath").content || "";
        this._winResultSpineAssetPath = TableManager.getDataById(table.battle.BattleConstantConfig, "BATTLE:winResultSpineAssetPath").content || "";
    }

    static get failResultSpineAssetPath(): string {
        return this._failResultSpineAssetPath;
    }

    static get winResultSpineAssetPath(): string {
        return this._winResultSpineAssetPath;
    }

// 失败 spine
    static getFailResultSpineAssetPath(): string {
        return this._failResultSpineAssetPath;
    }

    // 胜利 spine
    static getWinResultSpineAssetPath(): string {
        return this._winResultSpineAssetPath;
    }

    /**
     * 获取战场首个怪物 config
     * @param battleConfigId
     */
    static getFirstMonsterAttributeConfig(battleConfigId: number): table.monster.MonsterAttributeConfig | null {

        let battleConfig = TableManager.getDataById(table.battle.BattleConfig, battleConfigId);
        if (!battleConfig) {
            return null;
        }
        let monsterResourceIds = battleConfig.monsterResourceIds as number[];
        if (ArrayUtils.isEmpty(monsterResourceIds)) {
            return null;
        }
        let monsterResourceId = monsterResourceIds[0];
        let monsterRC = TableManager.getDataById(table.battle.MonsterResourceConfig, monsterResourceId);

        if (!monsterRC) {
            return null;
        }
        let monsterId = monsterRC.monsterId;
        if (!monsterId) {
            return null;
        }
        return TableManager.getDataById(table.monster.MonsterAttributeConfig, monsterId);
    }

    /**
     * 获取战场收割怪物的半身像 asset path
     * @param battleConfigId
     */
    static getFirstMonsterHalfBodyAssetPath(battleConfigId: number): string | null {
        let config = this.getFirstMonsterAttributeConfig(battleConfigId);
        if (!config) {
            return null;
        }
        return config.halfBodyPath;
    }

    /**获取战斗配置数据*/
    static getBattleSettingConfig(fightType:FightType):BattleSettingConfig {
        let fightTypeStr:string = FightType[fightType];
        return this.getBattleSettingConfigByKey(fightTypeStr);
    }

     /**获取战斗配置数据*/
     static getBattleSettingConfigByKey(fightTypeStr:string):BattleSettingConfig {
        let cfg = G.TableManager.getDataById(table.battle.BattleSettingConfig, fightTypeStr);
        if (cfg) {
            return cfg;
        }
        let clientCfg = G.TableManager.getDataById(table.battle.BattleSettingClientConfig, fightTypeStr);
        if (clientCfg) {
            return clientCfg;
        }
        return null
    }
}