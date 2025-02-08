import BaseSingleton from "../../../../core/base/BaseSingleton";
import G from "../../../../core/comm/G";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { Logger } from "../../../../core/log/Logger";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleLogicManager } from "../../../comm/battle/BattleLogicManager";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BattleModel } from "../../battle/model/BattleModel";
import { FormationManager } from "../../formation/FormationManager";
import { FormationModel } from "../../formation/model/FormationModel";
import { FormationVo } from "../../formation/vo/FormationVo";
import { UIGameModeKeys } from "../../gameMode/UIGameModeKeys";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonUIKeys } from "../SeasonUIKeys";

/** 秘境 */
export class SecretSeasonManager extends BaseSingleton {
    /** 秘境阵容 */
    private _formation: FormationVo;
    /** 当前通关层数 */
    private _level: number = 0;
    /** 活动结算时间 */
    private _endTime: number;
    /** 当前秘境关卡死亡次数 */
    private _dieCount = 0;
    /** 当前秘境关卡第几次付费复活 */
    // private _payRebirth = 1;
    /** 排名 */
    private _rank = -1;
    /** 每层时间记录 */
    private _floorBattleSecondsMap: { [floor: number]: number } = {};
    /** 当前挑战的层 */
    private _challengeFloor: number;
    /** 当前秘境bossId */
    private _bossId: number;

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


    //登录下发
    public initData(data: Vo.seasonactivity.SeasonSecretVo) {
        if (!data) return;
        this.rank = -1;
        this.level = data.passFloor;
        //在vo设置
        // this.endTime = data.settleTime;
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
    }

    public get formation() {
        if (!this._formation) {
            if (FormationManager.ins().getFormationVoByType(FightType.SEASON_SECRET)) {
                this._formation = FormationManager.ins().getFormationVoByType(FightType.SEASON_SECRET);
            } else {
                this._formation = FormationManager.ins().getDefaultFormationVo().clone();
                FormationModel.ins().setUpFormation(FightType.SEASON_SECRET, this._formation.toSetUpReqVo());
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

        let floorCfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, floor);
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


    /**是否可以切换，next: 1：下一关，-1上一关*/
    public isCanSel(id: number, next: number) {
        let cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, id + next);
        return cfg;
    }

    /** 获取掉落池所有奖励列表 */
    public getAwardByPoolId(poolId: number): Array<{ k: any; v: any }> {
        let rewardCfg = TableManager.getDataById(table.reward.RewardDropConfig, poolId);
        return rewardCfg.rewards;
    }

    //刷新boss
    public updateBoss() {
        let logic = BattleLogicManager.ins().getNotCreate(FightType.SEASON_SECRET);
        if (logic) BattleModel.ins().sendLoadBattleMonster([SecretSeasonManager.ins().bossId], logic.battleConfigId);
    }

    /** 退出秘境(结算界面关闭时调用) */
    public quitSecret(): void {
        this.isEnter = false;
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        SecretSeasonManager.ins().challengeFloor = null;
        this._break = true;
        this.dieCount = 0;

    }

    /** 当前秘境的总积分 */
    public getAllMonsterScore() {
        let allScore = 0;
        let modulePlayInfo = GIns.battleMgr.mainScene.battleData.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
        let cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, modulePlayInfo.secretConfigId);
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
            let scoreCfg = TableManager.getDataById(table.seasonactivity.Constant.SeasonActivityConstantConfig , "SEASON_ACTIVITY:SECRET_MONSTER_TYPE_SCORE");
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
        return this._floorBattleSecondsMap[floor] || 0;
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


    /**今日已挑战次数 */
    private _dailyChallengeTimes:number = 0;
    public get dailyChallengeTimes():number{
        return this._dailyChallengeTimes;
    }

    public set dailyChallengeTimes(times){
        this._dailyChallengeTimes = times;
    }


    /**今日已购买挑战次数 */
    private _dailyBuyChallengeTimes = 0;
    public get dailyBuyChallengeTimes():number{
        return this._dailyBuyChallengeTimes;
    }

    public set dailyBuyChallengeTimes(times){
        this._dailyBuyChallengeTimes = times;
    }


    /**秘境每日挑战次数上限 */
    public get dailyChallengeTimesLimit():number{
        return +SeasonConfigManager.getConstValue('SEASON_ACTIVITY:SECRET_DAILY_CHALLENGE_TIMES_LIMIT');
    }


    /**秘境每日购买挑战次数上限 */
    public get dailyBuyChallengeTimesLimit():number{
        return +SeasonConfigManager.getConstValue('SEASON_ACTIVITY:SECRET_DAILY_BUY_CHALLENGE_TIMES_LIMIT');
    }

    /**秘境每日挑战奖励次数上限 */
    public get dailyChallengeRewardsLimit():number{
        return +SeasonConfigManager.getConstValue('SEASON_ACTIVITY:SECRET_CHALLENGE_REWARDS_LIMIT');
    }

}
