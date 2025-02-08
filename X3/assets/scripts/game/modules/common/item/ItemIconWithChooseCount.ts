import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { BoxItemChooseRewardView } from "db://assets/scripts/game/modules/item/view/boxItemChoose/BoxItemChooseRewardView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "./ItemFrameBtn";

const { GObject } = fgui;

/**
 * 道具 with 选择数量
 */
export class ItemIconWithChooseCount extends fgui.GComponent {
    // 父页面
    // private _chooseRewardView: BoxItemChooseRewardView;
    private _chooseRewardView: any;
    // 选择的数量
    private _count: number = 0;
    // 最大数量
    private _maxCount: number = 0;
    // + 按钮回调
    private _clickAddCallback: Function;
    // - 按钮回调
    private _clickMinusCallback: Function;

    // 道具配置
    private _itemConfig: table.item.ItemConfig;

    static pkgName: string = "comm";

    static viewName: string = "ItemIconWithChooseCount";

    private get view(): ui.comm.item.ItemIconWithChooseCount {
        return this as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch(eventName){
        // }
    }

    public onConstruct(): void {
        G.Logger.debug("[ItemIconWithChooseCount] onInit ");

        this.view.chooseView.buttonAdd.onClick(this.onAddClick, this);
        this.view.chooseView.buttonMinus.onClick(this.onMinusClick, this);
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ");
    }

    public onClose(): void {
        G.Logger.debug(" onClose ");
    }

    /**
     * 设置道具数据
     * @param chooseRewardView 选择奖励界面
     * @param itemConfig 道具配置
     * @param count 数量
     * @param maxCount 最大数量
     */
    updateData(chooseRewardView: BoxItemChooseRewardView, itemConfig: table.item.ItemConfig, count: number, maxCount: number) {
        this._chooseRewardView = chooseRewardView;
        this._itemConfig = itemConfig;
        this._maxCount = maxCount;

        FguiScriptUtils.toMyScriptClass(this.view.itemIcon, ItemFrameBtn).reset(this._itemConfig.id, 0);
    }

    setClickAddCallback(callback: Function) {
        this._clickAddCallback = callback;
    }

    setClickMinusCallback(callback: Function) {
        this._clickMinusCallback = callback;
    }

    private onAddClick() {
        if (this._chooseRewardView.isNotCanAdd()) {
            return;
        }
        if (this._clickAddCallback) {
            this._clickAddCallback();
        }

        this._count = Math.min(this._count + 1, this._maxCount);
        this.view.chooseView.count.text = this._count.toString();
    }

    private onMinusClick() {
        if (this._chooseRewardView.isNotCanMinus()) {
            return;
        }
        if (this._clickMinusCallback) {
            this._clickMinusCallback();
        }

        this._count = Math.max(this._count - 1, 0);
        this.view.chooseView.count.text = this._count.toString();
    }
}
