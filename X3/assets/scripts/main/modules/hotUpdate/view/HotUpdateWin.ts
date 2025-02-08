import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { NumberUtils } from "../../../../core/utils/NumberUtils";
import LoginNotificationKey from "../../LoginNotificationKey";
import { UIHotUpdateKey } from "../const/UIHotUpdateConfig";
import { HotUpdateManager } from "../model/HotUpdateManager";

export class HotUpdateWin extends UIWin {
    static pkgName: string = "hotUpdate";
    static viewName: string = "HotUpdateWin";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private get view(): ui.hotUpdate.view.HotUpdateWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.HOTUPDATE_PROGRESS,
            LoginNotificationKey.HOTUPDATE_FAILED,

        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.HOTUPDATE_PROGRESS:
                let data = args as { percent: number };
                this.onProgress(data.percent || 0);
                break;
            case LoginNotificationKey.HOTUPDATE_FAILED:
                this.onFailed();
                break;
        }
    }

    protected onInit(): void {
        this.view.confirmBtn.onClick(this.onUpdate, this);
    }

    protected onOpen(): void {
        this.updateData();
    }

    protected onClose(): void {
    }

    private updateData() {
        this.view.contentTxt.setVar("num", this.getTotalSize()).flushVars();
    }

    private onUpdate(): void {
        this.view.confirmBtn.touchable = false;
        this.view.confirmBtn.grayed = true;
        HotUpdateManager.ins().hotUpdate();
    }

    private onFailed(): void {
        HotUpdateManager.ins().checkUpdate();
        this.view.confirmBtn.touchable = true;
        this.view.confirmBtn.grayed = false;
    }

    private getTotalSize() {
        let size = HotUpdateManager.ins().getTotalBytes();
        return NumberUtils.numberToSizeStr(size, 1);
    }

    private onProgress(percent: number): void {
        this.view.progressTxt.text = Math.floor(percent) + "%";
    }
}

UIScriptManager.bindScript(UIHotUpdateKey.HotUpdateWin, HotUpdateWin);