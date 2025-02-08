import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";

export class ActivityFlipCardConfigManager {
    // <活动id, 扣款>
    private static _activityIdToCostItemMap: Map<number, NoOwnerItem[]> = new Map<number, NoOwnerItem[]>();

    static init() {
        this._activityIdToCostItemMap = new Map<number, NoOwnerItem[]>();
        const objStr = TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:LOTTERY_COSTS")?.content || "{}";
        const obj = JSON.parse(objStr);
        for (const key in obj) {
            const costItemStr = obj[key];
            const costItems = ItemUtils.parseStringToNoOwnerItemArray(costItemStr);
            this._activityIdToCostItemMap.set(key.toInt(), costItems);
        }
    }

    static getCostItemByActivityId(activityId: number): NoOwnerItem[] {
        return this._activityIdToCostItemMap.get(activityId);
    }

    static getBigRewardArray(activityId: number, roundId: number): NoOwnerItem[] {
        const roundConfig = this.getConfigByActivityIdAndRoundId(activityId, roundId);
        if (!roundConfig) {
            return [];
        }

        return ItemUtils.parseKvArrayToItemArray(roundConfig.bigRewardArray);
    }

    static getConfigById(lotteryId: number) {
        return TableManager.getDataById(table.activity.Lottery.LotteryConfig, lotteryId);
    }

    static getPoolConfigById(poolId: number) {
        return TableManager.getDataById(table.activity.Lottery.LotteryPoolConfig, poolId);
    }

    static getConfigByActivityIdAndRoundId(activityId: number, roundId: number): table.activity.Lottery.LotteryConfig | null {
        return TableManager.getAllData(table.activity.Lottery.LotteryConfig).filter((it) => {
            return activityId == it.activityId && it.startRound <= roundId && roundId <= it.endRound;
        })[0];
    }
}
