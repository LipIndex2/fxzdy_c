import { TaskManager } from "../../core/task/TaskManager";
import IProcedure from "./IProcedure";

import EnterTask from "./gameTask/EnterTask";
import { LoadServerDescriptionTask } from "./gameTask/LoadServerDescriptionTask";
import { AccountLoginTask } from "./gameTask/AccountLoginTask";
import { InitPlayerInfoTask } from "./gameTask/InitPlayerInfoTask";
import LoadResTask from "./gameTask/LoadResTask";
import AyncTableProcedureCheckTask from "./gameTask/AyncTableProcedureCheckTask";
import { Handler } from "../../core/utils/Handler";
import { UIManager } from "../../core/mvc/UIManager";
import { UILoginKey } from "../modules/login/const/UILoginConfig";
import AyncScriptsProcedureCheckTask from "./gameTask/AyncScriptsProcedureCheckTask";

/**
 *游戏进入流程
 */
export default class EnterGameProcedure implements IProcedure {
    static start() {
        UIManager.ins().open(UILoginKey.LOGIN_PROGRESS_WIN);

        new EnterGameProcedure().run();
    }

    run() {
        var tasks = [];
        tasks.push(new LoadServerDescriptionTask());
        tasks.push(new AyncTableProcedureCheckTask());
        tasks.push(new AyncScriptsProcedureCheckTask());
        tasks.push(new LoadResTask());
        tasks.push(new AccountLoginTask());
        tasks.push(new InitPlayerInfoTask());
        tasks.push(new EnterTask());
        TaskManager.runTask(tasks, null, null, Handler.create(this, this.onError));
    }

    private onError() {
        console.error("EnterGameProcedure 失败");
        UIManager.ins().close(UILoginKey.LOGIN_PROGRESS_WIN);
    }
}