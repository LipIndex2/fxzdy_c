import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 创角天数 >=
 */
export class ConditionRoleCreateDayGte extends ICondition {

    protected _param: string = ''
    private _dayCount: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.SYSTEM_NEW_DAY,
    ];

    type(): EnumConditionType {
        return EnumConditionType.ROLE_CREATE_DAYS_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._dayCount
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._dayCount = targetCount;
    }

    check(): boolean {
        // 需要多少天
        const createTimeMs = PlayerModel.ins().Vo.createDate;
        const curTimeMs = TimeManager.serverNow;
        const days = DateUtils.diffDays(createTimeMs, curTimeMs);
        return days >= this._dayCount;
    }


    getErrorTipsArgs(): (string | number)[] {
        return [
            this._dayCount
        ];
    }

}