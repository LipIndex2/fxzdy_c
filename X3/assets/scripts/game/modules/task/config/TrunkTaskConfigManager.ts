import { TableManager } from "db://assets/scripts/core/table/TableManager";


export class TrunkTaskConfigManager {
    private static _maxTrunkTaskId: number = 0;

    static init() {
        const toArray = TableManager.getAllData(table.trunktask.TrunkTaskConfig)
            .toDataStream()
            .sortByWeightReverse(it => it.id)
            .toArray();
        this._maxTrunkTaskId = toArray[0]?.id || 0;

    }

    static getConfigById(taskId: number): table.trunktask.TrunkTaskConfig | null {
        return TableManager.getDataById(table.trunktask.TrunkTaskConfig, taskId);
    }


    static get maxTrunkTaskId(): number {
        return this._maxTrunkTaskId;
    }
}