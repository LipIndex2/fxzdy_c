import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";

/**
 * 道具详细的扣款结果
 */
export class ItemCostResult {

    // 是否可以支付
    private _isCanPay: boolean = false;

    // 扣款的道具数组
    private _costItemArray: NoOwnerItem[] = [];

    // 缺少的部分 <道具id, 差异的道具>
    private _missingItemIdToCountMap: Map<number, number> = new Map();

    static create(costItemArray: NoOwnerItem[]): ItemCostResult {
        const result = new ItemCostResult();
        result.reset(costItemArray);

        return result;
    }

    private reset(costItemArray: NoOwnerItem[]) {
        this._costItemArray = costItemArray;

        this._isCanPay = true;
        if (costItemArray.length > 0) {
            const haveItemIdToCountMap: Map<number, number> = BackpackManager.ins().getHaveItemIdToCountMap(costItemArray);

            const costItemIdToCountMap = costItemArray.toDataStream()
                .filterNotNull()
                .toMap(item => item.itemId, item => item.count, (v1, v2) => v1 + v2);

            // 扣去消耗剩余的道具
            const restItemIdToCountMap = MapUtils.diff(
                haveItemIdToCountMap,
                costItemIdToCountMap,
                (v1, v2) => v1 - v2
            );

            // 计算缺少的道具
            this._missingItemIdToCountMap = restItemIdToCountMap.toDataStream()
                .filter(it => it.value < 0)
                .toMap(it => it.key, it => Math.abs(it.value));
        }

        if (this._missingItemIdToCountMap.size > 0) {
            this._isCanPay = false;
        }
    }

    /**
     * 计算缺少的道具次数
     * @param itemId 道具id
     * @param oneTimesItemCount 一次性消耗的道具数量
     */
    calculateMissingCount(itemId: number, oneTimesItemCount: number): number {
        const missingCount = this._missingItemIdToCountMap.get(itemId) || 0;
        if (missingCount <= 0) {
            return 0;
        }
        

        // 计算需要多少次
        return Math.ceil(missingCount / oneTimesItemCount);
    }

    get isCanPay(): boolean {
        return this._isCanPay;
    }

    get costItemArray(): NoOwnerItem[] {
        return this._costItemArray;
    }

    get missingItemIdToCountMap(): Map<number, number> {
        return this._missingItemIdToCountMap;
    }
}