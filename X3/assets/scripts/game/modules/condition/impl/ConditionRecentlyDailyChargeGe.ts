import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";

/**
 *  最近X天付费金额>=target(单位：分)，param为天数，最大支持30天
 */
export class ConditionRecentlyDailyChargeGe extends ICondition {

    protected _param: string = ''
    private _value: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.RECENTLY_DAILY_CHARGE_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._value
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._value = targetCount;
    }

    check(): boolean {
        // 客户端不判断 统一当做通过处理
        return true;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [
            this._param,
            this._value
        ];
    }

}