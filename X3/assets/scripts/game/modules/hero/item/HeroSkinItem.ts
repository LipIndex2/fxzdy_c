import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";


/** 属性item */
export class HeroSkinItem extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroSkinItem";

    public _skinCfg: table.hero.HeroSkinConfig = null;
    public _index = null;
    protected _hasSkin: boolean = false

    private get view(): ui.hero.item.HeroSkinItem {
        return this as any;
    }


    protected onConstruct(): void {
        this.view.onClick(this.onBtnClick, this);
    }


    constructor() {
        super();
    }

    public updateView(skinCfg: table.hero.HeroSkinConfig, index, useId, select_idx) {
        this._skinCfg = skinCfg;
        this._index = index
        let heroVo = GIns.heroMgr.getHeroVoByID(this._skinCfg.heroBaseId);
        this._hasSkin = heroVo?.heroVoData?.heroSkinIds?.indexOf(this._skinCfg.id) != -1
        this.view.img_hero.icon = ItemUtils.getNormalHeroHead(skinCfg.headPath);
        let isGray:boolean = !this._hasSkin && skinCfg.id != 0
        this.view.img_hero.grayed = isGray
        this.view.lb_name.grayed = isGray
        if (skinCfg.id == 0) {
            let itemCfg = ItemUtils.getItemConfigByItemId(skinCfg.heroBaseId);
            this.view.lb_name.text = itemCfg.name;
            const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, 1);
            this.view.img_quality.icon = qualityConfig.itemQualityBgPath;
            this.view.lb_name.color = ItemUtils.getTextColor(1);
        } else {
            let itemCfg = ItemUtils.getItemConfigByItemId(skinCfg.id);
            this.view.lb_name.text = itemCfg.name + "";
            const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, itemCfg.quality);
            this.view.img_quality.icon = qualityConfig.itemQualityBgPath;
            this.view.lb_name.color = ItemUtils.getTextColor(itemCfg.quality);
        }
        this.updateUse(useId == skinCfg.id);
        this.updateSelect(index == select_idx);
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Hero_item_skin_item, [this._skinCfg.heroBaseId, this._skinCfg.id])
    }

    public updateUse(isUse) {
        this.view.grp_use.visible = isUse;
    }

    public updateSelect(isSelect) {
        this.view.grp_select.visible = isSelect;
    }


    public onBtnClick() {
        if (this._hasSkin) {
            GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Hero_item_skin_item, [this._skinCfg.heroBaseId, this._skinCfg.id])
        }
        FacadeManager.ins().emit(NotificationKey.HERO_SKIN_SWITCH, { showModelId: this._skinCfg.showModelId, index: this._index });
    }

}