import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { sys } from "cc";
import { NativeAPI } from "../../../../core/native/NativeAPI";
import LoginNotificationKey from "../../LoginNotificationKey";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";

@bindFguiExtension("ui://login/ProtocolCom")
export default class ProtocolCom extends fgui.GComponent {
    private _protocolAgreeKey = "protocolAgree";

    public get view(): ui.login.com.ProtocolCom {
        return (this as any);
    }

    protected onInit(): void {
        this.view.protocolText.on(fgui.Event.LINK, this.onOpenUrl, this);
        this.view.checkBtn.on(fgui.Event.STATUS_CHANGED, this.onProtocalChanged, this);

        let isAgree = sys.localStorage.getItem(this._protocolAgreeKey);
        this.view.checkBtn.selected = !!isAgree || false;
    }

    private onProtocalChanged() {
        if (this.view.checkBtn.selected) {
            sys.localStorage.setItem(this._protocolAgreeKey, 1);
        } else {
            sys.localStorage.removeItem(this._protocolAgreeKey);
        }
    }

    private onOpenUrl(url: string) {
        NativeAPI.openUrl(url === "protocol" ? ChannelManager.ins().protocolUrl : ChannelManager.ins().privacyUrl);
    }

    /**检查是否未同意用户协议 */
    public isDisagreeProtocal() {
        if (this.view.visible && !this.view.checkBtn.selected) {
            FacadeManager.ins().emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "请先阅读并同意《用户协议》和《隐私政策》再进入游戏");
            return true;
        }

        return false;
    }

}