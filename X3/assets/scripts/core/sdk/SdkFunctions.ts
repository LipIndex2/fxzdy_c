export enum SdkFuntionType {
    /**
     * 切换账号
     */
    SwitchAccount = 1,
    /**
     * 用户中心
     */
    UserCenter,
    /**
     * SDK退出界面
     */
    SDKExitView,
}

/**SDK 功能管理 */
export class SdkFuntions {

    /**sdk扩展功能 */
    private static _sdkFunctionMap = null;

    public static get isInitSdkFunctionMap() {
        return !!this._sdkFunctionMap;
    }
    public static initSdkFunctionMap(funcMap: object) {
        this._sdkFunctionMap = funcMap || {};
    }

    /**
     * 是否可以切换账号
     */
    public static isHasSwitchAccount() {
        return this.isSdkFunction(SdkFuntionType.SwitchAccount);
    }

    /**是否有界面用户中心 */
    public static isHasUserCenter() {
        return this.isSdkFunction(SdkFuntionType.UserCenter);
    }

    /**是否有sdk的退出界面 */
    public static isHasSdkExitView() {
        return this.isSdkFunction(SdkFuntionType.SDKExitView);
    }

    /**sdk是否支持功能 */
    public static isSdkFunction(type: SdkFuntionType) {
        if (!this._sdkFunctionMap || !this._sdkFunctionMap[SdkFuntionType[type]]) return false;
        return true;
    }
}