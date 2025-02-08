/**
 * 每日任务 | event 添加积分
 */
export interface EventDailyTaskAddScoreArgs {
    addScore: number;
}



/**
 * 每日任务 | event 添加积分
 */
export interface EventTaskAddProgressArgs {
    taskType: number
    taskId: number
    addProgress: number
}