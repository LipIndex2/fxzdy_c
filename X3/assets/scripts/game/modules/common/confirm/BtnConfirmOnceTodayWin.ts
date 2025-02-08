import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { LocalStorageUtils } from "../../../../core/utils/LocalStorageUtils";
import { UICommonKey } from "../const/UICommonConfig";
import { IBtnConfirmViewOnceTodayOpenArgs } from "./IBtnConfirmViewOnceTodayOpenArgs";

/**
 * 二次确认框
 */
@bindScript(UICommonKey.BtnConfirmOnceTodayWin)
export class BtnConfirmOnceTodayWin extends UIWin {
    static pkgName: string = "commFrame";
    static viewName: string = "BtnConfirmOnceTodayWin";

    //打开参数
    private _args: IBtnConfirmViewOnceTodayOpenArgs = null;
    protected _initCancelX: number;
    protected _initConfirmX: number;

    private get view(): ui.commFrame.confirm.BtnConfirmOnceTodayWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {}

    protected onInit(): void {
        this.view.btnConfirm.onClick(this.onClickConfirm, this);
        this.view.btnCancel.onClick(this.onClickCancel, this);
        this.view.btnClose.onClick(this.closeSelf, this);
        this.view.bgBtn.onClick(this.onClickBg, this);
    }

    protected onPreDispose(): void {}

    protected onClickConfirm(): void {
        if (this._args.onClickConfirm) {
            this._args.onClickConfirm();
        }
        this.closeSelf();
    }

    protected onClickCancel(): void {
        if (this._args.onClickCancel) {
            this._args.onClickCancel();
        }
        this.closeSelf();
    }

    protected onClickBg(): void {
        if (this._args.titleCancel) {
            this.closeSelf();
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as IBtnConfirmViewOnceTodayOpenArgs;
        if (this._args) {
            this.view.lbTitle.text = this._args.title ? this._args.title : "";

            this.view.btnConfirm.title = this._args.titleConfirm;

            if (this._args.titleCancel) {
                //有取消 显示两个按钮
                this.view.btnCancel.title = this._args.titleCancel;
            } else {
                //只有确定
                this.view.btnConfirm.x = this.view.width / 2;
            }
            this.view.lbContent.text = this._args.content ? this._args.content : "";

            this.view.lbTip.text = this._args.lbTip ? this._args.lbTip : "本日不再弹出";
        } else {
            this.closeSelf();
        }
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._args.localKey && this.view.btnGouXuan.selected) {
            //选中了今日只提示一次
            let todayZero: number = G.TimeManager.todayZero;
            LocalStorageUtils.set(this._args.localKey, todayZero);
        }
        if (this._args.onSelectedFun && this.view.btnGouXuan.selected) {
            this._args.onSelectedFun();
        }
    }
}
