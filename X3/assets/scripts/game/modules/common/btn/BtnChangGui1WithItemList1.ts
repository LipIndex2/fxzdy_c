import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import * as fgui from "fairygui-cc";
import NotificationKey from "../../../event/NotificationKey";
import G from "../../../../core/comm/G";
import { INotification } from "../../../../core/mvc/interface/INotification";

enum ETxStyle {
    lack = 0,  //道具不足
    enough = 1,  //道具足够
}

export class BtnChangGui1WithItemList1 extends fgui.GButton implements INotification {
    private _costItems: NoOwnerItem[];
    private _costStyle = 0;

    private get view(): ui.comm.btn.BtnChangGui1WithItemList1 {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                if (this._costItems) {
                    this.view.itemList.numItems = this._costItems.length;
                }
                break;
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this)
        this.view.itemList.itemRenderer = this.renderForCostItem.bind(this);
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this)
    }

    reset(items: NoOwnerItem[] | NoOwnerItem) {
        if (Array.isArray(items)) {
            this._costItems = items;
        } else {
            this._costItems = [items];
        }
        this.view.itemList.numItems = this._costItems.length;
    }

    // /**设置按钮样式 0黄色 1蓝色*/
    public setStyle(style: number): void {
        let ctrStyle = this.view.getController("style");
        ctrStyle.selectedIndex = style;
        if (this._costItems)
            this.view.itemList.numItems = this._costItems.length;
    }

    /**
     * 
     * @param style 0：只展示需求数量
     *              1：展示已有数量/需求数量
     */
    public setCostStyle(style: number) {
        this._costStyle = style;

        if (this._costItems)
            this.view.itemList.numItems = this._costItems.length;
    }

    renderForCostItem(index: number, comp: ui.comm.item.CommonItemSmallCostComp1) {
        // 消耗的道具
        const costItem = this._costItems[index];
        if (costItem) {
            comp.imageItem.icon = costItem.getItemSmallIconPath();

            if (this._costStyle == 0) {
                comp.labelCount.text = "" + costItem.count;
            } else {
                comp.labelCount.text = `${costItem.getPlayerBackpackItemCount()}/${costItem.count}`
            }

            const isCanPay = costItem.isCanPay();
            comp.getController("style").selectedIndex = isCanPay ? ETxStyle.enough : ETxStyle.lack;
        }
    }
}