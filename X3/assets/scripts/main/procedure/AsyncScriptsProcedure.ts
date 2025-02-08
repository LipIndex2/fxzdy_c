import { TaskGroup, TaskGroupState, TaskManager } from "../../core/task/TaskManager";
import IProcedure from "./IProcedure";
import GameScriptsTask from "./asyncTask/GameScriptsTask";

/**
 *异步加载代码流程
 */
export class AsyncScriptsProcedure implements IProcedure {
    private static taskGroup: TaskGroup;

    static isRunning() {
        return this.taskGroup && this.taskGroup.getState() === TaskGroupState.running;
    }
    static isCompleted() {
        return this.taskGroup && this.taskGroup.getState() === TaskGroupState.completed;
    }

    static start() {
        if (!this.taskGroup || this.taskGroup.getState() === TaskGroupState.failed) {
            new AsyncScriptsProcedure().run();
        }
    }

    run() {
        var tasks = [];
        tasks.push(new GameScriptsTask());
        AsyncScriptsProcedure.taskGroup = TaskManager.runTask(tasks, null);
    }
}