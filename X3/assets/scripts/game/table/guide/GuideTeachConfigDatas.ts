import { BaseTableManager } from "../BaseTabeManager";

export class GuideTeachConfigDatas extends BaseTableManager<table.guide.GuideTeachConfig> {
    private map: { [key: number]: table.guide.GuideTeachConfig[] };
    constructor() {
        super(table.guide.GuideTeachConfig);
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
}