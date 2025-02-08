import { sys } from "cc";
import { native } from "cc";
import { FunctionOnceBinder } from "./FunctionOnceBinder";
import FacadeManager from "../mvc/FacadeManager";
import BaseNotificationKey from "../mvc/event/BaseNotificationKey";
import { UploadEventManager } from "../sdk/UploadEventManager";

/**Game to Native Events */
class g2nEventKey {
    /**
     * 获取APP数据
     */
    public static readonly GetAppInfo = "GetAppInfo";

    /**
     * 跳转网页
     */
    public static readonly OpenUrl = "OpenUrl";

    /**
     * 物理振动
     */
    public static readonly Vibrate = "Vibrate";

    /**
     * 原生log
     */
    public static readonly NativeLog = "NativeLog";

    /**
     * 闪屏
     */
    public static readonly Splash = "Splash";

    /**
     * 退出游戏
     */
    public static readonly ExitGame = "ExitGame";

    /**
     * 初始化
     */
    public static readonly InitAd = "InitAd";

    /**
     * 加载激励广告
     */
    public static readonly LoadRewardAd = "LoadRewardAd";

    /**
     * 展示激励广告
     */
    public static readonly ShowRewardAd = "ShowRewardAd";


}

/**Native to Game Events */
class n2gEventKey {
    /**
     * APP数据
     */
    public static readonly AppInfo = "AppInfo";

    /**
     * 广告播放完成
     */
    public static readonly AdPlayCompleted = "AdPlayCompleted";
    /**
     * 广告播放奖励发放
     */
    public static readonly AdRewardArrive = "AdRewardArrive";

}

/**网络类型 
 * @deprecated
*/
export enum NetType {
    NO_NET = 0,
    WIFI,
    MOBILE,
}

/**app信息 */
export interface IAppInfo {
    isSdkEnable: boolean;
    isAdEnable: boolean;
    oid: number;
    versionCode: string; //版本号
    versionName: string; //版本名字
    os: string; //系统
    netType: string; //网络类型 no_net wifi 2G 3G ...
    totalMem: number;
}

export interface returnData {
    /**成功 0 */
    code: number;
    /**msg 状态信息 */
    msg?: string;

    /**返回数据 json字符串*/
    data?: string;
}


/**原生接口 */
export class NativeAPI {
    public static appInfo: IAppInfo;
    private static _funcBinder: FunctionOnceBinder = new FunctionOnceBinder();
    private static _jsb: typeof native.jsbBridgeWrapper;

    static init(): void {
        if (sys.isNative) {
            this._jsb = native?.jsbBridgeWrapper;
            this.initListener();
        }
    }

    private static get isEnable() {
        return sys.isNative && !!this._jsb;
    }

    public static get isAdEnable() {
        return this.appInfo?.isAdEnable;
    }

    /**初始化监听 */
    private static initListener() {
        this._jsb?.addNativeEventListener(n2gEventKey.AppInfo, (jsonStr: string) => {
            if (jsonStr) {
                this.appInfo = JSON.parse(jsonStr);
                //this._funcBinder.applyFunction(n2gEventKey.AppInfo, this.appInfo);
            }
        });

        this._jsb?.addNativeEventListener(n2gEventKey.AdRewardArrive, (jsonStr: string) => {
            if (jsonStr) {
                let data = JSON.parse(jsonStr) as returnData;
                if (data.code == 0) {
                    if (data.data) {
                        let vo = JSON.parse(data.data);
                        let eventType = vo.eventType;
                        FacadeManager.ins().emit(BaseNotificationKey.AD_REWARD_ARRIVE, eventType);
                    }
                }
            }
        });
    }

    /**
     * 绑定回调
     */
    private static bindFunction(funcName: String, callback: Function) {
        this._funcBinder.addFunction(funcName, callback);
    }

    /**
     * 发送事件到原生
     * @param {JSBSendEventKey} event 
     * @param {object} data Json stirng
     */
    private static dispatchEventToNative(event: string, data?: object | string) {
        if (data) {
            if (typeof data == "string") {
                this._jsb?.dispatchEventToNative(event, data);
            } else {
                this._jsb?.dispatchEventToNative(event, JSON.stringify(data));
            }
        } else {
            this._jsb?.dispatchEventToNative(event);
        }
    }

    /**
     * 获取app信息
     * 返回空参数则测试版本
    */
    static getAppInfo() {
        this.dispatchEventToNative(g2nEventKey.GetAppInfo);
    }

    /**打开url */
    static openUrl(url: string) {
        if (this.isEnable) {
            this.dispatchEventToNative(g2nEventKey.OpenUrl, url);
        } else {
            if (url.startsWith("http") && window.open) {
                window.open(url);
            } else {
                console.log("unsupport url" + url);
            }
        }
    }

    /**物理振动
     * @param duration 持续事件ms
    */
    static vibrate(duration: number = 500) {
        if (this.isEnable) {
            this.dispatchEventToNative(g2nEventKey.Vibrate, { duration: duration / 1000 });
        }
    }

    /**原生打印 （调试） */
    static nativeLog(str: string) {
        this.dispatchEventToNative(g2nEventKey.NativeLog, str);
    }


    /**闪屏
     * @param isShow 是否显示
     */
    static splash(isShow: boolean) {
        if (!this.isEnable) return;
        this.dispatchEventToNative(g2nEventKey.Splash, { isShow: isShow });
    }

    /**
     * 退出游戏
     */
    static exitGame() {
        if (!this.isEnable) return;
        this.dispatchEventToNative(g2nEventKey.ExitGame);
    }


    /**初始化 */
    static initAd() {
        if (this.isEnable && this.isAdEnable) {
            this.dispatchEventToNative(g2nEventKey.InitAd);
        }
    }

    /**展示广告 
     * 奖励监听奖励事件 BaseNotificationKey.AD_REWARD_ARRIVE
     */
    static showAd(eventType: string) {
        if (this.isEnable && this.isAdEnable) {
            UploadEventManager.ins().clickAd(eventType);
            this.dispatchEventToNative(g2nEventKey.ShowRewardAd, { eventType });
        }
    }

}