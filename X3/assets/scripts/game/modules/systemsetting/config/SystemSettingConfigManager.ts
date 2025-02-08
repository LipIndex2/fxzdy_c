import { TableManager } from "db://assets/scripts/core/table/TableManager";

/**
 * 系统设置
 */
export class SystemSettingConfigManager {


    /**
     * 提醒
     */
    static getRemindConfigArray(): table.systemsetting.SystemSettingRemindConfig[] {
        return TableManager.getAllData(table.systemsetting.SystemSettingRemindConfig);
    }

}