import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 活动未完成时才显示
 * ACTIVITY_NOT_DONE,${活动id},0
 */
export class ConditionActivityNotDone extends ICondition {

    protected _param: string
    private _activityId: number = 0;

    public listenNotifications: string[] = [
            NotificationKey.ACTIVITY_DATA_RELOAD,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.SYSTEM_NEW_DAY,
        ];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVITY_NOT_DONE;
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
        // 完成时间
        let doneTimeMs = vo.doneTimeMs;
        if (doneTimeMs <= 0) {
            return true;
        }
        const doneNextDay0HTimeMs = DateUtils.getNextResetTimeByResetHour(doneTimeMs, 0);
        return TimeManager.serverNow <= doneNextDay0HTimeMs;
    }


    getErrorTipsArgs(): (string | number)[] {
        // const vo = ActivityModel.ins().getActivityVoById(this._activityId);
        return [];
    }

}