export interface IFactoryConstCfg {
    /**最大体力*/
    maxPower: number
    /**体力恢复间隔(秒)*/
    powerRecoverInterval: number
    /**占领消耗体力*/
    occupyCostPower: number
    /**购买1点体力消耗*/
    buyOnePowerCosts: { k: any, v: any }[]
    /**领取占领的生产线,每跳过一分钟的消耗*/
    occupySkipOneMinutesCosts: { k: any, v: any }[]
    /**占领生产线最大数量*/
    occupyProductLineMaxCount: number
    /**战报记录过期时间(分钟)*/
    recordExpireMinutes: number
    /**战斗配置ID,BattleConfig的id*/
    battleConfigId: number
    /**体力图标*/
    powerIcon:string
    /**每日奖励次数上限*/
    dailyOccupyRewardTimes:number
    /**生产线刷新间隔(秒)*/
    productLineRefreshInterval:number
    /**战报记录上限*/
    maxRecordCount:number
    /**气泡切换间隔(秒)*/
    bubbleInterval:number;
}