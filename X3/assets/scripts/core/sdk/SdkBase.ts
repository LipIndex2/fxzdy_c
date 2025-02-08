
/**上报事件类型 */
export enum ReportDataType {
    /**进入服务器 */
    enterServer = "enterServer",
    /**创角 */
    createRole = "createRole",
    /**角色升级 */
    upgradeRole = "upgradeRole",
    /**VIP升级 */
    upgradeVIP = "upgradeVIP",
    /**主线关卡提升 */
    upgradeTrunk = "upgradeTrunk",

    /**引导完成 */
    guideFinish = "guideFinish", //微信
    /**打开商城 */
    openMall = "openMall", //微信
    /**打开活动 */
    openActivity = "openActivity", //微信
}


/**SDK状态 */
export interface ISdkStatus {
    /**是否初始化完成 */
    isInited: boolean,
    /**是否审核状态*/
    isExamine?: boolean,
    /**是否需要强制更新*/
    isNeedUpdateApk?: boolean,
    /**功能列表 */
    functionMap?: object;
}

/**用户信息 */
export interface IUserInfo {
    /**登录信息 */
    data: string,
}

/**原生返回结果 */
export interface INativeResult {
    /**0表示成功， 其他均为失败 */
    code: number;
    /**失败描述 */
    msg?: string;
    /**数据 (类型根据接口处理)*/
    data?: any;
}

/**支付订单信息 */
export interface IPayOrder {
    goodsId: string, //商品Id
    goodsName: string, //商品名
    amount: number, //价格分
    currency: string, //CNY:人民币 USD:美元 HKD:港币 JPY:日元 NTD:台币 KRW:韩币
    orderId: string, //订单号
    serverId: string, //服务器Id
    serverName: string, //服务器名
    roleId: string, //角色Id
    roleName: string, //角色名
    roleLevel: number, //角色等级
    extra: string, //透传数据
}

/**上报数据信息 */
export interface IReportData {
    reportDataType: ReportDataType; //类型
    serverId: string, //服务器Id
    serverName: string, //服务器名
    roleId: string, //角色Id
    roleName: string, //角色名
    roleLevel: number, //角色等级
    vipLevel: number, //vip等级
    oldVipLevel: number //旧vip等级 (vip升级时用)
    trunkId: string //关卡Id
    trunkName: string //关卡名
}

/**登录完成回写信息 */
export interface IAccountInfo {
    sdkUid: string; //sdk uid
    openId?: string, //微信openId
    sessionKey?: string, //微信sessionKey
}

/**Sdk接口 */
export abstract class SdkBase {

    public abstract loginSuccessHandler: Function;
    public abstract loginFailureHandler: Function;
    public abstract logoutSuccessHandler: Function;
    public abstract logoutFailureHandler: Function;
    public abstract paySuccessHandler: Function;
    public abstract payFailureHandler: Function;
    public abstract msgBackHandler: Function;

    //protected abstract _userInfo: UserInfo;

    /**sdk登录返回数据 */
    public abstract get userInfo();

    public abstract init(): void;

    /**是否可用 */
    public abstract isEnable(): boolean;

    /**获取SDK状态 @see SdkStatus*/
    public abstract getSdkStatus(callback: Function): void;

    /**获取用户数据 @see UserInfo*/
    public abstract getUserInfo(callback: Function): void;

    /**登录完成回写信息 */
    public abstract setAccountInfo(info: IAccountInfo): void;

    /**登陆 */
    public abstract login();

    /**登出 */
    public abstract logout();

    /**支付 */
    public abstract pay(order: IPayOrder);

    /**上报数据 */
    public abstract reportDataToSdk(data: IReportData);

    /**上传埋点事件数据 */
    public abstract uploadEvent(eventType: string, eventName: string, params: string);

    /**敏感词检测 */
    public abstract checkMsg(content: string, callback: Function);

    /**显示用户中心 */
    public abstract showUserCenter();

    /**显示用户中心 */
    public abstract floatMenu(isShow: boolean);

    /**退出游戏弹窗 */
    public abstract exitGameDialog();

    /**退出游戏 */
    public abstract exitGame();
}
