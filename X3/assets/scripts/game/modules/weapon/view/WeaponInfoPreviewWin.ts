import G from "../../../../core/comm/G";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { WeaponBaseItem } from "../item/WeaponBaseItem";
import { WeaponAttrPanel } from "../panel/WeaponAttrPanel";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器信息预览界面
 */
export class WeaponInfoPreviewWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponInfoPreviewWin";

    protected _vo: WeaponVo
    /**展开动画类型*/
    protected _effectType: UIWinEffectType = UIWinEffectType.Flat;
    /**展开动画内容分组名称*/
    protected _flatCenterGroup: string = 'gCenter';

    private get view(): ui.weapon.view.WeaponInfoPreviewWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected updateUI(): void {
        //@ts-ignore
        let baseComp = this.view.baseItem as WeaponBaseItem
        baseComp.setData(this._vo.base.baseId, this._vo.base.star)

        //@ts-ignore
        let attrComp = this.view.attrPanel as WeaponAttrPanel
        attrComp.setData(this._vo)

        this.view.lbType.text = WeaponManager.ins().getWeaponTypeDes(this._vo.cfg.type)

        this.view.lbName.color = ItemUtils.getTextColor(this._vo.itemCfg?.quality)
        this.view.lbName.text = this._vo.itemCfg?.name
    }

    protected onOpen(baseId: number, isReopen?: boolean): void {
        let weaponCfg = G.TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, baseId)
        if (weaponCfg == null) {
            this.closeSelf()
            return
        }
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, baseId)
        this._vo = new WeaponVo()
        this._vo.cfg = weaponCfg
        this._vo.itemCfg = itemCfg
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

        this.updateUI()
    }

    protected onClose(): void {

    }
}