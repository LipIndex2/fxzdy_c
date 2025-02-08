/**
 * 章节状态（自己）
 */
export enum EnumCTChapterState {
    // 没解锁
    LOCK = 0,
    // 已解锁，未领取
    
    // 可领取
    CAN_GAIN = 1,
    // 已领取
    HAVE_GAIN = 2,    
}


/**
 * 关卡挑战状态
 */
export enum EnumCTState {
    // 1 可以挑
    CAN = 1,
    // 锁关，
    LOCK = 2,
    // 全部通关
    FINISH = 3,    
}