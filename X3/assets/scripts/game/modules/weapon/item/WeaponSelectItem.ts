import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponBagItem } from "./WeaponBagItem";


/** 武器选择item */
export class WeaponSelectItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponSelectItem";

    public vo: WeaponVo = null

    private get view(): ui.weapon.item.WeaponSelectItem {
        return this as any;
    }

    protected onInit() {
        this.view.lbTakeOff.text = G.I18nManager.lang(WeaponI18nKeys.takeOff)
    }

    public setData(data: WeaponVo): void {
        this.vo = data
        if (data == null) {
            //代表是卸下按钮
            this.view.takeOff.visible = true
            this.view.base.visible = false
            return
        }
        this.view.takeOff.visible = false
        this.view.base.visible = true

        //@ts-ignore
        let comp = this.view.base as WeaponBagItem
        comp.setData(data, false)
    }

}