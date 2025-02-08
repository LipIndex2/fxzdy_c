import FacadeManager from "../../../core/mvc/FacadeManager";
import { SocketManager } from "../../../core/net/SocketManager";
import { SocketTransfer } from "../../../core/net/SocketTransfer";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import { ZlibUtils } from "../../../core/utils/ZlibUtils";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressTime } from "../GameTaskProgress";

/**
 * 加载服务端解析文件
 **/
export class LoadServerDescriptionTask extends Task {
    private _tag = GameTaskProgressTag.LoadServerDescriptionTask;

    public run(args?: any): void {
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        // console.log(">> run LoadServerDescriptionTask");
        this.requestDescription();
    }

    private requestDescription(): void {
        SocketManager.ins().registerMsg(0, 1, this.onRecepDescriptio.bind(this));
        SocketManager.ins().send(0, 1);
    }

    private onRecepDescriptio(s2cData: any): void {
        // console.log(">> end LoadServerDescriptionTask");

        SocketTransfer.ins.describe(ZlibUtils.analyzeData(s2cData));
        
        UploadEventManager.ins().startGame(StartGameEvent.ProtocolLoadDone);
        this.end();
    }
}
