import { bindScript } from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../event/NotificationKey";
import { ItemNotEnoughGift } from "./ItemNotEnoughGift";
import { ItemNotEnoughPanel } from "./ItemNotEnoughPanel";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

export interface ItemNotEnoughViewOpenArgs {
    itemConfig: table.item.ItemConfig,
    count: number
}

/**
 * 道具不足
 */
@bindScript(UIViewItemDetailsKey.ItemNotEnoughView)
export class ItemNotEnoughView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "ItemNotEnoughView";

    protected _args: ItemNotEnoughViewOpenArgs = null;
    private get view(): ui.itemDetails.ItemNotEnoughView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
            NotificationKey.DAILY_SALE_CHANGE,
            NotificationKey.EVENT_SHOP_BUY_RESP,
            NotificationKey.EVENT_SHOP_INFO_RESP,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
            case NotificationKey.DAILY_SALE_CHANGE:
                this.updatePack();
                break
            case NotificationKey.EVENT_SHOP_BUY_RESP:
            case NotificationKey.EVENT_SHOP_INFO_RESP:
                this.updatePack(true);
                break
        }
    }

    protected onInit(): void {

    }

    protected onOpen(args: ItemNotEnoughViewOpenArgs, isReopen?: boolean): void {
        this._args = args
        FguiScriptUtils.toMyScriptClass(this.view.pAll.pCenter, ItemNotEnoughPanel).updateUI(args)
        this.updatePack();
    }

    protected onClose(): void {
    }

    protected updatePack(force: boolean = false): void {
        let giftComp = FguiScriptUtils.toMyScriptClass(this.view.pAll.pGift, ItemNotEnoughGift)
        giftComp.setItemId(this._args.itemConfig.id, force)
        let result = giftComp.updateUI();
        this.view.pAll.getController('c1').selectedIndex = result ? 1 : 0;
    }


}