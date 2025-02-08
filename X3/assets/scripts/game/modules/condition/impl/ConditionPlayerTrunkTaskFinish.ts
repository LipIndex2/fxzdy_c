import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 玩家, 挂机关卡通过
 */
export class ConditionPlayerTrunkTaskFinish extends ICondition {

    private _taskId: number = 0;

    public listenNotifications: string[] = [NotificationKey.EVENT_TRUNK_TASK_CHANGE];

    type(): EnumConditionType {
        return EnumConditionType.FINISH_ASSIGN_TRUNK_TASK;
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
        // 通过?
        return TrunkTaskModel.ins().isPass(this._taskId);
    }

    getErrorTipsArgs(): (string | number)[] {
        let curTaskId = TrunkTaskModel.ins().getCurrentTaskId()
        let needTaskCount = Math.max(0, this._taskId - curTaskId + 1)
        return [
            needTaskCount
        ];
    }


}