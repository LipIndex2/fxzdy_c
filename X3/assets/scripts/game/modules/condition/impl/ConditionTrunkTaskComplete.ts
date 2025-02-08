import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { TrunkTaskConfigManager } from "db://assets/scripts/game/modules/task/config/TrunkTaskConfigManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 主线任务完成状态
 * COMPLETE_ASSIGN_TRUNK_TASK,${主线任务id},0
 */
export class ConditionTrunkTaskComplete extends ICondition {

    private _taskId: number = 0;

    listenNotifications: string[] = [
        NotificationKey.EVENT_TRUNK_TASK_COMPLETE
    ];


    type(): EnumConditionType {
        return EnumConditionType.COMPLETE_ASSIGN_TRUNK_TASK;
    }

    param(): string {
        return this._taskId + ''
    }

    value(): number {
        return this._taskId
    }

    initParams(params: string, targetCount: number): void {
        this._taskId = params.toInt();
    }

    check(): boolean {
        // 已完成
        return TrunkTaskModel.ins().isComplete(this._taskId)
    }


    getErrorTipsArgs(): (string | number)[] {
        let curTaskId = TrunkTaskModel.ins().getCurrentTaskId()
        let needTaskCount = Math.max(0, this._taskId - curTaskId + 1)
        return [
            needTaskCount
        ];
    }

}