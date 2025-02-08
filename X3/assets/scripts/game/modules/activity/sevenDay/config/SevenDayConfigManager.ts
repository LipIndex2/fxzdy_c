import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 七日
 */
export class SevenDayConfigManager {
    // <天数, 任务配置[]>
    private static _dayToTaskConfigsMap: Map<number, table.activity.Task.ActivityTaskConfig[]> = new Map();
    // <分组id, 天数>
    private static _groupIdToDayMap: Map<number, number> = new Map();
    private static _taskIdToDayMap: Map<number, number> = new Map();

    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        const tempMap = TableManager.getAllData(table.activity.Task.ActivityTaskConfig)
            .filter(it => ServerEnums.TaskType[it.type] == ServerEnums.TaskType.CARNIVAL)
            .toDataStream()
            .groupBy(it => it.groupId);
        this._dayToTaskConfigsMap.clear();

        let day = 1;
        for (let [groupId, configs] of tempMap.entries()) {
            this._groupIdToDayMap.set(groupId, day);
            this._dayToTaskConfigsMap.set(day, configs);
            for (let config of configs) {
                this._taskIdToDayMap.set(config.id, day);

            }
            day++;
        }
    }

    /**
     * 获取某一天任务列表
     * @param day
     */
    static getTaskConfigArrayByDay(day: number): table.activity.Task.ActivityTaskConfig[] {
        const taskArray = this._dayToTaskConfigsMap.get(day) || [];
        return taskArray.sort();
    }

    /**
     * 七日奖励进度 config
     */
    static getSevenDayProgressConfigArray(activityId: number): table.activity.Carnival.CarnivalRewardConfig[] {
        return TableManager.getAllData(table.activity.Carnival.CarnivalRewardConfig)
            .filter(it => it.activityId == activityId)
            ;
    }

    /**
     * 天
     * @param groupId
     */
    static getDayByGroupId(groupId: number): number {
        return this._groupIdToDayMap.getOrDefault(groupId, 1);
    }

    /**
     * 获取积分道具id
     * @param activityId
     */
    static getScoreItemIdByActivityId(activityId: number): number {
        return TableManager.getDataById(table.activity.Carnival.CarnivalConfig, activityId)?.scoreItemId || 0;
    }

    /**
     * 任务配置
     * @param taskId
     */
    static getTaskConfig(taskId: number): table.activity.Task.ActivityTaskConfig | null {
        return TableManager.getDataById(table.activity.Task.ActivityTaskConfig, taskId);
    }

    static getDayByTaskId(taskId: number): number {
        return this._taskIdToDayMap.getOrDefault(taskId, 0);
    }
}