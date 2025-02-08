import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { DailyTaskConfigManager } from "db://assets/scripts/game/modules/task/config/DailyTaskConfigManager";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";

/**
 * 每日任务状态数据
 */
export class DailyTaskContext {

    /**
     * 日活跃积分
     */
    dailyScore: number = 0;

    /**
     * 周活跃积分
     */
    weekScore: number = 0;

    /**
     * 已领取的日活跃宝箱
     */
    private _haveGainDailyRewardIdSet: Set<number>;

    /**
     * 已领取的周活跃宝箱
     */
    private _haveGainWeekRewardIdSet: Set<number>;

    /**
     * 进行中/完成了但未领取的任务 = doing/completed task
     * <taskId, task>
     */
    private _dailyTaskIdToTaskDataMap: Map<number, TaskData>;


    /**
     * 初始化 by Server
     * @param initData
     */
    static from(initData: Vo.dailytask.DailyTaskLoginVo): DailyTaskContext {
        const data = new DailyTaskContext();
        if (!initData) {
            console.error("每日活跃任务. 初始化数据 is null")
            return data
        }

        data.dailyScore = initData.dailyActive;
        data.weekScore = initData.weeklyActive;
        data._haveGainDailyRewardIdSet = initData.drewDailyActiveBoxIds?.toDataStream().toSet() || new Set();
        data._haveGainWeekRewardIdSet = initData.drewWeeklyActiveBoxIds?.toDataStream().toSet() || new Set();

        // 当街接的任务状态
        const taskInfoVo = initData.taskInfoVo;
        if (taskInfoVo) {
            data._dailyTaskIdToTaskDataMap = taskInfoVo.currentTasks
                    ?.toDataStream()
                    .toMap((task) => task.taskId, (task) => TaskData.fromServerData(task))
                || new Map();
            const finishTaskIdMap = taskInfoVo.finishedTaskIds?.toDataStream()
                .toMap((id) => id, (taskId) => {
                    return TaskData.createFinishTask(taskId, ServerEnums.TaskType.DAILY_TASK)
                });
            for (let [taskId, task] of finishTaskIdMap) {
                data._dailyTaskIdToTaskDataMap.set(taskId, task);
            }
        }

        return data;
    }


    /**
     * 获取任务状态
     * @param dailyTaskId 每日任务id
     */
    getTaskState(dailyTaskId: number): ServerEnums.TaskState {
        const doingTask = this._dailyTaskIdToTaskDataMap.get(dailyTaskId);
        if (!doingTask) {
            return ServerEnums.TaskState.NOT_START
        }
        // config
        const dailyTaskConfig = TableManager.getDataById(table.dailytask.DailyTaskConfig, dailyTaskId);
        if (!dailyTaskConfig) {
            return ServerEnums.TaskState.NOT_START
        }
        // 执行中
        if (doingTask.currentProgress < dailyTaskConfig.maxProgressValue) {
            return ServerEnums.TaskState.IN_PROGRESS;
        }
        // 已完成
        return ServerEnums.TaskState.COMPLETED
    }

    /**
     * 某个任务是否可以完成
     * @param dailyTaskId 每日任务id
     */
    isCanComplete(dailyTaskId: number): boolean {
        return this.getTaskState(dailyTaskId) == ServerEnums.TaskState.COMPLETED
    }

    /**
     * 获取每日任务
     * @param dailyTaskId
     */
    getDailyTaskById(dailyTaskId: number): TaskData {
        return this._dailyTaskIdToTaskDataMap.get(dailyTaskId)
    }

    /**
     * 获取排序后的任务 id
     */
    getSortedDailyTaskIdArray(): number[] {
        return this._dailyTaskIdToTaskDataMap.toDataStream()
            .map(kv => kv.value)
            .sortByComparator(TaskData.ComparatorOrderByStateThenProgress)
            .map(task => task.taskId)
            .toArray()
    }

    addDailyScore(addScore: number) {
        this.dailyScore += addScore;
        this.weekScore += addScore;
        this.refreshRedDot()
    }

