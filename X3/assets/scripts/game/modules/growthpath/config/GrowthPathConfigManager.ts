import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class GrowthPathConfigManager {
    private static _headerItemId1: number = 0;
    private static _headerItemId2: number = 0;

    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._headerItemId1 = TableManager.getDataById(table.activity.growup.GrowUpKvConfig, "growUp:headerItemId1").value.toInt();
        this._headerItemId2 = TableManager.getDataById(table.activity.growup.GrowUpKvConfig, "growUp:headerItemId2").value.toInt();
    }


    static get headerItemId1(): number {
        return this._headerItemId1;
    }

    static get headerItemId2(): number {
        return this._headerItemId2;
    }
}