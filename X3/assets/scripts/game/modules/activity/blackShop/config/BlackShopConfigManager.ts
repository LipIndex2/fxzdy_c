import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class BlackShopConfigManager {
    static getConfigByActivityId(activityId: number) {
        return TableManager.getDataById(table.activity.BlackShop.BlackShopConfig, activityId)
    }
}