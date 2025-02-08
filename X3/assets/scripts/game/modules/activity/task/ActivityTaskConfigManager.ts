import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";

/**
 * 活动任务
 */
export class ActivityTaskConfigManager {
    private static _isInit = false;

    // <taskId, ActivityTaskConfig>
    private static _taskIdToTaskMap: Map<number, table.activity.Task.ActivityTaskConfig> = new Map();
    // <activityId, <stageId, 阶段大奖[]>>
    private static _activityIdToStageIdToRewardArrayMap: Map<number, Map<number, NoOwnerItem[]>> = new Map();

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        
        this._taskIdToTaskMap = MapUtils.toLevel1Map(
            TableManager.getAllData(table.activity.Task.ActivityTaskConfig),
            it => it.id,
            (v1, v2) => v2
        );
        
        // 解析阶段奖励
        for (let data of TableManager.getAllData(table.activity.Task.ActivityTaskConfig)) {
            if (!data.isShowHead) {
                continue;
            }
            const childMap = this._activityIdToStageIdToRewardArrayMap.getOrCreate(data.activityId, () => new Map());
            const rewards = ItemUtils.parseKvArrayToItemArray(data.rewards);
            const stageId = data.growUpStageId;
            childMap.merge(stageId, rewards, (v1, v2) => {
                // 合并相同道具
                return ItemUtils.mergeItemArray(v1, v2);
            });
        }
    }

    // 活动任务配置
    static getConfigById(taskId: number): table.activity.Task.ActivityTaskConfig | null {
        return this._taskIdToTaskMap.get(taskId) || null;
    }

    // stageId 阶段奖励 by activityId
    static getStageIdToRewardArrayMapByActivityId(activityId: number): Map<number, NoOwnerItem[]> {
        return this._activityIdToStageIdToRewardArrayMap.get(activityId) || new Map();
    }
}