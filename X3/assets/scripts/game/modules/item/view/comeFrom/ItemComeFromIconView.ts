import G from "db://assets/scripts/core/comm/G";
import {EventTouch} from "cc";
import * as fgui from "fairygui-cc";
import {ItemComeFromView} from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromView";
import {FGUIMaskUtils} from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";


const {GObject} = fgui;

enum EnumChooseControllerState {
    // 未选中
    NO_CHOOSE = 0,
    // 选中
    CHOOSE = 1,
}

/**
 * 道具获取方式的图标
 */
export class ItemComeFromIconView extends fgui.GComponent {

    // 道具配置
    private _itemConfig: table.item.ItemConfig;
    // 弹出面板
    private _comeFromView: ItemComeFromView;

    static pkgName: string = "item";

    static viewName: string = "ItemComeFromIconView";

    private get view(): ui.item.ItemComeFromIconView {
        return this as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch(eventName){
        // }

    }


    public onInit(): void {
        G.Logger.debug("[ItemGetWayIconView] onInit ")

        
        // 触摸按钮
        this.view.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);


    }

    // public onOpen(): void {
    //     G.Logger.debug(" onOpen ")
        
    //     FGUIMaskUtils.createBackgroundMask(this.view)
    // }

    // public onClose(): void {

    //     G.Logger.debug(" onClose ")

    // }


    private onTouchEnd(event: EventTouch) {

        G.Logger.debug(event, " onTouchEnd ")

        this.setChooseAndUpdate(true)
    }


    // 设置选中
    public setChoose(chooseFlag: boolean) {
        if (chooseFlag) {
            this.view.getController("choose").selectedIndex = EnumChooseControllerState.CHOOSE;
        } else {
            this.view.getController("choose").selectedIndex = EnumChooseControllerState.NO_CHOOSE;
        }
    }


    public setChooseAndUpdate(chooseFlag: boolean) {
        this.setChoose(chooseFlag)


        this._comeFromView.setChooseItem(this._itemConfig)
        this._comeFromView.resetView(this._itemConfig)
    }


    bindPopUpView(view: ItemComeFromView) {
        this._comeFromView = view;
    }

    setData(itemConfig: table.item.ItemConfig) {
        this._itemConfig = itemConfig;

        this.updateView()
    }

    private updateView() {
        this.view.iconItem.icon = this._itemConfig.iconPath;
    }
}