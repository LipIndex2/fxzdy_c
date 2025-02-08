import { bindScript } from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { QualityUtils } from "../common/quality/QualityUtils";
import { ItemTipsViewOpenArgs } from "./ItemTipsView";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

/**
 * 皮肤
 */
@bindScript(UIViewItemDetailsKey.SkinTipsView)
export class SkinTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "SkinTipsView";

    private _skinCfg: table.hero.HeroSkinConfig;

    private get view(): ui.itemDetails.SkinTipsView {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.list_attr.itemRenderer = this.updateListAttr.bind(this);
    }

    protected onOpen(args: ItemTipsViewOpenArgs, isReopen?: boolean): void {
        let cfg = args.itemConfig;
        let qualityCfg = QualityUtils.getQualityConfigById(cfg.quality);
        this._skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, cfg.id);
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, this._skinCfg.heroBaseId);
        this.view.T_name.text = cfg.name;
        this.view.T_name.text = `${this.view.T_name.text}-${heroCfg.name}`;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, cfg.quality);
        // @ts-ignore
        this.view.modelNode.loadByModelId(this._skinCfg.showModelId);
        this.view.modelNode.setScale(2.4, 2.4);
        this.view.list_attr.numItems = this._skinCfg.attrs.length;
        this.view.img_bg.icon = qualityCfg.petPropDetailsQualityBgIconPath;
        this.view.img_quality.icon = qualityCfg.petPropDetailsQualityIconPath;
    }

    private updateListAttr(index: number, item: ui.itemDetails.item.WeaponTipsAttrItem): void {
        let attr = this._skinCfg.attrs[index];
        let attrCfg = TableManager.getDataById(table.battle.AttributeConfig, attr.k);
        item.lbDes.letterSpacing = 20;
        item.lbDes.text = "全体" + attrCfg.attrName;
        // item.lbDes.setPivot;
        if (attrCfg.isPermyriad) {
            item.lbValue.text = attr.v / 100 + "%";
        } else {
            item.lbValue.text = attr.v;
        }
    }
}
