import * as fgui from "fairygui-cc";
import { HeroManager } from "../../hero/HeroManager";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponBaseItem } from "./WeaponBaseItem";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";


/** 武器背包显示item */
export class WeaponBagItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponBagItem";

    protected _weaponVo: WeaponVo = null

    private get view(): ui.comm.item.WeaponBagItem {
        return this as any;
    }

    public get weaponVo(): WeaponVo {
        return this._weaponVo
    }

    protected onInit() {

    }
    protected updateUI(): void {
        //@ts-ignore
        let itemComp: WeaponBaseItem = this.view.baseItem as WeaponBaseItem
        itemComp?.setData(this._weaponVo.base.baseId, this._weaponVo.base.star)
        if (this._weaponVo.base.heroBaseId > 0) {
            //有穿戴者 显示穿戴者信息
            let heroVo = HeroManager.ins().getHeroVoByID(this._weaponVo.base.heroBaseId)
            this.view.lbUser.text = /**'装配于' + */heroVo?.heroCfg.name
            this.view.iconUser.visible = true
        } else {
            this.view.lbUser.text = ''
            this.view.iconUser.visible = false
        }
    }

    public setData(data: WeaponVo, isInBag:boolean = true): void {
        this._weaponVo = data
        this.updateUI()
        if (isInBag) {
            FguiScriptUtils.toMyScriptClass(this.view.baseItem.redDot, RedDotCom).reset(RedDotKeys.backpack_weapon_item, [this._weaponVo.base.id])
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.baseItem.redDot, RedDotCom).reset(RedDotKeys.Null)
        }
    }

    public makeReadRedDot():void {
        GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.backpack_weapon_item, [this._weaponVo.base.id])
    }

}