import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TrunkTaskConfigManager } from "db://assets/scripts/game/modules/task/config/TrunkTaskConfigManager";
import { DailyTaskConfigManager } from "db://assets/scripts/game/modules/task/config/DailyTaskConfigManager";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";


/**
 * 任务数据
 */
export class TaskData {

    // 任务类型
    taskType: ServerEnums.TaskType;
    // 任务ID
    taskId: number;
    // 当前进度
    currentProgress: number;
    // 任务状态
    state: ServerEnums.TaskState;

    // 先比较状态，再比较进度
    static readonly ComparatorOrderByStateThenProgress = ComparatorBuilder.create<TaskData>()
        .addComparator((a, b) => {
            if (a.state == ServerEnums.TaskState.FINISHED && b.state == ServerEnums.TaskState.FINISHED) {
                return 0;
            }
            if (a.state == ServerEnums.TaskState.FINISHED) {
                return 1;
            }
            if (b.state == ServerEnums.TaskState.FINISHED) {
                return -1;
            }
            return b.state - a.state
        })
        .addComparator((a, b) => b.currentProgress - a.currentProgress)
        .build()


    /**
     * 已完成任务
     * @param taskId
     * @param taskType
     */
    static createFinishTask(taskId: number, taskType: ServerEnums.TaskType): TaskData {
        const taskData = new TaskData();
        taskData.taskId = taskId;
        taskData.state = ServerEnums.TaskState.FINISHED;
        taskData.taskType = taskType;

        if (taskType == ServerEnums.TaskType.DAILY_TASK) {
            taskData.currentProgress = G.TableManager.getDataById(table.dailytask.DailyTaskConfig, taskId)?.maxProgressValue || 0;
        }
        if (taskType == ServerEnums.TaskType.ACHIEVEMENT) {
            taskData.currentProgress = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, taskId)?.totalProgress || 0;
        }
        if (taskType == ServerEnums.TaskType.GROW_UP) {
            taskData.currentProgress = ActivityTaskConfigManager.getConfigById(taskId)?.maxProgress || 0;
        }
        if (taskType == ServerEnums.TaskType.REACH_STANDARD) {
            taskData.currentProgress = ActivityTaskConfigManager.getConfigById(taskId)?.maxProgress || 0;
        }

        return taskData;
    }

    /**
     * 未开始任务
     * @param taskId
     * @param taskType
     */
    static createNotStartTask(taskId: number,
                              taskType: ServerEnums.TaskType
    ): TaskData {
        const taskData = new TaskData();
        taskData.taskId = taskId;
        taskData.state = ServerEnums.TaskState.FINISHED;
        taskData.taskType = taskType;
        taskData.currentProgress = 0;

        return taskData;
    }

    static fromServerData(taskVo: Vo.task.TaskVo) {
        const taskData = new TaskData();
        taskData.taskType = taskVo.type;
        taskData.taskId = taskVo.taskId;
        taskData.currentProgress = taskVo.progress;
        taskData.state = taskVo.state;
        return taskData;
    }

    /**
     * 是否可以完成
     */
    isCanComplete(): boolean {
        // 已完成任务
        if (this.state == ServerEnums.TaskState.FINISHED) {
            return false;
        }
        if (this.state == ServerEnums.TaskState.COMPLETED) {
            return true;
        }

        // 未领取 + 未完成
        let maxProgressCount = 0;
        // 主线任务
        if (this.taskType == ServerEnums.TaskType.TRUNK_TASK) {
            maxProgressCount = G.TableManager.getDataById(table.trunktask.TrunkTaskConfig, this.taskId)?.totalProgress || 0;
        }
        if (this.taskType == ServerEnums.TaskType.ACHIEVEMENT) {
            maxProgressCount = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, this.taskId)?.totalProgress || 0;
        }
        if (this.taskType == ServerEnums.TaskType.DAILY_TASK) {
            maxProgressCount = G.TableManager.getDataById(table.dailytask.DailyTaskConfig, this.taskId)?.maxProgressValue || 0;
        }
        if (this.taskType == ServerEnums.TaskType.CARNIVAL) {
            maxProgressCount = SevenDayConfigManager.getTaskConfig(this.taskId)?.maxProgress || 0;
        }
        // 其他任务类型...

        return this.currentProgress >= maxProgressCount;
    }

    /**
     * 已完成 + 已领取奖励
     */
    isFinish(): boolean {
        return this.state == ServerEnums.TaskState.FINISHED;
    }

    /**
     * 标记为已完成
     */
    markFinish() {
        this.state = ServerEnums.TaskState.FINISHED;
    }

    /**
     * 标记已完成
     */
    markComplete() {
        this.state = ServerEnums.TaskState.COMPLETED;
    }

    /**
     * 添加进度
     * @param addProgress
     */
    addProgress(addProgress: number) {
        this.currentProgress += addProgress;

        if (this.isCanComplete()) {
            this.markComplete()
        }
    }

    // 获取最大进度
    getMaxProgress(): number {
        if (this.taskType == ServerEnums.TaskType.DAILY_TASK) {
            return DailyTaskConfigManager.getConfigById(this.taskId)?.maxProgressValue || 0;
        }
        if (this.taskType == ServerEnums.TaskType.TRUNK_TASK) {
            return TrunkTaskConfigManager.getConfigById(this.taskId)?.totalProgress || 0;
        }
        if (this.taskType == ServerEnums.TaskType.GROW_UP) {
            return ActivityTaskConfigManager.getConfigById(this.taskId)?.maxProgress || 0;
        }

        return 0;
    }

    //获取当前任务id的状态
    get State() {
        return this.state;
    }

    /**
     * 获取奖励
     */
    getRewardItems(): NoOwnerItem[] {

        // 成长之路
        if (this.taskType == ServerEnums.TaskType.GROW_UP) {
            const config = ActivityTaskConfigManager.getConfigById(this.taskId);
            if (!config) {
                return []
            }
            return ItemUtils.parseKvArrayToItemArray(config.rewards);
        }


        return []
    }

    isBigRewardTask() {
        if (this.taskType == ServerEnums.TaskType.GROW_UP) {
            const config = ActivityTaskConfigManager.getConfigById(this.taskId);
            if (!config) {
                return []
            }
            return config.isShowHead;
        }
        return false;
    }

}
