import * as fgui from "fairygui-cc"
import {bindFguiExtension} from "../../../../core/comm/UIScriptManager";
import {CollectionItem} from "./CollectionItem";
import GIns from "../../../GIns";
import G from "../../../../core/comm/G";
import FGUINotificationComponent from "../../../../core/fgui/com/FGUINotificationComponent";
import NotificationKey from "../../../event/NotificationKey";
import { Logger } from "../../../../core/log/Logger";
import { UICollectionsKey } from "../const/UICollectionsConfig";
import { ECollectionInfoViewType } from "../win/CollectionInfoWin";

@bindFguiExtension("ui://collectibles/CollectionsListItem")
export class CollectionsListItem extends FGUINotificationComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionItem";

    private _collectionCfgIdList: Readonly<number[]>;

    private initedItem: Record<number, true> = {};

    private get view(): ui.collectibles.ui.cmp.item.CollectionsListItem {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.COLLECTIONS_UP_STAR,
            NotificationKey.COLLECTIONS_UP_LV,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.COLLECTIONS_PUSH_EXPIRED,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.COLLECTIONS_UP_STAR:
            case NotificationKey.COLLECTIONS_UP_LV: {
                let param = args as XJ.collections.IS2CUpStarParam | XJ.collections.IS2CUpLVParam;
                if (this._collectionCfgIdList.indexOf(param.collectionCfgId) > -1){
                    this.view.list.numItems = this.view.list.numItems;
                }
                break;
            }
            case NotificationKey.EVENT_CHANGE_ITEMS:{
                let addItemIdToAmountMap = args as Map<number, number>;
                let collFragementId2CollId = GIns.collectionsCfgMgr.collFragementId2CollId;
                for(let itemId of addItemIdToAmountMap.keys()){
                    let collCfgId = collFragementId2CollId.get(itemId);
                    if(collCfgId && this._collectionCfgIdList.indexOf(collCfgId) > -1){
                        this.view.list.numItems = this.view.list.numItems;
                        break;
                    }
                }
                break;
            }
            case NotificationKey.COLLECTIONS_PUSH_EXPIRED: {
                this.view.list.numItems = this.view.list.numItems;
                break;
            }
        }
    }

    protected onInit() {
        let view = this.view;
        view.list.itemRenderer = this.listItemRenderer.bind(this);
    }

    private listItemRenderer(index: number, item: CollectionItem): void {
        if (!this.initedItem[index]) {
            item.onClick(this.onClickItem.bind(this, index));
            this.initedItem[index] = true;
        }
        let cfgId = this._collectionCfgIdList[index];
        if (cfgId) {
            item.visible = true;
            item.setData(cfgId);
        } else {
            item.visible = false;
        }
    }

    setData(cfgIdList: number[]): void {
        this._collectionCfgIdList = cfgIdList;
        this.view.list.numItems = cfgIdList.length;
    }

    private onClickItem(index: number) {
        let collectionCfgId = this._collectionCfgIdList[index];
        Logger.game(`查看收藏品：collectionCfgId`);
        if (GIns.collectionsModel.context.isCanCompound(collectionCfgId)) {
            GIns.collectionsModel.active(collectionCfgId);
        } else {
            let param: XJ.collections.ICollectionsInfoViewParam = {
                collectionId: collectionCfgId,
                viewFlag: ECollectionInfoViewType.active | ECollectionInfoViewType.UP
            };
            G.UIManager.open(UICollectionsKey.COLLECTION_INFO, param);
        }
    }
}