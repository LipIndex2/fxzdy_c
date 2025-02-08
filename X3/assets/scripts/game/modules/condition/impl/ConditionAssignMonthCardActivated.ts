import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { MonthCardModel } from "../../monthCard/model/MonthCardModel";

/**
 *  指定Id特权卡特权卡处于激活状态，param为MonthCardConfig的Id
 */
export class ConditionAssignMonthCardActivated extends ICondition {

    protected _param: string = ''
    private _value: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.ASSIGN_MONTH_CARD_ACTIVATED;
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
        return MonthCardModel.ins().isAciveById(Number(this._param));
    }

    getErrorTipsArgs(): (string | number)[] {
        let data = MonthCardModel.ins().getData(Number(this._param))
        let goodName: string = data && data.orderCfg ? data.orderCfg.goodsName : ''
        return [
            goodName
        ];
    }

}