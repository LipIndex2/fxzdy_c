import { bindScript } from "../../../../core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityCareerTrialsVo } from "../model/ActivityCareerTrialsVo";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 职业试炼
 * 异能之路 （试炼通行证）
 */
@bindScript(UIActivityKey.CareerTrialsBattlePassBuyTipsWin)
export class CareerTrialsBattlePassBuyTipsWin extends UICommWin {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "CareerTrialsBattlePassBuyTipsWin";

    private get view(): ui.activityCareerTrials.CareerTrialsBattlePassBuyTipsWin {
        return this._view as any;
    }

    private _vo: ActivityCareerTrialsVo;

    listenNotifications(): string[] {
        return [
            // NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.CHARGE_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            // case NotificationKey.CHARGE_COMPLETE:
            //     if (this._vo && !this._vo.isActivityOver()) {
            //         GIns.activityModel.sendActivity(this._vo.activityId);
            //     }
            //     break;
            case NotificationKey.CHARGE_COMPLETE:
                if (args === this._vo.passCfg.chargeGoodsId) {
                    this.closeSelf();
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._vo.activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.itemList1.itemList.itemRenderer = this.itemRenderer1.bind(this);
        this.view.itemList2.itemList.itemRenderer = this.itemRenderer2.bind(this);

        this.view.btnBuy.on(fgui.Event.CLICK, this.onBuyClick, this);
    }

    private itemRenderer1(index: number, item: ItemFrameBtn): void {
        let data = this._vo.awardPreviewList[index];
        item.reset(data.k, data.v);
    }
    private itemRenderer2(index: number, item: ItemFrameBtn): void {
        let data = this._vo.allAwardList[index];
        item.reset(data.k, data.v);
    }

    protected onOpen(vo: ActivityCareerTrialsVo, isReopen?: boolean): void {
        this._vo = vo;

        this.view.itemList1.itemList.numItems = this._vo.awardPreviewList.length;
        this.view.itemList2.itemList.numItems = this._vo.allAwardList.length;

        if (this._vo.activityVo.boughtPassIds.indexOf(+this._vo.passCfg.chargeGoodsId) != -1) {
            this.view.btnBuy.visible = false;
            this.view.itemList1.itemList.numItems = 0;
        } else {
            this.view.btnBuy.visible = true;
            this.view.itemList1.itemList.numItems = this._vo.awardPreviewList.length;
        }
    }

    private onBuyClick() {
        if (this._vo.activityVo.boughtPassIds.indexOf(+this._vo.passCfg.chargeGoodsId) != -1) {
            return;
        }
        GIns.orderModel.sendCreateOrder(this._vo.passCfg.chargeGoodsId);
    }
}
