import { TableManager } from "db://assets/scripts/core/table/TableManager";


/**
 * 每日任务
 */
export class DailyTaskConfigManager {

    // 每日任务
    static getConfigById(taskId: number): table.dailytask.DailyTaskConfig | null {
        return TableManager.getDataById(table.dailytask.DailyTaskConfig, taskId);
    }

    static getDailyBoxConfigArray(): table.dailytask.DailyActiveBoxConfig[] {
        return TableManager.getAllData(table.dailytask.DailyActiveBoxConfig);
    }

    static getWeeklyBoxConfigArray(): table.dailytask.WeeklyActiveBoxConfig[] {
        return TableManager.getAllData(table.dailytask.WeeklyActiveBoxConfig);
    }

}