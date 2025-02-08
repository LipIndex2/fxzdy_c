import * as fgui from "fairygui-cc";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ActivityModel, ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityBattlePassVo } from "../model/ActivityBattlePassVo";
import G from "../../../../core/comm/G";
import { ActivityFundVo } from "../model/ActivityFundVo";
import { FundAwardListItem } from "./item/FundAwardListItem";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import GIns from "../../../GIns";

/**
 * 基金主界面弹窗
 */
export class FundMainWin extends UICommWin {
    static pkgName: string = "activityPass";
    static viewName: string = "PassMainWin";

    /**  基金vo */
    private _data: ActivityFundVo;

    private get view(): ui.activityPass.Win.PassMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CHARGE_COMPLETE:
                ActivityModel.ins().sendActivity(this._data.activityId);
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._data.activityId) {
                    ActivityModel.ins().sendActivity(this._data.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateData();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateData();
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._data.activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.list_awaed.setVirtual();
        this.view.list_awaed.itemRenderer = this.itemRenderer.bind(this);
        this.view.btn_buy.on(fgui.Event.CLICK, this.onBuyClick, this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(this._data.fundCfg.ruleId, this.view.btnRule);
    }

    protected onOpen(activityId: number, isReopen?: boolean): void {
        if (!activityId) return;
        this._data = ActivityModel.ins().getActivityVoById(activityId);
        // ActivityModel.ins().sendActivity(this._data.activityId);
        this.updateData();
    }

    private updateData() {
        this.view.list_awaed.numItems = this._data.fundAwardList.length;
        this.view.list_awaed.scrollToView(this._data.scrollToCurrentLevel, true);

        if (this._data.activityVo.boughtFund) {
            this.view.btn_buy.visible = false;
            this.view.T_buy.visible = true;
        } else {
            this.view.T_buy.visible = false;
            let cfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this._data.fundCfg.chargeGoodsId);
            this.view.btn_buy.text = `${cfg.price / 100}元`;
        }

        this.view.T_discount.text = `${this._data.fundCfg.discount}%`;
        this.view.img_bg.icon = this._data.fundCfg.iconPath3;

        this.view.img_title.icon = this._data.fundCfg.iconPath2;
        if (this._data.fundCfg.colors.length > 0) {
            this.view.T_tips.color = ColorUtils.createColor(this._data.fundCfg.colors[0]);
            this.view.T_tips.strokeColor = ColorUtils.createColor(this._data.fundCfg.colors[1]);
        }
        this.view.T_tips.text = this._data.fundCfg.tips;
    }

    //奖励列表
    private itemRenderer(index: number, item: FundAwardListItem): void {
        let data = this._data.fundAwardList[index];
        item.updateData(data, this._data);
    }

    protected onClose(): void {}

    //购买预览
    onBuyClick() {
        G.UIManager.open(UIActivityKey.FundRewardPreview, this._data.activityId);
    }
    //领取
    private onGetClick() {
        if (!this._data.isRewardCanGetList) {
            GIns.floatingTextMgr.showTips("没有可领取奖励");
            return;
        }

        let syncData = {
            activityId: this._data.activityId,
            itemId: "id",
            hidePopWin: 2,
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(syncData);
    }
}
UIScriptManager.bindScript(UIActivityKey.FundMainWin, FundMainWin);
