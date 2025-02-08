import UIScriptManager from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import * as fgui from "fairygui-cc";
import { BackpackManager } from "../backpack/BackpackManager";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";
import { QualityUtils } from "../common/quality/QualityUtils";
import { ItemTipsViewOpenArgs } from "./ItemTipsView";
import { SettingsConfigManager } from "../settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "../common/item/ItemFrameBtn";


export class ItemFrameItem extends fgui.GComponent {

    private get view(): ui.itemDetails.ItemFrameItem {
        return this as any;
    }

    public onInit(): void {
         
    }

    public updateView(cfg: table.set.SetShowConfig) {
        const t = this;
        const item = FguiScriptUtils.toMyScriptClass(t.view.item, ItemFrameBtn);
        t.view.nameLab.text = cfg.desc;
        item.reset(cfg.itemId, 0, false);
    }
}

/**
 * 道具详情
 */
export class ItemFrameTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "ItemFrameTipsView";

    private _itemArr: table.set.SetShowConfig[];

    private get view(): ui.itemDetails.ItemFrameTipsView {
        return this._view as any;
    }

    public onInit(): void {
        // 道具获取方式
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRendererForGetWayRow.bind(this);
        this._itemArr = SettingsConfigManager.getFrameByTC();
        this.view.itemList.numItems = this._itemArr.length;
    }

    public onClose(): void {

    }

    public onOpen(args: ItemTipsViewOpenArgs, isReopen?: boolean): void {
        this.view.nameLab.text = args.itemConfig.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.nameLab, args.itemConfig.quality);

        this.view.numLab.setVar("num", BackpackManager.ins().getItemCountByItemId(args.itemConfig.id).toString()).flushVars()
        this.view.desLab.text = args.itemConfig.desc;
        this.view.numLab.ensureSizeCorrect()
    }

    private itemRendererForGetWayRow(index: number, view: ItemFrameItem) {
        const itemComeFromConfig = this._itemArr[index];
        view.updateView(itemComeFromConfig)
    }
}
UIScriptManager.bindScript(UIViewItemDetailsKey.ItemFrameTipsView, ItemFrameTipsView);