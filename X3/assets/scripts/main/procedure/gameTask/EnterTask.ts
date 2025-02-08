import G from "../../../core/comm/G";
import { INotification } from "../../../core/mvc/interface/INotification";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressTime } from "../GameTaskProgress";

/**
 * 进入游戏
 */
export default class EnterTask extends Task implements INotification {
    private _tag = GameTaskProgressTag.EnterTask;

    listenNotifications(): string[] | null {
        return [LoginNotificationKey.INIT_GAME_WORLD_COMPLETED];
    }
    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case LoginNotificationKey.INIT_GAME_WORLD_COMPLETED:
                this.complete();
                break;
        }
    }

    run(args?: any): void {
        G.FacadeManager.emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });
        G.FacadeManager.registerNotification(this);

        this.initView();
    }

    initView() {
        G.FacadeManager.emit(LoginNotificationKey.INIT_GAME_WORLD);
    }

    complete() {
        // console.log(">> end EnterTask");
        G.FacadeManager.removeNotification(this);
        G.FacadeManager.emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE, { percent: GameTaskProgress.END, time: GameTaskProgressTime.END });
        UploadEventManager.ins().startGame(StartGameEvent.BuildWorldDone);
        this.end();
    }
}