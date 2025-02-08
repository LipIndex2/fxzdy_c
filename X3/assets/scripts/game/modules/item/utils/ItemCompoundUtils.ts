import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";

/**
 * 道具合成
 */
export class ItemCompoundUtils {

    /**
     * 合成奖励id
     * @param itemId
     */
    static getCompoundRewardIdByItemId(itemId: number): number {
        return TableManager.getDataById(table.item.ItemCompoundCostConfig, itemId)?.rewardId || 0
    }

    /**
     * 合成消耗数量
     * @param itemId
     */
    static getCompoundCostCount(itemId: number): number {
        return TableManager.getDataById(table.item.ItemCompoundCostConfig, itemId)?.costNum || 0
    }

    static getMaxCompoundCount(itemId: number) {
        const costCount = this.getCompoundCostCount(itemId);

        if (costCount == 0) {
            return 0;
        }

        const haveCount = BackpackManager.ins().getItemCountByItemId(itemId);
        if (haveCount <= 0) {
            return 0;
        }

        return Math.floor(haveCount / costCount);
    }

    /**
     * 是否可以合成任意一个道具
     * @param itemId
     */
    static isCanComposeAnyOne(itemId: number) {
        const costCount = this.getCompoundCostCount(itemId);
        if (costCount <= 0) {
            return false;
        }
        
        // 拥有数量
        return BackpackManager.ins().getItemCountByItemId(itemId) >= costCount;
    }
}