import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import G from "../../../../core/comm/G";

/**
 * 活动已完成 ?
 * ACTIVITY_IS_OVER,${活动id},0
 */
export class ConditionSystemOpenHourGe extends ICondition {

    protected _param: string
    private _openHour: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.SYSTEM_OPEN_HOUR_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._openHour
    }


    initParams(params: string, targetCount: number): void {
        this._param = params
        this._openHour = targetCount;
    }

    check(): boolean {
        let openZero: number = G.TimeManager.openDayZero;
        let openServerTime = G.TimeManager.openServerTime;
        let startHourTime:number = openZero + Math.floor((openServerTime - openZero) / 3600000) * 3600000
        let nowTime:number = G.TimeManager.serverNow;
        let openHour:number = Math.ceil((nowTime - startHourTime) / 3600000);
        return openHour >= this._openHour;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [this._openHour];
    }

}