import G from "../../../core/comm/G";
import FGUIManager from "../../../core/fgui/FGUIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { ActivityConfigManager } from "../../comm/activity/config/ActivityConfigManager";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EnumTabItemNameForClient } from "../../ui/main/const/EnumTabItemNameForClient";
import { ConditionManager } from "../condition/ConditionManager";
import { BattlePassAwardItem1 } from "./battlePass/item/BattlePassAwardItem1";
import { FirstChargeAwardItem } from "./firstcharge/item/FirstChargeAwardItem";
import { AwardItem } from "./giveHero/item/AwardItem";
import { ActivityTotalChargeDayVo } from "./model/ActivityTotalChargeDayVo";
import { RookieSaleItem } from "./rookieSale/item/RookieSaleItem";
import { RookieSaleSpeItem } from "./rookieSale/item/RookieSaleSpeItem";
import { TotalChargeItem } from "./totalCharge/item/TotalChargeItem";

export interface IActivityEnterCfg {
    mainCfg: table.mainpage.MainPageTabItemConfig;
    clientCfg: table.activity.ActivityConstant.ActivityClientConfig;
}

/** 累天充值状态 */
export enum ETotalChargeDayState {
    lock = 0, //锁定
    notFinish = 1, //前往
    draw = 2, //领取
    hasDraw = 3, //已领取
}

/** 活动 */
export class ActivityController extends BaseController {
    listNotificationInterests(): string[] {
        return [NotificationKey.CLOSE_GET_NEW_HERO_VIEW];
    }

    handleNotification(name: string, args?: any): void {
        switch (name) {
            case NotificationKey.CLOSE_GET_NEW_HERO_VIEW:
                ActivityModel.ins().showGetHeroAnim();
                break;
        }
    }

    onInit(): void {
        // 首充
        FGUIManager.ins().bindScript("ui://activityFirstCharge/FirstChargeAwardItem", FirstChargeAwardItem);

        //签到送英雄
        FGUIManager.ins().bindScript("ui://activityGiveHero/AwardItem", AwardItem);

        //开服累充
        FGUIManager.ins().bindScript("ui://activityTotalCharge/TotalChargeItem", TotalChargeItem);

        //新手特惠
        FGUIManager.ins().bindScript("ui://activityRookieSale/RookieSaleItem", RookieSaleItem);
        FGUIManager.ins().bindScript("ui://activityRookieSale/RookieSaleSpeItem", RookieSaleSpeItem);

        //通行证
        FGUIManager.ins().bindScript("ui://activityBattlePass/BattlePassAwardItem1", BattlePassAwardItem1);
    }

    /**获取累天充值配置 */
    getTotalChargeDayViewCfgs(activityId: number) {
        let cfgs = TableManager.getAllData(table.activity.TotalChargeDay.TotalChargeDayConfig);
        return cfgs.filter((cfg) => {
            return cfg.activityId == activityId;
        });
    }

    /**获取累天充值状态 */
    getTotalChargeDayState(cfg: table.activity.TotalChargeDay.TotalChargeDayConfig): ETotalChargeDayState {
        let chargeDayState = ETotalChargeDayState.lock;
        let serverHaveOpenDay = G.TimeManager.serverHaveOpenDay;

        let vo: ActivityTotalChargeDayVo = GIns.activityModel.getActivityVoById(cfg.activityId);
        if (vo) {
            let totalChargeDayVo = vo.activityVo;
            let checkDay = totalChargeDayVo.chargeDay;
            if (totalChargeDayVo.dailyReached == false) {
                ++checkDay;
            }

            if (checkDay >= cfg.chargeDay) {
                if (totalChargeDayVo.rewardIds.indexOf(cfg.id) > -1) {
                    chargeDayState = ETotalChargeDayState.hasDraw;
                } else if ((checkDay == cfg.chargeDay && totalChargeDayVo.dailyReached)|| checkDay > cfg.chargeDay) {
                    //如果今天的就要判断是否已经到达金额
                    chargeDayState = ETotalChargeDayState.draw;
                } else {
                    // 同时只有一个显示“前往”，后面的锁定
                    chargeDayState = ETotalChargeDayState.notFinish;
                }
            }
        }
        return chargeDayState;
    }

    /**获取首个活动数据*/
    public getFirstOpenActvityVoForOpenId(openId:number):BaseActivityVo {
        let allCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        let firstVo:BaseActivityVo = null;
        for (let i = 0; i < allCfgs.length; i++) {
            if (allCfgs[i].parentId == openId && ConditionManager.ins().checkCondition(allCfgs[i].conditionText)) {
                let vo = ActivityModel.ins().getActivityVoById(allCfgs[i].typeParam);
                if (vo && vo.isShowEntrance()) {
                    firstVo = vo;
                    break;
                }
            }
        }
        return firstVo;
    }

    public getOpenAvtivityList(id: string): table.activity.ActivityConstant.ActivityClientConfig[] {
        let openId = Number(id);
        let cfgs: table.activity.ActivityConstant.ActivityClientConfig[] = [];
        let allCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        for (let cfg of allCfgs) {
            if (cfg.parentId == openId && ConditionManager.ins().checkCondition(cfg.conditionText)) {
                switch (cfg.type) {
                    case "1":
                        let vo = ActivityModel.ins().getActivityVoById(cfg.typeParam);
                        if (vo && vo.isShowEntrance()) {
                            cfgs.push(cfg);
                        }
                        break;
                    case "3":
                        break;
                    default:
                        cfgs.push(cfg);
                        break;
                }
            }
        }
        return cfgs;
    }

    /**活动是否解锁*/
    public isActivityUnlock(activityId: number): boolean {
        let activityVo = GIns.activityModel.getActivityVoById(activityId) as BaseActivityVo;
        if (activityVo == null || activityVo.isShowEntrance() == false) {
            return false;
        }
        let enterCfg = ActivityConfigManager.getEnterCfg(activityId);
        if (enterCfg == null) {
            //找不到入口 就当开启了
            return true;
        }
        if (enterCfg.mainCfg && GIns.conditionMgr.checkCondition(enterCfg.mainCfg.conditionText) == false) {
            //入口未开启
            return false;
        }
        if (enterCfg.clientCfg) {
            //配置存在
            if (GIns.conditionMgr.checkCondition(enterCfg.clientCfg.conditionText) == false) {
                //不满足开启条件
                return false;
            }
        }
        return true;
    }
}
ActivityController.ins().doInit();
