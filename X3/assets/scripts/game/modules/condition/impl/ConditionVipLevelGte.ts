import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { VipModel } from "../../vip/model/VipModel";

/**
 * VIP等级 >= 
 */
export class ConditionVipLevelGte extends ICondition {

    protected _param:string = ''
    private _level: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.VIP_LEVEL_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._level
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._level = targetCount;
    }

    check(): boolean {
        // 共鸣等级
        return VipModel.ins().vipLv >= this._level;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [
            this._level
        ];
    }

}