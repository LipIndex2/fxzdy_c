/**战报本地记录key*/
export const FACTORY_RECORD_LOCAL_KEY = 'FACTORY_RECORD_LOCAL_KEY'

/**玩家战报状态*/
export enum FactoryRecordState {
    UnRead = 1,
    Read = 2
}

/**星际工厂生产线状态*/
export enum FactoryProductLineState {
    /**未知状态*/
    None = 0,
    /**空闲无生产线状态*/
    Idle = 1,
    /**未被占领状态*/
    NotOccupied,
    /**占领中状态*/
    Occupied,
    /**占领完成但是未领取 只有自己有这状态 其他人就直接进入空闲状态*/
    OccupiedComplete,
}

/**其他玩家工厂打开类型*/
export enum FactoryOtherMainType {
    Friend = 1,
    Rank = 2,
    Other = 3,
}