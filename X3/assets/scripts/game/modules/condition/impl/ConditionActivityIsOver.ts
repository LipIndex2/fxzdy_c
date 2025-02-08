import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 活动已完成 ?
 * ACTIVITY_IS_OVER,${活动id},0
 */
export class ConditionActivityIsOver extends ICondition {

    protected _param: string
    private _activityId: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.ACTIVITY_END_REFRESH,
    ];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVITY_IS_OVER;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._activityId
    }


    initParams(params: string, targetCount: number): void {
        this._param = params
        this._activityId = params.toInt();
    }

    check(): boolean {
        // 活动
        const vo = ActivityModel.ins().getActivityVoById(this._activityId);
        if (!vo) {
            return false;
        }
        return vo.isActivityOver();
    }


    getErrorTipsArgs(): (string | number)[] {
        // const vo = ActivityModel.ins().getActivityVoById(this._activityId);
        return [];
    }

}