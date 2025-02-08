import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { TableManager } from "../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { BackpackManager } from "../backpack/BackpackManager";
import { ItemFrameBtn } from "../common/item/ItemFrameBtn";
import { ItemTipsViewItem } from "./ItemTipsView";

export interface ItemNotEnoughViewOpenArgs {
    itemConfig: table.item.ItemConfig,
    count: number
}

/**
 * 道具不足
 */
@bindFguiExtension('ui://itemDetails/ItemNotEnoughPanel')
export class ItemNotEnoughPanel extends fgui.GComponent {
    static pkgName: string = "itemDetails";
    static viewName: string = "ItemNotEnoughPanel";

    private itemArr: table.item.ItemComeFromConfig[];

    private get view(): ui.itemDetails.panel.ItemNotEnoughPanel {
        return this as any;
    }

    public onInit(): void {
        // 道具获取方式
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRendererForGetWayRow.bind(this);
    }

    public updateUI(args: ItemNotEnoughViewOpenArgs): void {
        FguiScriptUtils.toMyScriptClass(this.view.item, ItemFrameBtn).reset(args.itemConfig.id, 0)
        let bagNum = BackpackManager.ins().getItemCountByItemId(args.itemConfig.id)
        this.view.numLab.text = `${bagNum}/${args.count}`;
        this.itemArr = []
        const itemComeFromConfigArray = TableManager.getAllData(table.item.ItemComeFromConfig)
        for (let i = 0; i < itemComeFromConfigArray.length; i++) {
            if (itemComeFromConfigArray[i].itemId == args.itemConfig.id)
                this.itemArr.push(itemComeFromConfigArray[i])
        }
        this.view.itemList.numItems = this.itemArr.length;
    }

    private itemRendererForGetWayRow(index: number, view: ItemTipsViewItem) {
        const itemComeFromConfig = this.itemArr[index];
        view.updateView(itemComeFromConfig)
    }
}