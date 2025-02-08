import { UITransform } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { EventClickItem } from "../../item/event/EventClickItem";


export class ResoureceBtn extends fgui.GButton implements INotification {
    private _itemId: number = 0;
    private _isCanBuy: boolean = false;

    listenNotifications(): string[] | null {
        return [
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.EVENT_CHANGE_ITEMS,

        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
            case NotificationKey.HERO_UP_LEVEL:
                this.refreshMe();
                break;
        }
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);

        G.FacadeManager.registerNotification(this);
    }

    private get view(): ui.comm.header.resoureceBtn {
        return this as any;
    }
    /**0点击跳转 1点击来源 */
    private clickType: number = 0;

    reset(itemId: number, clickType = 0) {
        this.clickType = clickType;
        const config = ItemUtils.getItemConfigByItemId(itemId);
        if (!config) {
            return;
        }
        this._itemId = itemId;


        // + 号
        //  this.view.imageBuy.visible = config.buyJumpId > 0;
        this.view.iconImg.icon = config.iconPath;

        const itemById = BackpackManager.ins().getItemById(itemId);
        if (!itemById) {
            // 背包中没有该物品
            this.view.labelItemCount.text = "0";
            return;
        }

        const itemCount = itemById.count;
        if (itemCount > 0) {
            // 数量格式化
            this.view.labelItemCount.text = NumberFormatter.formatNumberToString(itemCount);

            // maxCount
            const maxCount = ItemConfigManager.getItemMaxCountByItemId(itemId)
            if (maxCount) {
            } else {
                // 无上限
            }
        } else {
            this.view.labelItemCount.text = "0";
        }

    }


    onClick0(event: fgui.Event) {
        const config = ItemUtils.getItemConfigByItemId(this._itemId);
        if (!config) {
            return;
        }
        if (this.clickType == 0) {
            // 跳转
            const buyJumpId = config.buyJumpId;
            if (buyJumpId == 0) {
                return;
            }
            G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, buyJumpId)
        } else if (this.clickType == 1) {
            // event 点击道具
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                config,
                this.view.node.getComponent(UITransform),
                1,
            ));
            // FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP, this._itemId);
        }

    }

    private refreshMe() {
        this.reset(this._itemId);
    }
}
