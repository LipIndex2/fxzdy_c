import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { SdkManager } from "../../../../core/sdk/SdkManager";
import { UIChooseServerKey } from "../../chooseServer/const/UIChooseServerConfig";
import LoginNotificationKey from "../../LoginNotificationKey";
import { UILoginKey } from "../const/UILoginConfig";
import { ChooseServerModel } from "../model/ChooseServerModel";
import LoginModel from "../model/LoginModel";
import { IServerVo } from "../vo/ILoginVo";
import ProtocolCom from "../com/ProtocolCom";
import { ViewAdaptType, ViewType } from "../../../../core/mvc/view/UIView";
import BgCom from "../com/BgCom";
import { EnumUIViewLayer } from "db://assets/scripts/core/comm/LayerManager";

enum LoginPageState {
    WaitLogin = 0,
    Logined,
    NoSDKLogined,
}

@bindScript(UILoginKey.LOGIN_PAGE)
export class LoginPage extends UIPage {
    static pkgName: string = "login";
    static viewName: string = "LoginPage";

    protected adaptType = ViewAdaptType.FULL;

    /**当前服务器数据 */
    private _serverVo: IServerVo;

    private _protocal: ProtocolCom;
    private _bgCom: BgCom;

    private get view(): ui.login.LoginPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.CHOOSE_SERVER_CHANGED,
            LoginNotificationKey.REFRESH_SERVER_INFO,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.REFRESH_SERVER_INFO:
            case LoginNotificationKey.CHOOSE_SERVER_CHANGED:
                this.updateView();
                break;
        }
    }

    protected onInit(): void {
        this.view.accountBtn.visible = false;
        this.view.accountBtn.alpha = 0;
        this._protocal = this.view.protocolCom as any;
        this._bgCom = this.view.adapt_bg as any;

        this.view.serverBtn.onClick(this.onSwitchServer, this);
        this.view.accountBtn.onClick(this.onSwitchAccount, this);
        this.view.enterBtn.onClick(this.onEnter, this);
        this.view.ageBtn.onClick(() => {
            UIManager.ins().open(UILoginKey.AGE_TIPS_WIN);
        }, this);
    }

    protected onOpen(): void {
        this.updateView();
        this.updateInfo();
    }


    protected onClose(dontDispose?: boolean): void {
    }

    public updateInfo() {
        let infoTxt = ChannelManager.ins().infoTxt;
        let logo = ChannelManager.ins().logo;
        let bg = ChannelManager.ins().loginBg;

        if (bg) {
            this._bgCom.setBgImg("image/unpack/logo/" + bg)
        }

        if (logo) {
            this._bgCom.setLogoImg("image/unpack/logo/" + logo);
        }

        if (infoTxt) {
            this.view.infoCom.txt.text = infoTxt;
        }
    }

    public setState(state: LoginPageState) {
        if (this.view.getController("state").selectedIndex != state) {
            this.view.getController("state").selectedIndex = state;
        }
    }

    private updateView() {
        let serverVo = ChooseServerModel.ins().serverVo;
        if (!serverVo) {
            this.setState(LoginPageState.WaitLogin);
            return;
        }

        this._serverVo = serverVo;
        this.view.serverName.text = serverVo.name;

        if (ChannelManager.ins().manualEnter) {
            //手动进入游戏
            //this.setState(SdkManager.ins().isEnable() ? LoginPageState.Logined : LoginPageState.NoSDKLogined);
            this.setState(LoginPageState.NoSDKLogined);
        } else {
            //自动进入
            this.emit(LoginNotificationKey.ENTER_GAME);
        }
    }

    private onSwitchServer() {
        UIManager.ins().open(UIChooseServerKey.ChooseServerWin);
    }

    private onSwitchAccount() {
        LoginModel.ins().reset();
        this.setState(LoginPageState.WaitLogin);
        if (!SdkManager.ins().isEnable()) {
            UIManager.ins().open(UILoginKey.ACCOUNT_WIN);
        }
    }

    private onEnter() {
        if (this._protocal?.isDisagreeProtocal()) {
            //不同意
            return;
        }

        let ret = ChooseServerModel.ins().checkServerState(this._serverVo, true);
        if (!ret) return;

        this.emit(LoginNotificationKey.ENTER_GAME);
    }
}