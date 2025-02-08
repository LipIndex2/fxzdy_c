import { PoolManager } from "db://assets/scripts/core/pool/PoolManager";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { IPool } from "db://assets/scripts/core/pool/IPoolInstance";

export class EventTaskProgressChange implements IPool {


    taskId: number = 0;
    oldProgress: number = 0;
    newProgress: number = 0;
    maxProgress: number = 0;

    onRecovery(): void {
        this.taskId = 0;
        this.oldProgress = 0;
        this.newProgress = 0;
        this.maxProgress = 0;


    }


    static create(taskId: number,
                  oldP: number,
                  newP: number,
    ): EventTaskProgressChange {
        const item = PoolManager.getItem(EventTaskProgressChange);
        item.taskId = taskId;
        item.oldProgress = oldP;
        item.newProgress = newP;
        const maxProgress = ActivityTaskConfigManager.getConfigById(taskId)?.maxProgress || 0;
        item.maxProgress = maxProgress;
        return item;
    }

    getActivityTaskConfig(): table.activity.Task.ActivityTaskConfig {
        return ActivityTaskConfigManager.getConfigById(this.taskId);
    }
}