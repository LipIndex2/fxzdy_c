import * as fgui from "fairygui-cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemListComp } from "./ItemListComp";


/**
 * 道具列表
 */
export class ItemListComp2 extends ItemListComp {

    static pkgName: string = "comm";
    static viewName: string = "ItemListComp2";
   

    protected get view(): ui.comm.item.ItemListComp2 {
        return this as any;
    }

    constructor() {
        super();
    }

   


}