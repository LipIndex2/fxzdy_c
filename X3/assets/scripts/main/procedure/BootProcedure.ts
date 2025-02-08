import { TaskManager } from "../../core/task/TaskManager";
import { Handler } from "../../core/utils/Handler";
import IProcedure from "./IProcedure";
import LoginTask from "./bootTask/LoginTask";
import CheckVersionTask from "./bootTask/CheckVersionTask";
import InitAppInfoTask from "./bootTask/InitAppInfoTask";
import LoginPageTask from "./bootTask/LoginPageTask";
import { StartGameEvent, UploadEventManager } from "../../core/sdk/UploadEventManager";
import InitAppStateTask from "./bootTask/InitAppStateTask";
import CheckMiniGameVersionTask from "./bootTask/CheckMiniGameVersionTask";
import { AsyncScriptsProcedure } from "./AsyncScriptsProcedure";
import { AsyncTableProcedure } from "./AsyncTableProcedure";
import { DebugUtils } from "../../core/utils/DebugUtils";

/**
 *启动流程
 */
export class BootProcedure implements IProcedure {
    static start() {
        UploadEventManager.ins().startGame(StartGameEvent.StartGameCode);
        new BootProcedure().run();
    }

    run() {
        var tasks = [];
        tasks.push(new InitAppInfoTask());
        tasks.push(new CheckMiniGameVersionTask());
        tasks.push(new LoginPageTask());
        tasks.push(new InitAppStateTask());
        tasks.push(new CheckVersionTask());
        tasks.push(new LoginTask());
        TaskManager.runTask(tasks, null, Handler.create(this, this.onComplete));
    }

    private onComplete() {
        DebugUtils.isDebugMode() && console.log(">>> BootProcedure onComplete");

        setTimeout(() => {
            AsyncTableProcedure.start();
        }, 100);
        setTimeout(() => {
            AsyncScriptsProcedure.start();
        }, 300);
    }
}