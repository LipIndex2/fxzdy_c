import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class HeroSupplyConfigManager {
    private static _activityIdToRewardConfigsMap: Map<number, table.activity.HeroSupply.HeroSupplyRewardConfig[]> = new Map();
    private static _activityIdToMaxDayMap: Map<number, number> = new Map();
    private static _activityIdToDayToRewardIdMap: Map<number, Map<number, number>> = new Map();

    static init() {
        this._activityIdToRewardConfigsMap = TableManager.getAllData(table.activity.HeroSupply.HeroSupplyRewardConfig)
            .toDataStream()
            .map(it => {
                const activityId = it.activityId;
                const openDay = it.openDay;
                this._activityIdToMaxDayMap.merge(activityId, openDay, (v1, v2) => Math.max(v1, v2));
                this._activityIdToDayToRewardIdMap.getOrCreate(activityId, () => new Map())
                    .set(openDay, it.id);
                return it;
            })
            .groupBy(it => it.activityId)

    }

    /**
     * 奖励配置
     * @param activityId
     */
    static getRewardConfigArrayByActivityId(activityId: number): table.activity.HeroSupply.HeroSupplyRewardConfig[] {
        return this._activityIdToRewardConfigsMap.get(activityId) || [];
    }

    // 充值 id
    static getChargeIdByActivityId(activityId: number): string {
        return TableManager.getDataById(table.activity.HeroSupply.HeroSupplyConfig, activityId)?.chargeId || "";
    }

    // 最大天数
    static getMaxDayByActivityId(activityId: number): number {
        return this._activityIdToMaxDayMap.get(activityId) || 0;
    }

    // 获取奖励id
    static getRewardIdByActivityIdAndDay(activityId: number, day: number): number {
        return this._activityIdToDayToRewardIdMap.get(activityId)
            ?.get(day);    
    }
}