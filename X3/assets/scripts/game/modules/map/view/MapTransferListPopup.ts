import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { MapManager } from "../../../tiledMap/MapManager";
import { MapModel } from "../../../tiledMap/model/MapModule";
import { IMapTransStarData, MapTransConfigManager } from "../config/MapTransConfigManager";
import { TransferListItem } from "../item/TransferListItem";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIMapKey } from "../const/UIMapConfig";

/** 传送列表弹窗界面 */
@bindScript(UIMapKey.MAP_TRANSFER_POPUP)
export class MapTransferListPopup extends UICommWin {
    static pkgName: string = "map";
    static viewName: string = "MapTransferListPopup";

    protected _transCfgMap: Map<number, table.map.TeleportlistConfig[]> = new Map();
    protected _tabs: IMapTransStarData[] = [];

    protected _testTabId: number = 9999;
    protected _testTabName: string = '测试星球';

    /**当前所在建筑id*/
    private _curBuildingId: number;
    /**当前所在星球id*/
    protected _curStarId: number;

    protected _curList: table.map.TeleportlistConfig[] = []

    protected _curIndex: number = -1;
    protected _defaultTabIndex: number = 0;
    protected _defaultItemIndex: number = 0;

    private get view(): ui.map.view.MapTransferListPopup {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    public onInit(): void {

        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.itemRendererForTrans.bind(this);
        this.view.listTab.itemRenderer = this.itemRendererForTab.bind(this)

        this.view.listTab.on(fgui.Event.CLICK_ITEM, this.onClickTab, this)
    }

    protected onOpen(data: { buildingId: number }): void {
        this._curBuildingId = data?.buildingId ? data.buildingId : 0;
        if (this._tabs.length == 0) {
            //初始化配置
            let allMapStars = MapTransConfigManager.getMapStars()
            this._transCfgMap = MapTransConfigManager.getTransMap()
            allMapStars.forEach((starData) => {
                let transCfgs = this._transCfgMap?.get(starData.id)
                if (transCfgs) {
                    //因为排序是从大到小 所以反向遍历
                    for (let i = transCfgs.length - 1; i >= 0; i--) {
                        if (MapModel.ins().getBuildingUnlockById(transCfgs[i].building_id)) {
                            //只显示已解锁的星球
                            this._tabs.push(starData)
                            break
                        }
                    }
                }
            })
            if (this._curBuildingId > 0) {
                this._curStarId = MapTransConfigManager.getBuildStarId(this._curBuildingId)
                this._defaultTabIndex = this._tabs.findIndex((value) => value.id == this._curStarId)
            }
            if (this.isInMainCity()) {
                //如果是在主城需要默认展示最新的解锁传送点
                let arr = this._tabs.filter((value) => value.id != this._testTabId)
                this._defaultTabIndex = arr.length - 1
            }
            this._defaultItemIndex = this._transCfgMap.get(this._curStarId)?.findIndex((value) => value.building_id == this._curBuildingId)
            if (this._defaultItemIndex == undefined) {
                this._defaultItemIndex = -1
            }
            this.view.listTab.numItems = this._tabs.length
        }

        if (this._defaultTabIndex == -1) {
            this._defaultTabIndex = 0
        }
        this.view.listTab.selectedIndex = this._defaultTabIndex
        this.setTabIndex(this._defaultTabIndex)
        this.view.listTab.scrollToView(this._defaultTabIndex, false)
    }

    protected setTabIndex(index: number): void {
        if (this._curIndex != index && index >= 0 && index < this._tabs.length) {
            this._curIndex = index
            let starId = this._tabs[index].id
            this._curList = this._transCfgMap.get(starId)
            this.view.list.numItems = this._curList.length
            let scrollIndex = this._curList.length - 1
            if (starId == this._curStarId) {
                //自动滚动到当前所在传送点
                if (this._defaultItemIndex >= 0 && this._defaultItemIndex <= scrollIndex) {
                    scrollIndex = this._defaultItemIndex
                }
            }
            if (this.isInMainCity()) {
                scrollIndex = this.getFirstUnlockIndex(this._curList)
            }
            this.scollToIndex(scrollIndex)
        }
    }

    protected getFirstUnlockIndex(arr: table.map.TeleportlistConfig[]): number {
        let index = arr.length - 1
        for (let i = 0; i < arr.length; i++) {
            if (MapModel.ins().getBuildingUnlockById(arr[i].building_id)) {
                index = i
                break
            }
        }
        return index
    }

    protected scollToIndex(index: number): void {
        if (index == this._curList.length - 1) {
            this.view.list.scrollToView(index, false)
            return
        }

        if (this.view.list._children?.length <= 0) {
            return
        }
        let listH = this.view.list.height
        let firstItem = this.view.list.getChildAt(0)
        let itemH = firstItem.height
        let endPosY = (index + 1) * itemH + index * this.view.list.lineGap
        endPosY -= listH
        endPosY = Math.max(0, endPosY)
        this.view.list.scrollPane.setPosY(endPosY, false)
    }

    /**当前是否在主城*/
    protected isInMainCity(): boolean {
        const mapId = MapManager.ins().getMapID();
        const isFromAndToPosIsMainCity = MapManager.ins().isMainCityId(mapId) && MapManager.ins().isInMainCity();
        if (isFromAndToPosIsMainCity) {
            return true;
        }
        return false
    }

    protected itemRendererForTrans(index: number, item: TransferListItem): void {
        item.setData(this._curList[index], this._curBuildingId);
    }

    protected itemRendererForTab(index: number, item: ui.map.component.MapTransferTabBtn): void {
        let data = this._tabs[index]
        item.title = data.name
    }

    protected onClickTab(item: ui.map.component.MapTransferTabBtn): void {
        this.setTabIndex(this.view.listTab.selectedIndex)
    }

}