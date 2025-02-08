import { TableManager } from "../../../../../core/table/TableManager";

export class PetGiftConfigManager {
    private static _activityIdDayMap: Map<number, table.activity.PetGift.PetGiftConfig[]> = new Map();

    static init() {
        const cgf =  TableManager.getAllData(table.activity.PetGift.PetGiftConfig);
        this._activityIdDayMap = TableManager.getAllData(table.activity.PetGift.PetGiftConfig)
            .toDataStream()
            .groupBy(it => it.activityId)

    }

    /**
     * 奖励配置
     * @param activityId
     */
    static getDayInfoByActivityId(activityId: number): table.activity.PetGift.PetGiftConfig[] {
        if(this._activityIdDayMap.size == 0){
            this.init();
        }
        return this._activityIdDayMap.get(activityId) || [];
    }

}