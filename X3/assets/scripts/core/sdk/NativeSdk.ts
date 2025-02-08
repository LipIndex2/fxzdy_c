import { sys } from "cc";
import { ChannelManager } from "./ChannelManager";
import { IUserInfo, IPayOrder, ReportDataType, SdkBase, IReportData, IAccountInfo, } from "./SdkBase";
import { native } from "cc";
import { JSBRecvEventKey } from "./JSBRecvEventType";
import { JSBSendEventKey } from "./JSBSendEventType";
import { FunctionOnceBinder } from "../native/FunctionOnceBinder";
import { NativeAPI } from "../native/NativeAPI";
import { DebugUtils } from "../utils/DebugUtils";

/**原生Sdk接口 */
export class NativeSdk implements SdkBase {
    public loginSuccessHandler: Function;
    public loginFailureHandler: Function;
    public logoutSuccessHandler: Function;
    public logoutFailureHandler: Function;
    public paySuccessHandler: Function;
    public payFailureHandler: Function;
    public msgBackHandler: Function;

    protected _userInfo: IUserInfo;

    private _jsb: typeof native.jsbBridgeWrapper;
    private _isInit: boolean = false;

    private _funcBinder: FunctionOnceBinder = new FunctionOnceBinder();

    constructor() {
        //super();
        this.init();
    }

    init(): void {
        if (!this._isInit && sys.isNative && !ChannelManager.ins().disableSDK) {
            this._jsb = native?.jsbBridgeWrapper;

            if (this._jsb) {
                DebugUtils.isDebugMode() && console.log("NativeSdk 初始化成功！");
                this.initListener();
            } else {
                DebugUtils.isDebugMode() && console.log("NativeSdk 初始化失败！");
            }
        }
        this._isInit = true;
    }

    /**初始化监听 */
    initListener() {
        this._jsb.addNativeEventListener(JSBRecvEventKey.SDKStatus, (jsonStr: string) => {
            try {
                this._funcBinder.applyFunction(JSBRecvEventKey.SDKStatus, jsonStr);
            } catch (e) {
                console.error(e);
            }
        });

        this._jsb.addNativeEventListener(JSBRecvEventKey.SDKFunction, (jsonStr: string) => {
            try {
            } catch (e) {
                console.error(e);
            }
        });

        this._jsb.addNativeEventListener(JSBRecvEventKey.SDKInfo, (jsonStr: string) => {
            try {
                this._funcBinder.applyFunction(JSBRecvEventKey.SDKInfo, jsonStr);
            } catch (e) {
                console.error(e);
            }
        });


        this._jsb.addNativeEventListener(JSBRecvEventKey.LoginResult, (jsonStr: string) => {
            try {
                this.loginResult(jsonStr);
            } catch (e) {
                console.error(e);
            }
        });

        this._jsb.addNativeEventListener(JSBRecvEventKey.LogoutResult, (jsonStr: string) => {
            try {
                this.logoutResult(jsonStr);
            } catch (e) {
                console.error(e);
            }
        });

        this._jsb.addNativeEventListener(JSBRecvEventKey.PayResult, (jsonStr: string) => {
            try {
                this.payResult(jsonStr);
            } catch (e) {
                console.error(e);
            }
        });
    }

    /**
     * 发送事件到原生
     * @param {JSBSendEventKey} event 
     * @param {object} data Json stirng
     */
    dispatchEventToNative(event: string, data?: object) {
        if (data) {
            this._jsb?.dispatchEventToNative(event, JSON.stringify(data));
        } else {
            this._jsb?.dispatchEventToNative(event);
        }
    }

    /**
     * 绑定回调
     */
    private bindFunction(funcName: String, callback: Function) {
        this._funcBinder.addFunction(funcName, callback);
    }

    /**是否可用 */
    isEnable() {
        return sys.isNative && !!this._jsb && NativeAPI.appInfo?.isSdkEnable;
    }

    /**
     * sdk状态
     */
    getSdkStatus(callback: Function) {
        this.bindFunction(JSBRecvEventKey.SDKStatus, callback);
        this.dispatchEventToNative(JSBSendEventKey.GetSDKStatus);
    }

