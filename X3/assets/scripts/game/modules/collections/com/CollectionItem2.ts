import * as fgui from "fairygui-cc"
import {bindFguiExtension} from "../../../../core/comm/UIScriptManager";
import {ItemUtils} from "../../item/utils/ItemUtils";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import {HeroUtils} from "../../hero/utils/HeroUtils";
import {quality2DiCol} from "../const/UICollectionsConfig";

@bindFguiExtension("ui://collectibles/CollectionItem2")
export class CollectionItem2 extends fgui.GComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionItem2";

    private _star: number;

    private get view(): ui.collectibles.ui.cmp.item.CollectionItem2 {
        return this as any;
    }

    protected onInit() {
        let view = this.view;
        view.list_star1.itemRenderer = this.itemRendererForStar.bind(this);
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    public setData(collectionCfgId: number, LV: number, star: number) {
        let view = this.view;
        this._star = star || 0;
        view.list_star1.numItems = HeroUtils.getShowStarCount(this._star);

        GIns.collectionsCfgMgr.isTimeLimitColl(collectionCfgId);

        if (LV >= 0) {
            view.lv.text = `+${LV}`;
        } else {
            view.lv.text = ``;
        }

        let collItemCfg = G.TableManager.getDataById(table.item.ItemConfig, collectionCfgId);
        view.itemIcon.icon = collItemCfg.bigIconPath;

        let cfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        this.getController("quality").selectedIndex = quality2DiCol[cfg.quality];
    }
}