import * as fgui from "fairygui-cc";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { Attribute } from "../../attr/AttrEnum";


/** 武器属性显示item */
export class WeaponUpAttrItem2 extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponUpAttrItem2";

    private get view(): ui.weapon.item.WeaponUpAttrItem2 {
        return this as any;
    }

    protected onInit() {

    }

    public setData(data: AttrData, nextData: AttrData): void {
        //属性覆盖 所以只会新增
        let attrId:Attribute = Attribute.ATK;
        if (data) {
            attrId = data.id;
        } else if (nextData) {
            attrId = nextData.id;
        }
        this.view.lbAttrDes.text = AttrManager.ins().getAttrNameByType(attrId);

        let oldEffect = AttrConfigEffect.create(attrId, data ? data.num : 0);
        this.view.lbOldAttr.text = oldEffect.getValueStringForUIShow();

        let nextEffect = AttrConfigEffect.create(attrId, nextData ? nextData.num : 0);
        this.view.lbNewAttr.text = nextEffect.getValueStringForUIShow();

        //隐藏属性图标
        this.view.iconLoader.visible = false
        this.view.bgIcon.visible = false
        // this.view.iconLoader.icon = oldEffect.getIconPath()
    }

}