import { UITransform } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { EventClickItem } from "../../item/event/EventClickItem";


/** 奖励道具item */
export class ChargeLimitIconItem extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeLimitIconItem";

    public itemCfg: table.item.ItemConfig = null
    public count: number = 0

    private get view(): ui.charge.item.ChargeLimitIconItem {
        return this as any;
    }

    protected onInit() {
        this.view.onClick(this.onClickItem, this)
    }

    protected onClickItem(event: fgui.Event): void {
        const itemUI = this.view.node.getComponent(UITransform);

        // event 点击道具
        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            this.itemCfg,
            itemUI,
            this.count,
        ));
    }

    public setData(data: { k: any, v: any }): void {
        this.itemCfg = G.TableManager.getDataById(table.item.ItemConfig, data.k);
        // 物品配置
        if (this.itemCfg) {
            // 物品图标
            this.view.itemIcon.icon = this.itemCfg.iconPath;
        }

        // 品质
        const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, this.itemCfg?.quality);
        if (qualityConfig) {
            // 品质背景
            this.view.bg.icon = qualityConfig.itemQualityBgPath
        }

        // 物品数量
        this.count = data.v
        this.view.itemCount.text = "" + data.v;
    }
}