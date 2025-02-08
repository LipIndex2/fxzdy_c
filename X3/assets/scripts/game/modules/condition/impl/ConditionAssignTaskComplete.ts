import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 指定任务是否完成
 */
export class ConditionAssignTaskComplete extends ICondition {

    private taskType: Extract<keyof typeof ServerEnums.TaskType, "MAP_BUILDING">
    private taskId: number

    public listenNotifications: string[] = [NotificationKey.MAP_BUILDING_TASK_CHG];

    type(): EnumConditionType {
        return EnumConditionType.ASSIGN_TASK_COMPLETED;
    }

    param(): string {
        return this.taskType;
    }

    value(): number {
        return this.taskId;
    }

    initParams(params: string, targetCount: number): void {
        this.taskType = params as any;
        this.taskId = targetCount || 0;
    }

    check(): boolean {
        let state = GIns.mapModel.getMapBuildingTaskState(this.taskId)
        return state == ServerEnums.TaskState.COMPLETED || state == ServerEnums.TaskState.FINISHED;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [
        ];
    }

}