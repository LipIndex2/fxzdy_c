import { TableManager } from "db://assets/scripts/core/table/TableManager";


export class SecretAreaConfigManager {
    
    protected static _sweepOpenMaxSeconds: number = 0;

    static getConfigByLevel(level: number): table.secretinstance.SecretInstanceConfig {
        return TableManager.getDataById(table.secretinstance.SecretInstanceConfig, level)
    }

    /**可扫荡需要通关时间限制(秒)*/
    static get sweepOpenMaxSeconds(): number {
        if (this._sweepOpenMaxSeconds == 0) {
            this._sweepOpenMaxSeconds = TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:SWEEP_OPEN_MAX_SECONDS").content.toInt();
        }
        return this._sweepOpenMaxSeconds;
    }

}