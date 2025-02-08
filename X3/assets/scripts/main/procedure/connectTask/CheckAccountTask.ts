import G from "../../../core/comm/G";
import { MsgUtils } from "../../../core/net/MsgUtils";
import { SocketManager } from "../../../core/net/SocketManager";
import { Task } from "../../../core/task/TaskManager";
import { DebugUtils } from "../../../core/utils/DebugUtils";
import LoginModel from "../../modules/login/model/LoginModel";
import LoginNotificationKey from "../../modules/LoginNotificationKey";

/**
 * 校验帐号是否存在
 **/
export class CheckAccountTask extends Task {
    public static FULL_TIPS = "服务器拥挤，请重试";

    /**是否是新角色 */
    public static isNewRole = false;

    public run(args?: any): void {
        //this.initVo();

        SocketManager.ins().registerMsg(12, 4, this.receptionResult.bind(this));

        let signAndTime = LoginModel.ins().getLoginSignAndTime();

        let param = {
            account: LoginModel.ins().getAccount(),
            timestamp: signAndTime.timestamp,
            key: signAndTime.sign,
            loginParam: signAndTime.param
        }

        //该接口只能传字符串/
        var c2s = {} as Vo.account.CheckAccountC2S;
        c2s.param = JSON.stringify(param);
        SocketManager.ins().send(12, 4, c2s);
    }

    public receptionResult(result: { code: number }): void {

        switch (result.code) {
            case 1:
                this.comptele();
                break;
            case 2:
                this.doCreateRole();
                break;
            case 3:
                //this.end(CheckAccountTask.FULL_TIPS);
                G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "服务器拥挤，请重试");
                this.onFailed();
                break;
            case -2:
                // LoginModel.ins().reset();
                G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "秘钥过期，请重新进入");
                this.onFailed();
                break;
            case -3:
                // LoginModel.ins().reset();
                G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "账号验证失败，请重试");
                this.onFailed();
                break;
            default:
                G.FacadeManager.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "登录失败");
                this.onFailed();
                break;
        }
    }

    /**创角 */
    public doCreateRole() {
        SocketManager.ins().registerMsg(12, 16, this.receptionCreateResult.bind(this));
        var c2s = {} as Vo.account.Create3C2S;
        let signAndTime = LoginModel.ins().getCreateRoleSignAndTime();

        c2s.account = LoginModel.ins().getAccount();
        c2s.createParam = signAndTime.param;
        c2s.time = signAndTime.timestamp;
        c2s.sign = signAndTime.sign;
        //SocketManager.ins().send(12, 1, c2s);
        SocketManager.ins().send(12, 16, c2s);
    }

    public receptionCreateResult(result): void {
        DebugUtils.isDebugMode() && console.log(result);
        CheckAccountTask.isNewRole = true;
        SocketManager.ins().removeMsg(12, 16);
        this.comptele();
    }

    public comptele(): void {
        SocketManager.ins().removeMsg(12, 4);
        this.end();
    }

    private onFailed() {
        SocketManager.ins().removeMsg(12, 4);
        this.exit();
    }
}
