import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { UIAccountConfig } from "../const/UIAccountConfig";

export class ReconnectWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "ReconnectWin";
    protected _layer = EnumUIViewLayer.WARN;

    private _strs = [".", "..", "..."];
    private _index = 2;

    private get view(): ui.comm.reconnect.ReconnectWin {
        return this._view as any;
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onInit(): void {
    }

    protected onOpen(): void {
        this.cancelAllTouches();

        this.updateTxt();
        GameTimer.ins().loop(1000, this, this.updateTxt);
    }

    private updateTxt() {
        this._index = (this._index + 1) % 3;
        this.view.tipsTxt.setVar("str", this._strs[this._index]).flushVars();
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }
}

UIScriptManager.bindScript(UIAccountConfig.ReconnectWin, ReconnectWin);