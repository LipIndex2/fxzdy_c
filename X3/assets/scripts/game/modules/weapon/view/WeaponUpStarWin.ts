import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIWeaponConfig, UIWeaponInfoFrom } from "../const/UIWeaponConfig";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponConsumeAddItem } from "../item/WeaponConsumeAddItem";
import { WeaponUpAttrItem2 } from "../item/WeaponUpAttrItem2";
import { WeaponModel } from "../model/WeaponModel";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器升星界面
 */
export class WeaponUpStarWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponUpStarWin";

    protected _vo: WeaponVo
    protected _from: UIWeaponInfoFrom
    protected _curHeroId: number = 0
    protected _consumes: WeaponVo[] = []
    protected _curStarCfg: table.awakeweapon.AwakeWeaponStarConfig = null

    protected _curIndex: number = -1
    protected _upWeapons: WeaponVo[] = []

    private get view(): ui.weapon.view.WeaponUpStarWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.WEAPON_UP_STAR_COMPLETE,
            NotificationKey.WEAPON_SELECT_CONSUME_COMPLETE,
            NotificationKey.WEAPON_UP_STAR_CONFIRM
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.WEAPON_UP_STAR_COMPLETE:
                this.updateUI()
                this.resetUpWeapons()
                break;
            case NotificationKey.WEAPON_SELECT_CONSUME_COMPLETE:
                let selectMap: Map<number, WeaponVo> = args as Map<number, WeaponVo>
                this._consumes.fill(null)
                let index: number = 0
                selectMap.forEach((value: WeaponVo) => {
                    this._consumes[index] = value
                    index++
                })
                this.updateConsumes()
                break;
            case NotificationKey.WEAPON_UP_STAR_CONFIRM:
                this.sendUpStar()
                break
        }
    }

    protected onInit(): void {
        this.view.btnUp.onClick(this.onClickUpStar, this)
        this.view.btnPrev.onClick(this.onClickPrev, this)
        this.view.btnNext.onClick(this.onClickNext, this)
        this.view.listAttr.itemRenderer = this.attrItemRenderer.bind(this)
        this.view.listAdd.itemRenderer = this.addItemRenderer.bind(this)
    }

    protected attrItemRenderer(index: number, item: ui.weapon.item.WeaponUpAttrItem2): void {
        //@ts-ignore
        let comp = item as WeaponUpAttrItem2
        comp.setData(this._vo.attrs[index], this._vo.nextAttrs[index])
    }

    protected addItemRenderer(index: number, item: ui.weapon.item.WeaponConsumeAddItem): void {
        //@ts-ignore
        let comp = item as WeaponConsumeAddItem
        comp.setData(this._consumes[index], this._consumes, this._vo)
    }

    protected onClickUpStar(): void {
        let isWeaponNotEnough: boolean = this._consumes.findIndex((value) => value == null) != -1
        if (isWeaponNotEnough) {
            //材料不齐
            GIns.floatingTextMgr.showTips(G.I18nManager.lang(WeaponI18nKeys.tip4));
            return
        }
        let hasEnoughItem: boolean = true
        for (let i = 0; i < this._curStarCfg.costItems.length; i++) {
            let consume = NoOwnerItem.createByConfigKv(this._curStarCfg.costItems[i])
            if (consume.isCanPay(true) == false) {
                hasEnoughItem = false
                break
            }
        }
        if (hasEnoughItem == false) {
            //道具不足
            return
        }
        let hasHighStarConsume: boolean = this._consumes.find((value) => value && value.base.star > 0) != null
        if (hasHighStarConsume) {
            //有高星消耗品 需要弹出二次确认窗
            G.UIManager.open(UIWeaponConfig.WEAPON_UP_STAR_TIP_VIEW, this._consumes)
            return
        }
        this.sendUpStar()
    }

    protected onClickPrev() {
        if (this._curIndex > 0) {
            this._curIndex--
        } else {
            this._curIndex = this._upWeapons.length - 1
        }
        this._vo = this._upWeapons[this._curIndex]
        this.initUI()
        this.updateUI()
    }

    protected onClickNext() {
        if (this._curIndex < this._upWeapons.length - 1) {
            this._curIndex++
        } else {
            this._curIndex = 0
        }
        this._vo = this._upWeapons[this._curIndex]
        this.initUI()
        this.updateUI()
    }

    protected sendUpStar() {
        let data: { weaponUniqueId: number, consumeSameWeaponIds: number[] } = {
            weaponUniqueId: this._vo.base.id,
            consumeSameWeaponIds: this._consumes.map((value: WeaponVo) => { return value.base.id })
        }
        WeaponModel.ins().sendUpStar(data)
    }

    protected initUI(): void {
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, this._vo.cfg.id)
        this.view.lbTitle.color = ItemUtils.getTextColor(itemCfg?.quality)
        this.view.lbTitle.text = itemCfg?.name
        this.view.iconLoader.icon = itemCfg.bigIconPath
    }

    protected updateUI(): void {
        if (this._vo.base.star >= WeaponManager.ins().maxStar) {
            //已满星关闭界面
            this.closeSelf()
            return
        }
        this.view.listStar.numItems = this._vo.base.star
        this.view.listStarOld.numItems = this._vo.base.star
        this.view.listStarNew.numItems = this._vo.base.star + 1

        this.view.listAttr.numItems = this._vo.nextAttrs.length

        this._curStarCfg = WeaponManager.ins().getStarCfg(this._vo)
        this.view.lbConsumeCnt.text = G.I18nManager.lang(WeaponI18nKeys.tip3, this._curStarCfg?.consumeSameCount)

        const btn = FguiScriptUtils.toMyScriptClass(this.view.btnUp, BtnChangGui1WithItem);
        btn.reset(G.I18nManager.lang(WeaponI18nKeys.upStar), NoOwnerItem.createByConfigKv(this._curStarCfg?.costItems[0]));

        //每次刷新清空选中
        this._consumes = new Array(this._curStarCfg?.consumeSameCount).fill(null)
        this.updateConsumes()
    }

    protected updateConsumes() {
        this.view.listAdd.numItems = this._consumes.length
    }

    protected resetUpWeapons() {
        this._upWeapons = WeaponManager.ins().getCanUpWeapons()
        this._curIndex = this._upWeapons.indexOf(this._vo)
    }

    protected onOpen(args: WeaponVo, isReopen?: boolean): void {
        this._vo = args
        this.initUI()
        this.updateUI()
        this.resetUpWeapons()

        TweenUtils.yoyoOnAxisY(this.view.iconLoader.node, 1, 30)
    }

    protected onClose(): void {

    }
}