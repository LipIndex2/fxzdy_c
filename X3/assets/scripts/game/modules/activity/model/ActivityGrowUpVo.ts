import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import TaskType = ServerEnums.TaskType;


/**
 * 成长之路
 */
export class ActivityGrowthPathVo extends BaseActivityVo {

    private _maxStageId: number = 0;

    public get activityVo(): Vo.task.TaskInfoVo {
        return this.content as any;
    }

    onInitDone() {
        // 最大阶段id
        let maxStageId = [
            ...this.activityVo.currentTasks.map(it => TaskData.fromServerData(it)),
            ...this.activityVo.finishedTaskIds.map(it => TaskData.createFinishTask(it, TaskType.GROW_UP)),
        ].toDataStream()
            .filterNotNull()
            .map(it => ActivityTaskConfigManager.getConfigById(it.taskId)?.growUpStageId || 0)
            .maxByWeightNumber(it => it, 0);
        this._maxStageId = maxStageId;

        console.info(`【成长之路】初始化完成. activityId=${this.activityId}, maxStageId=${this._maxStageId}`);

    }

    updateTaskData(newTaskData: Vo.task.TaskVo): void {
        if (!newTaskData) {
            return;
        }

        const taskId = newTaskData.taskId;
        const config = ActivityTaskConfigManager.getConfigById(taskId)
        if (!config) {
            console.error(`【成长之路】未找到配置 | taskId=${taskId}`);
            return;
        }

        const currentTasks = this.activityVo.currentTasks;
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

        // 最大阶段id
        this._maxStageId = Math.max(this._maxStageId, config.growUpStageId);

        // new task
        if (!isHave) {
            this.activityVo.currentTasks.push(newTaskData);
        }

        if (isFinish) {
            this.activityVo.finishedTaskIds.push(taskId);
            this.activityVo.currentTasks = this.activityVo.currentTasks.filter(it => it.taskId != taskId);
        }


        (!isHave || isFinish) && FacadeManager.ins().emit(NotificationKey.GROW_UP_TASK_UPDATE);
        isFinish && FacadeManager.ins().emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {

        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        return this.isDone();


    }

    public isShowRed(): boolean {
        let hasRed:boolean = false
        let arr = this.getNormalTaskSortArray()
        hasRed = arr.find((value) => value.state == 3) != null;
        if (hasRed) {
            return hasRed
        }
        let bigTask = this.getBigRewardTask()
        if (bigTask?.state == ServerEnums.TaskState.COMPLETED) {
            hasRed = true
        }
        return hasRed
    }

    getMaxStageId(): number {
        return this._maxStageId;
    }

    /**
     * 获取普通任务排序数组
     */
    getNormalTaskSortArray(): Array<TaskData> {
        return [
            ...this.activityVo.currentTasks.map(it => TaskData.fromServerData(it)),
            ...this.activityVo.finishedTaskIds.map(it => TaskData.createFinishTask(it, TaskType.GROW_UP)),
        ]
            .toDataStream()
            .filter(it => {
                const c = ActivityTaskConfigManager.getConfigById(it.taskId);
                if (!c) {
                    return false;
                }
                // 只保留当前阶段
                return c.growUpStageId == this._maxStageId;
            })
            .filter(it => it.isBigRewardTask() == false)
            .sortByComparator(TaskData.ComparatorOrderByStateThenProgress)
            .toArray()
            ;
    }

    // 完成并跨天
    isDoneAndPast1Day(): boolean {
        if (this.doneTimeMs <= 0) {
            return false;
        }
        let nextDay = DateUtils.getNextResetTimeByResetHour(this.doneTimeMs, 0);

        return TimeManager.serverNow >= nextDay;
    }

    getBigRewardTask(): TaskData {
        const curBigRewardTask = [
            ...this.activityVo.currentTasks.map(it => TaskData.fromServerData(it)),
        ].find((value, index) => {
            const taskId = value.taskId;
            const configById = ActivityTaskConfigManager.getConfigById(taskId);
            return configById?.isShowHead || false;
        });
        if (curBigRewardTask) {
            return curBigRewardTask;
        }

        // 全部任务完成了
        return [
            ...this.activityVo.finishedTaskIds.map(it => TaskData.createFinishTask(it, TaskType.GROW_UP)),
        ].find((value, index) => {
            const taskId = value.taskId;
            const configById = ActivityTaskConfigManager.getConfigById(taskId);
            if (!configById) {
                return false;
            }

            if (configById.growUpStageId != this._maxStageId) {
                return false;
            }
            return configById.isShowHead || false;
        });
    }

    getRewardArrayGroupByStageId(): Map<number, NoOwnerItem[]> {
        return ActivityTaskConfigManager.getStageIdToRewardArrayMapByActivityId(this.activityId);
    }

    finshTask(taskIdStr: string) {
        const taskId = taskIdStr.toInt();
        if (taskId == 0) {
            console.error("taskId is 0")
            return;
        }


        this.activityVo.currentTasks = this.activityVo.currentTasks.filter(it => it.taskId != taskId);
        this.activityVo.finishedTaskIds.push(taskId);

        console.info(`【成长之路】完成并领取了活动任务. activityId=${this.activityId}, taskId=${taskId}`);

        FacadeManager.ins().emit(NotificationKey.GROW_UP_TASK_UPDATE);
    }

    /**
     * 这个阶段是否领取过
     * @param stageId
     */
    isHaveGainStage(stageId: number) {
        let isHaveGain = false;
        if (stageId < this.getMaxStageId()) {
            isHaveGain = true;
        }
        const isAllFinish = ArrayUtils.isEmpty(this.activityVo.currentTasks);
        return isAllFinish || isHaveGain;
    }
}