import FacadeManager from "../../../core/mvc/FacadeManager";
import { SocketManager } from "../../../core/net/SocketManager";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import LoginModel from "../../modules/login/model/LoginModel";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressTime } from "../GameTaskProgress";

/**
 * 帐号登入
 **/
export class AccountLoginTask extends Task {
    private _tag = GameTaskProgressTag.AccountLoginTask;
    private _args: any;

    public run(args?: any): void {
        // console.log(">> run CheckAccountTask");
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        SocketManager.ins().registerMsg(12, 2, this.receptionResult.bind(this));

        let signAndTime = LoginModel.ins().getLoginSignAndTime();

        var c2s: Vo.account.LoginC2S = {} as Vo.account.LoginC2S;
        c2s.account = LoginModel.ins().getAccount();
        c2s.age = 18;
        c2s.antiAddictionFlag = 0; //0 不开启防沉迷 1 防沉迷在线 2 防沉迷充值 3 全部
        c2s.timestamp = signAndTime.timestamp;
        c2s.key = signAndTime.sign;
        c2s.loginParam = signAndTime.param;
        SocketManager.ins().send(12, 2, c2s);
    }

    public receptionResult(result: Vo.account.LoginS2C): void {
        if (result.code >= 0) {
            console.log("登录成功");
            this.comptele();
        }
        else {
            //TipsMgr.showErrorTips(result.code);
            this.exit();
            console.warn("登录失败");
        }
    }

    public comptele(): void {
        // console.log(">> end CheckAccountTask");
        UploadEventManager.ins().startGame(StartGameEvent.RoleLoginDone);

        SocketManager.ins().removeMsg(12, 2);
        this.end();
    }
}
