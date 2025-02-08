import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";


/** 武器属性显示item */
export class WeaponAttrItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponAttrItem";

    private get view(): ui.weapon.item.WeaponAttrItem {
        return this as any;
    }

    protected onInit() {

    }

    public setData(data: AttrData): void {
        this.view.lbDes.text = AttrManager.ins().getAttrNameByType(data.id)

        let effect = AttrConfigEffect.create(data.id, data.num)
        this.view.lbValue.text = '+' + effect.getValueStringForUIShow()
    }

}