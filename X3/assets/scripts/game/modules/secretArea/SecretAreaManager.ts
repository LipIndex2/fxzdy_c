import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { LogBusiness } from "../../../core/log/LogBusiness";
import { Logger } from "../../../core/log/Logger";
import { TableManager } from "../../../core/table/TableManager";
import { StringUtils } from "../../../core/utils/StringUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { BattleLogicManager } from "../../comm/battle/BattleLogicManager";
import { BattleManager } from "../../comm/battle/BattleManager";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { BattleModel } from "../battle/model/BattleModel";
import { FormationManager } from "../formation/FormationManager";
import { FormationModel } from "../formation/model/FormationModel";
import { FormationVo } from "../formation/vo/FormationVo";
import { UIGameModeKeys } from "../gameMode/UIGameModeKeys";
import { SecretAreaConfigManager } from "./config/SecretAreaConfigManager";
import { UISecretAreaKey } from "./const/UISecretAreaConfig";

/** 秘境 */
export class SecretAreaManager extends BaseSingleton {
    /** 秘境阵容 */
    private _formation: FormationVo;
    /** 当前通关层数 */
    private _level: number = 0;
    /** 活动结算时间 */
    private _endTime: number;
    /** 当前秘境关卡死亡次数 */
    private _dieCount = 0;
    /** 当前秘境关卡第几次付费复活 */
    private _payRebirth = 1;
    /** 排名 */
    private _rank;
    /** 每层时间记录 */
    private _floorBattleSecondsMap: { [floor: number]: number } = {};
    /** 当前挑战的层 */
    private _challengeFloor: number;
    /** 当前秘境bossId */
    private _bossId: number;

    /** boss出现 */
    bossAppear = false;

    private _isEnter = false;
    private _showUnlockAni = false;
    /** 是否返回秘境界面 */
    public _break = false;

    /** 战斗开始的时间 */
    // public fightStartTime: number;

    /** 每日门票 */
    protected _dailyCostItem: NoOwnerItem = null;
    /** 额外门票 */
    protected _extraCostItem: NoOwnerItem = null;

    private _lastCheckUnlock: boolean

    /**广告刷新次数*/
    public todaySweepAdvertTimes:number = 0;


    //登录下发
    public initData(data: Vo.secretinstance.SecretInstancePlayInfo) {
        if (!data) return;
        this.rank = data.rank;
        this.level = data.passFloor;
        this.endTime = data.settleTime;
        this.showUnlockAni = false
        this._lastCheckUnlock = undefined;

        GIns.secretAreaMgr.checkShowUnlockAni({ initData: true });
    }

    /** 当前通关层数 */
    public set level(level: number) {
        this._level = level;
    }
    public get level(): number {
        return this._level;
    }

    /** 当前挑战的层 */
    public set challengeFloor(v: number) {
        this._challengeFloor = v;
    }
    public get challengeFloor(): number {
        return this._challengeFloor;
    }

    /** 是否成功进入秘境 */
    public set isEnter(v: boolean) {
        this._isEnter = v;
    }
    public get isEnter() {
        return this._isEnter;
    }

    /** 播放解锁动画 */

    public set showUnlockAni(v: boolean) {
        this._showUnlockAni = v;
    }
    public get showUnlockAni() {
        return this._showUnlockAni;
    }

    /** 当前秘境关卡死亡次数 */
    public set dieCount(v: number) {
        this._dieCount = v;
    }
    public get dieCount() {
        return this._dieCount;
    }

    /** 当前秘境关卡支付复活次数 */
    public set payRebirth(v: number) {
        this._payRebirth = v;
    }
    public get payRebirth(): number {
        return this._payRebirth;
    }

    /** 当前排名 */
    public set rank(v: number) {
        this._rank = v;
    }
    public get rank(): number {
        return this._rank;
    }

    /** 当前秘境bossId */
    public set bossId(v: number) {
        this._bossId = v;
    }
    public get bossId(): number {
        return this._bossId;
    }

    /** 秘境阵容 */
    public set formation(vo: FormationVo) {
        this._formation = vo;

        // FormationModel.ins().setUpFormation(FightType.SECRET_INSTANCE, this._formation.toSetUpReqVo())
    }
    public get formation() {
        if (!this._formation) {
            if (FormationManager.ins().getFormationVoByType(FightType.SECRET_INSTANCE)) {
                this._formation = FormationManager.ins().getFormationVoByType(FightType.SECRET_INSTANCE);
            } else {
                this._formation = FormationManager.ins().getDefaultFormationVo().clone();
                FormationModel.ins().setUpFormation(FightType.SECRET_INSTANCE, this._formation.toSetUpReqVo());
            }
        }
        return this._formation;
    }

    /** 结算时间 */
    public set endTime(time: number) {
        this._endTime = time;
    }
    public get endTime(): number {
        return this._endTime;
    }

    /** 每日门票 */
    public get dailyCostItem(): Readonly<NoOwnerItem> {
        if (this._dailyCostItem == null) {
            let itemId = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:CHALLENGE_ITEM_ID").content;
            let itemCost = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:CHALLENGE_ITEM_COST_AMOUNT").content;
            this._dailyCostItem = NoOwnerItem.create(Number(itemId), Number(itemCost));
        }
        return this._dailyCostItem;
    }
    /** 额外门票 */
    public get extraCostItem(): Readonly<NoOwnerItem> {
        if (this._extraCostItem == null) {
            let itemId = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:CHALLENGE_EXTRA_ITEM_ID").content;
            let itemCost = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:CHALLENGE_ITEM_COST_AMOUNT").content;
            this._extraCostItem = NoOwnerItem.create(Number(itemId), Number(itemCost));
        }
        return this._extraCostItem
    }


