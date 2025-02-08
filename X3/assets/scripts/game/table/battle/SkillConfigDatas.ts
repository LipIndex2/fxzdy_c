import { BaseTableManager } from "../BaseTabeManager";

export class SkillConfigDatas extends BaseTableManager<table.battle.SkillConfig> {
    private map: { [key: string]: table.battle.SkillConfig[] };

    constructor() {
        super(table.battle.SkillConfig);
    }

    init() {
        if (!this.map) {
            this.map = {};
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                if (!this.map[config.group]) {
                    this.map[config.group] = [];
                }
                this.map[config.group].push(config);
            }
        }
    }

    getConfigsByGroup(group: string) {
        if (!this.map) {
            this.init();
        }
        return this.map[group];
    }

    /**
     * 根据技能组别和等级获取对应的配置信息。
     * @param group 技能组别字符串
     * @param level 技能等级数字，从1开始计数
     * @returns 返回对应组别和等级的配置信息，如果不存在则返回undefined
     */
    getConfigByLevel(group: string, level: number): table.battle.SkillConfig {
        if (!this.map) {
            this.init();
        }
        return this.map[group]?.[level - 1]; //配表必定是顺序的
    }
}