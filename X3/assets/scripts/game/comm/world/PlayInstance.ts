
import G from "../../../core/comm/G";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { TableManager } from "../../../core/table/TableManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { UIBattleKeys } from "../../modules/battle/UIBattleKeys";
import { IBattleResult } from "../../modules/battle/vo/IBattleResult";
import { IBattleTeamData } from "../../modules/battle/vo/IBattleTeamData";
import { IBattleUnitData } from "../../modules/battle/vo/IBattleUnitData";
import { UICommonKey } from "../../modules/common/const/UICommonConfig";
import { BattleLogicManager } from "../battle/BattleLogicManager";
import { BattleUtils } from "../battle/BattleUtils";
import BattleSetting, { HpShowType } from "../battle/config/BattleSetting";
import { MonsterType, UnitType, WorldUnitTeam } from "../battle/enum/BattleEnum";
import HpStateUtils from "../battleEx/HpStateUtils";
import HpMonitor from "./HpMonitor";
import WorldInstance from "./WorldInstance";


/**玩法实例 */
export default class PlayInstance extends WorldInstance {
    protected monitors: HpMonitor[];
    /**清理敌方后不再创建小怪 */
    private _isCleanedDefender = false;

    protected onInitUnits() {
        this._isCleanedDefender = false;
        let heroes = this._battleData.attackerUnitDatas;
        this._unitProcessor.setFightType(this._playingMethod)
        this.battleLogic.randomMgr.setRandomSeed(this._battleData.randomSeed);
        this._unitProcessor.resetContainer();
        this._unitProcessor.loadTeam(WorldUnitTeam.Enemy);
        this._unitProcessor.loadTeam(WorldUnitTeam.Self);
        this._unitProcessor.createHeroes(WorldUnitTeam.Self, heroes);
        this._unitProcessor.createEnemyUnitsByBattleData(this._battleData.defenderUnitDatas);
        this._unitProcessor.loadSafeArea();
        this._unitProcessor.loadBlock();
        this.initPetUnits(true, WorldUnitTeam.Self, this._battleData.attackerPetUnitDatas)
        this.initPetUnits(false, WorldUnitTeam.Enemy, this._battleData.defenderPetUnitDatas)

        this.initTeamBattleData(this._battleData.attackerBattleTeamDatas, WorldUnitTeam.Self, true)
        this.initTeamBattleData(this._battleData.defenderBattleTeamDatas, WorldUnitTeam.Enemy, false)

        // BattleLogicManager.ins().get(this._playingMethod).initLeaderSkill(true, null, WorldUnitTeam.Self)
        // BattleLogicManager.ins().get(this._playingMethod).initCollectSkill(true, null, WorldUnitTeam.Self)
        // BattleManager.ins().initFormationSkill(this._battleData.attackerUnitDatas, TargetFaction.OurSide);
        // BattleManager.ins().initFormationSkill(this._battleData.defenderUnitDatas, TargetFaction.EnemySide);
        this.initSaveHp()

        this.initHp();
        this.battleLogic.stopFightAi();
        this.updateFormation()
    }

    private initTeamBattleData(battleTeamDatas: IBattleTeamData[], teamId: number, isinit: boolean): void {
        if (battleTeamDatas) {
            for (let i = 0; i < battleTeamDatas.length; i++) {
                if (battleTeamDatas[i].type == ServerEnums.UnitType.CAPTAIN) {
                    BattleLogicManager.ins().get(this._playingMethod).initLeaderSkill(isinit, battleTeamDatas[i].skillIds, teamId)
                }
                else if (battleTeamDatas[i].type == ServerEnums.UnitType.COLLECTIBLES) {
                    BattleLogicManager.ins().get(this._playingMethod).initCollectSkill(isinit, battleTeamDatas[i].skillIds, teamId)
                }
            }
        }
    }

    /***进入前的准备处理 */
    public battleReadyHandler() {
        if (this.isReadyEnter) {
            G.UIManager.open(UICommonKey.TouchMaskWin)
            GIns.cameraAnimUtils.moveCameraScreenToMapCamerPos()
            if (BattleSetting.showBattleStart)
                G.UIManager.open(UIBattleKeys.BattleStartView)
            else if (!BattleSetting.showTransferAnim) {
                //地图副本需要地图副本援助逻辑
                setTimeout(() => {
                    G.FacadeManager.emit(NotificationKey.BATTLE_START);
                }, 1500);
            }
        }
    }

    protected initHp() {
        let attackerHpShowType = BattleSetting.attackerHpShowType;
        let defenderHpShowType = BattleSetting.defenderHpShowType;

        this.monitors = [];

        if (attackerHpShowType != HpShowType.NOT_SHOW) {
            let hpMonitor = new HpMonitor(WorldUnitTeam.Self, attackerHpShowType, this._playingMethod);
            this.monitors.push(hpMonitor);
        }

        if (defenderHpShowType != HpShowType.NOT_SHOW) {
            let hpMonitor = new HpMonitor(WorldUnitTeam.Enemy, defenderHpShowType, this._playingMethod);
            this.monitors.push(hpMonitor);
        }

        if (!this.battleLogic.isNotShowBattleEffect())
            FacadeManager.ins().emit(NotificationKey.BATTLE_START_STATE, this._battleData);
    }

