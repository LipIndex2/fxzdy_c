import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { LoginConfirmViewOpenArgs, UILoginKey } from "../const/UILoginConfig";


/**
 * 二次确认框
 */
@bindScript(UILoginKey.LOGIN_CONFIRM_VIEW)
export class LoginConfirmView extends UIWin {

    // 按 yes 回调
    private _onBtnYesCallback: Function;

    //关闭回调
    private _closeCb?: Function

    //打开参数
    private _args: LoginConfirmViewOpenArgs = null

    static pkgName: string = "login";

    static viewName: string = "LoginConfirmView";

    private get view(): ui.login.LoginConfirmView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch (eventName) {
        // }
    }

    public onInit(): void {
        // this.view.btnNo.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.confirmBtn.on(fgui.Event.CLICK, this.onBtnYes0, this);
        this.view.bgBtn.onClick(this.onBtnClose, this);
    }

    public onOpen(args: LoginConfirmViewOpenArgs): void {
        this.isClickYes = false;
        this._args = args
        if (args) {
            if (args.title) {
                this.view.labelTitle.text = args.title;
            }

            // this.setBtnNoTitle(args.titleCancel);
            this.setBtnYesTitle(args.titleConfirm);


            this.setContent(args.content);
            // 点击确认
            this._onBtnYesCallback = args.onBtnYes;
            // this._closeCb = args.closeCb;
        }

    }

    public onClose(): void {
        if (this._closeCb)
            this._closeCb(this.isClickYes);
        G.Logger.debug(" onClose ")
    }

    setBtnYesTitle(title: string): void {
        this.view.confirmBtn.title = title;
    }

    /**设置no按钮文本 （空则隐藏 不可取消）*/
    // setBtnNoTitle(title: string): void {
    //     this.view.btnNo.title = title;
    //     this.view.btnNo.visible = !!title;
    // }

    setContent(content: string) {
        this.view.labelContent.text = content;
    }

    private isClickYes: boolean = false
    private onBtnYes0() {
        this.isClickYes = true;
        if (this._onBtnYesCallback) {
            this._onBtnYesCallback();
        }
        this.closeSelf();
    }

    protected onBtnClose() {
        if (this._args?.canCloseByBg) {
            this.closeSelf();
            return
        }
        /**仅确认不可以点击空白关闭 */
        // if (!this.view.btnNo.visible) return;

        // this.closeSelf();
    }
}