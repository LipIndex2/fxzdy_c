import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponBaseItem } from "../item/WeaponBaseItem";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器升星确认界面
 */
export class WeaponUpStarTipWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponUpStarTipWin";

    protected _backIds: number[] = []

    private get view(): ui.weapon.view.WeaponUpStarTipWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {
    }

    protected onInit(): void {
        this.view.btnSure.onClick(this.onClickSure, this)
        this.view.btnCancel.onClick(this.onClickCancel, this)
        this.view.listBack.setVirtual()
        this.view.listBack.itemRenderer = this.itemRenderer.bind(this)

        this.view.lbTitle.text = G.I18nManager.lang(WeaponI18nKeys.tipTitle)
        this.view.lbTip1.text = G.I18nManager.lang(WeaponI18nKeys.tip1)
        this.view.lbTip2.text = G.I18nManager.lang(WeaponI18nKeys.tip2)
        this.view.btnCancel.title = G.I18nManager.lang(CommonI18nKeys.cancel)
        this.view.btnSure.title = G.I18nManager.lang(WeaponI18nKeys.confirmUpStar)
    }

    protected itemRenderer(index: number, item: ui.comm.item.WeaponBaseItem): void {
        //@ts-ignore
        let comp = item as WeaponBaseItem
        comp.setData(this._backIds[index])
    }

    protected onClickSure(): void {
        this.emitNow(NotificationKey.WEAPON_UP_STAR_CONFIRM)
        this.closeSelf()
    }

    protected onClickCancel(): void {
        this.closeSelf()
    }

    protected onOpen(args: WeaponVo[], isReopen?: boolean): void {
        this._backIds.length = 0
        args.forEach((value: WeaponVo) => {
            if (value) {
                let backCnt: number = WeaponManager.ins().getBackWeaponCnt(value)
                if (backCnt > 0) {
                    this._backIds = this._backIds.concat(new Array(backCnt).fill(value.base.baseId))
                }
            }
        })
        this.view.listBack.numItems = this._backIds.length
    }

    protected onClose(): void {

    }
}