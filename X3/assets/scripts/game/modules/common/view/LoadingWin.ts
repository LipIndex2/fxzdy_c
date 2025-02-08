import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { TimeManager } from "../../../../core/time/TimeManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { LayoutUtils } from "../../../../core/utils/LayoutUtils";
import NotificationKey from "../../../event/NotificationKey";
import { UICommonKey } from "../const/UICommonConfig";
import { ModelNode } from "../node/ModelNode";

export class LoadingWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "LoadingWin";
    static animModelPath = "spine/building/guochangdonghua/guochangdonghua";

    public _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private _modelNode: ModelNode;
    private _cfgs: table.common.LoadingTipsConfig[];

    private _endTime: number;

    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.onComplete();
                break;
        }
    }

    /**是否是登录 */
    private _isLogin: boolean;

    private get view(): ui.comm.view.LoadingWin {
        return this._view as any;
    }

    protected onInit(): void {
        this._modelNode = this.view.loadingCom.modelNode as ModelNode;
        this._modelNode.loadByPath(LoadingWin.animModelPath);
        if(this._modelNode.spineNode){
            this._modelNode.spineNode.premultipliedAlpha = false;
        }
        this._modelNode.play("idle", true);
    }

    protected onOpen(args: { isLogin: boolean }): void {
        LayoutUtils.setScreenCenter(this.view.loadingCom);

        this._endTime = TimeManager.serverNow + 1000;
        this._isLogin = args && args.isLogin;
        this.showTable();
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    private showTable() {
        if (TableManager.isComplete()) {
            this._cfgs = TableManager.getAllData(table.common.LoadingTipsConfig);
            if (!this._cfgs?.length) return;
            let index = Math.floor(Math.random() * this._cfgs.length);
            this.view.tipsTxt.text = I18nManager.ins().translate(this._cfgs[index].content);
        } else {
            GameTimer.ins().once(500, this, this.showTable);
        }
    }

    private onComplete() {
        if (this._endTime > TimeManager.serverNow) {
            GameTimer.ins().once(this._endTime - TimeManager.serverNow, this, this.onComplete);
        } else {
            this.emit(NotificationKey.LOADING_VIEW_COMPLETE);
            this.closeSelf();
        }
    }
}

UIScriptManager.bindScript(UICommonKey.LoadingWin, LoadingWin);