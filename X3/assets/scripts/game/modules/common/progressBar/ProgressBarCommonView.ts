import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";


const {GObject} = fgui;

/**
 * 同用进度条组件
 */
export class ProgressBarCommonView extends fgui.GComponent {

    // "+" button 的回调
    private _buttonAddCallback: Function;
    // "-" button 的回调
    private _buttonMinusCallback: Function;

    static pkgName: string = "comm";

    static viewName: string = "ProgressBarCommonView";


    private get view(): ui.comm.progressBar.ProgressBarCommonView {
        return this as any;
    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        // 左右两个 +/- 按钮
        this.view.buttonAdd.on(fgui.Event.CLICK, this.onClickButtonAdd, this);
        this.view.buttonMinus.on(fgui.Event.CLICK, this.onClickButtonMinus, this);
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")


    }

    public onClose(): void {

        G.Logger.debug(" onClose ")

    }


    /**
     * 设置点击回调
     * @param buttonAddCallback "+" button 回调
     * @param buttonMinusCallback "-" button 回调
     */
    setClickCallback(buttonAddCallback: Function, buttonMinusCallback: Function) {
        this._buttonAddCallback = buttonAddCallback;
        this._buttonMinusCallback = buttonMinusCallback;
    }

    private onClickButtonAdd() {
        if (!this._buttonAddCallback) {
            return
        }
        this._buttonAddCallback()
    }


    private onClickButtonMinus() {
        if (!this._buttonMinusCallback) {
            return
        }
        this._buttonMinusCallback()
    }
}