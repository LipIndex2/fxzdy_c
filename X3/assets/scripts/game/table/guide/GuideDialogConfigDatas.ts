import { BaseTableManager } from "../BaseTabeManager";

export class GuideDialogConfigDatas extends BaseTableManager<table.guide.GuideDialogConfig> {
    private map: { [key: number]: table.guide.GuideDialogConfig[] };
    constructor() {
        super(table.guide.GuideDialogConfig);
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