import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ListPageController } from "../../common/list/ListPageController";
import { FactoryOtherMainType } from "../const/FactoryEnum";
import { UIFactoryConfig } from "../const/UIFactoryConfig";
import { FactoryOthersItem } from "./item/FactoryOthersItem";

/**
 * 星际工厂其他工厂
 */
@bindScript(UIFactoryConfig.FactoryOthersWin)
export class FactoryOthersWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryOthersWin";

    protected _isInitIndexMap: Map<number, boolean> = new Map()
    protected _curIndex: number = -1
    protected _listCtrl: ListPageController = new ListPageController()
    protected _friends: Vo.factory.PlayerFactoryBaseVo[] = null
    private get view(): ui.factory.view.FactoryOthersWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_FRIEND_UPDATE,
            NotificationKey.FACTORY_RANK_UPDATE,
            NotificationKey.OPEN_ViEW,
            NotificationKey.FRIEND_DATA_ID_CHANGE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_FRIEND_UPDATE:
                this.updateFriends()
                break
            case NotificationKey.FACTORY_RANK_UPDATE:
                if (args) {
                    let datas = args?.data?.map(value => value.baseVo)
                    this._listCtrl.recRequstData(args.curPage, datas, args.totalPage)
                }
                break
            case NotificationKey.OPEN_ViEW:
                if (args == UIFactoryConfig.FactoryOtherMainView || args == UIFactoryConfig.FactoryMainView) {
                    this.closeSelf()
                }
                break
            case NotificationKey.FRIEND_DATA_ID_CHANGE:
                if (GIns.friendModel.friendCount != GIns.factoryModel.friends.length) {
                    //好友出现变更 刷新好友列表
                    GIns.factoryModel.sendLoadFriendFactoryInfo()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listFriend.setVirtual()
        this.view.listRank.setVirtual()
        this.view.listFriend.itemRenderer = this.itemRendererForFriend.bind(this)
        this.view.listRank.itemRenderer = this.itemRendererForRank.bind(this)
        this.view.getController('tab').on(fgui.Event.STATUS_CHANGED, this.onTabChange, this)
        this._listCtrl.requestCallback = this.getRankDataByPage.bind(this)
    }

    protected onPreDispose(): void {
        this._listCtrl.dispose()
    }

    protected itemRendererForFriend(index: number, item: FactoryOthersItem): void {
        item.setData(GIns.factoryModel.friends[index], index, FactoryOtherMainType.Friend)
    }

    protected itemRendererForRank(index: number, item: FactoryOthersItem): void {
        item.setData(GIns.factoryModel.ranks[index], index, FactoryOtherMainType.Rank)
    }

    protected onTabChange(): void {
        let index = this.view.getController('tab').selectedIndex
        this.setIndex(index)
    }

    protected getRankDataByPage(page: number): void {
        GIns.factoryModel.sendLoadFactoryRank({ page: page })
    }

    protected updateFriends(): void {
        this._friends = GIns.factoryModel.friends
        this.view.listFriend.numItems = this._friends.length
        this.view.gNone.visible = GIns.factoryModel.friends.length <= 0
    }

    protected setIndex(index: number): void {
        if (this._curIndex != index) {
            this._curIndex = index
            if (this._isInitIndexMap.has(index) == false) {
                if (index == 0) {
                    GIns.factoryModel.sendLoadFriendFactoryInfo()
                } else {
                    this._listCtrl.init(this.view.listRank, {moreRequestCnt:1})
                }
                this._isInitIndexMap.set(index, true)
            }
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let defaultIndex = args?.index ? args.index : 0
        this.view.listTab.selectedIndex = defaultIndex
        this.view.gNone.visible = false
        this.setIndex(defaultIndex)
    }

    protected onClose(dontDispose?: boolean): void {

    }
}