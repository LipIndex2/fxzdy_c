import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class SignInConfigManager {
    private static _activityIdToConfigsMap: Map<number, table.activity.Sign.SignRewardConfig[]> = new Map();

    static init() {
        this._activityIdToConfigsMap = TableManager.getAllData(table.activity.Sign.SignRewardConfig)
            .toDataStream()
            .groupBy(it => it.activityId)
    }

    /**
     * 获取配置
     * @param activityId
     */
    static getConfigArrayByActivityId(activityId: number): table.activity.Sign.SignRewardConfig[] {
        return this._activityIdToConfigsMap.get(activityId);
    }

}