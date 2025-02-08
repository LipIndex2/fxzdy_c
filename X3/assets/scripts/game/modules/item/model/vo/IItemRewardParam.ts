export enum ItemRewardFrom {
    /**地图宝箱*/
    MAP_BOX = 'MAP_BOX',
    /**地图宝箱广告奖励*/
    MAP_BOX_AD = 'MAP_BOX_AD',
}

/**道具奖励来源*/
export interface IItemRewardParam {
    rewards: Vo.reward.RewardResult[];
    from?: ItemRewardFrom;
    extra?: any;
}