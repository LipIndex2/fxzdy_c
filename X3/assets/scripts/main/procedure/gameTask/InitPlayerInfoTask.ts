import FacadeManager from "../../../core/mvc/FacadeManager";
import { SocketManager } from "../../../core/net/SocketManager";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressTime } from "../GameTaskProgress";

/**
 * 初始化帐号信息
 **/
export class InitPlayerInfoTask extends Task {
    private _tag = GameTaskProgressTag.InitPlayerInfoTask;

    public run(args?: any): void {
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        // console.log(">> run InitPlayerInfoTask");

        SocketManager.ins().registerMsg(12, 7, this.receptionResult.bind(this));
        SocketManager.ins().send(12, 7);
    }

    public receptionResult(result: Vo.account.LoginInfoS2C): void {
        SocketManager.ins().removeMsg(12, 7); //注意顺序 AccountModel里的监听移除

        UploadEventManager.ins().startGame(StartGameEvent.RoleDataLoadDone);

        if (result.code >= 0) {
            console.log("登录完成");
            if (result.content) {
                FacadeManager.ins().emitNow(LoginNotificationKey.INIT_PLAYER_INFO, result.content);
            } else {
                throw new Error("12, 7 Vo.account.LoginInfoS2C result.content is empty");
            }

            this.sendLoginComplete();
        } else {
            //this.end("登录失败");
            console.warn("登录失败")
            this.exit();
        }
    }

    public sendLoginComplete(): void {
        SocketManager.ins().registerMsg(12, 9, this.receptionLoginCompleteResult.bind(this));
        SocketManager.ins().send(12, 9);
    }

    public receptionLoginCompleteResult(): void {
        SocketManager.ins().removeMsg(12, 9);
        this.checkComplete();
    }

    private checkComplete() {
        this.complete();
    }

    public complete(): void {
        // console.log(">> end InitPlayerInfoTask");
        UploadEventManager.ins().startGame(StartGameEvent.RoleDataInitDone);
        this.end();
    }
}
