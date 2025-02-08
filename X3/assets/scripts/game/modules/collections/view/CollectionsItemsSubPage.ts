import G from "../../../../core/comm/G";
import {EnumUIViewLayer} from "../../../../core/comm/LayerManager";
import {bindScript} from "../../../../core/comm/UIScriptManager";
import {UIPage} from "../../../../core/mvc/view/UIPage";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import {CollectionsListItem} from "../com/CollectionsListItem";
import {UICollectionsKey} from "../const/UICollectionsConfig";

/**
 *  藏品列表
 *  子页面
 */
@bindScript(UICollectionsKey.ITEM_SUB_PAGE)
export class SevenDayLoginSubPage extends UIPage {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionsItemsSubPage";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    private _collectionIds: number[][] = [];

    private get view(): ui.collectibles.ui.view.page.CollectionsItemsSubPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIONS_ACTIVE,
            NotificationKey.COLLECTIONS_UP_LV,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIONS_ACTIVE: {
                this.updateCollectionListData();
                this.view.list.numItems = this._collectionIds.length;
                break;
            }
            case NotificationKey.COLLECTIONS_UP_LV: {
                this.view.list.refreshVirtualList();
                break;
            }
            default:
                break;
        }
    }

    protected onInit() {
        let view = this.view;
        view.list.itemRenderer = this.itemRenderer.bind(this);
        view.list.setVirtual();

    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view;
        this.updateCollectionListData();
        view.list.numItems = this._collectionIds.length;
    }

    protected itemRenderer(index: number, listItem: CollectionsListItem) {
        let subIds = this._collectionIds[index];
        listItem.setData(subIds);
    }

    private updateCollectionListData() {
        this._collectionIds.length = 0;
        let allCollectionsId = G.TableManager.getAllData(table.collectibles.CollectiblesConfig).map(n => {
            return n.id;
        });
        // 道具排序：已拥有>可合成>未拥有，品质高>品质低；id大>id小
        let collectionContext = GIns.collectionsModel.context;
        allCollectionsId.sort((a, b) => {
            let sa: number, sb: number
            sa = collectionContext.isHaveCollection(a) ? 0 : 1;
            sb = collectionContext.isHaveCollection(b) ? 0 : 1;
            if (sa !== sb) {
                return sa - sb;
            }

            sa = collectionContext.isCanCompound(a) ? 0 : 1;
            sb = collectionContext.isCanCompound(b) ? 0 : 1;
            if (sa !== sb) {
                return sa - sb;
            }

            let cfgA = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, a);
            let cfgB = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, b);
            if (cfgA.quality != cfgB.quality) {
                return cfgB.quality - cfgA.quality;
            }

            return cfgB.id - cfgA.id;
        });

        while (allCollectionsId.length > 0) {
            let chunk = allCollectionsId.splice(0, 3);
            this._collectionIds.push(chunk);
        }
    }
}