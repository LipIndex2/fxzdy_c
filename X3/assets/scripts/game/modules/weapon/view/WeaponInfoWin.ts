import G from "../../../../core/comm/G";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIBackpackKeys } from "../../backpack/const/UIBackpackKeys";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { HeroManager } from "../../hero/HeroManager";
import { HeroVo } from "../../hero/HeroVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { JumpManager } from "../../jump/JumpManager";
import { UIWeaponConfig, UIWeaponInfoFrom, UIWeaponInfoOpenData } from "../const/UIWeaponConfig";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponBaseItem } from "../item/WeaponBaseItem";
import { WeaponModel } from "../model/WeaponModel";
import { WeaponAttrPanel } from "../panel/WeaponAttrPanel";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器信息界面
 */
export class WeaponInfoWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponInfoWin";

    protected _vo: WeaponVo
    protected _from: UIWeaponInfoFrom
    protected _curHeroId: number = 0

    /**展开动画类型*/
    protected _effectType: UIWinEffectType = UIWinEffectType.Flat;
    /**展开动画内容分组名称*/
    protected _flatCenterGroup: string = 'gCenter';

    private get view(): ui.weapon.view.WeaponInfoWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.WEAPON_LOCK_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.WEAPON_LOCK_COMPLETE:
                this.updateLockState()
                break;
        }
    }

    protected onInit(): void {
        this.view.btnUpStar.onClick(this.onClickUpStar, this)
        this.view.btnGotoWear.onClick(this.onClickGotoWear, this)
        this.view.btnChange.onClick(this.onClickChange, this)
        this.view.btnWear.onClick(this.onClickWear, this)
        this.view.btnLock.onClick(this.onClickLock, this)

        this.view.lbWore.text = G.I18nManager.lang(WeaponI18nKeys.wore)
        this.view.btnChange.title = G.I18nManager.lang(WeaponI18nKeys.change)
        this.view.btnGotoWear.title = G.I18nManager.lang(WeaponI18nKeys.gotoWare)
        this.view.btnUpStar.title = G.I18nManager.lang(WeaponI18nKeys.gotoUpStar)
        this.view.btnWear.title = G.I18nManager.lang(WeaponI18nKeys.ware)
    }

    protected onClickUpStar(): void {
        if (this._vo.base.star >= WeaponManager.ins().maxStar) {
            //已达最大星级
            GIns.floatingTextMgr.showTips("此超能武器已满星");
            return
        }
        G.UIManager.open(UIWeaponConfig.WEAPON_UP_STAR_VIEW, this._vo)
        this.closeSelf()
    }

    protected onClickGotoWear(): void {
        JumpManager.ins().jumpByEnum(ServerEnums.SystemType.HERO)
        G.UIManager.close(UIBackpackKeys.BACKPACK_VIEW)
        this.closeSelf()
    }

    protected onClickChange(): void {
        G.UIManager.open(UIWeaponConfig.WEAPON_WEAR_VIEW, this._vo.base.heroBaseId)
        this.closeSelf()
    }

    protected onClickWear(): void {
        if (GIns.battleMgr.battleLogic.isInBattle()) {
            GIns.floatingTextMgr.showTips("战斗中不能装配");
            return
        }

        if (this._vo.base.heroBaseId > 0 && this._vo.base.heroBaseId != this._curHeroId) {
            //当前武器装备在其他角色身上
            let lastHeroVo: HeroVo = HeroManager.ins().getHeroVoByID(this._vo.base.heroBaseId)
            // let heroName:string = G.I18nManager.lang(lastHeroVo?.heroCfg.name)
            let heroName: string = lastHeroVo?.heroCfg.name
            let content = `此武器已装配于${heroName}，是否继续装配？`
            G.UIManager.open(UICommonKey.BtnConfirmView, {
                title: null,
                titleCancel: CommonI18nKeys.cancel,
                titleConfirm: CommonI18nKeys.confirm,
                content: content,
                onBtnYes: () => {
                    WeaponModel.ins().sendWear({ weaponUniqueId: this._vo.base.id, heroBaseId: this._curHeroId })
                    this.closeSelf()
                }
            } as BtnConfirmViewOpenArgs)
            return
        }
        WeaponModel.ins().sendWear({ weaponUniqueId: this._vo.base.id, heroBaseId: this._curHeroId })
        this.closeSelf()
    }

    protected onClickLock(): void {
        WeaponModel.ins().sendLock({ weaponUniqueId: this._vo.base.id })
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

        this.updateBtns()
        this.updateLockState()
    }

    protected updateLockState() {
        this.view.btnLock.iconLock.visible = this._vo.base.locked
        this.view.btnLock.iconUnlock.visible = !this._vo.base.locked
    }

    protected updateBtns(): void {
        this.clearAllBtns()
        if (this._from == UIWeaponInfoFrom.Bag) {
            //背包只有前往升星和前往装配
            this.view.btnUpStar.visible = true
            this.view.btnGotoWear.visible = true
        } else if (this._from == UIWeaponInfoFrom.HeroWear) {
            this.view.btnUpStar.visible = true
            this.view.btnChange.visible = true
        } else if (this._from == UIWeaponInfoFrom.WearSelect) {
            if (this._vo.base.heroBaseId == this._curHeroId) {
                //是当前已装配的武器
                this.view.lbWore.visible = true
            } else {
                this.view.btnWear.visible = true
            }
        }
    }

    protected clearAllBtns(): void {
        this.view.btnUpStar.visible = false
        this.view.btnGotoWear.visible = false
        this.view.btnWear.visible = false
        this.view.btnChange.visible = false
        this.view.lbWore.visible = false
    }

    protected onOpen(args: UIWeaponInfoOpenData, isReopen?: boolean): void {
        this._vo = args?.data
        this._from = args?.from
        this._curHeroId = args?.curHeroId

        this.updateUI()
    }

    protected onClose(): void {

    }
}