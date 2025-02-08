export interface IPetDungeonConstCfg {
    /**每日首次重置消耗*/
    dailyResetCosts: { k: number, v: number }[];
    /**重复重置每次消耗*/
    repeatResetCosts: { k: number, v: number }[];
    /**赛季关卡重复奖励次数*/
    floorRepeatRewardTimes: number;
    /**扫荡可达到赛季最高关卡的差值,m = floor((赛季最高关卡 - 差值) / 10) * 10 + 1*/
    resetSweepFloorDiff: number;
    /**副本地图id*/
    mapId: number;
    /**活动战斗持续时间(分)*/
    fightContinueMinutes: number;
    /**玩具宝箱存储链最多20个*/
    toyBoxMaxCount: number;
    /**物质仓库(最多4个)*/
    toyMaxCount: number
    /**刷新玩具宝箱消耗*/
    refreshToyBoxCosts: { k: number, v: number }[];
    /**单个宝箱最多可刷新次数*/
    toyBoxRefreshCount: number;
    /**玩具宝箱图标*/
    toyBoxIcon: string;
}