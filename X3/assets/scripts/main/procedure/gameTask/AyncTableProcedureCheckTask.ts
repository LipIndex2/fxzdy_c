import FacadeManager from "../../../core/mvc/FacadeManager";
import { NativeAPI } from "../../../core/native/NativeAPI";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { AsyncTableProcedure } from "../AsyncTableProcedure";
import { GameTaskProgressTag } from "../GameTaskProgress";

/**
 * 数据表
 */
export default class AyncTableProcedureCheckTask extends Task {
    private _tag = GameTaskProgressTag.AyncTableProcedureCheckTask;
    private _time = 20; //10秒

    run(args?: any): void {
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        NativeAPI.initAd(); //临时

        this.check();
    }

    private check() {
        if (--this._time < 0) {
            //检测超时
            console.log("配置加载失败！！！");
            this.exit();
            return;
        }

        if (AsyncTableProcedure.isCompleted()) {
            this.onComplete();
            return;
        } else if (!AsyncTableProcedure.isRunning()) {
            AsyncTableProcedure.start();
        }

        GameTimer.ins().once(500, this, this.check);
    }

    private onComplete() {
        // console.log(">> end AyncTableProcedureCheckTask");
        GameTimer.ins().clearAll(this);

        UploadEventManager.ins().startGame(StartGameEvent.TableResLoadDone);
        // 加载完成
        this.end();
    }
}