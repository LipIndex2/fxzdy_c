import * as fgui from "fairygui-cc";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponBaseItem } from "./WeaponBaseItem";


/** 武器属性显示item */
export class WeaponConsumeItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponConsumeItem";
    public index: number

    private get view(): ui.weapon.item.WeaponConsumeItem {
        return this as any;
    }

    protected onInit() {

    }

    public setData(data: WeaponVo, index: number): void {
        //@ts-ignore
        let comp = this.view.base as WeaponBaseItem
        comp.setDataByItemCfg(data.itemCfg, data.base.star)
        this.index = index;
    }

    public setSelectState(isSelect: boolean): void {
        this.view.iconSelect.visible = isSelect
    }

    public setSelectEnabled(isEnabled: boolean): void {
        if (this.view.iconSelect.visible && isEnabled == false) {
            return
        }
        this.view.bgNone.visible = !isEnabled
        this.view.bgSelect.visible = isEnabled
    }

}