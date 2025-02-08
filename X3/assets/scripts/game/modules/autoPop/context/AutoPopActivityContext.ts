import LoginNotificationKey from "db://assets/scripts/main/modules/LoginNotificationKey";
import G from "../../../../core/comm/G";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { ActivityController } from "../../activity/ActivityController";
import { ActivityAutoPopEvent } from "../../activityAutoPop/const/ActivityAutoPopConfig";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { AutoPopBaseContext } from "./AutoPopBaseContext";

/** 活动自动弹框 */
export class AutoPopActivityContext extends AutoPopBaseContext {
    protected _curPlayerId: number = 0;
    /**是否初始化了登录数据*/
    protected _isInitLogin: boolean = false;
    /**根据弹出时机分类所有配置*/
    protected _cfgForEventMap: Map<ActivityAutoPopEvent, table.activity.ActivityConstant.ActivityAutoPopConfig[]> = new Map();
    /**等待弹出的配置*/
    protected _waitPopCfgs: table.activity.ActivityConstant.ActivityAutoPopConfig[] = [];

    protected _loginOpenMap: Map<number, boolean> = new Map();

    protected _localAutoPopData: Object = {};
    protected _localBannerPopOnceData: Object = {};

    listenNotifications(): string[] {
        return [
            // 解锁
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.TEAM_DIE_BACK,
            NotificationKey.BATTLE_RESULT,
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.ACTIVITY_STUFF_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.initCfgs();
                //玩家id变化才代表登录 过滤断线重连
                this.initLocalData();
                this._curPlayerId = GIns.playerModel.playerId;
                this._isInitLogin = false;
                if (this._curPlayerId != GIns.playerModel.playerId) {
                    //清除等待弹框数据
                    this._waitPopCfgs.length = 0;
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                this.onActivityUpdate(args);
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                if (this._isInitLogin == false) {
                    //INIT_PLAYER_INFO_COMPLETE后活动信息尚未返回 所以在ACTIVITY_REQUEST_BACK中处理登录初始化
                    this._isInitLogin = true;
                    this.onLoginHandler();
                } else {
                    this.onActivityUpdate();
                }
                break;
            case NotificationKey.TEAM_DIE_BACK:
                this.onTeamDieBackHandler(args);
                break;
            case NotificationKey.BATTLE_RESULT:
                this.onBattleResultHandler(args);
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.popNextForEnterWorld();
                break;
            case NotificationKey.ACTIVITY_STUFF_UPDATE:
                this.onActivityStuffUpdate(args);
                break;
        }
        if (event != NotificationKey.ACTIVITY_REQUEST_BACK) {
            const ok = ConditionUtils.isNeedHandleForUnlock(event);
            if (ok && this._isInitLogin == true) {
                this.onActivityUpdate();
            }
        }
    }

    /**初始化配置表*/
    protected initCfgs(): void {
        if (this._cfgForEventMap.size <= 0) {
            //初始化配置列表
            let allCfgs = G.TableManager.getAllData(table.activity.ActivityConstant.ActivityAutoPopConfig);
            allCfgs?.forEach((cfg) => {
                let arr = null;
                cfg.popEvent
                let type = ActivityAutoPopEvent[cfg.popEvent];
                if (this._cfgForEventMap.has(type)) {
                    arr = this._cfgForEventMap.get(type);
                } else {
                    arr = [];
                    this._cfgForEventMap.set(type, arr);
                }
                arr.push(cfg);
            });
        }
    }

    /**初始化本地数据*/
    protected initLocalData(): void {
        GIns.activityAutoPopMgr.initLocalData();
    }

    /**登录完成处理*/
    protected onLoginHandler(): void {
        //记录登录时后开启的活动
        let activitys = GIns.activityModel.getAllVos();
        this._loginOpenMap.clear();
        activitys.forEach((vo) => {
            this._loginOpenMap.set(vo.activityId, ActivityController.ins().isActivityUnlock(vo.activityId));
        });

        this.checkPopForType(ActivityAutoPopEvent.LOGIN);
    }

    /**活动更新处理*/
    protected onActivityUpdate(activityId: number = 0): void {
        if (activityId > 0) {
            //刷新当个活动
            this.checkOneActivityOpen(activityId);
        } else {
            let activitys = GIns.activityModel.getAllVos();
            activitys.forEach((vo) => {
                this.checkOneActivityOpen(vo.activityId);
            });
        }
    }

    protected checkOneActivityOpen(activityId: number): void {
        if (this._loginOpenMap.has(activityId) == false || this._loginOpenMap.get(activityId) == false) {
            //代表活动开启了
            let isUnlock: boolean = ActivityController.ins().isActivityUnlock(activityId);
            this._loginOpenMap.set(activityId, isUnlock);
            if (isUnlock) {
                //活动开启
                this.checkPopForType(ActivityAutoPopEvent.ACTIVITY_OPEN, activityId);
            }
        }
    }

    protected popUIByCfg(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): boolean {
        if (ActivityController.ins().isActivityUnlock(cfg.activityId) == false) {
            //弹框有延时性 所以这里要再次判断活动是否开启
            return false;
        }
        if (GIns.activityAutoPopMgr.isNoPopToday(cfg)) {
            //今日不在弹出
            return false;
        }
        if (GIns.conditionMgr.checkCondition(cfg.conditions) == false) {
            //弹框有延时性 所以这里要再次判断活动的条件
            return false;
        }
        //弹框配置优先级最高
        if (cfg.popUpView) {
            /**弹框 默认参数cfg*/
            G.UIManager.open(cfg.popUpView, cfg.popUpParam ? cfg.popUpParam : cfg);
            this.popUIComplete(cfg);
            return true;
        }
        //最后跳活动
        let result = GIns.jumpManager.jumpByActivityId(cfg.activityId, true);
        if (result) {
            this.popUIComplete(cfg);
        }
        return result;
    }

    protected popUIComplete(cfg: table.activity.ActivityConstant.ActivityAutoPopConfig): void {
        GIns.activityAutoPopMgr.addTodayPopRecord(cfg);
        if (this._waitPopCfgs.length > 0) {
            let arr = this._waitPopCfgs.concat();
            arr.forEach((value) => {
                if (GIns.activityAutoPopMgr.isEqualCfgs(value, cfg)) {
                    //弹框后 去除同类型的
                    let index = this._waitPopCfgs.indexOf(value);
                    if (index != -1) {
                        this._waitPopCfgs.splice(index, 1);
                    }
                }
            })
        }
    }

    /**进入新场景 判断战斗成功或失败弹框*/
    protected popNextForEnterWorld(): boolean {
        if (this._waitPopCfgs.length > 0) {
            //找到战斗失败或者胜利需要弹出的配置
            let index: number = this._waitPopCfgs.findIndex((cfg) => {
                let type = ActivityAutoPopEvent[cfg.popEvent];
                if (type == ActivityAutoPopEvent.BATTLE_WIN || type == ActivityAutoPopEvent.BATTLE_FAIL) {
                    return true;
                }
                return false;
            });
            if (index != -1) {
                let cfg = this._waitPopCfgs[index];
                this._waitPopCfgs.splice(index, 1);
                if (cfg) {
                    return this.popUIByCfg(cfg);
                }
            }
        }
        return false;
    }

    /**根据类型检测弹框*/
    protected checkPopForType(type: ActivityAutoPopEvent, activityId: number = 0, popEventParam: string = null): void {
        if (this._cfgForEventMap.has(type)) {
            let cfgs = this._cfgForEventMap.get(type);
            cfgs?.forEach((cfg) => {
                if (activityId && cfg.activityId != activityId) {
                    //活动id不匹配
                    return;
                }
                if (cfg.popEventParam && cfg.popEventParam != popEventParam) {
                    //参数不匹配
                    return;
                }
                if (GIns.activityAutoPopMgr.isNoPopToday(cfg)) {
                    //今日不在弹出
                    return;
                }
                if (ActivityController.ins().isActivityUnlock(cfg.activityId) == false) {
                    //活动未开启
                    return;
                }
                if (GIns.conditionMgr.checkCondition(cfg.conditions)) {
                    //满足条件
                    let index = this._waitPopCfgs.findIndex((value) => value.id == cfg.id);
                    if (index == -1) {
                        //不在等待队列中
                        this._waitPopCfgs.push(cfg);
                        this._waitPopCfgs.sort((a, b) => {
                            return a.sort - b.sort;
                        })
                        this.onAutoPopDataChange();
                    }
                }
            })
        }
    }


    /**队伍死亡返回主城检测*/
    protected onTeamDieBackHandler(fightType: FightType): void {
        this.checkPopForType(ActivityAutoPopEvent.TEAM_DIE_BACK, 0, FightType[fightType]);
    }

    /**战斗完成后检测*/
    protected onBattleResultHandler(vo: IBattleResultVo): void {
        if (vo.isWin) {
            this.checkPopForType(ActivityAutoPopEvent.BATTLE_WIN, 0, FightType[vo.fightType]);
        } else {
            this.checkPopForType(ActivityAutoPopEvent.BATTLE_FAIL, 0, FightType[vo.fightType]);
        }
    }

    protected onActivityStuffUpdate(args: Vo.activity.ActivityStuffVo): void {
        if (args.key == 'SETTLE') {
            //结算推送
            this.checkPopForType(ActivityAutoPopEvent.ACTIVITY_SETTLE, args.activityId);
        }
    }

    public checkPopNext(): boolean {
        let result: boolean = false;
        if (this._waitPopCfgs.length > 0) {
            //只打开主界面
            if (G.UIManager.isUiTop(UIMainKey.MAIN_PAGE)) {
                while (this._waitPopCfgs.length > 0) {
                    let cfg = this._waitPopCfgs.shift();
                    let isPop: boolean = this.popUIByCfg(cfg);
                    if (isPop) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    }
}
