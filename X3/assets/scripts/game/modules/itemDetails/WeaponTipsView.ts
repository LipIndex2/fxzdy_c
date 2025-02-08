import UIScriptManager from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import { QualityUtils } from "../common/quality/QualityUtils";
import { ItemUtils } from "../item/utils/ItemUtils";
import { WeaponAttrPanel } from "../weapon/panel/WeaponAttrPanel";
import { WeaponVo } from "../weapon/vo/WeaponVo";
import { WeaponManager } from "../weapon/WeaponManager";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

export interface ItemTipsViewOpenArgs {
    itemConfig: table.item.ItemConfig
}

/**
 * 道具详情
 */
export class WeaponTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "WeaponTipsView";

    private _vo: WeaponVo

    private get view(): ui.itemDetails.WeaponTipsView {
        return this._view as any;
    }

    public onOpen(args: ItemTipsViewOpenArgs, isReopen?: boolean): void {
        let weaponCfg = TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, args.itemConfig.id)
        let baseId = args.itemConfig.id
        this._vo = new WeaponVo()
        this._vo.cfg = weaponCfg
        this._vo.itemCfg = args.itemConfig
        let base: Vo.awakeweapon.AwakeWeaponVo = {
            baseId: baseId,
            heroBaseId: 0,
            id: baseId,
            locked: false,
            star: WeaponManager.ins().maxStar
        }
        this._vo.base = base
        this._vo.attrs = WeaponManager.ins().converWeaponAttr(weaponCfg, this._vo.base.star)
        this._vo.nextAttrs = WeaponManager.ins().converWeaponAttr(weaponCfg, this._vo.base.star + 1)

        //@ts-ignore
        let baseComp = this.view.baseItem as WeaponBaseItem
        baseComp.setData(this._vo.base.baseId, this._vo.base.star)

        //@ts-ignore
        let attrComp = this.view.attrPanel as WeaponAttrPanel
        attrComp.setData(this._vo)

        this.view.lbType.text = WeaponManager.ins().getWeaponTypeDes(this._vo.cfg.type)

        // this.view.lbName.color = ItemUtils.getTextColor(this._vo.itemCfg?.quality)
        this.view.lbName.text = this._vo.itemCfg?.name
        QualityUtils.setFGUIFontColorByQuality(this.view.lbName, this._vo.itemCfg?.quality );
    }
}
UIScriptManager.bindScript(UIViewItemDetailsKey.WeaponTipsView, WeaponTipsView);