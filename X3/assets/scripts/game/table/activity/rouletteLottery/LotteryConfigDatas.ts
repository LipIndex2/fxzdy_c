import { BaseTableManager } from "../../BaseTabeManager";

/**
 * 抽奖配置表
 */
export class LotteryConfigDatas extends BaseTableManager<table.activity.Lottery.LotteryConfig> {
    // 奖池map : { 活动id : 奖池配置 }
    private idMap: { [id: number]: table.activity.Lottery.LotteryConfig[] };

    constructor() {
        super(table.activity.Lottery.LotteryConfig);
    }

    initIdMap() {
        if (!this.idMap) {
            this.idMap = {};
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                if (!this.idMap[config.activityId]) {
                    this.idMap[config.activityId] = [];
                }
                this.idMap[config.activityId].push(config);
            }
        }
    }

    /** 根据活动id获取抽奖配置表[] */
    getConfigsByPoolId(activityId: number) {
        if (!this.idMap) {
            this.initIdMap();
        }
        return this.idMap[activityId];
    }
}
