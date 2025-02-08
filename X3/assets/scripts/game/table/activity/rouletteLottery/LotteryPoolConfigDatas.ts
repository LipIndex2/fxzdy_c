import { BaseTableManager } from "../../BaseTabeManager";

/**
 * 奖池配置表
 */
export class LotteryPoolConfigDatas extends BaseTableManager<table.activity.Lottery.LotteryPoolConfig> {
    // 奖池map : { 奖池id : 奖池配置 }
    private poolIdMap: { [key: number]: table.activity.Lottery.LotteryPoolConfig[] };

    //唯一idmap : { 唯一id : 奖池配置 }
    private idMap: { [key: number]: table.activity.Lottery.LotteryPoolConfig };

    constructor() {
        super(table.activity.Lottery.LotteryPoolConfig);
    }

    initPoolIdMap() {
        if (!this.poolIdMap) {
            this.poolIdMap = {};
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                if (!this.poolIdMap[config.poolId]) {
                    this.poolIdMap[config.poolId] = [];
                }
                this.poolIdMap[config.poolId].push(config);
            }
        }
    }

    initIdMap() {
        if (!this.idMap) {
            this.idMap = {};
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                this.idMap[config.id] = config;
            }
        }
    }

    /** 根据奖池id获取 奖池配置表[] */
    getConfigsByPoolId(poolId: number) {
        if (!this.poolIdMap) {
            this.initPoolIdMap();
        }
        return this.poolIdMap[poolId];
    }

    /** 根据唯一id 获取奖池配置 */
    getConfigById(id: number) {
        if (!this.idMap) {
            this.initIdMap();
        }
        return this.idMap[id];
    }
}
