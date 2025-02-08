import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import G from "db://assets/scripts/core/comm/G";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { Color } from "cc";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UICommonKey } from "../const/UICommonConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";

export class BuyInLimitTodayConfirmViewOpenArgs {
    // 消耗的道具
    costItem: NoOwnerItem;
    // 当前次数
    currentCount: number;
    // 最大次数
    maxCount: number;
    // 确认cB
    callbackForOk: Function;


    static create(item: NoOwnerItem,
                  todayCount: number,
                  maxCount: number,
                  callbackForOk: Function
    ): BuyInLimitTodayConfirmViewOpenArgs {
        const args = new BuyInLimitTodayConfirmViewOpenArgs();
        args.costItem = item;
        args.currentCount = todayCount;
        args.maxCount = maxCount;
        args.callbackForOk = callbackForOk;
        return args;
    }
}

/**
 * 购买确认界面
 */
export class BuyInLimitTodayConfirmView extends UICommWin {


    static pkgName: string = "commFrame";

    static viewName: string = "BuyInLimitTodayConfirmView";
    private _args: BuyInLimitTodayConfirmViewOpenArgs;

    private get view(): ui.commFrame.confirm.BuyInLimitTodayConfirmView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        this.view.btnOk.onClick(this.onBtnOkClick, this)
        this.view.btnCancel.onceClick(this.onBtnCancelClick, this);

    }

    public onOpen(args: BuyInLimitTodayConfirmViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

        if (!args) {
            return;
        }
        this._args = args;
        this.reset();

    }

    private reset() {
        const costItem = this._args.costItem;
        if (!costItem) {
            console.error("确认购买窗口的消耗道具配置为空! 请检查配置!");
            return;
        }
        const restCount = this._args.maxCount - this._args.currentCount;
        const maxCount = this._args.maxCount;

        this.view.imageItem.icon = costItem.getItemSmallIconPath();
        this.view.labelCostCount.text = `${costItem.count}`;
        const isCanPay = costItem.isCanPay();
        if (isCanPay) {
            this.view.labelCostCount.color = new Color("#66FF66");
        } else {
            this.view.labelCostCount.color = new Color("#FF0000");
        }
        this.view.labelTips
            .setVar("restCount", restCount.toString())
            .setVar("maxCount", maxCount.toString())
            .flushVars();

    }

    private onBtnOkClick() {
        const callbackForOk = this._args.callbackForOk;
        const costItem = this._args.costItem;
        if (!costItem) {
            console.error("确认购买窗口的消耗道具配置为空! 配置有问题. 所以直接关闭");
            this.closeSelf();
            return;
        }

        const isCanPay = costItem.isCanPay();
        if (isCanPay) {
            if (callbackForOk) {
                callbackForOk();
            }
        } else {
            GIns.floatingTextMgr.showTips("道具不足");
        }
        this.closeSelf();
    }

    private onBtnCancelClick() {
        this.closeSelf();
    }
}

UIScriptManager.bindScript(UICommonKey.BuyInLimitTodayConfirmView, BuyInLimitTodayConfirmView);