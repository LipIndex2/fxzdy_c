import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { UICommonKey } from "../const/UICommonConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";


const { GObject } = fgui;

export interface BtnConfirmViewOpenArgs {
    /**标题*/
    title: string,
    /**取消 (不设置 则为 仅可确认弹窗)*/
    titleCancel?: string,
    /**确认*/
    titleConfirm: string,
    /**内容*/
    content: string,
    /**点击确认回调*/
    onBtnYes: Function
    /**关闭回调*/
    closeCb?: Function
    /**是否可以点击背景关闭 在没有取消按钮的情况下*/
    canCloseByBg?: boolean
}

/**
 * 二次确认框
 */
export class BtnConfirmView extends UICommWin {

    // 按 yes 回调
    private _onBtnYesCallback: Function;

    //关闭回调
    private _closeCb?: Function

    //打开参数
    private _args: BtnConfirmViewOpenArgs = null


    static pkgName: string = "commFrame";

    static viewName: string = "BtnConfirmView";

    private get view(): ui.commFrame.confirm.BtnConfirmView {
        return this._view as any;
    }

    protected initComp(): void {
        this.initEffectComp();
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch (eventName) {
        // }
    }

    public onInit(): void {
        this.view.btnNo.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.btnYes.on(fgui.Event.CLICK, this.onBtnYes0, this);
        this.view.bgBtn.onClick(this.onBtnClose, this);
    }

    public onOpen(args: BtnConfirmViewOpenArgs): void {
        this.isClickYes = false;
        this._args = args
        if (args) {
            if (args.title) {
                this.view.labelTitle.text = args.title;
            }

            this.setBtnNoTitle(args.titleCancel);
            this.setBtnYesTitle(args.titleConfirm);


            this.setContent(args.content);
            // 点击确认
            this._onBtnYesCallback = args.onBtnYes;
            this._closeCb = args.closeCb;
        }

    }

    public onClose(): void {
        if (this._closeCb)
            this._closeCb(this.isClickYes);
        G.Logger.debug(" onClose ")
    }

    setBtnYesTitle(title: string): void {
        this.view.btnYes.title = title;

        if (!this.view.btnNo.visible) {
            this.view.btnYes.x = this.view.width / 2;
        }
    }

    /**设置no按钮文本 （空则隐藏 不可取消）*/
    setBtnNoTitle(title: string): void {
        this.view.btnNo.title = title;
        this.view.btnNo.visible = !!title;
    }

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
        if (!this.view.btnNo.visible) return;

        this.closeSelf();
    }
}

UIScriptManager.bindScript(UICommonKey.BtnConfirmView, BtnConfirmView);