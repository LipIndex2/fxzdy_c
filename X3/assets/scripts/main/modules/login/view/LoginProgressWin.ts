import { tween } from "cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";

import { UIPage } from "../../../../core/mvc/view/UIPage";
import LoginNotificationKey from "../../LoginNotificationKey";
import { UILoginKey } from "../const/UILoginConfig"; import { Tween } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressText, GameTaskProgressTime } from "../../../procedure/GameTaskProgress";
import { UIManager } from "../../../../core/mvc/UIManager";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { NumberUtils } from "../../../../core/utils/NumberUtils";
import { UIWin } from "db://assets/scripts/core/mvc/view/UIWin";

@bindScript(UILoginKey.LOGIN_PROGRESS_WIN)
export class LoginProgressWin extends UIWin {
    static pkgName: string = "login";
    static viewName: string = "LoginProgressWin";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    protected _loginBg: fgui.GComponent;

    private get view(): ui.login.LoginProgressWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.LOGIN_PROGRESS_UPDATE,
            LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG,
            LoginNotificationKey.HOTUPDATE_PROGRESS,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.LOGIN_PROGRESS_UPDATE:
                this.updateProgress(args);
                break;
            case LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG:
                this.updateProgressByTag(args.tag);
                break;
            case LoginNotificationKey.HOTUPDATE_PROGRESS:
                let data = args as { percent: number, totalBytes: number, loadedBytes: number };
                if (!data) {
                    return;
                }
                this.updateProgressByHotUpdate(data);
                break;
        }
    }

    protected onInit(): void {
        this.view.progress.value = 0;
        this.view.progress.max = 100;
        this.view.ageBtn.onClick(() => {
            UIManager.ins().open(UILoginKey.AGE_TIPS_WIN);
        }, this);
    }

    protected onOpen(): void {
        this.view.progress.value = 0;
        this.updateProgress({ percent: 3, time: 200 });
        this.updateInfo();
        this.robBgInLogin();
    }

    /**把登录界面背景移到该界面 */
    protected robBgInLogin() {
        if (!this._loginBg) {
            let view = UIManager.ins().getViewInstance(UILoginKey.LOGIN_PAGE);
            if (view) {
                //@ts-ignore
                this._loginBg = view._view?.adapt_bg;
                if (this._loginBg) {
                    this._loginBg.removeFromParent();
                    this.view.bg.addChild(this._loginBg);
                }
            }
        }
    }

    /**归还背景 */
    protected giveBackBgToLogin() {
        let view = UIManager.ins().getViewInstance(UILoginKey.LOGIN_PAGE);
        if (view && this._loginBg) {
            this._loginBg.removeFromParent();
            view._view?.addChildAt(this._loginBg, 0);
            this._loginBg = null;
        }
    }


    public updateInfo() {
        // let infoTxt = ChannelManager.ins().infoTxt;
        // let logo = ChannelManager.ins().logo;
        // let bg = ChannelManager.ins().loginBg;

        // if (bg) {
        //     this.view.adapt_bg.bg.icon = null;
        //     this.view.adapt_bg.bg.icon = "image/unpack/logo/" + bg;
        // }

        // if (logo) {
        //     this.view.adapt_bg.logo.icon = null;
        //     this.view.adapt_bg.logo.icon = "image/unpack/logo/" + logo;
        // }

        // if (infoTxt) {
        //     this.view.infoCom.txt.text = infoTxt;
        // }
    }

    protected onClose(): void {
        this.giveBackBgToLogin();
        GameTimer.ins().clearAll(this);
    }

    private updateProgressByTag(tag: GameTaskProgressTag) {
        if (!tag) return;

        this.updateProgress({ percent: GameTaskProgress[tag], time: GameTaskProgressTime[tag] });
        this.view.tipsText.text = GameTaskProgressText[tag];
    }

    private updateProgress(data: { percent: number, time: number }) {
        Tween.stopAllByTarget(this.view.progress);

        if (data.time == 0) {
            this.view.progress.value = data.percent;
        } else {
            let s = data.time / 1000;
            let value = data.percent;
            //console.log(s + " >>>>>>>>>>>>>>>>>>>>>>>>> " + data.percent);
            tween(this.view.progress).to(s, { value: value }).start();
        }

        if (data.percent == 100) {
            this.delayClose();
        }
    }

    private delayClose() {
        GameTimer.ins().once(GameTaskProgressTime.END + 50, this, () => {
            this.closeSelf();
        })
    }

    private updateProgressByHotUpdate(data: { percent: number, totalBytes: number, loadedBytes: number }) {
        Tween.stopAllByTarget(this.view.progress);
        this.view.progress.value = data.percent * 0.97 + 3;
        this.view.tipsText.text = "正在下载更新包 " + NumberUtils.numberToSizeStr(data.loadedBytes, 2) + "/" + NumberUtils.numberToSizeStr(data.totalBytes, 2);
    }
}