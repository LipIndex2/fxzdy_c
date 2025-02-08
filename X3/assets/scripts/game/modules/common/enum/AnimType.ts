
export enum CameraAnimBackType {
    /**动画结束 自动移镜队伍 */
    AutoBack = 1,
    /**动画结束 点击屏幕移镜队伍 */
    TouchBack = 2,
}

export enum CameraAnimBattleStopType {
    /**暂停AI */
    StopAi = 0,
    /**全部暂停，包括动作 */
    StopAll = 1,
}

export interface ICameraAnim {
    /**目标坐标 */
    targetPos: { x: number, y: number },
    /**移镜时间 */
    timeMs: number,
    /**保持时间 （移后停留时间）*/
    holdTimeMs?: number,
    /**移镜类型 */
    backType: CameraAnimBackType,
    /***暂停的战斗类型，默认只暂停AI */
    battleStopType?: CameraAnimBattleStopType
    /**移镜动画完成事件 */
    onAnimEndNotification?: string,
}
