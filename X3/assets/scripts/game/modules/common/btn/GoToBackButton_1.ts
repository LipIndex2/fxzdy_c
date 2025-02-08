import * as fgui from "fairygui-cc";
import { UIManager } from "../../../../core/mvc/UIManager";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/**
 * 通用返回按钮
 */
@bindFguiExtension("ui://comm/GoToBackButton_1")
export class GoToBackButton_1 extends fgui.GButton {
    private get view(): ui.comm.btn.GoToBackButton_1 {
        return this as any;
    }

    // 自定义返回按钮
    public callBack: Function;

    constructor() {
        super();
    }
    protected onConstruct() {
        this.view.on(fgui.Event.CLICK, this.onBackClick, this);
    }
    private onBackClick() {
        if (this.callBack != null) {
            this.callBack();
            return;
        } else {
            UIManager.ins().goToBack();
        }
    }
}
