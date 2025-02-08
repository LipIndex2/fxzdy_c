import { TableManager } from "db://assets/scripts/core/table/TableManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ChargeUtils } from "db://assets/scripts/game/modules/charge/utils/ChargeUtils";

export class ActivityMallConfigManager {

    static getGoodConfigArrayByActivityId(activityId: number): table.activity.Mall.ActivityMallGoodsConfig[] {
        return TableManager.getAllData(table.activity.Mall.ActivityMallGoodsConfig)
            .filter(it => it.activityId == activityId);

    }

    static getMaxBuyCount(goodId: number): number {
        return TableManager.getDataById(table.activity.Mall.ActivityMallGoodsConfig, goodId)?.buyLimit || 0;
    }

    static isCharge(goodId: number): boolean {
        let cfg = TableManager.getDataById(table.activity.Mall.ActivityMallGoodsConfig, goodId);
        if (cfg && cfg.chargeGoodsId && Number(cfg.chargeGoodsId) > 0) {
            return true;
        }
        return false;
    }

    static getGoodConfig(goodId: number) {
        return TableManager.getDataById(table.activity.Mall.ActivityMallGoodsConfig, goodId)
    }

    static getGoodCostConfig(goodId: number) {
        return TableManager.getDataById(table.activity.Mall.ActivityMallCostRewardConfig, goodId)
    }

    static getCostItem(goodId: number): NoOwnerItem | null {
        const costs = this.getGoodCostConfig(goodId)?.costs || [];
        if (ArrayUtils.isEmpty(costs)) {
            return null;
        }
        return NoOwnerItem.createByConfigKv(costs[0]);
    }

    static isFree(goodId: number): boolean {
        const chargeId = this.getGoodConfig(goodId)?.chargeGoodsId || 0;
        if (Number(chargeId) > 0) {
            return false;
        }
        const cost = this.getGoodCostConfig(goodId)?.costs || [];
        return ArrayUtils.isEmpty(cost);
    }

    static getPayMoney(goodId: number) {
        const goodConfig = this.getGoodConfig(goodId);
        const chargeGoodsId = goodConfig.chargeGoodsId;
        const price = TableManager.getDataById(table.order.ChargeGoodsConfig, chargeGoodsId)?.price;
        return ChargeUtils.getPayRMBText(price);
    }
}