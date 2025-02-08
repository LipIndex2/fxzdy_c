import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import GIns from "../../../GIns";

/**
 * 活动是否弹出过 0未弹出 1弹出 
 * ACTIVITY_POP_TODAY,${活动弹框id},0
 */
export class ConditionActivityPopToday extends ICondition {

    protected _state: number = 0;
    private _popId: number = 0;

    public listenNotifications: string[] = [
    ];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVITY_POP_TODAY;
    }

    param(): string {
        return this._popId.toString();
    }

    value(): number {
        return this._state;
    }


    initParams(params: string, targetCount: number): void {
        this._popId = params.toInt();
        this._state = targetCount;
    }

    check(): boolean {
        let isPop: boolean = GIns.activityAutoPopMgr.isPoppedToday(this._popId);
        return (isPop && this._state == 1) || (!isPop && this._state == 0);
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}