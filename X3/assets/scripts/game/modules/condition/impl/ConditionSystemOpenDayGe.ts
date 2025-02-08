import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 开服天数 >=
 */
export class ConditionSystemOpenDayGe extends ICondition {

    protected _param: string = ''
    private _dayCount: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.SYSTEM_NEW_DAY,
    ];


    type(): EnumConditionType {
        return EnumConditionType.SYSTEM_OPEN_DAY_GE;
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
        const days = TimeManager.serverHaveOpenDay;
        return days >= this._dayCount;
    }


    getErrorTipsArgs(): (string | number)[] {
        return [
            this._dayCount
        ];
    }

}