import { sp } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UIWeaponConfig } from "../../weapon/const/UIWeaponConfig";
import { WeaponManager } from "../../weapon/WeaponManager";
import { IllustrationsScoreBtn } from "../btn/IllustrationsScoreBtn";
import { IllustrationsModel, IllustrationsScoreState, IllustrationsWeaponCfg } from "../model/IllustrationsModel";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { IllustrationsI18nKeys } from "../const/IllustrationsI18nKeys";
import { math } from "cc";
import { Color } from "cc";
import GIns from "../../../GIns";
import { ItemUtils } from "../../item/utils/ItemUtils";


/** 图鉴武器item */
export class IllustrationsWeaponItem extends fgui.GComponent {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsWeaponItem";

    protected _vo: IllustrationsWeaponCfg = null

    protected _activeStar: number = -1

    private get view(): ui.illustrations.item.IllustrationsWeaponItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this)
        this.view.btnBg.onClick(this.onClickItem, this)
        this.view.btnScore.onClick(this.onClickScore, this)
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._activeStar)
    }

    protected onClickItem(): void {
        //弹出详情
        G.UIManager.open(UIWeaponConfig.WEAPON_INFO_PREVIEW_VIEW, this._vo.cfg.id)
    }

    protected onClickScore(): void {
        if (this._vo.state == IllustrationsScoreState.NotDraw) {
            GIns.floatingTextMgr.showTips(G.I18nManager.lang(IllustrationsI18nKeys.getScoreTip))
            return
        }
        if (this._activeStar == -1) {
            //激活
            IllustrationsModel.ins().sendDrawActiveAwakeWeaponScore({ weaponBaseId: this._vo.cfg.id })
        } else {
            //领取第一次升星积分
            IllustrationsModel.ins().sendDrawAwakeWeaponUpStarScore({ weaponBaseId: this._vo.cfg.id, star: this._activeStar + 1 })
        }
    }

    protected showModel() {
        this.view.iconLoader.visible = true
        this.view.iconSihouette.visible = false
        this.view.iconLoader.icon = this._vo.itemCfg.iconPath
        if (this._vo.curStar < 0 && this._activeStar < 0) {
            //未获得
            this.view.iconLoader.color = Color.BLACK
        } else if (this._activeStar < 0) {
            //未激活
            this.view.iconLoader.color = math.color(60, 60, 60)
        } else {
            this.view.iconLoader.color = Color.WHITE
        }
    }

    protected hideModel() {
        this.view.iconLoader.visible = false
        this.view.iconSihouette.visible = true
    }

    public setData(data: IllustrationsWeaponCfg): void {
        this._vo = data
        this.view.bgLoader.icon = IllustrationsModel.ins().getItemBgUrl(data.itemCfg.quality)
        this._activeStar = IllustrationsModel.ins().getWeaponStar(data.cfg.id)
        this.showModel()
        this.view.lbName.text = data.itemCfg.name

        //星级
        let showStar = Math.max(0, this._activeStar)
        this.view.listStar.numItems = showStar

        //@ts-ignore
        let btnScore = this.view.btnScore as IllustrationsScoreBtn
        btnScore.updateByScoreAndState(data.score, data.state)
    }
}