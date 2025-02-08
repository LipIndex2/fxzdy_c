import * as fgui from "fairygui-cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";


/**
 * 道具列表
 */
export class ItemListComp extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "ItemListComp";
    private _items: NoOwnerItem[] = [];

    private _showCount:boolean = true;

    protected get view(): ui.comm.item.ItemListComp {
        return this as any;
    }

    constructor () {
        super();
    }

    protected onConstruct(): void {
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.renderItem0.bind(this);
    }

    reset(items: NoOwnerItem[], showCount:boolean = true) {
        this._showCount = showCount;
        this._items = items || [];
        this.view.itemList.numItems = this._items.length;
    }


    private renderItem0(index: number, item: ItemFrameBtn): void {
        const item1 = this._items[index];
        if (!item1) {
            return;
        }

        item.resetByNoOwnerItem(item1,this._showCount);

        if (item1.effect > 0)
            item.playOtherEffect(item1.effect)
        else
            item.clearAnim()
    }


}