    /**
     * sdk功能集
     */
    getSdkFunction(callback: Function) {
        this.bindFunction(JSBRecvEventKey.SDKFunction, callback);
        this.dispatchEventToNative(JSBSendEventKey.GetSDKFunction);
    }


    /**sdk登录返回数据 */
    public get userInfo() {
        return this._userInfo;
    }

    /**获取用户数据 */
    getUserInfo(callback: Function) {
        if (this._userInfo) {
            callback(this._userInfo);
            return;
        }

        this.bindFunction(JSBRecvEventKey.SDKInfo, callback);
        this.dispatchEventToNative(JSBSendEventKey.GetSDKInfo);
    }

    setAccountInfo(info: IAccountInfo) {
        this.dispatchEventToNative(JSBSendEventKey.SetAccountInfo, info);
    }

    /**登录 */
    login() {
        this.dispatchEventToNative(JSBSendEventKey.Login);
    }

    /**原生回调 登录结果 */
    protected loginResult(jsonStr: string) {
        let data = JSON.parse(jsonStr);
        if (data.code == 0) {
            let userInfo = this._userInfo = data.data;
            this.loginSuccessHandler && this.loginSuccessHandler({ data: userInfo }); //登录参数 sdk跟不相同所有在这里封装
        } else {
            this.loginFailureHandler && this.loginFailureHandler(data);
        }
    }

    /**登出 */
    logout() {
        this._jsb?.dispatchEventToNative(JSBSendEventKey.Logout);
    }

    /**原生回调 登出结果 */
    protected logoutResult(jsonStr: string) {
        try {
            let data = JSON.parse(jsonStr);
            DebugUtils.isDebugMode() && console.log(data);
            this._userInfo = null;
            if (data.code == 0) {
                this.logoutSuccessHandler && this.logoutSuccessHandler(data);
            } else {
                this.logoutFailureHandler && this.logoutFailureHandler(data);
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**支付 */
    pay(order: IPayOrder) {
        if (this.isEnable()) {
            let data = {} as any;
            data.goodsId = order.goodsId;
            data.goodsName = order.goodsName;
            data.quantity = 1; //购买数量 一般都是1
            data.amount = order.amount;
            data.currency = order.currency
            data.orderId = order.orderId;
            data.extra = order.extra;
            this.dispatchEventToNative(JSBSendEventKey.Pay, data);
        }
    }

    /**SDK支付成功回调 */
    protected payResult(jsonStr: string) {
        let data = JSON.parse(jsonStr);
        if (data.code == 0) {
            this.paySuccessHandler && this.paySuccessHandler(data);
        } else {
            this.payFailureHandler && this.payFailureHandler(data);
        }
    }

    /**敏感词检查 */
    checkMsg(content: string, callback: Function) {
        if (!this.isEnable()) {
            callback && callback(content);
            return;
        }

        //没有sdk检测
        callback && callback(content);
    }


    protected nativeMsgBack(jsonStr: string) {
        let data = JSON.parse(jsonStr);
        this.msgBackHandler && this.msgBackHandler(data);
    }

    /**上报用户数据 */
    public reportDataToSdk(data: IReportData) {
        this.dispatchEventToNative(JSBSendEventKey.ReportData, data);
    }

    /**上报自定义打点事件 */
    public uploadEvent(eventType: string, eventName: string, params: string) {
        let data = {} as any;
        data.type = eventType;
        data.event = eventName;
        data.params = params;
        this.dispatchEventToNative(JSBSendEventKey.ReportCustomData, data);
    }

    showUserCenter() {
        // if (!this._jsb || !this._jsb.showUserCenter) return false;
        // this._jsb.showUserCenter();
        return true;
    }

    floatMenu(isShow: boolean) {
        if (isShow) {
            this.dispatchEventToNative(JSBSendEventKey.ShowFloatMenu);
        } else {
            this.dispatchEventToNative(JSBSendEventKey.HideFloatMenu);
        }
    }


    /** 退出游戏 弹窗*/
    exitGameDialog() {
        // if (!this._jsb || !this._jsb.exitGameDialog) return false;
        // this._jsb.exitGameDialog();//退出弹窗
        return true;
    }

    /** 退出游戏 */
    exitGame() {
        this.dispatchEventToNative(JSBSendEventKey.ExitGameInSdk);
        return true;
    }
}