    /** 是否通关指定关卡 */
    public isPassFloor(floor: number) {
        if (floor <= this.level) {
            return true;
        }

        return false;
    }

    /** 获取关卡锁定状态 */
    public getFloorIsLock(floor: number) {
        if (floor > this.level + 1) {
            //未通关上一关卡
            return true;
        }

        let floorCfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, floor);
        if (!floorCfg) {
            return true;
        }
        let lv = GIns.formationMgr.getCommonLevel();
        if (floorCfg && lv < floorCfg.level) {
            //共鸣等级未达到
            return true;
        }

        return false
    }

    /** 活动是否结束 */
    public isActivityEnd() {
        return this.endTime - G.TimeManager.serverNow < 0;
    }

    /**是否可以切换，next: 1：下一关，-1上一关*/
    public isCanSel(id: number, next: number) {
        let cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, id + next);
        return cfg;
    }

    /** 获取掉落池所有奖励列表 */
    public getAwardByPoolId(poolId: number): Array<{ k: any; v: any }> {
        let rewardCfg = TableManager.getDataById(table.reward.RewardDropConfig, poolId);
        return rewardCfg.rewards;
    }

    //刷新boss
    public updateBoss() {
        let logic = BattleLogicManager.ins().getNotCreate(FightType.SECRET_INSTANCE);
        if (logic) BattleModel.ins().sendLoadBattleMonster([SecretAreaManager.ins().bossId], logic.battleConfigId);
    }

    /** 退出秘境(结算界面关闭时调用) */
    public quitSecret(): void {
        SecretAreaManager.ins().isEnter = false;
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        G.UIManager.close(UISecretAreaKey.SecretAreaBattleView);

        // if (isCancel)
        //     G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
        // if (isCancel) {
        //     G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
        // } else {
        //     G.FacadeManager.emit(NotificationKey.EXIT_BATTLE);
        // }

        SecretAreaManager.ins().challengeFloor = null;
        this._break = true;
        this.dieCount = 0;
        G.FacadeManager.emit(NotificationKey.SECRET_AREA_CHALLENGE_UPDATE);
    }

    /** 当前秘境的总积分 */
    public getAllMonsterScore() {
        let allScore = 0;
        let modulePlayInfo = GIns.battleMgr.mainScene.battleData.modulePlayInfo as Vo.secretinstance.SecretInstanceBattleInfo;
        let cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, modulePlayInfo.instanceConfigId);
        if (cfg) {
            allScore = cfg.summonBossNeedScore;
        }
        return allScore;
    }
    /** 获取单个怪物的积分 */
    public getScoreByMonsterId(id: number) {
        let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, id);
        return this.getScoreByType(cfg.monsterType);
    }
    //怪物积分
    private _scoreMap: { [type: string]: number } = {};
    private getScoreByType(type: string) {
        if (!this._scoreMap[type]) {
            let scoreCfg = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:MONSTER_TYPE_SCORE");
            let strs = scoreCfg.content;
            strs = strs.replace(/[-_!|~`()#$%^&*{};"<>?]/g, "");
            let strArr = strs.split(",");

            for (let str of strArr) {
                let arr = str.split(":");
                let type = StringUtils.repBlank(arr[0]);
                let num = StringUtils.repBlank(arr[1]);
                this._scoreMap[type] = +num;
            }
        }
        return this._scoreMap[type] || 0;
    }

    /** 初始化记录map */
    public setFloorBattleSecondsMap(v: any) {
        this._floorBattleSecondsMap = v;
    }

    public getSecondsByFloor(floor: number) {
        return this._floorBattleSecondsMap[floor] || 9999;
    }

    public setSecondsByFloor(key: number, value: number) {
        this._floorBattleSecondsMap[key] = value;
    }

    /** 判断是否显示解锁动画 */
    @LogBusiness("判断是否显示解锁动画")
    public checkShowUnlockAni(param: XJ.SecretArea.IUnlockAniParam) {
        let curUnlock: boolean, level = this.level;
        if (!this.isCanSel(level, 1)) {
            //已到最大层级
            return
        }
        curUnlock = !this.getFloorIsLock(level + 1);
        if (param.newFloor) {
            if (curUnlock) {
                //通关上一难度，并且下一难度也是解锁的，播放解锁动画
                GIns.secretAreaMgr.showUnlockAni = true;
            }
        } else if (param.commonLV) {
            //共鸣等级变化导致解锁难度的，播放解锁动画
            if (this._lastCheckUnlock === false && curUnlock) {
                GIns.secretAreaMgr.showUnlockAni = true;
            }
        }

        Logger.game("秘境判断播放解锁动画", this._lastCheckUnlock, curUnlock, GIns.secretAreaMgr.showUnlockAni);
        this._lastCheckUnlock = curUnlock;
    }

    /**层数是否可扫荡*/
    public isLevelCanSweep(level: number): boolean {
        let isPassFloor = GIns.secretAreaMgr.isPassFloor(level);
        if (isPassFloor) {
            let passTime = GIns.secretAreaMgr.getSecondsByFloor(level);
            if (passTime <= SecretAreaConfigManager.sweepOpenMaxSeconds) {
                return true;
            }
        }
        return false;
    }

    /**是否有可扫荡的层数*/
    public hasCanSweepLevel():boolean {
        return this.hasCanSweepForRange(1, this.level);
    }

    /**某个区间的层级是否可扫荡*/
    public hasCanSweepForRange(minLevel:number, maxLevel:number):boolean {
        let result:boolean = false;
        for (let i = minLevel; i <= maxLevel; i++) {
            if (this.isLevelCanSweep(i)) {
                result = true;
                break;
            }
        }
        return result;
    }
}
