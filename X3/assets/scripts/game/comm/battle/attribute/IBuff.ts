export interface IBuff {
    cfg:table.battle.BuffConfig;
    /**开始时间 */
    startTime?:number;
    /**结束时间 */
    endTime?:number;
    /**生效次数 */
    count?:number;
}