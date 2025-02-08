import FacadeManager from "../../../core/mvc/FacadeManager";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { AsyncScriptsProcedure } from "../AsyncScriptsProcedure";
import { GameTaskProgressTag } from "../GameTaskProgress";

/**
 * 代码检测
 */
export default class AyncScriptsProcedureCheckTask extends Task {
    private _tag = GameTaskProgressTag.AyncScriptsProcedureCheckTask;
    private _time = 20; //10秒

    run(args?: any): void {
        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        this.check();
    }

    private check() {
        if (--this._time < 0) {
            //检测超时
            console.log("加载脚本失败！！！");
            this.exit();
            return;
        }

        if (AsyncScriptsProcedure.isCompleted()) {
            this.onComplete();
            return;
        } else if (!AsyncScriptsProcedure.isRunning()) {
            AsyncScriptsProcedure.start();
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