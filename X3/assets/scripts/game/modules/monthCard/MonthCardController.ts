import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { UIMonthCardConfig } from "./const/UIMonthCardConfig";
import { MonthCardModel } from "./model/MonthCardModel";


export class MonthCardController extends BaseController {

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MONTHCARD_DATA_CHANGE:
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.checkAllRedDots()
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            this.checkAllRedDots();
        }
    }

    constructor() {
        super();
    }

    public checkAllRedDots(): void {
        let isOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD, false)
        if (isOpen == false) {
            //没开启就没红点
            RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_free, false)
            let model = MonthCardModel.ins()
            model.datas?.forEach((value) => {
                RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_item, false, [value.id])
            })
            return
        }
        let model = MonthCardModel.ins()
        let hasFree = model.gainDailyFreeReward == false
        RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_free, hasFree)
        if (model.datas) {
            for (let i = 0; i < model.datas.length; i++) {
                let value = model.datas[i]
                let isActive = model.isActive(value);
                let hasReward = isActive && model.hasDrewReward(value) == false
                RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_dayReward, isActive && !model.hasDrewReward(value), [value.id])
                if (value.id == ServerEnums.MonthCardType.MONTH) {
                    let canAct = !isActive && model.canUseItem();
                    RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_act, canAct);
                }
                RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_item, hasReward, [value.id])
            }
        }
        // model.datas?.forEach((value) => {
        //     let isActive = model.isActive(value);
        //     let hasReward = isActive && model.hasDrewReward(value) == false
        //     RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_dayReward, isActive && !model.hasDrewReward(value), [value.id])
        //     if (value.id == ServerEnums.MonthCardType.MONTH && !isActive) {
        //         let canAct = model.canUseItem();
        //         RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_act, canAct);
        //     }
        //     RedDotManager.ins().setRedDot(RedDotKeys.MonthCard_item, hasReward, [value.id])
        // })
    }

    onInit(): void {

    }

    /**打开终身卡购买界面*/
    public openForeverBuyWin(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD) == false) {
            return;
        }
        let data = MonthCardModel.ins().datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == ServerEnums.MonthCardType.FOREVER)
        if (data) {
            if (GIns.conditionMgr.checkCondition(data.cfg.displayVerify, true, true) == false) {
                return;
            }
            G.UIManager.open(UIMonthCardConfig.MonthCardForeverBuyWin, data);
        }
    }

    /**打开月卡购买界面*/
    public openBuyWin(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD) == false) {
            return;
        }
        let data = MonthCardModel.ins().datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == ServerEnums.MonthCardType.MONTH)
        if (data) {
            if (GIns.conditionMgr.checkCondition(data.cfg.displayVerify, true, true) == false) {
                return;
            }
            G.UIManager.open(UIMonthCardConfig.MonthCardBuyWin, data);
        }
    }

    /**打开矿卡购买界面*/
    public openBuyMineWin(): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD) == false) {
            return;
        }
        let data = MonthCardModel.ins().datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == ServerEnums.MonthCardType.MINERAL)
        if (data) {
            if (GIns.conditionMgr.checkCondition(data.cfg.displayVerify, true, true) == false) {
                return;
            }
            G.UIManager.open(UIMonthCardConfig.MonthCardMineBuyWin, data);
        }
    }

    /**跳转购买界面*/
    public jumpToBuyWin(type: ServerEnums.MonthCardType): void {
        if (ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD) == false) {
            return;
        }
        let data = MonthCardModel.ins().datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == type)
        if (data) {
            if (GIns.conditionMgr.checkCondition(data.cfg.displayVerify, true, true) == false) {
                return;
            }
            if (MonthCardModel.ins().isActive(data)) {
                GIns.floatingTextMgr.showTips('您已购买过该礼包~')
                return;
            }
            if (type == ServerEnums.MonthCardType.MONTH) {
                G.UIManager.open(UIMonthCardConfig.MonthCardBuyWin, data)
            } else if (type == ServerEnums.MonthCardType.FOREVER) {
                G.UIManager.open(UIMonthCardConfig.MonthCardForeverBuyWin, data)
            } else if (type == ServerEnums.MonthCardType.MINERAL) {
                G.UIManager.open(UIMonthCardConfig.MonthCardMineBuyWin, data)
            }
        }
    }
}

MonthCardController.ins().doInit();