import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EnumTabItemNameForClient } from "../../ui/main/const/EnumTabItemNameForClient";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ConditionManager } from "../condition/ConditionManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { UIFuilKey } from "../fuli/const/fuliConst";
import { ActivityFirstChargeVo } from "./model/ActivityFirstChargeVo";
import { ActivitySignInVo } from "./model/ActivitySignInVo";

/** 活动红点控制 */
export class ActivityRedDotController extends BaseController {
    /**七天登录活动id*/
    protected _signInId: number = 0;
    /**开服特惠活动id列表*/
    protected _openChargeIds: number[] = [];
    protected _openChargeConditionMap: Map<number, Array<Array<any>>> = new Map();
    /**活动id列表*/
    protected _entranceIds: number[] = [];
    protected _entranceCfg: table.activity.ActivityConstant.ActivityClientConfig[] = [];
    protected _entranceConditionMap: Map<number, Array<Array<any>>> = new Map();

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_RED_DOT_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_RED_DOT_CHANGE:
                // this.checkRedDotById(args);
                G.GameTimer.once(300, this, () => {
                    this.checkAllRedDots(args);
                });
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.initActivityIds();
                G.GameTimer.once(300, this, () => {
                    this.checkAllRedDots();
                });
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event);
        if (ok) {
            this.checkFristChargeRedDot();
        }
    }

    initActivityIds(): void {
        if (this._signInId == 0) {
            let cfgs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig);
            let signCfg = cfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.SIGN);
            if (signCfg) {
                this._signInId = signCfg?.activityIds[0];
            }
            this._openChargeIds.length = 0;
            this._entranceIds.length = 0;
            this._entranceCfg = [];
            let activityCfgs = G.TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
            activityCfgs.forEach((cfg) => {
                if (cfg.parentId == 31) {
                    this._openChargeIds.push(cfg.typeParam);
                    this._openChargeConditionMap.set(cfg.typeParam, cfg.conditionText);
                } else if (cfg.parentId == 23) {
                    if (cfg.UIView != UIFuilKey.worldBoss) {
                        //世界boss的红点 由世界boss自身处理
                        this._entranceIds.push(cfg.typeParam);
                        this._entranceCfg.push(cfg);
                        this._entranceConditionMap.set(cfg.typeParam, cfg.conditionText);
                    }
                } else if (cfg.parentId) {
                    this._entranceIds.push(cfg.typeParam);
                    this._entranceCfg.push(cfg);
                    this._entranceConditionMap.set(cfg.typeParam, cfg.conditionText);
                }
            });
        }
    }

    /**检测所有红点*/
    public checkAllRedDots(args?: any): void {
        if (args) {
            this.checkRedDotById(args);
        } else {
            this.checkSignInRedDot();
            this.checkOpenChargeRedDot();
            this.checkEntranceRedDot();
            this.checkFristChargeRedDot();
        }
    }

    /**七天登录红点*/
    protected checkSignInRedDot(): void {
        // let signVos = GIns.activityModel.getActivityVosByType(ServerEnums.ActivityType.SIGN) as ActivitySignInVo[];
        // // let showRed = false;
        // for (let vo of signVos) {
        //     const isHaveRedDot = vo.isShowRed();
        //     GIns.redDotMgr.setRedDot(RedDotKeys.Activity_signIn_reward, isHaveRedDot, [vo.activityClientCfg.parentId, vo.activityClientCfg.typeParam]);
        // }
    }

    /**开服优惠红点*/
    protected checkOpenChargeRedDot(): void {
        this._openChargeIds.forEach((id) => {
            this.checkOpenChargeRedDotForId(id);
        });
    }

    protected checkOpenChargeRedDotForId(activityId: number): void {
        let showRed = false;
        let vo = ActivityModel.ins().getActivityVoById(activityId) as BaseActivityVo;
        if (vo) {
            let condition = this._openChargeConditionMap.get(activityId);
            let isOpen = condition == null || ConditionManager.ins().checkCondition(condition);
            showRed = vo.isShowEntrance() && vo.isShowRed() && isOpen;
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Activity_openCharge_item, showRed, [activityId]);
    }

    /**活动入口红点*/
    protected checkEntranceRedDot(): void {
        this._entranceCfg.forEach((cfg) => {
            this.checkEntranceRedDotForId(cfg);
        });
    }

    protected checkEntranceRedDotForId(cfg: table.activity.ActivityConstant.ActivityClientConfig): void {
        let showRed = false;
        let vo = ActivityModel.ins().getActivityVoById(cfg.typeParam) as BaseActivityVo;
        let activityCfg = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, cfg.typeParam);
        if (vo) {
            let condition = this._entranceConditionMap.get(cfg.typeParam);
            let isOpen = condition == null || ConditionManager.ins().checkCondition(condition);

            //特殊情况的红点，比如一个活动分成好几个界面，每个界面又是单独入口的时候，要把红点分界面处理
            if (activityCfg.type == "CAREER_TRIAL") {
                showRed = vo.isShowEntrance() && vo.isShowRedOfUIView(cfg.UIView) && isOpen;
            } else {
                showRed = vo.isShowEntrance() && vo.isShowRed() && isOpen;
            }
        }
        if (activityCfg?.type == "CAREER_TRIAL") {
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_entrance_item, showRed, [cfg.parentId, cfg.typeParam + cfg.order]);
        } else {
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_entrance_item, showRed, [cfg.parentId, cfg.typeParam]);
        }
        if (ServerEnums.ActivityType[activityCfg?.type] == ServerEnums.ActivityType.HERO_SUPPLY) {
            //英雄补给 需要显示新
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_entrance_item_new, true, [cfg.parentId, cfg.typeParam]);
        }
    }

    protected checkFristChargeRedDot(): void {
        let vo: ActivityFirstChargeVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.FIRST_CHARGE) as ActivityFirstChargeVo;
        if (vo && vo.chargeCfgs) {
            let allCfg = vo.chargeCfgs;
            let tabs: string[] = allCfg.map((value) => value.id);
            let tabCnt: number = 0;
            for (let i = 0; i < allCfg.length; i++) {
                if (allCfg[i]) {
                    tabCnt++;
                    if (!vo.isFirstChargeById(Number(allCfg[i].id))) {
                        break;
                    }
                }
            }
            tabs.forEach((id) => {
                let awardListCfg = vo.getSceneCfgByType(id);
                let hasRedDot = false;
                awardListCfg?.forEach((value) => {
                    let hasItemRedDot = vo.isCanGetAwardById(value.id) == 1;
                    RedDotManager.ins().setRedDot(RedDotKeys.FirstCharge_item, hasItemRedDot, [value.id]);
                    hasRedDot = hasRedDot || hasItemRedDot;
                });
                RedDotManager.ins().setRedDot(RedDotKeys.FirstCharge_tab, hasRedDot && tabCnt > 1, [id]);
            });
        }
    }

    public checkRedDotById(activityId: number): void {
        if (activityId == this._signInId) {
            this.checkSignInRedDot();
            return;
        } else if (this._openChargeIds.indexOf(activityId) != -1) {
            this.checkOpenChargeRedDotForId(activityId);
            return;
        } else if (this._entranceIds.indexOf(activityId) != -1) {
            for (let cfg of this._entranceCfg) {
                if (cfg && cfg.typeParam == activityId) {
                    this.checkEntranceRedDotForId(cfg);
                }
            }
            return;
        }
        let vo = ActivityModel.ins().getActivityVoById(activityId);
        if (vo?.type == ServerEnums.ActivityType.FIRST_CHARGE) {
            this.checkFristChargeRedDot();
        }
    }
}
ActivityRedDotController.ins().doInit();
