import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class RankConfigManager {
    private static _rankTypeToSubTypeConfigArrayMap: Map<ServerEnums.RankingType, Array<table.rank.RankingSubTypeTabConfig>> = new Map();


    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._rankTypeToSubTypeConfigArrayMap = TableManager.getAllData(table.rank.RankingSubTypeTabConfig)
            .toDataStream()
            .groupBy((it) => ServerEnums.RankingType[it.rankType])
    }


    static getSubTypeConfigArrayByRankType(rankType: ServerEnums.RankingType): Array<table.rank.RankingSubTypeTabConfig> {
        return this._rankTypeToSubTypeConfigArrayMap.get(rankType) || [];
    }
}