import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { ActivityRushRankVo } from "../activity/model/ActivityRushRankVo";
import { UIActivityAutoPopConfig } from "./const/UIActivityAutoPopConfig";
import { ActivityAutoPopLocalData, ActivityAutoPopTodayLocalData } from "./model/vo/ActivityAutoPopLocalData";

const ACTIVITY_AUTO_POP_LOCAL_KEY = 'activity_auto_pop_local_key';

/**
 * 活动弹框数据管理
*/
export class ActivityAutoPopManager extends BaseController {
    /**计时器key值*/
    protected _timerKey: string = null;
    /**本地数据*/
    protected _localData: ActivityAutoPopLocalData = null;

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_NEW_DAY:
                this.initLocalData();
                break;
        }
    }

    /**本地记录key值*/
    protected get localKey(): string {
        let playerId: number = GIns.playerModel.playerId;
        return ACTIVITY_AUTO_POP_LOCAL_KEY + '_' + playerId;
    }

    /**将数据保存到本地*/
    protected saveDataToLocal(): void {
        LocalStorageUtils.set(this.localKey, this._localData);
    }

    /**banner本地存储唯一键值 弹框id不能作为键值存储*/
    protected getCfgLocalKey(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): string {
        if (cfg) {
            return cfg.activityId + '_' + cfg.popUpView;
        }
        return '';
    }

    /**初始化本地数据*/
    public initLocalData(): void {
        this._localData = LocalStorageUtils.get(this.localKey, ActivityAutoPopLocalData);
        let zeroTime: number = G.TimeManager.todayZero;
        if (this._localData == null) {
            this._localData = new ActivityAutoPopLocalData();
        }
        if (this._localData.todayData.todayZeroTime != zeroTime) {
            //跨天重置每日数据
            this._localData.todayData = new ActivityAutoPopTodayLocalData();
            this._localData.todayData.todayZeroTime = zeroTime;
        }
    }

    /**添加弹框记录*/
    public addTodayPopRecord(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): void {
        if (!this._localData.todayData.popIds) {
            this._localData.todayData.popIds = [];
        }
        let key: string = this.getCfgLocalKey(cfg);
        let needSave: boolean = false;
        if (cfg && key) {
            let index = this._localData.todayData.popIds.indexOf(cfg.id);
            if (index == -1) {
                this._localData.todayData.popIds.push(cfg.id);
                needSave = true;
            }
            if (cfg.popUpView == UIActivityAutoPopConfig.ActivityAutoPopRankSettleWin) {
                //结算弹框需要单独做永久记录
                let vo = GIns.activityModel.getActivityVoById(cfg.activityId) as ActivityRushRankVo;
                if (vo) {
                    this._localData.settleHistorys[vo.activityId] = { activityId: vo.activityId, period: vo.period, round: vo.getCurSettleRound(), popZeroTime: G.TimeManager.todayZero };
                    needSave = true;
                }
            }
        }
        if (needSave) {
            this.saveDataToLocal();
        }
    }

    /**活动结算是否已经弹出过*/
    public hasSettleHistory(activityId: number, period: number, round: number): boolean {
        if (this._localData?.settleHistorys && this._localData.settleHistorys[activityId]) {
            let data = this._localData.settleHistorys[activityId];
            return data.period >= period && round >= round;
        }
        return false;
    }

    /**今日是否已经弹出过*/
    public isPoppedToday(id: number): boolean {
        let index: number = this._localData.todayData?.popIds?.indexOf(id);
        if (index >= 0) {
            return true;
        }
        return false;
    }

    /**弹框配置是否相同*/
    public isEqualCfgs(cfgA: table.activity.ActivityConstant.ActivityAutoPopConfig, cfgB: table.activity.ActivityConstant.ActivityAutoPopConfig): boolean {
        if (this.getCfgLocalKey(cfgA) == this.getCfgLocalKey(cfgB)) {
            return true;
        }
        return false;
    }

    /**弹框配置是否相同*/
    public isEqualIds(idA: number, idB: number): boolean {
        let cfgA = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityAutoPopConfig, idA);
        let cfgB = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityAutoPopConfig, idB);
        return this.isEqualCfgs(cfgA, cfgB);
    }

    /**弹框配置是否相同*/
    public isEqualIdAndCfg(id: number, cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): boolean {
        let cfgForId = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityAutoPopConfig, id);
        return this.isEqualCfgs(cfgForId, cfg);
    }

    /**是否今日不在弹出banner*/
    public isNoPopToday(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): boolean {
        if (cfg && cfg.canPopOnceToday) {
            let key = this.getCfgLocalKey(cfg);
            if (this._localData.todayData.noPopTodayKeys.indexOf(key) != -1) {
                return true
            }
        }
        return false;
    }

    /**是否今日不在弹出banner*/
    public isNoPopTodayById(id: number): boolean {
        let cfg = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityAutoPopConfig, id);
        return this.isNoPopToday(cfg);
    }

    /**添加今日不在弹出记录*/
    public addNoTopTodayToLocal(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): void {
        let key = this.getCfgLocalKey(cfg);
        if (key && this._localData.todayData.noPopTodayKeys.indexOf(key) == -1) {
            this._localData.todayData.noPopTodayKeys.push(key);
            this.saveDataToLocal();
        }
    }

    /**添加今日不在弹出记录*/
    public addNoTopTodayToLocalById(id: number): void {
        let cfg = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityAutoPopConfig, id);
        this.addNoTopTodayToLocal(cfg);
    }
}

ActivityAutoPopManager.ins().doInit();