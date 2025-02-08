import * as fgui from "fairygui-cc";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponBaseItem } from "./WeaponBaseItem";
import G from "../../../../core/comm/G";
import { UIWeaponConfig, UIWeaponConsumeOpenData } from "../const/UIWeaponConfig";


/** 武器属性显示item */
export class WeaponConsumeAddItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponConsumeAddItem";

    protected _targetVo:WeaponVo = null
    protected _curSelects:WeaponVo[] = []

    private get view(): ui.weapon.item.WeaponConsumeAddItem {
        return this as any;
    }

    protected onInit() {
        this.view.on(fgui.Event.CLICK, this.onClickItem, this)
    }

    protected onClickItem() {
        let data:UIWeaponConsumeOpenData = {
            target:this._targetVo,
            selectVos:this._curSelects
        }
        G.UIManager.open(UIWeaponConfig.WEAPON_CONSUME_VIEW, data)
    }

    public setData(data: WeaponVo, curSelects:WeaponVo[], target:WeaponVo): void {
        this._targetVo = target
        this._curSelects = curSelects
        if (data == null) {
            this.view.base.visible = false
            this.view.btnAdd.visible = true
            return
        }

        this.view.base.visible = true
        this.view.btnAdd.visible = false
        //@ts-ignore
        let comp = this.view.base as WeaponBaseItem
        comp.setDataByItemCfg(data.itemCfg, data.base.star)

    }

}