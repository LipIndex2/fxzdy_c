import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { MonthCardModel } from "../monthCard/model/MonthCardModel";
import { VipModel } from "./model/VipModel";

/**特权加成处理 防止不同模块出现相同特权 所以在这里统一处理一下
 * 目前只加入了vip模块
*/
export class PrivilegeAdditionController extends BaseController {
    listenNotifications(): string[] {
        return [

        ];
    }


    notificationHandler(event: string, args?: any): void {

    }

    constructor() {
        super();
    }

    /**获取挂机奖励加成数量*/
    public getHangUpReward(itemId: number, count: number): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.HANG_UP_REWARD, itemId + '')
        return Math.floor(count * addition / 10000)
    }

    /**获取挂机时长上限加成(毫秒)*/
    public getHangUpDurationLimit(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.HANG_UP_DURATION_LIMIT)
        return addition * 3600 * 1000
    }

    /**获取快速挂机次数加成*/
    public getFastHangUpTimes(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.FAST_HANG_UP_TIMES)
        return addition
    }

    /**获取付费挂机次数加成*/
    public getPayHangUpTimes(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.PAY_HANG_UP_TIMES)
        return addition
    }

    /**获取总共挂机次数加成*/
    public getTotalHangUpTimes(): number {
        return this.getFastHangUpTimes() + this.getPayHangUpTimes()
    }

    /**获取竞技场每日免费门票数量*/
    public getArenaFreeChallengeRecoverAmt(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.ARENA_FREE_CHALLENGE_RECOVER_AMT)
        return addition
    }

    /**获取竞技场奖励加成数量*/
    public getArenaReward(itemId: number, count: number): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.ARENA_REWARD, itemId + '')
        return Math.floor(count * addition / 10000)
    }

    /**获取竞技场刷新对手额外次数*/
    public getArenaRefreshTimes(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.ARENA_REFRESH_TIMES)
        return addition
    }

    /**获取每日Boss购买挑战次数*/
    public getDailyBossBuyChallengeTimes(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.DAILY_BOSS_BUY_CHALLENGE_TIMES)
        return addition
    }

    /**获取每日Boss免费挑战次数*/
    public getDailyBossFreeChallengeTimes(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.DAILY_BOSS_FREE_CHALLENGE_TIMES)
        return addition
    }

    /**获取每日Boss排名奖励*/
    public getDailyBossRankReward(itemId: number, count: number): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.DAILY_BOSS_RANK_REWARD, itemId + '')
        return Math.floor(count * addition / 10000)
    }

    /**获取好友额外数量*/
    public getFriendAmount(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.FRIEND_AMOUNT)
        return addition
    }

    /**获取秘境每日免费门票数量*/
    public getSecretInstanceFreeChallengeRecoverAmt(): number {
        let addition: number = 0
        addition += VipModel.ins().getAdditionToNumber(ServerEnums.VipAdditionType.SECRET_INSTANCE_FREE_CHALLENGE_RECOVER_AMT)
        return addition
    }

    /**是否解锁挂机托管功能*/
    public hasTrunkInstanceHangUp(): boolean {
        let addition: string = null
        addition = MonthCardModel.ins().getAddition(ServerEnums.MonthCardAdditionType.TRUNK_INSTANCE_HANG_UP)
        return addition !== null
    }

    /**获取勘探奖励加成*/
    public getLeagueExploreReward(itemId:number, count:number): number {
        let addition: number = 0
        addition += MonthCardModel.ins().getAdditionToNumber(ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_REWARD_ADDITION)
        return Math.floor(count * addition / 10000)
    }

    /**获取勘探奖励加成百分比*/
    public getLeagueExploreRewardPercent(): number {
        let addition: number = 0
        addition += MonthCardModel.ins().getAdditionToNumber(ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_REWARD_ADDITION)
        return addition / 100
    }

    /**获取勘探时间上限加成*/
    public getLeagueExploreHangUpTime(): number {
        let addition: number = 0
        addition += MonthCardModel.ins().getAdditionToNumber(ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_HANG_UP_TIME_ADDITION)
        return addition * 60 * 1000
    }
}