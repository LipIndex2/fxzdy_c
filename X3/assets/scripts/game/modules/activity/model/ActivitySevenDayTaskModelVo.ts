import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NumberRange } from "db://assets/scripts/core/utils/NumberRange";
import TaskState = ServerEnums.TaskState;
import TaskType = ServerEnums.TaskType;
import GIns from "../../../GIns";
import { SevenDayController } from "../sevenDay/SevenDayController";

/**
 * 七日任务
 */
export class ActivitySevenDayTaskModelVo extends BaseActivityVo {
    // 最大天数
    private _maxDay: number = 0;

    public get activityVo(): Vo.activity.CarnivalVo {
        return this.content as any;
    }

    onInitDone() {
        if (!this.activityVo.rewardIds) {
            this.activityVo.rewardIds = [];
        }

        // 刷新最大天数
        this.refreshMaxDay();

        Logger.game(`【七日任务】初始化完成. activityId=${this.activityId} `);
        FacadeManager.ins().emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
    }

    private refreshMaxDay() {
        // 最大阶段id
        const taskInfoVo = this.activityVo.taskInfoVo;
        let maxGroupId = [...taskInfoVo.currentTasks.map((it) => TaskData.fromServerData(it)), ...taskInfoVo.finishedTaskIds.map((it) => TaskData.createFinishTask(it, TaskType.GROW_UP))]
            .toDataStream()
            .filterNotNull()
            .map((it) => ActivityTaskConfigManager.getConfigById(it.taskId)?.groupId)
            .maxByWeightNumber((it) => it, 0);
        this._maxDay = SevenDayConfigManager.getDayByGroupId(maxGroupId);
    }

    // on update
    updateTaskData(newTaskData: Vo.task.TaskVo): void {
        if (!newTaskData) {
            return;
        }

        const taskId = newTaskData.taskId;
        const config = ActivityTaskConfigManager.getConfigById(taskId);
        if (!config) {
            Logger.error(`【七日任务】未找到配置 | taskId=${taskId}`);
            return;
        }

        // task
        const taskInfoVo = this.activityVo.taskInfoVo;
        const currentTasks = taskInfoVo.currentTasks;
        let isFinish = false;
        let isHave = false;

        for (let currentTask of currentTasks) {
            if (currentTask.taskId == taskId) {
                isHave = true;
                const newState = newTaskData.state;
                if (newState == ServerEnums.TaskState.FINISHED) {
                    isFinish = true;
                } else {
                    currentTask.state = newState;
                }

                currentTask.progress = newTaskData.progress;
                break;
            }
        }

        // new task
        if (!isHave) {
            taskInfoVo.currentTasks.push(newTaskData);
            Logger.game(`七日任务 | 添加新的任务 taskId = ${newTaskData.taskId}`);
        }

        if (isFinish) {
            taskInfoVo.finishedTaskIds.push(taskId);
            taskInfoVo.currentTasks = taskInfoVo.currentTasks.filter((it) => it.taskId != taskId);
        }

        // 刷新
        this.refreshMaxDay();

        // event
        (!isHave || isFinish) && FacadeManager.ins().emit(NotificationKey.SEVEN_DAY_TASK_UPDATE);
        isFinish && FacadeManager.ins().emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);

        // this.isShowRed();
        SevenDayController.ins().initRedDot(this.activityId);
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        if (!(this.getEndTimeMs() > TimeManager.serverNow)) {
            return true;
        }

