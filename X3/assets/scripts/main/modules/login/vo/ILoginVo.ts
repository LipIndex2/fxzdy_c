
export interface ILoginResultVo {
    /**错误码 */
    code: number;
    /**
     * 错误信息
     */
    errorInfo: Object;
    /**
     * 内容
     */
    content: ILoginVo;
}

/**服务器信息 */
export interface ILoginVo {
    /** 运营商id */
    oid: number;
    /** 账号(游戏) */
    account: string;
    /**创角参数 */
    createRoleParam: string;
    /**	登录参数 */
    loginParam: string
    /** 创角游戏签名 */
    createRoleSign: string;
    /** 登录游戏签名 */
    loginSign: string;
    /** 推荐的服务器，当玩家已有角色时，-1 */
    recommendServer: number;
    /**重登参数 */
    reLoginParam: string;
    /**重登签名 */
    reLoginSign: string;
    /** 角色信息 */
    roleVos: IRoleVo[];
    /** 服务器列表 */
    servers: IServerVo[];
    /** 时间 */
    timestamp: number;
    /** 更新公告 */
    updateNotices: INoticeVo[];
    /** 扩展结果。不同平台有不同的结果值 **/
    extra: string;
    /** 防沉迷信息返回 */
    //public fangChenMiRes:FangChenMiVo;
    /** 当未进行实名认证时有值，用来传递给实名认证接口 */
    //public fangChenMiSign:string;
}

/**公告 */
export interface INoticeVo {
    /** 标题 */
    name: string;
    /** 正文 */
    content: string;
    /** 开始时间 */
    start: number;
    /** 结束时间 */
    end: number;
    /** 创建时间 */
    createTime: number;
    /** 排序 升序*/
    priority: number;
}

/**服务器角色信息 */
export interface IRoleVo {

    /** 登录服务器ID */
    serverId: number;

    /** 最后一次登陆时间 */
    loginTime: number;

    /** 玩家角色名 */
    name: string;

    /** 角色主将标识 */
    //public baseId: number;

    /** 头像Id */
    headIcon: number;

    /** 玩家等级 */
    level: number;

    /** 战力 */
    fight: number;

    /** 是否被封号 */
    block: boolean;
}

/**服务器信息 */
export interface IServerVo {
    /**服务器id */
    id: number;
    /** 名称*/
    name: string;
    /** 地址*/
    address: string;
    /** 服务器状态 1正常 2满员 3维护*/
    states: number;
    /**开服时间 */
    startTime: number;
}

/**登录额外信息 */
export interface ILoginExtraVo {
    /**
     *  SDK类型,GAME-游戏白框,CHU_XIN-初心
     */
    type: string;
    /**uid */
    sdkUid: string;
}