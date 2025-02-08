import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";

/** 装备属性页Item2 */
@bindFguiExtension('ui://equip/EquipAttrItem2')
export class EquipAttrItem2 extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrItem2";

    private get view(): ui.equip.item.EquipAttrItem2 {
        return this as any;
    }

    onInit() { }

    setData(datas: AttrConfigEffect[]) {
        if (datas?.length >= 1) {
            this.view.lbName1.text = datas[0].config.attrName
            this.view.lbValue1.text = datas[0].getValueStringForUIShow()
        } else {
            this.view.lbName1.text = ''
            this.view.lbValue1.text = ''
        }
        if (datas?.length >= 2) {
            this.view.lbName2.text = datas[1].config.attrName
            this.view.lbValue2.text = datas[1].getValueStringForUIShow()
        } else {
            this.view.lbName2.text = ''
            this.view.lbValue2.text = ''
        }
    }
}
