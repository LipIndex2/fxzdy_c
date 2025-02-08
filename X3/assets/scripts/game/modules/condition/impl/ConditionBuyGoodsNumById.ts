import GIns from "../../../GIns";
import { EnumConditionType } from "../enum/EnumConditionType";
import { ICondition } from "../ICondition";

/**
 * 指定充值商品Id购买数量(注：不包含优惠券购买)
 */
export class ConditionBuyGoodsNumById extends ICondition {
    private _goodsId: number = 0;
    protected _num: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.ASSIGN_GOODS_REAL_CHARGE_SUM_GE;
    }

    param(): string {
        return this._goodsId + ``;
    }

    value(): number {
        return this._goodsId;
    }

    initParams(params: string, targetCount: number): void {
        this._goodsId = params.toInt();
        this._num = targetCount;
    }

    check(): boolean {
        //礼包购买次数
        return GIns.orderModel.realChargeMap[this._goodsId] >= this._num;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [this._goodsId];
    }
}
