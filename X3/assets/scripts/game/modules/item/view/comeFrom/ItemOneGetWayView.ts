import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";

const {GObject} = fgui;

/**
 * 锁定状态
 */
enum LockState {
    LOCK = 0,
    UNLOCK = 1,
}

/**
 * 背包
 */
export class ItemOneGetWayView extends fgui.GComponent {

    // 物品来源配置
    private _itemComeFromConfig: table.item.ItemComeFromConfig;


    private readonly CONTROLLER_LOCK_STATE_NAME = "lockState";

    static pkgName: string = "item";

    static viewName: string = "ItemOneGetWayView";

    private get view(): ui.item.ItemOneGetWayView {
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
        G.Logger.debug(" onInit ")

        this.view.btnJump.onClick(this.onClickJump, this);
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")

    }

    public onClose(): void {

        G.Logger.debug(" onClose ")

    }

    onClickJump() {
        const jumpId = this._itemComeFromConfig?.jumpId;
        if (!jumpId) {
            console.warn("没有跳转id ")
            return;
        }
        JumpManager.ins().jumpById(jumpId);
        
    }

    updateView(itemComeFromConfig: table.item.ItemComeFromConfig) {
        this._itemComeFromConfig = itemComeFromConfig;

        // 标题
        this.view.title.text = G.I18nManager.translate(itemComeFromConfig.title);
        // 描述
        this.view.desc.text = G.I18nManager.translate(itemComeFromConfig.desc);
        // 右侧的锁定提示内容
        this.view.lockTips.text = G.I18nManager.translate(itemComeFromConfig.lockTips);

        // 条件检查
        const isOk = ConditionManager.ins().checkCondition(itemComeFromConfig.unlockCondition);
        if (isOk) {
            this.view.getController(this.CONTROLLER_LOCK_STATE_NAME).selectedIndex = LockState.UNLOCK;
        } else {
            this.view.getController(this.CONTROLLER_LOCK_STATE_NAME).selectedIndex = LockState.LOCK;
        }

    }
}