import { UITransform } from "cc";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { EventClickItem } from "../../item/event/EventClickItem";

/**
 * 战队科技头部道具
 */
@bindFguiExtension('ui://captainSkill/CaptainSkillHeaderItem')
export class CaptainSkillHeaderItem extends fgui.GButton {
    static pkgName: string = "captainSkill";
    static viewName: string = "CaptainSkillHeaderItem";

    protected _itemId: number = 0;
    protected _itemCount: number = 0;

    listenNotifications(): string[] | null {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                let data = args as Map<number, number>
                if (data?.has(this._itemId)) {
                    this.refreshCount();
                }
                break;
        }
    }

    private get view(): ui.captainSkill.components.CaptainSkillHeaderItem {
        return this as any;
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this);
        this.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this);
    }

    protected onClickItem(event): void {
        const itemUI = this.view.node.getComponent(UITransform);
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, this._itemId);

        // event 点击道具
        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, itemCfg, itemUI, this._itemCount));
    }

    /**刷新道具数量*/
    public refreshCount(): void {
        if (this._itemId > 0) {
            const itemById = GIns.backpackMgr.getItemById(this._itemId);
            let itemCount: number = 0
            if (itemById) {
                itemCount = itemById.count;
            }
            this._itemCount = itemCount;
            this.view.labelValue.text = itemCount + '';
        }
    }

    public setItemId(itemId: number) {
        if (this._itemId != itemId) {
            this._itemId = itemId;
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId);
            if (itemCfg) {
                this.view.imageIcon.icon = itemCfg.smallIconPath;
            }
            this.refreshCount()
        }
    }
}