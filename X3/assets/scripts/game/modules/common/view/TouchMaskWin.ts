import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { UICommonKey } from "../const/UICommonConfig";

export class TouchMaskWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TouchMaskWin";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    listenNotifications(): string[] {
        return;
    }

    notificationHandler(event: string, args?: any): void {
    }

    /**绑定，注册，静态数据获取 （初始化） */
    protected onInit(): void {

    }

    /**动态数据获取，界面逻辑 （界面打开，可能触发多次）*/
    protected onOpen(args?): void {
        let maskTime = (args && typeof (args) == "number") ? args: 3000 // 默认屏蔽3秒
        GameTimer.ins().once(maskTime, this, this.closeSelf); 
    }

    /*清理定时器、动画、临时数据 （界面关闭，注意这里不是销毁）*/
    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    /**用于界面清理缓存 （界面销毁）*/
    protected onPreDispose(): void {

    }
}

UIScriptManager.bindScript(UICommonKey.TouchMaskWin, TouchMaskWin);