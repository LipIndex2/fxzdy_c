/** 通关状态 */
export enum PassType {
    /** 已通关 */
    Pass = 1,
    /** 未通关，已解锁 */
    Ing = 2,
    /** 没解锁 */
    Lock = 3,
}

/**任务状态 */
export enum TaskState {
    /** 进行中 */
    ING  = 2,
    /** 已完成，未领取 */
    CAN_GET = 3,
    /** 已领取 */
    FINISH = 1,
}

/**
 * 赛季达标积分类型
 */
export enum SeasonReachScoreType {
    /**
    * 英雄升星，参数格式：英雄品质,星级
    */
    HERO_UP_STAR = 1,
    /**
    * 专属武器升星，参数格式：专武品质,星级
    */
    AWAKE_WEAPON_UP_STAR = 2,
    /**
    * 星灵宠物升星，参数格式：宠物品质,星级
    */
    PET_UP_STAR = 3,
    /**
    * 竞技场
    */
    ARENA  = 4,
    /**
    * 勘探
    */
    EXPLORE = 5,
}

export enum ActivityState{
    //未开启
    LOCK = 1,
    //开启中
    ING = 2,
    //结束
    CLOSE = 3,
}