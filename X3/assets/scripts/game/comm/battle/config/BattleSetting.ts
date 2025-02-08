import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../enum/FightType";
import { BattleSettingConfig } from "../interface/BattleSettingConfig";
import { BattleConfigManager } from "./BattleConfigManager";

/**血量展示类型 */
export enum HpShowType {
    /**不展示 */
    NOT_SHOW = 0,
    /**全部单位 */
    TOTAL = 1,
    /**BOSS */
    BOSS = 2,
}

/**
 * @see table.battle.BattleSettingConfig
 * 当前战斗类型设置
 */
export default class BattleSetting {
    /**@see table.battle.BattleConfig.id (主线默认0)*/
    static cfg: BattleSettingConfig;

    static playingMethod: FightType;

    /**初始化类型 */
    static initByFightType(fightType: FightType) {
        this.playingMethod = fightType;
        this.cfg = BattleConfigManager.getBattleSettingConfig(fightType);

        if (!this.cfg) {
            this.cfg = TableManager.getDataById(table.battle.BattleSettingConfig, fightType < 0 ? "TRUNK_MAP" : "TRUNK_INSTANCE"); //默认模式
        }
    }

    /**该玩法是否动态创建单位*/
    static get isDynamicsCreate() {
        return !this.cfg?.isStaticCreate;
    }

    /**是否可以主动复活单位 （复活弹窗）*/
    static get isCanActiveRebirth() {
        return this.cfg?.isCanActiveRebirth;
    }

    /**是否显示战斗开始*/
    static get showBattleStart() {
        return this.cfg?.showBattleStart;
    }

    /**是否使用传送动画*/
    static get showTransferAnim() {
        return this.cfg?.showTransferAnim;
    }

    /** 是否是地图副本boss（副本boss的开启战斗是玩法中开启，不走通用） */
    static get isMapInstance() {
        return ServerEnums.FightType[this.cfg.fightType] == ServerEnums.FightType.MAP_INSTANCE;
    }

    /**是否可以时间复活单位 */
    static get isCanTimeRebirth() {
        return this.playingMethod == FightType.TRUNK_MAP;
    }

    /**攻方血条显示类型 */
    static get attackerHpShowType(): HpShowType {
        return HpShowType[this.cfg?.attackerHpShowType];
    }

    /**守方血条显示类型 */
    static get defenderHpShowType(): HpShowType {
        return HpShowType[this.cfg?.defenderHpShowType];
    }

    /***通过玩法获取是否显示传送动画 */
    static getShowTransferAnimByType(fightType: FightType): boolean {
        let cfg = BattleConfigManager.getBattleSettingConfig(fightType);; //默认模式
        return cfg?.showTransferAnim
    }

    /***通过玩法获取胜利界面的延迟时间 */
    static getResultWinDelayByType(fightType: FightType): number {
        let cfg = BattleConfigManager.getBattleSettingConfig(fightType);; //默认模式
        return cfg?.resultWinDelay || 0
    }

    /***通过玩法获取失败界面的延迟时间 */
    static getResultFailDelayByType(fightType: FightType): number {
        let cfg = BattleConfigManager.getBattleSettingConfig(fightType);; //默认模式
        return cfg?.resultFailDelay || 0
    }

    /***通过玩法获取是否能自动战斗 */
    static getIsAutoFightByType(fightType: FightType): boolean {
        let cfg = BattleConfigManager.getBattleSettingConfig(fightType);; //默认模式
        return cfg?.isAutoFight
    }

    /***通过玩法获取能跳过战斗的时间 */
    static getIsSkipBattleByType(fightType: FightType): number {
        let cfg = BattleConfigManager.getBattleSettingConfig(fightType);
        return cfg?.skipBattle
    }
}