        return this.isDone();
    }

    // red dot
    public isShowRed(): boolean {
        let arr = this.getAllTaskArray();

        const completedTask = arr.find((value) => value.state == ServerEnums.TaskState.COMPLETED);
        if (completedTask != null) {
            return true;
        }

        // progress
        if (this.isCanGainAnyProgressReward()) {
            return true;
        }

        return false;
    }

    /**
     * 获取所有任务
     */
    getAllTaskArray(): TaskData[] {
        return [
            ...this.activityVo.taskInfoVo.currentTasks.map((it) => TaskData.fromServerData(it)),
            ...this.activityVo.taskInfoVo.finishedTaskIds.map((it) => TaskData.createFinishTask(it, TaskType.GROW_UP)),
        ];
    }

    /**
     * 获取普通任务排序数组
     */
    getTaskSortArrayByDay(chooseDay: number): Array<TaskData> {
        const taskConfigArrayByDay = SevenDayConfigManager.getTaskConfigArrayByDay(chooseDay);

        const taskDataArray = [
            ...this.activityVo.taskInfoVo.currentTasks.map((it) => TaskData.fromServerData(it)),
            ...this.activityVo.taskInfoVo.finishedTaskIds.map((it) => TaskData.createFinishTask(it, TaskType.GROW_UP)),
        ]
            .toDataStream()
            .filter((it) => {
                const c = ActivityTaskConfigManager.getConfigById(it.taskId);
                if (!c) {
                    return false;
                }
                // 只保留当前阶段
                const groupId = c.groupId;
                const day = SevenDayConfigManager.getDayByGroupId(groupId);
                return day == chooseDay;
            })
            .filter((it) => it.isBigRewardTask() == false)
            .sortByComparator(TaskData.ComparatorOrderByStateThenProgress)
            .toArray();

        // 数据一致
        if (taskDataArray.length == taskConfigArrayByDay.length) {
            return taskDataArray;
        }

        return taskConfigArrayByDay.map((it) => {
            return TaskData.createNotStartTask(it.id, ServerEnums.TaskType.CARNIVAL);
        });
    }

    /**
     * 完成任务
     * @param taskIdStr
     */
    finshTask(taskIdStr: string) {
        if (!taskIdStr.startsWith("TASK_")) {
            return;
        }
        const taskId = taskIdStr.substring(5).toInt();
        if (taskId == 0) {
            Logger.error("taskId is 0");
            return;
        }

        this.activityVo.taskInfoVo.currentTasks = this.activityVo.taskInfoVo.currentTasks.filter((it) => it.taskId != taskId);
        this.activityVo.taskInfoVo.finishedTaskIds.push(taskId);

        Logger.game(`【七日任务】完成并领取了活动任务. activityId=${this.activityId}, taskId=${taskId}`);

        FacadeManager.ins().emit(NotificationKey.SEVEN_DAY_TASK_UPDATE);
    }

    /**
     * 这个阶段是否领取过
     * @param day
     */
    isHaveGainAllByDay(day: number): boolean {
        let isHaveGain = false;
        if (day < this._maxDay) {
            isHaveGain = true;
        }
        const isAllFinish = ArrayUtils.isEmpty(this.activityVo.taskInfoVo.currentTasks);
        return isAllFinish || isHaveGain;
    }

    /**
     * 获取进度
     * @param config
     */
    getProgressPercent100ByConfig(config: table.activity.Carnival.CarnivalRewardConfig): number {
        const start = config.scoreStart;
        const end = config.scoreEnd;

        const activityId = this.activityId;
        const itemId = SevenDayConfigManager.getScoreItemIdByActivityId(activityId);

        const scoreCount = BackpackManager.ins().getItemCountByItemId(itemId);

        const range = NumberRange.create(start, end);
        return range.getPercentByValue(scoreCount, 100);
    }

    // 任务进度
    getTaskProgressByTaskId(taskId: number): number {
        const taskInfoVo = this.activityVo.taskInfoVo;

        for (let task of taskInfoVo.currentTasks || []) {
            if (task.taskId == taskId) {
                return task.progress;
            }
        }
        for (let finishTaskId of taskInfoVo.finishedTaskIds || []) {
            if (finishTaskId == taskId) {
                return SevenDayConfigManager.getTaskConfig(taskId)?.maxProgress || 0;
            }
        }

        return 0;
    }

    // score
    getScore(): number {
        const itemId = SevenDayConfigManager.getScoreItemIdByActivityId(this.activityId);
        return BackpackManager.ins().getItemCountByItemId(itemId);
    }

    /**
     * 任务状态
     * @param taskId
     */
    getTaskStateById(taskId: number): TaskState {
        const taskInfoVo = this.activityVo.taskInfoVo;

        // done
        if (taskInfoVo.finishedTaskIds.indexOf(taskId) >= 0) {
            return TaskState.FINISHED;
        }

        const curTask = taskInfoVo.currentTasks.find((it) => it.taskId == taskId);
        if (!curTask) {
            return ServerEnums.TaskState.NOT_START;
        }

        const maxProgress = SevenDayConfigManager.getTaskConfig(taskId)?.maxProgress || 0;
        const curProgress = curTask.progress;
        if (curProgress >= maxProgress) {
            return ServerEnums.TaskState.COMPLETED;
        }

        return ServerEnums.TaskState.IN_PROGRESS;
    }

    getMaxDay(): number {
        return this._maxDay;
    }

    /**
     * 是否领取过奖励
     * @param rewardId
     */
    isGainRewardConfig(rewardId: number): boolean {
        return this.activityVo.rewardIds.find((it) => it == rewardId) != null;
    }

    /**
     * 是否领取过
     * @param rewardId
     */
    markGainRewardId(rewardId: number) {
        this.activityVo.rewardIds.push(rewardId);

        FacadeManager.ins().emit(NotificationKey.SEVEN_DAY_TASK_UPDATE);
    }

    /**
     * 奖励
     * @param uidStr
     */
    markGainRewardIdByServer(uidStr: string) {
        if (!uidStr) {
            Logger.error(`领取进度奖励失败. uid = ${uidStr}`);
            return;
        }
        // SCORE_
        const rewardId = uidStr.substring(6).toInt();
        this.markGainRewardId(rewardId);
    }

    getHaveGainRewardIdCount(): number {
        return this.activityVo.rewardIds?.length || 0;
    }

    /**
     * 是否可以领取任何奖励
     * @private
     */
    private isCanGainAnyProgressReward(): boolean {
        const sevenDayProgressConfigArray = SevenDayConfigManager.getSevenDayProgressConfigArray(this.activityId);
        const score = this.getScore();
        for (let c of sevenDayProgressConfigArray) {
            if (score >= c.scoreEnd) {
                if (this.activityVo.rewardIds.indexOf(c.id) < 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