    private checkBossHp(arr: IBattleUnitData[]) {
        //boss血量模式 检测boss产生
        let ret = false;
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, data.configId); //data.monsterId
            if (cfg.monsterType == MonsterType.Boss) {
                ret = true;
                break;
            }
        }
        if (ret) {
            for (let j = 0; j < this.monitors.length; j++) {
                const monitor = this.monitors[j];
                monitor.update();
            }
        }
    }

    protected skipBattleComplete(): void {
        super.skipBattleComplete()
        this.checkHpChange(true)
    }

    /**过滤可以创建的小怪 */
    private filterCreateUnit(arr: IBattleUnitData[]) {
        if (this._isCleanedDefender) {
            //清理小怪后，只允许创建BOSS
            let tempArr = [];
            for (let i = 0; i < arr.length; i++) {
                const data = arr[i];
                let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, data.configId); //data.monsterId
                if (cfg?.monsterType == MonsterType.Boss) {
                    tempArr.push(data);
                }
            }

            return tempArr;
        }

        return arr;
    }

    /**创建单位 （其他玩法） */
    public createEnemyUnitsByPlay(arr: IBattleUnitData[]) {
        let tempArr = this.filterCreateUnit(arr);
        if (!tempArr?.length) return;

        this._unitProcessor.createEnemyUnitsByBattleData(arr);

        if (BattleSetting.defenderHpShowType === HpShowType.BOSS) {
            this.checkBossHp(arr);
        }
    }

    /**设置玩法结束时间 */
    setBattleEndTime(endTime: number) {
        this._battleData.endTime = endTime;
        this._battleData.endTimeFrame = BattleUtils.getFrameByTime(endTime - TimeManager.serverNow)
    }

    /**检测是否结束 */
    onCheckEnd() {
        if (this._isEnd) return;
        this.checkBattleEnd();
        this.checkTimeOut();
        if (!this._isEnd)
            this.checkHpChange();
    }

    /**发送单位死亡给后端 */
    sendDeadUids() {
        let deadUids = this.battleLogic.popDeadUids();
        if (deadUids?.length) {
            FacadeManager.ins().emit(NotificationKey.BATTLE_PLAY_UNIT_DEAD, [deadUids, this._battleData.battleConfigId]);
        }

        let deadDatas = this.battleLogic.popDeadUnitEventDatas();
        if (deadDatas?.length) {
            FacadeManager.ins().emit(NotificationKey.BATTLE_UNIT_DEAD_INFO, deadDatas);
        }

        let verifyUids = this.battleLogic.popVerifyUids();
        if (verifyUids?.length) {
            FacadeManager.ins().emit(NotificationKey.BATTLE_PLAY_UNIT_VERIFY, [verifyUids, this._battleData.battleConfigId]);
        }
    }

    /**检测攻方是否需要重生 */
    checkAttackerNeedRebirth() {
        if (!BattleSetting.isCanActiveRebirth || this._isWaitingActiveRebirth || this.battleLogic.battleSetting.isAttackerAllDeadTriggerResult) return;
        if (!this._unitProcessor.hasAlive(WorldUnitTeam.Self)) {
            //功方全部阵亡，发送复活
            this._isWaitingActiveRebirth = true;
            FacadeManager.ins().emit(NotificationKey.TEAM_DIE, this.playingMethod);
        }
    }

    /**检测战斗结束 */
    checkBattleEnd() {
        if (!this._unitProcessor.isDeadDirty) return;
        this._unitProcessor.isDeadDirty = false;

        this.sendDeadUids(); //必须在结算前

        this.checkAttackerNeedRebirth();

        if (this.battleLogic.battleSetting.isAttackerAllDeadTriggerResult && !this._unitProcessor.hasAlive(WorldUnitTeam.Self)) {
            this.onBattleEnd(ServerEnums.BattleResult.DEFENDER); //攻方全部阵亡，守方胜利
        } else if (this.battleLogic.battleSetting.isDefenderAllDeadTriggerResult && !this._unitProcessor.hasAlive(WorldUnitTeam.Enemy)) {
            this.onBattleEnd(ServerEnums.BattleResult.ATTACKER); //守方全部阵亡，攻方胜利
        } else if (this.battleLogic.battleSetting.isBossDeadTriggerResult && this.battleLogic.deadBossUid) {
            this.onBattleEnd(ServerEnums.BattleResult.ATTACKER); //BOSS阵亡，攻方胜利
        }
    }

    /**是否有存活单位 */
    public hasAlive(teamId: WorldUnitTeam) {
        return this._unitProcessor?.hasAlive(teamId);
    }

    /**检测时间结束 */
    checkTimeOut() {
        if (this._battleData.endTime > 0) {
            if (this._battleData.endTimeFrame <= 0)
                this.onBattleEnd(ServerEnums.BattleResult.MAX_TIME);
            else
                this._battleData.endTimeFrame--;
        }
        // if (this._battleData.endTime > 0 && this._battleData.endTime <= TimeManager.serverNow) {
        //     this.onBattleEnd(ServerEnums.BattleResult.MAX_TIME);
        // }
    }

    /**请求战斗结束,通常用于玩法主动结束1场战斗 */
    onBattleCheckEnd(isWin: boolean): void {
        this._unitProcessor.isDeadDirty = false;
        this.sendDeadUids(); //必须在结算前
        if (!isWin)
            this.onBattleEnd(ServerEnums.BattleResult.DEFENDER);
        else
            this.onBattleEnd(ServerEnums.BattleResult.ATTACKER);
    }

    /**战斗结束 */
    onBattleEnd(battleResult: ServerEnums.BattleResult) {
        let battleLogic = BattleLogicManager.ins().get(this._playingMethod)
        let easyLogMgr = battleLogic.easyLogManager;

        let result = {} as IBattleResult;
        result.battleConfigId = this._battleData.battleConfigId;
        result.fightType = this._playingMethod;
        result.battleResult = battleResult;
        let attackerSurplusHp = HpStateUtils.getCurHpByType(this._playingMethod, WorldUnitTeam.Self, HpShowType.TOTAL);
        let defenderSurplusHp = HpStateUtils.getCurHpByType(this._playingMethod, WorldUnitTeam.Enemy, HpShowType.TOTAL);

        result.attackerTotalHurt = easyLogMgr.getTotalHurt(WorldUnitTeam.Self);
        result.defenderTotalHurt = easyLogMgr.getTotalHurt(WorldUnitTeam.Enemy);
        result.attackerSurplusHp = attackerSurplusHp;
        result.defenderSurplusHp = defenderSurplusHp;

        result.attackerHpPercent = Math.ceil(attackerSurplusHp / HpStateUtils.getMaxHpByType(this._playingMethod, WorldUnitTeam.Self, HpShowType.TOTAL) * 100);
        result.defenderHpPercent = Math.ceil(defenderSurplusHp / HpStateUtils.getMaxHpByType(this._playingMethod, WorldUnitTeam.Enemy, HpShowType.TOTAL) * 100);

        if (battleLogic.maxHurtList.length >= 1)
            result.maxHurtList = battleLogic.maxHurtList.concat()

        //详细数据根据统计规则发送
        if (this.battleLogic.battleSetting.isUnitStatistics != 0) {
            result.attackerUnitStatisticsVos = easyLogMgr.getUnitStatistics(WorldUnitTeam.Self);
            for (let i = 0; i < result.attackerUnitStatisticsVos.length; i++) {
                let unit = battleLogic.getBatteUintByUid(result.attackerUnitStatisticsVos[i].unitId)
                if (unit)
                    result.attackerUnitStatisticsVos[i].surplusHp = unit.hp;
            }
        } else {
            result.attackerUnitStatisticsVos = [];
        }

        if (this.battleLogic.battleSetting.isUnitStatistics == 1) {
            result.defenderUnitStatisticsVos = easyLogMgr.getUnitStatistics(WorldUnitTeam.Enemy);
            for (let i = 0; i < result.defenderUnitStatisticsVos.length; i++) {
                let unit = battleLogic.getBatteUintByUid(result.defenderUnitStatisticsVos[i].unitId)
                if (unit)
                    result.defenderUnitStatisticsVos[i].surplusHp = unit.hp;
            }
        } else {
            result.defenderUnitStatisticsVos = [];
        }

        this.checkHpChange(true);
        result.isHideBattle = this.battleLogic.isHideBattle;

        this.battleLogic.isBattleEnd = true;
        FacadeManager.ins().emit(NotificationKey.BATTLE_END, result);
        this.battleLogic.stopFightAi()
        BattleLogicManager.ins().setAutoFight(this._playingMethod, false)
        easyLogMgr.stop()
        console.log("onBattleEnd  !!!!!!!!!!!!! ");

        this._isEnd = true;
    }

    formationChanged() {
    }

    heroAttrChanged(heroId: number) {
    }

    petSkillChanged(): void {
    }

    heroSkinChanged(heroId: number): void {
    }

    /**清理掉敌方单位 （boss 出现清理小怪时使用） */
    cleanDefenders() {
        this._isCleanedDefender = true;
        let units = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            unit.removeUnit();
            // unit.showUnit()?.dispose()
        }
    }

    private _count = 0;
    /**检测hp变化
     * @param 强制刷新
     */
    checkHpChange(force: boolean = false) {
        if (!force && ++this._count % 5) return;

        for (let i = 0; i < this.monitors.length; i++) {
            this.monitors[i].update();
        }
    }

}