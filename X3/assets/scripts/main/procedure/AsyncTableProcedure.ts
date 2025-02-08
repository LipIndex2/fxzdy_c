import { TaskGroup, TaskGroupState, TaskManager } from "../../core/task/TaskManager";
import { Handler } from "../../core/utils/Handler";
import IProcedure from "./IProcedure";
import FontTask from "./asyncTask/FontTask";
import ForbiddenTask from "./asyncTask/ForbiddenTask";
import GameScriptsTask from "./asyncTask/GameScriptsTask";
import TableTask from "./asyncTask/TableTask";

/**
 *异步加载资源流程
 */
export class AsyncTableProcedure implements IProcedure {
    private static taskGroup: TaskGroup;

    static isRunning() {
        return this.taskGroup && this.taskGroup.getState() === TaskGroupState.running;
    }
    static isCompleted() {
        return this.taskGroup && this.taskGroup.getState() === TaskGroupState.completed;
    }

    static start() {
        if (!this.taskGroup || this.taskGroup.getState() === TaskGroupState.failed) {
            new AsyncTableProcedure().run();
        }
    }

    run() {
        var tasks = [];
        tasks.push(new TableTask());
        tasks.push(new FontTask());
        tasks.push(new ForbiddenTask());
        AsyncTableProcedure.taskGroup = TaskManager.runTask(tasks, null);
    }
}