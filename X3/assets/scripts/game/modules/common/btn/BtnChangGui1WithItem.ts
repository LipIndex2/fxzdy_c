import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";

/**
 * 英雄item
 * - 纯展示用 | 非养成
 */
export class BtnChangGui1WithItem extends fgui.GButton implements INotification {
    private _title: string = "";
    private _item: NoOwnerItem;
    protected _itemId: number

    private get view(): ui.comm.btn.BtnChangGui1WithItem {
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
                const item = args as NoOwnerItem;
                this.refresh();
                break;
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this)
        //默认样式
        this.setStyle(0)
        this.setLbStyle(0)
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this)
    }


    reset(title: string, item: NoOwnerItem) {
        this._title = title;
        this._item = item;
        this._itemId = item ? item.itemId : 0
        if (item) {
            this.updateUI(title, item.getItemSmallIconPath(), item.count, item.isCanPay());
        } else {
            this.view.title = title;
        }
    }

    resetForNoItem(title: string, itemIcon: string, needCnt: number, hasCnt: number): void {
        this._title = title
        this._item = null
        this._itemId = 0
        this.updateUI(title, itemIcon, needCnt, hasCnt >= needCnt, hasCnt)
    }

    protected updateUI(title: string, itemIcon: string, needCnt: number, isCanPay: boolean, hasCnt: number = 0): void {
        this.view.imageItem.icon = itemIcon;
        this.view.title = title;
        if (needCnt <= 0) {
            this.view.getController("canPayFlag").selectedIndex = 2;
        } else if (isCanPay) {
            this.view.getController("canPayFlag").selectedIndex = 1;
        } else {
            this.view.getController("canPayFlag").selectedIndex = 0;
        }
        if (needCnt > 0) {
            this.view.gCost.visible = true;
            let lbStyle = this.view.getController("lbStyle").selectedIndex
            if (lbStyle == 1) {
                if (hasCnt <= 0) {
                    let itemVo = GIns.itemModel.getItemById(this._itemId);
                    hasCnt = itemVo ? itemVo.count : 0
                }
                this.view.labelCount.text = hasCnt + '/' + needCnt;
            } else {
                this.view.labelCount.text = needCnt + '';
            }
        }
    }

    /**设置按钮样式 0黄色 1蓝色*/
    public setStyle(style: number): void {
        this.view.getController("style").selectedIndex = style != 0 ? 1 : 0;
    }

    /**设置文本展示样式 0 needCnt 1 hasCnt/needCnt */
    public setLbStyle(style: number): void {
        let realStyle = style != 0 ? 1 : 0;
        if (this.view.getController("lbStyle").selectedIndex != realStyle) {
            this.view.getController("lbStyle").selectedIndex = realStyle
            if (this._itemId > 0) {
                this.refresh()
            }
        }
    }

    public getItemName(): string {
        return this._item ? this._item.getItemNameToI18n() : '道具'
    }

    public getNoPayTip(): string {
        return this.getItemName() + '不足！'
    }

    public isCanPay(showComeFromFlag: boolean = false): boolean {
        return this._item == null || this._item.isCanPay(showComeFromFlag)
    }

    private refresh() {
        this.reset(this._title || "", this._item || null);
    }
}