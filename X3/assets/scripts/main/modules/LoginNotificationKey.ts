import BaseNotificationKey from "../../core/mvc/event/BaseNotificationKey";

export default class LoginNotificationKey extends BaseNotificationKey {

    /*******************************************登录 ********************************/
    /**sdk登录成功 */
    static readonly SDK_LOGINED = "SDK_LOGINED";

    /**sdk登出成功 */
    static readonly SDK_LOGOUTED = "SDK_LOGOUTED";

    /**登录账号 */
    static readonly ACCOUNT_LOGIN = "ACCOUNT_LOGIN";

    /**登录成功 */
    static readonly LOGIN_SUCCESS = "LOGIN_SUCCESS";

    /**登录失败 */
    static readonly ACCOUNT_LOGIN_FAILED = "ACCOUNT_LOGIN_FAILED";

    /**刷新服务器信息 */
    static readonly REFRESH_SERVER_INFO = "REFRESH_SERVER_INFO";

    /**进入游戏 */
    static readonly ENTER_GAME = "ENTER_GAME";

    /**初始化角色登录数据 */
    static readonly INIT_PLAYER_INFO = "INIT_PLAYER_INFO";

    /**初始化角色登录数据完成 */
    static readonly INIT_PLAYER_INFO_COMPLETE = "INIT_PLAYER_INFO_COMPLETE";

    /**初始化游戏世界 */
    static readonly INIT_GAME_WORLD = "INIT_GAME_WORLD";

    /**初始化游戏世界完成 */
    static readonly INIT_GAME_WORLD_COMPLETED = "INIT_GAME_WORLD_COMPLETED";


    /****************************************** 进度更新 ****************************************/

    /**登录过程的进度条更新 （热更新和进入游戏）*/
    static readonly LOGIN_PROGRESS_UPDATE = "LOGIN_PROGRESS_UPDATE";

    /**登录过程的进度条更新 （热更新和进入游戏）*/
    static readonly LOGIN_PROGRESS_UPDATE_BY_TAG = "LOGIN_PROGRESS_UPDATE_BY_TAG";

    /*******************************************热更新 ********************************/
    /**更新 */
    static readonly HOTUPDATE_UPDATE = "HOTUPDATE_UPDATE";
    /**更新进度 */
    static readonly HOTUPDATE_PROGRESS = "HOTUPDATE_PROGRESS";
    /**更新完成 */
    static readonly HOTUPDATE_COMPLETE = "HOTUPDATE_COMPLETE";
    /**更新失败 */
    static readonly HOTUPDATE_FAILED = "HOTUPDATE_FAILED";

    /******************************************* 选服 **********************************/
    /**选择服务器 */
    static readonly CHOOSE_SERVER_CHANGED = "CHOOSE_SERVER_CHANGED";
    /**游戏内选择服务器 */
    static readonly CHOOSE_SERVER_CHANGED_IN_GAME = "CHOOSE_SERVER_CHANGED_IN_GAME";

    /******************************************* 登录提示 **********************************/
    /**提示飘字 */
    static readonly FLOATING_LOGIN_TIPS = "FLOATING_LOGIN_TIPS";

    /******************************************* 上报数据  ******************************************/
    /**上报数据到sdk */
    static readonly REPORT_DATA_TO_SDK = "REPORT_DATA_TO_SDK";

}
