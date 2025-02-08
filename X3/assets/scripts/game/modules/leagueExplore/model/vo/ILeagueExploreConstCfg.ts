import { ILeagueExploreHangUpVo } from "./ILeagueExploreHangUpVo";

/**勘探星球静态配置*/
export interface ILeagueExploreConstCfg {
    /**每日进攻占领奖励次数*/
    dailyOccupyRewardTimes: number;
    /**挂机奖励持续时间上限(分钟)*/
    continueMinuets: number;
    /**快速挂机奖励数据*/
    hangUpVos: ILeagueExploreHangUpVo[];
    /**沦陷重整CD(秒)*/
    captureCdSeconds: number;
    /**被击败后重新占领CD(秒)*/
    failReoccupyCdSeconds: number;
    /**同盟攻击等待时间(秒)*/
    sameLeagueFightWaitSeconds: number;
    /**他盟攻击等待时间(秒)*/
    otherLeagueFightWaitSeconds: number;
    /**互换建筑等级差*/
    exchangeBuildingLevelDiff: number;
    /**击破状态持续时间(秒)*/
    changeHandsContinueSeconds: number;
    /**占领后保护持续时间(秒)*/
    protectedContinueSeconds: number;
    /**守卫机器人重生时间(分钟)*/
    robotRebirthMinutes: number;
    /**战斗失败后重新进攻CD(秒)*/
    failContinueFightCdSeconds: number;
    /**建筑分享频道类型和冷却时间(秒)*/
    shareChannelTypeMap: Map<string, number>;
    /**每日开战开始时间(小时)*/
    dailyWarStartHour: number;
    /**每日开战结束时间(小时)*/
    dailyWarEndHour: number;
    /**初始星球id*/
    initStarConfigId: number;
    /**活动战斗持续时间(分)*/
    fightContinueMinutes: number;
    /**每日第X小时结算挂机*/
    dailySettleHangUpHour:number;
}