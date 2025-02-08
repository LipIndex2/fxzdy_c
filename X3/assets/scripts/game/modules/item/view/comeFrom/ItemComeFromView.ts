import G from "db://assets/scripts/core/comm/G";
import { EventTouch, Input, v2 } from "cc";
import * as fgui from "fairygui-cc";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import {
    ItemComeFromIconView
} from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromIconView";
import {
    ItemOneGetWayView
} from "db://assets/scripts/game/modules/item/view/comeFrom/ItemOneGetWayView";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { UiTweenMgr } from "../../../../../core/comm/UiTweenMgr";


const { GObject } = fgui;

export interface ItemComeFromViewOpenArgs {
    itemConfig: table.item.ItemConfig
}

/**
 * 道具来源 View
 */
export class ItemComeFromView extends UICommWin {

    // 选中的物品配置
    private _currentChooseItemConfig: table.item.ItemConfig;
    // 过滤的道具获取方式
    private _filterItemComeFromConfigArray: table.item.ItemComeFromConfig[] = [];
    private _filterItemConfigArray: table.item.ItemConfig[] = [];

    static pkgName: string = "item";

    static viewName: string = "ItemComeFromView";

    private get view(): ui.item.ItemComeFromView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch(eventName){
        // }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        // 触摸外部
        // this.view.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        // 所有道具
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRendererForItem.bind(this);

        // 道具获取方式
        this.view.comeFromList.setVirtual();
        this.view.comeFromList.itemRenderer = this.itemRendererForGetWayRow.bind(this);
    }

    public onOpen(args: ItemComeFromViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)


        // 初始化列表



        this.reset(args.itemConfig)
    }

    private reset(itemConfig: table.item.ItemConfig): void {
        this._currentChooseItemConfig = itemConfig;

        this.resetView(itemConfig);

        this.updateScrollViewForItem()

        this.setChooseItem(itemConfig)

    }


    /**
     * 重置显示文本
     * @param itemConfig
     */
    public resetView(itemConfig: table.item.ItemConfig) {
        // 修改标题部分
        this.view.labelItemTitle.text = G.I18nManager.translate(itemConfig.name)
        this.view.labelDesc.text = G.I18nManager.translate(itemConfig.desc)

        const itemById = ItemModel.ins().getItemById(itemConfig.id);
        if (itemById) {
            this.view.labelHaveItemCount.setVar("count", itemById.count?.toString() || "0")
        } else {
            this.view.labelHaveItemCount.setVar("count", "0")
        }
        this.view.labelHaveItemCount.flushVars()
    }

    public setChooseItem(itemConfig: table.item.ItemConfig) {
        const filterItemComeFromConfigArray: table.item.ItemComeFromConfig[] = G.TableManager.getAllData(table.item.ItemComeFromConfig)
            .toDataStream()
            .filter((it) => it.itemId == itemConfig.id)
            .toList();
        this._filterItemComeFromConfigArray = filterItemComeFromConfigArray;
        this.view.comeFromList.numItems = filterItemComeFromConfigArray.length;

        // 选中的道具
        this._currentChooseItemConfig = itemConfig;
        // 刷新
        this.view.itemList.refreshVirtualList();
        UiTweenMgr.ins().listShowEffect(this.view.comeFromList)
    }

    /**
     * 渲染背包物品列表
     * @private
     */
    private updateScrollViewForItem() {

        const itemComeFromConfigArray = G.TableManager.getAllData(table.item.ItemComeFromConfig)
            .toDataStream()
            .distinct((it) => it.itemId)
            .toList();
        this._filterItemConfigArray = itemComeFromConfigArray.toDataStream()
            .map((it) => G.TableManager.getDataById(table.item.ItemConfig, it.itemId))
            .filter((it) => it != null)
            .toList();

        this.view.itemList.numItems = this._filterItemConfigArray.length;


    }

    public onClose(): void {
        G.GameTimer.clearAll(this);
        G.Logger.debug(" onClose ")
        UiTweenMgr.ins().removeTweenEffect(this.view.comeFromList)
    }


    private onTouchEnd(event: EventTouch) {

        G.Logger.debug(event, " onTouchEnd ")

        // 点击空白处退出背包面板
        let uiPos = event.getUILocation(v2(0, 0));
        let boundingBox = this.view.background._uiTrans.getBoundingBoxToWorld();
        let isIn = boundingBox.contains(uiPos);
        if (isIn) {
            return
        }
        this.closeSelf()
    }

    private itemRendererForItem(index: number, view: ItemComeFromIconView) {
        const itemConfig = this._filterItemConfigArray[index];

        view.setData(itemConfig)

        view.bindPopUpView(this)

        if (itemConfig.id == this._currentChooseItemConfig.id) {
            //直接设置没有渲染出来的item会报错,加个10毫秒延迟等item渲染出来在设置
            G.GameTimer.once(10,this, ()=>{
                this.view.itemList.scrollToView(index,true)
            })
            view.setChoose(true)
        } else {
            view.setChoose(false)
        }
    }


    /**
     * 物品类型
     * @private
     */
    private itemRendererForGetWayRow(index: number, view: ItemOneGetWayView) {
        const itemComeFromConfig = this._filterItemComeFromConfigArray[index];

        view.updateView(itemComeFromConfig)
    }

}