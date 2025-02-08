
import AccountHistoryCom from "../com/AccountHistoryCom";
import { UILoginKey } from "../const/UILoginConfig";
import LoginNotificationKey from "../../LoginNotificationKey";
import { AccountHistoryModel } from "../model/AccountHistoryModel";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { SdkManager } from "../../../../core/sdk/SdkManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";


@bindScript(UILoginKey.AGE_TIPS_WIN)
export class AgeTipsWin extends UICommWin {

    static pkgName: string = "loginAgeTips";
    static viewName: string = "AgeTipsWin";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private get view(): ui.loginAgeTips.AgeTipsWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return;
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected onInit(): void {
    }

    protected onOpen(): void {
    }

    protected onClose(): void {
    }

}