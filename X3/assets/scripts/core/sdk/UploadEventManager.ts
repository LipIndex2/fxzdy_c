import { DEBUG } from "cc/env";
import BaseSingleton from "../base/BaseSingleton";
import { SdkManager } from "./SdkManager";

export enum UploadEventType {
    START_GAME = "START_GAME",
    AD = "AD"
}


/**
 * 启动流程上报事件
 */
export enum StartGameEvent {
    InitSdk = "InitSdk", //初始化sdk  --在原生执行
    InitSdkDone = "InitSdkDone", //初始化sdk完成  --在原生执行
    InitSdkFailed = "InitSdkFailed", //初始化sdk失败  --在原生执行
    StartGameCode = "StartGameCode", //游戏代码启动
    OpenLoginView = "OpenLoginView", //打开登录界面
    HotupdateCheck = "HotupdateCheck", //检查热更新
    HotupdateStart = "HotupdateStart", //热更新开始
    HotupdateDone = "HotupdateDone", //热更新完成
    HotupdateFailed = "HotupdateFailed", //热更新失败
    LoginCall = "LoginCall", //调用登录
    LoginSdk = "LoginSdk", //Sdk登录 --在原生执行
    LoginSdkDone = "LoginSdkDone", //Sdk登录完成 --在原生执行
    LoginSdkFailed = "LoginSdkFailed", //Sdk登录失败 --在原生执行
    GameLoginDone = "GameLoginDone", //游戏登录完成
    GameLoginFaild = "GameLoginFaild", //游戏登录失败
    ConnectGameServer = "ConnectGameServer", //连接游戏服务器
    ConnectGameServerDone = "ConnectGameServerDone", //连接游戏服务器完成
    ConnectGameServerFailed = "ConnectGameServerFailed", //连接游戏服务器失败
    ProtocolLoadDone = "ProtocolLoadDone", //加载服务器协议完成
    TableResLoadDone = "TableResLoadDone",//加载表资源完成
    ScriptsLoadDone = "ScriptsLoadDone",//加载脚本完成
    CommResLoadDone = "CommResLoadDone",//加载公共资源完成
    RoleLoginDone = "RoleLoginDone",//角色登录完成
    RoleDataLoadDone = "RoleDataLoadDone",//角色数据获取完成
    RoleDataInitDone = "RoleDataInitDone",//角色数据初始化完成
    BuildWorldDone = "BuildWorldDone",//构建世界完成
}

/**埋点管理 */
export class UploadEventManager extends BaseSingleton {

    /**启动游戏 流程事件埋点 */
    public startGame(event: StartGameEvent, params: string = "") {
        if (!DEBUG) {
            SdkManager.ins().uploadEvent(UploadEventType.START_GAME, event, params);
        }
    }


    /**点击广告 事件埋点 */
    public clickAd(event: string) {
        if (!DEBUG) {
            SdkManager.ins().uploadEvent(UploadEventType.AD, event);
        }
    }

}