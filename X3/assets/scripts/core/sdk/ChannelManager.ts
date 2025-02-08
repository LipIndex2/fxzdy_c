import { sys } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import { DEBUG } from "cc/env";
import { native } from "cc";

/**渠道 */
export class ChannelManager extends BaseSingleton {

    private _developUrl = "http://192.168.18.44:9001";
    //private _developUrl = "http://106.52.201.68:8911";

    private _channel: any = {};

    /**是否在审核中 */
    public isExamineing = false;
    /**是否强更app */
    public isNeedUpdateApk = false;

    constructor() {
        super();

        //@ts-ignore
        if ("undefined" !== typeof channel) {
            //@ts-ignore
            this._channel = channel;
        }

        if (sys.isNative && native.fileUtils.isFileExist("channel.json")) {
            let str = native.fileUtils.getStringFromFile("channel.json");
            if (str) {
                let data = JSON.parse(str);
                for (const key in data) {
                    this._channel[key] = data[key];
                }
            }
        }

        if (this._channel.realName != true && DEBUG) {
            if (window.location.href && window.location.href.startsWith("https") == false) {
                //@ts-ignore
                window.xaDebugEnable = true;

                //测试状态下使用
                let oid = sys.localStorage.getItem("oid");
                if (oid && Number(oid)) {
                    this._channel.oid = Number(oid);
                }
            }
        }
    }

    /**渠道对象 */
    public get channel(): any {
        return this._channel;
    }

    /**代理 */
    public get agent(): any {
        return this._channel.agent || "dev";
    }

    /**获取登录服务器 */
    public get serverUrl(): string {
        return this._channel.serverUrl || this._developUrl;
    }

    /**获取当前使用运营商Id */
    public get oid(): number {
        return this.isExamineing ? this.examineOid : this.officialOid;
    }

    /**获取官方的oid */
    public get officialOid(): number {
        return this._channel.oid || 1;
    }

    /**获取审核运营商Id */
    public get examineOid(): number {
        return this._channel.examine || this.officialOid;
    }

    /**是否检查审核状态 */
    public get isCheckExamine(): boolean {
        return this._channel.checkExamine;
    }

    /**获取登录链接 */
    public get loginUrl(): string {
        return this.serverUrl + (this._channel.loginApi || "/test/login");
    }

    /**获取快速登录链接 */
    public get quickLoginUrl(): string {
        return this.serverUrl + "/xj/login";
    }

    /**登录游戏服 防沉迷参数 */
    public get antiAddictionFlag(): number {
        return this._channel.antiAddictionFlag || 1;
    }

    /**是否需要用户手动登录 （不自动弹窗账号界面）*/
    public get manualLogin(): number {
        return this._channel.manualLogin || false;
    }

    /**是否需要用户手动进入 （默认false 自动进入）*/
    public get manualEnter(): number {
        return this._channel.manualEnter || true;
    }

    /**是否需要实名制*/
    public get realName(): boolean {
        return !!this._channel.realName;
    }

    /**是否关闭SDK */
    public get disableSDK(): boolean {
        return this._channel.disableSDK || false;
    }

    /**错误上报的URL */
    public get errorCatchUrl(): string {
        if (this._channel.reportUrl) {
            return this._channel.reportUrl;
        }
        return "http://192.168.18.55:9998/xj/dev/report";
    }

    /**登录背景 */
    public get loginBg() {
        return this._channel.bg || "";
    }

    /**备案信息 */
    public get logo() {
        return this._channel.logo;
    }

    /**备案信息 */
    public get infoTxt() {
        return this._channel.infoTxt || "";
    }

    /**用户协议 */
    public get protocolUrl() {
        if (this._channel.protocolUrl) {
            return this._channel.protocolUrl;
        }
        return "https://www.chuxinhudong.com/meishengyuan/protocol.html";
    }

    /**隐私协议 */
    public get privacyUrl() {
        if (this._channel.privacyUrl) {
            return this._channel.privacyUrl;
        }
        return "https://www.chuxinhudong.com/meishengyuan/privacy.html";
    }

}
