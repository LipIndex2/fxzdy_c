
/**
 * 经营设备奖励
*/
export interface IStimulationRewards {
    /**奖励来源设备*/
    deviceId: number;
    /**奖励列表*/
    rewards: Vo.reward.RewardResult[];
}