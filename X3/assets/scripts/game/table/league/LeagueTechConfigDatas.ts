import { BaseTableManager } from "../BaseTabeManager";

export class LeagueTechConfigDatas extends BaseTableManager<table.league.LeagueTechConfig> {
    private map: { [key: string]: { [soltId: number]: table.league.LeagueTechConfig[] } };

    constructor() {
        super(table.league.LeagueTechConfig);
    }

    init() {
        if (!this.map) {
            this.map = {};
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                if (!this.map[config.career]) {
                    this.map[config.career] = {};
                }

                if (!this.map[config.career][config.slotId]) {
                    this.map[config.career][config.slotId] = [];
                }

                this.map[config.career][config.slotId].push(config);
            }
        }
    }

    getConfigsByCareerSlot(career: string, slotId: number) {
        if (!this.map) {
            this.init();
        }
        return this.map[career]?.[slotId];
    }


    /**
     * 根据职业、插槽ID和等级获取联赛科技配置。
     * @param career - 玩家职业
     * @param slotId - 插槽ID
     * @param level - 等级
     * @returns table.league.LeagueTechConfig - 对应的联赛科技配置
     */
    getConfigByLevel(career: string, slotId: number, level: number): table.league.LeagueTechConfig {
        if (!this.map) {
            this.init();
        }
        return this.map[career]?.[slotId]?.[level - 1]; //配表必定是顺序的
    }
}