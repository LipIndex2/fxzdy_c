import {TaskData} from "db://assets/scripts/game/modules/task/structs/TaskData";
import {ServerEnums} from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";

/**
 * 成就任务
 */
export class AchievementTaskContext {

    // 任务数据
    private _taskIdToTaskMap = new Map<number, TaskData>();

    /**
     * 初始化数据
     * @param initVo
     */
    static from(initVo: Vo.achievement.AchievementLoginVo): AchievementTaskContext {
        const context = new AchievementTaskContext();
        const taskInfoVo = initVo.taskInfoVo;
        if (!taskInfoVo) {
            return context;
        }

        // doing
        const currentTasks = taskInfoVo.currentTasks;
        currentTasks?.forEach(task => {
            const taskData = TaskData.fromServerData(task);
            context._taskIdToTaskMap.set(taskData.taskId, taskData);
        });

        // done
        const finishedTaskIds = taskInfoVo.finishedTaskIds;
        finishedTaskIds?.forEach(taskId => {
            const taskData = TaskData.createFinishTask(taskId, ServerEnums.TaskType.ACHIEVEMENT);
            context._taskIdToTaskMap.set(taskData.taskId, taskData);
        });


        return context;
    }

    /**
     * 获取排序后的任务 id
     */
    getViewTaskIdArray(): number[] {
        return this._taskIdToTaskMap.toDataStream()
            .map(kv => kv.value)
            .filter(it => {
                const config = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, it.taskId);
                if (!config) {
                    return false;
                }
                const parentTaskId = config.parentTaskId;
                // 没有父任务
                if (parentTaskId == 0) {
                    return true;
                }
                // 父任务已完成
                return this._taskIdToTaskMap.get(parentTaskId)?.isFinish() || false;
            })
            .sortByComparator(TaskData.ComparatorOrderByStateThenProgress)
            .map(task => task.taskId)
            .toArray()
    }


    /**
     * 获取任务数据
     * @param taskId
     */
    getTaskByTaskId(taskId: number): TaskData | null {
        return this._taskIdToTaskMap.get(taskId)
    }

    /**
     * 获取所有未完成的任务 id
     */
    getDoingTaskIdArray() {
        return this._taskIdToTaskMap.toDataStream()
            .filter(kv => kv.value.state === ServerEnums.TaskState.IN_PROGRESS)
            .map(kv => kv.value.taskId)
            .toArray()
    }

    getCanCompleteTaskIdArray() {
        return this._taskIdToTaskMap.toDataStream()
            .filter(kv => kv.value.isCanComplete())
            .map(kv => kv.value.taskId)
            .toArray()
    }

    markTaskFinish(taskId: number) {
        this._taskIdToTaskMap.get(taskId)?.markFinish();
    }

    addTaskProgress(taskId: number, addProgress: number): boolean {
        const task = this._taskIdToTaskMap.get(taskId);
        if (task) {
            task.addProgress(addProgress);
            return true;
        }
        return false;
    }
}
