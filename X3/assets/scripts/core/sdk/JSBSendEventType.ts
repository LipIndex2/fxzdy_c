
/**
 * js端发送的事件
 */
export class JSBSendEventKey {

    /***************************** SDK manager ************************************/

    /**
     * 获取sdk状态
     */
    public static readonly GetSDKStatus = "GetSDKStatus";

    /**
     * 获取功能集 (需要sdk初始化完成)
     */
    public static readonly GetSDKFunction = "GetSDKFunction";

    /**
     * 获取SDK数据
     */
    public static readonly GetSDKInfo = "GetSDKInfo";

    /**
     * 设置账号信息 uid...
     */
    public static readonly SetAccountInfo = "SetAccountInfo";

    /**
     * 登录
     */
    public static readonly Login = "Login";

    /**
     * 登出
     */
    public static readonly Logout = "Logout";

    /**
     * 在sdk里退出游戏
     */
    public static readonly ExitGameInSdk = "ExitGameInSdk";

    /**
     * 支付
     */
    public static readonly Pay = "Pay";

    /**
     * 切换账号
     */
    public static readonly SwitchAccount = "SwitchAccount";

    /**
     * 显示用户协议
     */
    public static readonly ShowUserCenter = "ShowUserCenter";

    /**
     * 显示客服反馈
     */
    public static readonly ShowFeedback = "ShowFeedback";

    /**
     * 显示浮窗
     */
    public static readonly ShowFloatMenu = "ShowFloatMenu";

    /**
     * 隐藏浮窗
     */
    public static readonly HideFloatMenu = "HideFloatMenu";


    /***************************** SDK report************************************/

    /**
     * 上报数据
     */
    public static readonly ReportData = "ReportData";

    /**
     * 上报登出游戏
     */
    public static readonly ReportLogoutServer = "ReportLogoutServer";

    /**
     * 上报自定义数据 （如 新手引导、登录流程、兴趣点 等等）
     */
    public static readonly ReportCustomData = "ReportCustomData";


}
