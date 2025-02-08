import * as fgui from "fairygui-cc";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { Attribute } from "../../attr/AttrEnum";


/** 武器属性显示item */
export class WeaponUpAttrItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponUpAttrItem";

    private get view(): ui.weapon.item.WeaponUpAttrItem {
        return this as any;
    }

    protected onInit() {

    }

    public setData(data: AttrData, oldData: AttrData, index:number): void {
        let attrId:Attribute = Attribute.ATK;
        if (data) {
            attrId = data.id;
        } else if (oldData) {
            attrId = oldData.id;
        }
        this.view.lbName.text = AttrManager.ins().getAttrNameByType(attrId);
        let oldEffect = AttrConfigEffect.create(attrId, oldData ? oldData.num : 0);
        this.view.lbOld.text = oldEffect.getValueStringForUIShow();

        let nextEffect = AttrConfigEffect.create(attrId, data ? data.num : 0);
        this.view.lbNew.text = nextEffect.getValueStringForUIShow();

        this.view.bg.visible = index % 2 == 0
    }

}