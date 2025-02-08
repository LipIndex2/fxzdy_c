import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { BattleLogic } from "./BattleLogic";
import { BattleConfigManager } from "./config/BattleConfigManager";
import { FightType } from "./enum/FightType";
import { BattleSettingConfig } from "./interface/BattleSettingConfig";

/**结算触发点 */
enum ResultTriggerType {
    /**攻方全部死亡 */
    ATTACKER_ALL_DEAD = 1,
    /**守方全部死亡 */
    DEFENDER_ALL_DEAD = 2,
    /**BOSS死亡 */
    BOSS_DEAD = 3,
    /**玩法控制 */
    Play_Instance = 4,
}

export default class BattleSettingMgr {
    public cfg: BattleSettingConfig;
    public playingMethod: FightType;
    /**与后端交互 */
    private _handleMap: { [key: number]: boolean };
    /**结算触发点 */
    private _resultTriggerMap: { [key: number]: boolean };
    public battleLogic: BattleLogic;

    /**镜头停止跟随 */
    public isCameraStopFollow: boolean = false;

    /**初始化类型 */
    public constructor (fightType: FightType) {
        this.playingMethod = fightType;
        this._handleMap = {};
        this._resultTriggerMap = {};
        this.cfg = BattleConfigManager.getBattleSettingConfig(fightType);
        if (!this.cfg) {
            this.cfg = TableManager.getDataById(table.battle.BattleSettingConfig, fightType < 0 ? "TRUNK_MAP" : "TRUNK_INSTANCE"); //默认模式
        }

        if (this.cfg.handledClientBattleContentTypes) {
            for (let i = 0; i < this.cfg.handledClientBattleContentTypes.length; i++) {
                const key = this.cfg.handledClientBattleContentTypes[i];
                const type = ServerEnums.ClientBattleContentType[key];
                if (type) {
                    this._handleMap[type] = true;
                }
            }
        }

        if (this.cfg.resultTrigger) {
            for (let i = 0; i < this.cfg.resultTrigger.length; i++) {
                const key = this.cfg.resultTrigger[i];
                const type = ResultTriggerType[key];
                if (type) {
                    this._resultTriggerMap[type] = true;
                }
            }
        }
    }

    /**是否发送单位死亡 （后端）*/
    public get isSendUnitDead() {
        return !!this._handleMap[ServerEnums.ClientBattleContentType.UNIT_DEAD];
    }

    /**是否发送攻方单位死亡 */
    get isEventAttackerDead() {
        return !!this.cfg?.isEventAttackerDead;
    }

    /**是否发送防守方单位死亡 */
    get isEventDefenderDead() {
        return !!this.cfg?.isEventDefenderDead;
    }

    /**是否攻击方全部死亡触发结算 */
    get isAttackerAllDeadTriggerResult() {
        return !!this._resultTriggerMap[ResultTriggerType.ATTACKER_ALL_DEAD];
    }

    /**是否防守方全部死亡触发结算 */
    get isDefenderAllDeadTriggerResult() {
        return !!this._resultTriggerMap[ResultTriggerType.DEFENDER_ALL_DEAD];
    }

    /**是否BOSS死亡触发结算 */
    get isBossDeadTriggerResult() {
        return !!this._resultTriggerMap[ResultTriggerType.BOSS_DEAD];
    }

    /**是否玩法自己触发死亡 */
    get isPlayInstanceTriggerResult() {
        return !!this._resultTriggerMap[ResultTriggerType.Play_Instance];
    }

    /**是否需要玩法控制怪物掉落*/
    get isCtrlMonsterDrop() {
        return this.cfg?.isCtrlMonsterDrop;
    }

    /**是否1个竞技玩法 */
    get isPvpModel(): boolean {
        return this.cfg?.isPvpModel
    }

    /**是否忽略单位碰撞 */
    get isNotEnv(): boolean {
        return this.cfg?.isNotEnv
    }

    /**是否需要统计各单位数据 
     *  0,不统计
     *  1.统计全部
     *  2.只统计玩家
    */
    get isUnitStatistics(): number {
        return this.cfg?.isUnitStatistics;
    }

    /**TRUE-战斗初始化所有战斗单位,FALSE-通过请求战斗配置的资源点刷新单位 */
    get isStaticCreate(): Boolean {
        return this.cfg?.isStaticCreate;
    }

    /**是否需要统计召唤物的数据 */
    get isSummonStatistics(): Boolean {
        return this.cfg?.isSummonStatistics;
    }

    /**是否可以主动复活（仅前端） */
    get isCanActiveRebirth(): Boolean {
        return this.cfg?.isCanActiveRebirth;
    }

    /**是否隐藏摇杆 */
    get hideCtrlRocker(): boolean {
        return this.cfg?.hideCtrlRocker
    }

    /**是否锁定镜头 */
    get lockCamera(): boolean {
        return this.cfg?.lockCamera;
    }

    /**镜头停止跟随 */
    get cameraStopFollow(): boolean {
        return this.isCameraStopFollow;
    }

    /**是否无限仇恨 */
    get infiniteHate(): boolean {
        return this.cfg?.infiniteHate;
    }

    /**是否不缓存A星 */
    get notCacheAStar(): boolean {
        return this.cfg?.notCacheAStar;
    }

    /**闪现距离 */
    get flashDis(): number {
        return this.cfg?.flashDis;
    }

    /**闪现格子数 */
    get flashTile(): number {
        return this.cfg?.flashTile;
    }

    get winToClearDefHp(): boolean {
        return this.cfg?.winToClearDefHp;
    }

    /**是否保存攻击方血量 */
    get saveHp(): boolean {
        return this.cfg?.saveHp;
    }

    /**跳过战斗的时间 */
    get skipBattle(): number {
        return this.cfg?.skipBattle;
    }
}