import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";
import { AttrData } from "../../attr/AttrManager";
import { UIHeroKey } from "../const/UIHeroConfig";

/**
 * 英雄属性预览界面
 */
@bindScript(UIHeroKey.SkinAttrPreviewWin)
export class SkinAttrPreviewWin extends UICommWin {
    static pkgName: string = "hero";
    static viewName: string = "SkinAttrPreviewWin";

    private get view(): ui.hero.view.SkinAttrPreviewWin {
        return this._view as any;
    }

    private _showAttrs: AttrData[] = [];

    onInit() {
        this.view.list_attr1.itemRenderer = this.attrItemRenderer.bind(this);
    }

    onOpen() {
        this._showAttrs = GIns.heroMgr.getSkinAttrs();
        this.view.list_attr1.numItems = this._showAttrs.length;
    }

    private attrItemRenderer(index: number, item: ui.hero.item.TextItem2) {
        let attr = this._showAttrs[index];

        let cfg = TableManager.getDataById(table.battle.AttributeConfig, attr.id);
        item.T_name.text = "全体" + cfg.attrName;
        if (cfg.isPermyriad) {
            item.T_count.text = `${attr.num / 100}%`;
        } else {
            item.T_count.text = `${attr.num}`;
        }

        item.T_count.x = 307;
    }
}
