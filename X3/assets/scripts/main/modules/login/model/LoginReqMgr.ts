import BaseSingleton from "../../../../core/base/BaseSingleton";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { HttpRequest } from "../../../../core/net/HttpRequest";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { SdkManager } from "../../../../core/sdk/SdkManager";
import { StartGameEvent, UploadEventManager } from "../../../../core/sdk/UploadEventManager";
import LoginNotificationKey from "../../LoginNotificationKey";
import { LoginController } from "../LoginController";
import { ILoginExtraVo, ILoginResultVo, ILoginVo } from "../vo/ILoginVo";
import { AccountHistoryModel } from "./AccountHistoryModel";
import { ChooseServerModel } from "./ChooseServerModel";
import LoginModel from "./LoginModel";


/**快速登陆数据 */
export interface QuickLoginData {
    time: string,
    sign: string,
    param: string,
}

/**
 * 登录请求
 */
export class LoginReqMgr extends BaseSingleton {
    /**http */
    private _http: HttpRequest = new HttpRequest();
    constructor() {
        super();
    }

    /**是否请求中 */
    public get isLogining() {
        return this._http.isRequestingByUrl(ChannelManager.ins().loginUrl) || this._http.isRequestingByUrl(ChannelManager.ins().quickLoginUrl);
    }

    /**登录
     * @param args 如：{userId:account, pwd:pwd, oid:1}  根据渠道不同结构会相应改变
     */
    public reqLoginServer(args: any): void {
        if (!args) {
            return;
        }
        if (this.isLogining) return;
        if (!args.oid) args.oid = ChannelManager.ins().oid;
        this._http.timeout = 3000;

        this._http.getWithParams(ChannelManager.ins().loginUrl, args, this.onLoginSuccess.bind(this), this.onLoginFailure.bind(this));
    }

    /**快速登录
     * @param args 如：{userId:account, pwd:pwd, oid:1}  根据渠道不同结构会相应改变
     */
    public reqQuickLoginServer(args: any): void {
        if (!args) {
            return;
        }
        if (this.isLogining) return;
        this._http.timeout = 1000;
        this._http.getWithParams(encodeURI(ChannelManager.ins().quickLoginUrl), args, this.onQuickSuccess.bind(this), this.onQuickFailure.bind(this));
    }

    /**获取失败 */
    private onLoginFailure(): void {
        UploadEventManager.ins().startGame(StartGameEvent.GameLoginFaild, "服务器连接失败，请稍后重试");
        console.log("登陆失败");
        FacadeManager.ins().emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "服务器连接失败，请稍后重试");
        //FacadeManger.ins().sendNotification(BaseNotificationName.ACCOUNT_LOGIN_FAILURE);
    }

    /**获取成功 */
    private onLoginSuccess(data: ILoginResultVo): void {
        this.praseHttpData(data);
    }

    /**获取失败 */
    private onQuickFailure(): void {
        console.log("快速登陆失败");
        FacadeManager.ins().emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "快速登陆失败 服务器连接失败，请稍后重试");

        //UploadEventManager.ins().startGame(StartGameEventType.ACCOUNT_LOGIN_FAILURE);
        if (!LoginModel.ins().isLogined) {
            //未登录
            //LoginController.ins().onLogined();
        }
    }

    /**获取成功 */
    private onQuickSuccess(data): void {
        this.praseHttpData(data, true);
    }

    /**已经登录 重新获取服务器状态 */
    public updateServer(vo: ILoginVo) {
        LoginModel.ins().initVo(vo);
        if (ChooseServerModel.ins().updateServerState()) {
            FacadeManager.ins().emit(LoginNotificationKey.REFRESH_SERVER_INFO);
            //     UploadEventManager.ins().startGame(StartGameEventType.RELOGIN_UPDATE_SERVER_COMPLETE);
        }
    }

    /**登录成功 */
    public loginSuccess(vo: ILoginVo) {
        LoginModel.ins().initVo(vo);
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_SUCCESS);
        // FacadeManger.ins().sendNotification(BaseNotificationName.SERVER_LIST_GET_COMPLETE);
        // FacadeManger.ins().sendNotification(BaseNotificationName.ACCOUNT_LOGIN_COMPLETE);
    }

    /**服务器错误码 */
    public errorCodeToString(errorCode: number, isshow: boolean = true) {
        let errorStr = "";
        switch (errorCode) {
            case -1:
                errorStr = "签名错误，请重新登录";
                break;
            case -2:
                errorStr = "运营商不存在";
                break;
            case -4:
                errorStr = "用户不存在，请重新登录";
                break;
            case -13:
                errorStr = "token已过期，请重新登录";
                break;
            case -15:
                errorStr = "秘钥格式错误，请重新登录";
                break;
            default:
                errorStr = "登录失败";
                break;
        }

        isshow && errorStr && FacadeManager.ins().emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, errorStr);
        console.warn(errorStr + " code: " + errorCode);
        return errorStr;
    }

    /**处理登陆返回数据 */
    private praseHttpData(objs: ILoginResultVo, isQuick: boolean = false) {
        if (objs.code == 0) {
            UploadEventManager.ins().startGame(StartGameEvent.GameLoginDone);

            let vo = objs.content as ILoginVo;
            console.log("获取登陆信息成功");
            if (LoginModel.ins().vo && LoginModel.ins().vo.account == vo.account) {
                //刷新服务器状态
                this.updateServer(vo);
            } else {
                //未登录执行登录
                this.loginSuccess(vo);
            }

            if (!isQuick && vo.extra) {
                let info: ILoginExtraVo = JSON.parse(vo.extra);
                SdkManager.ins().setAccountInfo(info); //初心 uid
            }
        } else {
            let errorCode = objs.code;
            let canTryAgain = errorCode != -2 && LoginModel.ins().isLogined;
            this.errorCodeToString(errorCode, !canTryAgain);
            UploadEventManager.ins().startGame(StartGameEvent.GameLoginFaild, `errorCode:${errorCode}`);
            FacadeManager.ins().emit(LoginNotificationKey.ACCOUNT_LOGIN_FAILED, canTryAgain);
        }
    }
}



