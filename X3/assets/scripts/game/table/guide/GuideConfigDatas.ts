import { BaseTableManager } from "../BaseTabeManager";

export class GuideConfigDatas extends BaseTableManager<table.guide.GuideConfig> {
    private map: { [key: number]: table.guide.GuideConfig[] };
    constructor() {
        super(table.guide.GuideConfig);
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

    getConfigsByGroup(group: number) {
        if (!this.map) {
            this.init();
        }
        return this.map[group];
    }

    /**获取下一个段落引导配置 (用于重登)*/
    getNextPartConfigById(id: number) {
        if (!this.map) {
            this.init();
        }

        let cfg = this.findById(id);
        if (!cfg || !cfg.nextId) return null;
        if (!cfg.partId) {
            return this.getNextConfigById(id);
        }

        let cfgs = this.map[cfg.group];
        let index = cfgs.indexOf(cfg);
        for (let i = index + 1; i < cfgs.length; i++) {
            if (cfg.partId != cfgs[i].partId) {
                return cfgs[i];
            }
        }
        return null;
    }

    /**获取下一个步引导配置*/
    getNextConfigById(id: number) {
        let cfg = this.findById(id);
        if (!cfg || !cfg.nextId) return null;

        let nextCfg = this.findById(cfg.nextId);
        if (cfg.group == nextCfg.group) {
            //防止配置错误
            return nextCfg;
        }
        return null;
    }
}