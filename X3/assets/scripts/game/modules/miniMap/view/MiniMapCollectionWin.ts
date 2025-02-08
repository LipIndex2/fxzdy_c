import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIMiniMapKey } from "../const/UIMiniMapConfig";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { MiniMapManager } from "../MiniMapManager";
import { MiniMapCollectionListItem } from "../item/MiniMapCollectionListItem";
import { MiniMapCollectionItem } from "../item/MiniMapCollectionItem";

/**
 * 小地图收集页
 */
export class MiniMapCollectionWin extends UIWin {
    static pkgName: string = "miniMap";
    static viewName: string = "MiniMapCollectionWin";

    private _index: number = 0;
    // 星球id
    private _starId: number = 0;

    private get view(): ui.miniMap.MiniMapCollectionWin {
        return this._view as any;
    }

    /***组件初始化 */
    protected initComp(): void {
        this.addComp(new ViewBlackBgComp());
    }

    protected onInit(): void {
        this.view.list_section.itemRenderer = this.onUpdateSectionItem.bind(this);

        this.view.item_sel.list_star.itemRenderer = this.onUpdateStarItem.bind(this);
    }

    protected onOpen(index: number, isReopen?: boolean): void {
        this._index = index;
        this._starId = MiniMapManager.ins().MapStarId;
        this.view.topItem.getController("c1").selectedIndex = this._index;
        this.view.item_sel.list_star.numItems = MiniMapManager.ins().MapStarCfg.length;
        this.updateUI();
    }

    protected onClose(): void {}

    private updateUI() {
        this.view.list_section.numItems = MiniMapManager.ins().MapChapterCfgById(this._starId).length;

        if (this._starId) {
            this.view.topItem.visible = true;
            // @ts-ignore
            let item = this.view.topItem as MiniMapCollectionItem;
            item.setData(this._starId);
        } else {
            this.view.topItem.visible = false;
        }
    }

    //章节列表
    private onUpdateSectionItem(index: number, item: MiniMapCollectionListItem) {
        let cfg = MiniMapManager.ins().MapChapterCfgById(this._starId)[index];
        item.setData(cfg.id);
        item.setControllerState(this._index);
    }

    private _selItem: ui.miniMap.item.NameTextItem;
    // 星球列表
    private onUpdateStarItem(index: number, item: ui.miniMap.item.NameTextItem) {
        let cfg = MiniMapManager.ins().MapStarCfg[index];
        item.T_name.text = cfg.name;
        if (cfg.id == this._starId) {
            this._selItem = item;
            this._selItem.selected = true;
            this.view.item_sel.T_name.text = cfg.name;
        }

        item.clearClick();
        item.onClick(() => {
            this._starId = cfg.id;
            this._selItem.selected = false;
            item.selected = true;
            this._selItem = item;
            this.view.item_sel.T_name.text = cfg.name;
            this.updateUI();
        });
    }
}
UIScriptManager.bindScript(UIMiniMapKey.MiniMapCollectionWin, MiniMapCollectionWin);
