import { sys } from "cc";
import { NativeSdk } from "./NativeSdk";
import { IAccountInfo, INativeResult, IReportData, ReportDataType, SdkBase } from "./SdkBase";
import BaseSingleton from "../base/BaseSingleton";
import FacadeManager from "../mvc/FacadeManager";
import LoginNotificationKey from "../../main/modules/LoginNotificationKey";
import G from "../comm/G";

/**SDK管理 */
export class SdkManager extends BaseSingleton {

    private _sdk: SdkBase;

    constructor() {
        super();

        if (window["NativeSdk"]) {
            this._sdk = new window["NativeSdk"];
        } else {
            this._sdk = new NativeSdk();
        }

        this._sdk.loginSuccessHandler = this.loginSuccessResult.bind(this);
        this._sdk.loginFailureHandler = this.loginFailureResult.bind(this);
        this._sdk.logoutSuccessHandler = this.logoutSuccessResult.bind(this);
        this._sdk.logoutFailureHandler = this.logoutFailureResult.bind(this);
        this._sdk.paySuccessHandler = this.paySuccessResult.bind(this);
        this._sdk.payFailureHandler = this.payFailureResult.bind(this);
        this._sdk.msgBackHandler = this.msgBackResult.bind(this);
    }

    /**是否启用sdk接口 */
    public isEnable() {
        return this._sdk && this._sdk.isEnable();
    }

    /**获取sdk实体 */
    protected getSdk() {
        return this._sdk;
    }

    /**获取Sdk状态 @see ISdkStatus */
    public getSdkStatus(callback: Function) {
        if (!this.isEnable()) {
            callback && callback(null);
            return;
        }

        // this._sdk.getSdkStatus((status: SdkStatus) => {
        //     callback && callback(status);
        //     if (status && status.isInited) {
        //         //初始化功能列表
        //         SdkFuntions.initSdkFunctionMap(status.functionMap);
        //     }
        // });
    }

    /**
     * 回写账号信息
     * @param uid 
     */
    public setAccountInfo(info: IAccountInfo) {
        if (this.isEnable() && info) {
            this._sdk.setAccountInfo(info);
        }
    }


    /**获取SDK信息 */
    public get userInfo() {
        return this._sdk && this._sdk.userInfo;
    }

    /**获取uid */
    public get userId() {
        return this.userInfo && this.userInfo.userId;
    }

    /**获取用户信息 
     * @see UserInfo
     */
    public getUserInfo(callback: Function) {
        this._sdk.getUserInfo(callback);
    }

    /**登录 */
    public login() {
        if (!this.isEnable()) return;

        // this.getUserInfo((user: UserInfo) => {
        //     if (!user) {
        this._sdk.login();
        //     } else {
        //         //UploadEventManager.ins().startGame(StartGameEventType.DO_QUICK_LOGIN);
        //         //this.setVerifyRealName(user);
        //     }
        // });


        // let quickInfo: Vo.account.ReLoginInfoVo = this.quickReloadInfo;
        // if (quickInfo) {
        //     /**执行快速登录 */
        //     this.getUserInfo((user: UserInfo) => {
        //         if (!user) {
        //             this._sdk.login();
        //         } else {
        //             UploadEventManager.ins().startGame(StartGameEventType.DO_QUICK_LOGIN);
        //             this.setVerifyRealName(user);

        //             let data = {} as QuickLoginData;
        //             data.sign = quickInfo.sign;
        //             data.time = quickInfo.timestamp;
        //             data.param = quickInfo.param;
        //             LoginReqMgr.ins.reqQuickLoginServer(data);
        //         }
        //     });
        // } else {
        //     this._sdk.login();
        // }
        return true;
    }

    /**SDK登录成功回调 */
    protected loginSuccessResult(data: any) {
        FacadeManager.ins().emit(LoginNotificationKey.SDK_LOGINED, data);
    }

    /**SDK登录失败回调 */
    protected loginFailureResult(data: INativeResult) {
    }

    /**登出 */
    public logout() {
        if (!this.isEnable()) return;
        return this._sdk.logout();
    }

    /**SDK登出成功回调 */
    protected logoutSuccessResult(data: INativeResult) {
        FacadeManager.ins().emit(LoginNotificationKey.SDK_LOGOUTED);
    }

    /**SDK登出失败回调 */
    protected logoutFailureResult(data: INativeResult) {
    }

    /**支付 */
    public pay(order) {
        if (!this.isEnable()) return;
        this._sdk.pay(order);
    }

    /**SDK支付成功回调 */
    protected paySuccessResult(data: INativeResult) {
    }

    /**SDK支付失败回调 */
    protected payFailureResult(data: INativeResult) {
    }


    /**敏感词检查 */
    public checkMsg(content: string, callback: Function) {
        if (!this.isEnable()) {
            callback && callback(content);
            return;
        }
        this._sdk.checkMsg(content, callback);
    }

    /**sdk消息 */
    protected msgBackResult(data: { key: string, code: number, msg: string }) {
        // if (data && data.key == "saveImage") {
        //     TipsMgr.showLoginTipView(data.msg);
        // }
    }

    /**上报用户数据 */
    public reportDataToSdk(data: IReportData) {
        if (!this.isEnable()) return;
        this._sdk.reportDataToSdk(data);
    }

    /**
     * 上传埋点事件
     * 事件名
     */
    public uploadEvent(eventType: string, eventName: string, params: string = "") {
        if (!this._sdk.isEnable()) return false;
        return this._sdk.uploadEvent(eventType, eventName, params);
    }

    /**显示用户中心 */
    public showUserCenter() {
        if (!this.isEnable()) return false;
        return this._sdk.showUserCenter();
    }

    /**显示sdk浮窗 */
    public floatMenu(isShow: boolean = true) {
        if (!this.isEnable()) return false;
        return this._sdk.floatMenu(isShow);
    }

    /**退出游戏弹窗 */
    public exitGameDialog() {
        return this._sdk.exitGameDialog();
    }

    /**退出游戏 */
    public exitGame() {
        if (!this._sdk.exitGame()) {
            G.exitGame();
        }
    }

    /**获取快速重登信息 */
    public get quickReloadInfo() {
        let infoStr = sys.localStorage.getItem("quickRelogin");
        if (infoStr) {
            sys.localStorage.removeItem("quickRelogin");
            return JSON.parse(infoStr);
        }
        return null;
    }

    /**设置快速重登信息 */
    public set quickReloadInfo(info: any) {
        sys.localStorage.setItem("quickRelogin", JSON.stringify(info));
    }
}