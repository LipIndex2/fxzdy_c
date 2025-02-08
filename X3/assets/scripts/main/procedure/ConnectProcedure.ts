import { UIManager } from "../../core/mvc/UIManager";
import { StartGameEvent, UploadEventManager } from "../../core/sdk/UploadEventManager";
import { TaskGroup, TaskGroupState, TaskManager } from "../../core/task/TaskManager";
import { Handler } from "../../core/utils/Handler";
import { UICommonKey } from "../../game/modules/common/const/UICommonConfig";
import { UILoginKey } from "../modules/login/const/UILoginConfig";
import EnterGameProcedure from "./EnterGameProcedure";
import IProcedure from "./IProcedure";
import AccountTask from "./bootTask/LoginTask";
import { CheckAccountTask } from "./connectTask/CheckAccountTask";
import { ConnectServerTask } from "./connectTask/ConnectServerTask";

/**
 *连接服务器流程
 */
export class ConnectProcedure implements IProcedure {
    private static taskGroup: TaskGroup;


    static isRunning() {
        return this.taskGroup && this.taskGroup.getState() === TaskGroupState.running;
    }
    static start() {
        if (this.isRunning()) {
            return;
        }

        UploadEventManager.ins().startGame(StartGameEvent.ConnectGameServer);
        new ConnectProcedure().run();
    }

    run() {
        var tasks = [];
        tasks.push(new ConnectServerTask());
        tasks.push(new CheckAccountTask());

        ConnectProcedure.taskGroup = TaskManager.runTask(tasks, null, Handler.create(this, this.complete), Handler.create(this, this.error));
    }

    complete() {
        UploadEventManager.ins().startGame(StartGameEvent.ConnectGameServerDone);
        EnterGameProcedure.start();
    }

    error() {
        UploadEventManager.ins().startGame(StartGameEvent.ConnectGameServerFailed);
    }
}