    // 完成任务
    finishTask(taskIds: number[]) {
        taskIds.forEach(taskId => {
            const taskData: TaskData = this._dailyTaskIdToTaskDataMap.get(taskId);
            if (!taskData) {
                return
            }
            taskData.state = ServerEnums.TaskState.FINISHED;
        });


        this.refreshRedDot();
    }

    updateTaskState(changedTask: Vo.task.TaskVo) {
        const newTaskId = changedTask.taskId;
        const newProgressValue = changedTask.progress;

        G.Logger.debug(`收到服务器每日任务推送变更. daily taskId = ${newTaskId}, progress = ${newProgressValue}`);


        // 配置不存在
        const config = TableManager.getDataById(table.dailytask.DailyTaskConfig, newTaskId);
        if (!config) {
            G.Logger.error(`DailyTaskContext.updateTaskState: DailyTaskConfig not found, taskId: ${newTaskId}`);
            return;
        }

        const taskData = this._dailyTaskIdToTaskDataMap.get(newTaskId);
        if (!taskData) {
            // 任务不存在, 添加新的任务
            this._dailyTaskIdToTaskDataMap.set(newTaskId, TaskData.fromServerData(changedTask));
            // event
            FacadeManager.ins().emit(NotificationKey.DAILY_TASK_ADD_NEW);
            return
        }
        taskData.currentProgress = changedTask.progress;

        const oldState = taskData.state;
        const newState = changedTask.state;

        // 状态更新
        taskData.state = changedTask.state;

        FacadeManager.ins().emit(NotificationKey.EVENT_DAILY_TASK_CHANGE);
        
        if (oldState != newState) {
            this.refreshRedDot();
        }
    }

    /**
     * 获取所有进行中的任务id
     */
    getDoingTaskIdArray(): number[] {
        return this._dailyTaskIdToTaskDataMap.toDataStream()
            .map(it => it.value)
            .filter(it => it.state == ServerEnums.TaskState.IN_PROGRESS)
            .map(it => it.taskId)
            .toArray()
    }

    // 加进度
    addProgress(taskId: number, addProgress: number): boolean {
        const taskData = this._dailyTaskIdToTaskDataMap.get(taskId);
        if (!taskData) {
            return false;
        }
        taskData.currentProgress += addProgress;
        const config = TableManager.getDataById(table.dailytask.DailyTaskConfig, taskId);
        if (!config) {
            return false;
        }
        if (taskData.currentProgress >= config.maxProgressValue) {
            taskData.state = ServerEnums.TaskState.COMPLETED;
        }
        return true;
    }

    /**
     * 是否领了日活跃宝箱
     * @param boxId
     */
    isGainDailyActiveBoxById(boxId: number): boolean {
        return this._haveGainDailyRewardIdSet.has(boxId)
    }

    /**
     * 是否领了周活跃宝箱
     * @param boxId
     */
    isGainWeekActiveBoxById(boxId: number): boolean {
        return this._haveGainWeekRewardIdSet.has(boxId)
    }

    // 日活
    addDailyActiveBoxByIdByGain(boxId: number) {
        this._haveGainDailyRewardIdSet.add(boxId)
        this.refreshRedDot()
    }

    // 周活
    addWeekActiveBoxByIdByGain(boxId: number) {
        this._haveGainWeekRewardIdSet.add(boxId)
        this.refreshRedDot()
    }

    // 获取所有已完成但未领奖的 taskId[]
    getAllCompleteTaskIdArray(): number[] {
        return this._dailyTaskIdToTaskDataMap.toDataStream()
            .map(it => it.value)
            .filter(it => it.isCanComplete())
            .map(it => it.taskId)
            .toArray()
    }

