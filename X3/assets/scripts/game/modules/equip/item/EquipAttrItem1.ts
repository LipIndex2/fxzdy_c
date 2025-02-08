import * as fgui from "fairygui-cc";
import { EquipAttrData, EquipVo } from "../vo/EquipVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { AttrManager } from "../../attr/AttrManager";
import { TableManager } from "../../../../core/table/TableManager";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";

/** 装备属性页Item1 */
@bindFguiExtension('ui://equip/EquipAttrItem1')
export class EquipAttrItem1 extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrItem1";

    private get view(): ui.equip.item.EquipAttrItem1 {
        return this as any;
    }

    onInit() {}

    setData(data: AttrConfigEffect) {
        this.view.iconLoader.icon = data.getIconPath()
        this.view.lbValue.text = data.getValueStringForUIShow()
    }
}
