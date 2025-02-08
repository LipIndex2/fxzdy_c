import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { HeroManager } from "../../hero/HeroManager";
import { HeroVo } from "../../hero/HeroVo";
import { UIWeaponConfig, UIWeaponInfoFrom, UIWeaponInfoOpenData } from "../const/UIWeaponConfig";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponSelectItem } from "../item/WeaponSelectItem";
import { WeaponModel } from "../model/WeaponModel";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";
import { BattleManager } from "../../../comm/battle/BattleManager";
import GIns from "../../../GIns";

/**
 * 武器穿戴界面
 */
export class WeaponWearWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponWearWin";

    protected _heroVo: HeroVo
    protected _wearWeapons: WeaponVo[] = []

    private get view(): ui.weapon.view.WeaponWearWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.WEAPON_WEAR_COMPLETE,
            NotificationKey.WEAPON_TAKE_OFF_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.WEAPON_WEAR_COMPLETE:
            case NotificationKey.WEAPON_TAKE_OFF_COMPLETE:
                // this.updateUI()
                this.closeSelf()
                break;
        }
    }

    protected onInit(): void {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRenderer.bind(this)
        this.view.list.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.view.lbTitle.text = G.I18nManager.lang(WeaponI18nKeys.myWeapon)
        this.view.lbNone.text = G.I18nManager.lang(WeaponI18nKeys.noWeapon)
    }

    protected itemRenderer(index: number, item: ui.weapon.item.WeaponSelectItem): void {
        //@ts-ignore
        let comp = item as WeaponSelectItem
        comp.setData(this._wearWeapons[index])
    }

    protected onClickItem(item: ui.weapon.item.WeaponSelectItem): void {
        //@ts-ignore
        let comp = item as WeaponSelectItem
        if (comp.vo == null) {
            //发送卸下装备
            if (GIns.battleMgr.battleLogic.isInBattle()) {
                GIns.floatingTextMgr.showTips("战斗中不能卸下");
                return
            }
            let curWeapon = WeaponManager.ins().getWeaponForHero(this._heroVo.baseId)
            WeaponModel.ins().sendTakeOff({ weaponUniqueId: curWeapon.base.id })
            return
        }

        //大概装备详情界面
        let openData: UIWeaponInfoOpenData = {
            data: comp.vo,
            from: UIWeaponInfoFrom.WearSelect,
            curHeroId: this._heroVo.baseId
        }
        G.UIManager.open(UIWeaponConfig.WEAPON_INFO_VIEW, openData)
    }

    protected updateUI(): void {
        this._wearWeapons = WeaponManager.ins().getCanWearWeapons(this._heroVo.baseId)
        if (WeaponManager.ins().getWeaponForHero(this._heroVo.baseId)) {
            //当前有装备武器 需要显示卸下按钮
            this._wearWeapons.unshift(null)
        }
        this.view.list.numItems = this._wearWeapons.length
        this.view.lbNone.visible = this._wearWeapons.length <= 0
    }

    protected onOpen(heroId: number, isReopen?: boolean): void {
        this._heroVo = HeroManager.ins().getHeroVoByID(heroId)
        this.updateUI()
    }

    protected onClose(): void {

    }
}