    // 所有可领取的日活跃箱子 id[]
    getCanGainDailyBoxIdArray(): number[] {
        const configArray = TableManager.getAllData(table.dailytask.DailyActiveBoxConfig);
        if (!configArray) {
            return []
        }
        return configArray.toDataStream()
            // 未领取过 + 积分达到
            .filter(it => !this._haveGainDailyRewardIdSet.has(it.id) && this.dailyScore >= it.needDailyScore)
            .map(it => it.id)
            .toArray();
    }

    // 所有可领取的周活跃箱子 id[]
    getCanGainWeekBoxIdArray(): number[] {
        const configArray = TableManager.getAllData(table.dailytask.WeeklyActiveBoxConfig);
        if (!configArray) {
            return []
        }
        return configArray.toDataStream()
            // 未领取过 + 积分达到
            .filter(it => !this._haveGainWeekRewardIdSet.has(it.id) && this.weekScore >= it.needWeekScore)
            .map(it => it.id)
            .toArray();
    }

    // 是否有任何奖励可以领取
    isHaveAnyRewardCanGain(): boolean {
        // 可完成任务 / 可领取日活 / 可领取周活
        const dailyBoxIds = this.getCanGainDailyBoxIdArray();
        const canGainWeekBoxIds = this.getCanGainWeekBoxIdArray();
        const allCompleteTaskIdArray = this.getAllCompleteTaskIdArray();
        return dailyBoxIds.length > 0
            || canGainWeekBoxIds.length > 0
            || allCompleteTaskIdArray.length > 0
    }

    resetByServer(vo: Vo.dailytask.DailyTaskResetVo) {
        this.dailyScore = vo.dailyActive;
        this.weekScore = vo.weeklyActive;
        this._haveGainDailyRewardIdSet = vo.drewDailyActiveBoxIds?.toDataStream().toSet() || new Set();
        this._haveGainWeekRewardIdSet = vo.drewWeeklyActiveBoxIds?.toDataStream().toSet() || new Set();

        // 服务端说直接删就可以了..
        const taskRemovedVo = vo.taskRemovedVo;
        if (taskRemovedVo) {
            taskRemovedVo.finishedTaskIds?.forEach(taskId => {
                this._dailyTaskIdToTaskDataMap.delete(taskId)
            })
            taskRemovedVo.currentTaskIds?.forEach(taskId => {
                this._dailyTaskIdToTaskDataMap.delete(taskId)
            })
        }

        this.refreshRedDot();
    }


    refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.DAILY_TASK)) {
            return;
        }
        // daily task
        for (let [taskId, data] of this._dailyTaskIdToTaskDataMap) {
            const isCanComplete = data.isCanComplete();

            RedDotManager.ins().setRedDot(RedDotKeys.dailyTask_taskRow, isCanComplete, [taskId]);
        }

        // box daily
        for (let config of DailyTaskConfigManager.getDailyBoxConfigArray()) {
            const id = config.id;
            const isCan = this.isCanGainDailyBoxByConfig(config);
            RedDotManager.ins().setRedDot(RedDotKeys.dailyTask_DailyRewardBox, isCan, [id]);
        }
        // box weekly
        for (let config of DailyTaskConfigManager.getWeeklyBoxConfigArray()) {
            const id = config.id;
            const isCan = this.isCanGainWeeklyBoxByConfig(config);
            RedDotManager.ins().setRedDot(RedDotKeys.dailyTask_WeeklyRewardBox, isCan, [id]);
        }

    }

    // 是否可以领取日活跃箱子
    private isCanGainDailyBoxByConfig(config: table.dailytask.DailyActiveBoxConfig): boolean {
        if (!config) {
            return false;
        }
        if (this.dailyScore < config.needDailyScore) {
            return false;
        }

        const id = config.id;
        return !this._haveGainDailyRewardIdSet.has(id);
    }


    // 是否可以领取周活跃箱子
    private isCanGainWeeklyBoxByConfig(config: table.dailytask.WeeklyActiveBoxConfig): boolean {
        if (!config) {
            return false;
        }
        if (this.weekScore < config.needWeekScore) {
            return false;
        }

        const id = config.id;
        return !this._haveGainWeekRewardIdSet.has(id);
    }
}
