import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 道具数量 gte
 */
export class ConditionItemAmountGte extends ICondition {

    protected _itemId: number = 0
    private _needCount: number = 0;

    public listenNotifications: string[] = [NotificationKey.EVENT_CHANGE_ITEMS];

    type(): EnumConditionType {
        return EnumConditionType.ITEM_AMOUNT_GE;
    }

    param(): string {
        return this._itemId.toString();
    }

    value(): number {
        return this._needCount
    }

    initParams(params: string, targetCount: number): void {
        this._itemId = params.toInt();
        this._needCount = targetCount || 0;
    }

    check(): boolean {
        const haveCount = BackpackManager.ins().getItemCountByItemId(this._itemId);
        return haveCount >= this._needCount;
    }


    getErrorTipsArgs(): (string | number)[] {
        return [
        ];
    }

}