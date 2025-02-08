import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { OrderModel } from "../../order/OrderModule";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityFundVo } from "../model/ActivityFundVo";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";

/**
 * 基金购买界面弹窗
 */
@bindScript(UIActivityKey.FundRewardPreview)
export class FundRewardPreview extends UICommWin {
    static pkgName: string = "activityPass";
    static viewName: string = "FundRewardPreview";

    /**  基金vo */
    private _data: ActivityFundVo;

    private get view(): ui.activityPass.Win.FundRewardPreview {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._data.activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.list_canGetReward.itemRenderer = this.itemGetRenderer.bind(this);
        this.view.list_reward.itemRenderer = this.itemRenderer.bind(this);
        this.view.btn_buy.on(fgui.Event.CLICK, this.onBuyClick, this);
    }

    protected onOpen(activityId: number, isReopen?: boolean): void {
        if (!activityId) return;
        this._data = ActivityModel.ins().getActivityVoById(activityId);
        this.view.textItem.visible = this._data.fundCfg.ruleId == 77;
        this.updateData();
    }

    private updateData() {
        this.view.list_canGetReward.numItems = this._data.buyRewardList.length;
        this.view.list_reward.numItems = this._data.allRewardList.length;

        let cfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this._data.fundCfg.chargeGoodsId);
        this.view.btn_buy.text = `${cfg.price / 100}元`;
    }

    private itemGetRenderer(index: number, item: ItemFrameBtn) {
        let data = this._data.buyRewardList[index];
        item.reset(data.k, data.v);
    }
    private itemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._data.allRewardList[index];
        item.reset(data.k, data.v);
    }
    private onBuyClick() {
        OrderModel.ins().sendCreateOrder(this._data.fundCfg.chargeGoodsId);
        GIns.floatingTextMgr.showTips(`购买成功`);
        this.closeSelf();
    }
}
