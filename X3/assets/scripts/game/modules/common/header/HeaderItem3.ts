import * as fgui from "fairygui-cc";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import FGUINotificationGButton from "../../../../core/fgui/com/FGUINotificationGButton";


export class HeaderItem3 extends FGUINotificationGButton implements INotification {
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


    protected onInit() {
        this.view.onClick(this.onClick0, this);
    }

    private get view(): ui.comm.header.HeaderItem3 {
        return this as any;
    }

    reset(itemId: number) {
        const config = ItemUtils.getItemConfigByItemId(itemId);
        if (!config) {
            return;
        }
        this._itemId = itemId;


        // + 号
        this.view.imageBuy.visible = config.buyJumpId > 0;
        this.view.imageItem.icon = config.iconPath;

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


    onClick0() {
        const config = ItemUtils.getItemConfigByItemId(this._itemId);
        if (!config) {
            return;
        }

        // 跳转id
        const buyJumpId = config.buyJumpId;
        if (buyJumpId == 0) {
            return;
        }
        G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, buyJumpId)
    }

    private refreshMe() {
        this.reset(this._itemId);
    }
}
