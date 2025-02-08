import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { RedDotCom } from "../common/redDot/redDotCom";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { HeroManager } from "../hero/HeroManager";
import { HeroVo } from "../hero/HeroVo";
import { ItemUtils } from "../item/utils/ItemUtils";
import { UIWeaponConfig, UIWeaponInfoFrom, UIWeaponInfoOpenData } from "./const/UIWeaponConfig";
import { WeaponBaseItem } from "./item/WeaponBaseItem";
import { WeaponVo } from "./vo/WeaponVo";
import { WeaponManager } from "./WeaponManager";


/** 武器穿戴btn */
export class BtnWearWeapon extends fgui.GButton {
    static pkgName: string = "comm";
    static viewName: string = "BtnWearWeapon";

    private _heroId: number = 0;
    private _heroVo: HeroVo = null
    private _weaponVo: WeaponVo = null

    private get view(): ui.comm.btn.BtnWearWeapon {
        return this as any;
    }

    protected onInit() {
        this.view.onClick(this.onBtnClick, this);
    }

    private onBtnClick() {
        if (this.view.curView.visible) {
            //当前有武器 弹出武器详情
            let data: UIWeaponInfoOpenData = {
                data: this._weaponVo,
                from: UIWeaponInfoFrom.HeroWear,
            }
            G.UIManager.open(UIWeaponConfig.WEAPON_INFO_VIEW, data)
        } else {
            G.UIManager.open(UIWeaponConfig.WEAPON_WEAR_VIEW, this._heroId)
            GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Hero_item_weapon_active)
            this.updateWearTip()
        }
    }

    public updateUI(): void {
        this._weaponVo = WeaponManager.ins().getWeaponForHero(this._heroVo.baseId)
        if (this._weaponVo) {
            //装备了专武
            this.view.curView.visible = true
            this.view.noneView.visible = false

            //@ts-ignore
            let comp = this.view.iconItem as WeaponBaseItem
            comp.setDataByItemCfg(this._weaponVo.itemCfg, this._weaponVo.base.star)

            this.view.lbName.color = ItemUtils.getTextColor(this._weaponVo.itemCfg?.quality)
            this.view.lbName.text = this._weaponVo.itemCfg?.name
        } else {
            this.view.curView.visible = false
            this.view.noneView.visible = true
        }

        this.updateWearTip()
    }

    /**更新穿戴提示*/
    public updateWearTip(): void {
        if (this._weaponVo == null) {
            //未装备 显示红点
            let hasWearWeapon: boolean = GIns.weaponMgr.getCanWearIdleWeapons(this._heroId)?.length > 0
            this.view.gTip.visible = true
            if (hasWearWeapon) {
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Hero_item_weapon_wear, [this._heroId])
            } else {
                if (GIns.redDotMgr.isHaveRedDot(RedDotKeys.Hero_item_weapon_active)) {
                    FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Hero_item_weapon_active)
                } else {
                    this.view.gTip.visible = false
                }
            }
        } else {
            //已装备红点
            this.view.gTip.visible = false
            let iconRedDot = FguiScriptUtils.toMyScriptClass(this.view.iconItem.redDot, RedDotCom)
            if (GIns.weaponMgr.isWeaponCanUpStar(this._weaponVo)) {
                //当前武器可升级
                iconRedDot.reset(RedDotKeys.Hero_item_weapon_up, [this._heroId])
                return
            } else if (this._weaponVo?.cfg.heroBaseId != this._heroId) {
                let weapons = GIns.weaponMgr.getCanWearIdleWeapons(this._heroId, ServerEnums.AwakeWeaponType.EXCLUSIVE)
                if (weapons?.length > 0) {
                    //当前不是专武 并且有专武可装备
                    iconRedDot.reset(RedDotKeys.Hero_item_weapon_exclusive, [this._heroId])
                    return
                }
            }
            iconRedDot.reset(RedDotKeys.Null)
        }
    }

    public setHero(heroId: number): void {
        if (!heroId) return;
        if (this._heroId != heroId) {
            this._heroId = heroId;
            this._heroVo = HeroManager.ins().getHeroVoByID(heroId);
            this.updateUI()

        }
    }

}