
/**
 * js端接收的事件
 */
export class JSBRecvEventKey {
    /***************************** SDK manager ************************************/
    /**
     * sdk状态
     */
    public static readonly SDKStatus = "SDKStatus";

    /**
     * 获取功能集 (需要sdk初始化完成)
     */
    public static readonly SDKFunction = "SDKFunction";

    /**
     * SDK数据 (登录完成)
     */
    public static readonly SDKInfo = "SDKInfo";

    /**
     * 登录结果
     */
    public static readonly LoginResult = "LoginResult";
    /**
     * 登出结果
     */
    public static readonly LogoutResult = "LogoutResult";

    /**
     * 充值结果
     */
    public static readonly PayResult = "PayResult";

}
