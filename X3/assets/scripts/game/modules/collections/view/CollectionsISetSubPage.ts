import {UICollectionsKey} from "../const/UICollectionsConfig";
import {CollectionsSetListItem} from "../com/CollectionsSetListItem";
import {bindScript} from "../../../../core/comm/UIScriptManager";
import {UIPage} from "../../../../core/mvc/view/UIPage";
import G from "../../../../core/comm/G";
import {EnumUIViewLayer} from "../../../../core/comm/LayerManager";
import NotificationKey from "../../../event/NotificationKey";


/**
 *  藏品套装列表
 *  子页面
 */
@bindScript(UICollectionsKey.SET_SUB_PAGE)
export class SevenDayLoginSubPage extends UIPage {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionsSetSubPage";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    private suitIds: number[];

    private get view(): ui.collectibles.ui.view.page.CollectionsSetSubPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIONS_ACTIVE_SET,
            NotificationKey.COLLECTIONS_UP_STAR,
            NotificationKey.COLLECTIONS_UP_LV,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIONS_ACTIVE_SET:
            case NotificationKey.COLLECTIONS_UP_STAR:
            case NotificationKey.COLLECTIONS_UP_LV:
                this.view.list.refreshVirtualList();
                break
            default:
                break;
        }
    }

    protected onInit() {
        let view = this.view;
        view.list.itemRenderer = this.suitRenderer.bind(this);
        view.list.setVirtual();

        this.suitIds = G.TableManager.getAllData(table.collectibles.CollectiblesSuitConfig).map(a => {
            return a.id;
        });
    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view;
        view.list.numItems = this.suitIds.length;
    }

    private suitRenderer(index: number, item: CollectionsSetListItem) {
        let suitCfgId = this.suitIds[index];
        item.setData(suitCfgId);
    }
}