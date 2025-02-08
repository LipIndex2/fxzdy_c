import G from "db://assets/scripts/core/comm/G";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { VipModel } from "../../vip/model/VipModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * 竞技场
 */
export class PVPUtils {

    static _costItemCountArray: number[] = null;
    static _weeklyMaxChallengeTimes: number = 0;

    // 挑战完成奖励
    private static _challengeDoneRewards: Array<NoOwnerItem>;
    private static _challengeItemId: number;
    private static _buyChallengeCostItemId: number;
    private static _headerItemId1: number;
    private static _challengeCostItem: NoOwnerItem;
    private static _battleConfigId: number;
    private static _dailyRefreshHour: number;
    private static _weeklyRefreshWeekday: number;
    private static _weeklyRefreshHour: number;
    private static _weeklyConfigIds: number[] = [];
    // 最大刷新对手次数
    private static _maxRefreshOppoCount: number = 0;
    private static _dailyRecoverChallengeItemCount: number = 0;
    private static _reversePVPConfigs: table.arena.ArenaRankConfig[] = [];
    private static _challengeRewardsMaxCount:number;

    static init() {
        const content = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_REWARDS").content;
        this._challengeDoneRewards = ItemUtils.parseStringToNoOwnerItemArray(content);

        this._challengeItemId = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_ITEM_ID").content.toInt();
        this._buyChallengeCostItemId = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:BUY_CHALLENGE_COST_ITEM_ID").content.toInt();
        this._headerItemId1 = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:HEADER_ITEM_ID_1").content.toInt();

        const challengeCostItemId = this.getChallengeItemId();
        const challengeCostItemCount = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_ITEM_COST_AMOUNT").content.toInt();
        this._challengeCostItem = NoOwnerItem.create(challengeCostItemId, challengeCostItemCount);

        this._battleConfigId = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:BATTLE_ID")?.content?.toInt() || 0;

        this._dailyRefreshHour = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:DAILY_SETTLE_HOUR").content.toInt();
        this._maxRefreshOppoCount = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_LIST_REFRESH_TIMES").content.toInt();
        this._dailyRecoverChallengeItemCount = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_ITEM_RECOVER_AMOUNT").content.toInt();
        this._challengeRewardsMaxCount = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:CHALLENGE_REWARDS_MAX_COUNT").content.toInt();
        

        // 从表中获取刷新时间配置
        const weeklySettleTimeText = G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:WEEKLY_SETTLE_TIME_TEXT").content;
        const strings = weeklySettleTimeText.split(",");
        this._weeklyRefreshWeekday = parseInt(strings[0]);
        this._weeklyRefreshHour = parseInt(strings[1]);

        this._costItemCountArray = JSON.parse(
            G.TableManager.getDataById(table.arena.ArenaConstantConfig, "ARENA:BUY_CHALLENGE_TIMES_COST_AMOUNTS").content
        ) as number[];

        this._weeklyConfigIds = G.TableManager.getAllData(table.arena.ArenaWeeklyRewardConfig)
            .map(c => c.id)
            .sort((a, b) => a - b)
        ;

        this._reversePVPConfigs = [...G.TableManager.getAllData(table.arena.ArenaRankConfig)].reverse();
    }

    // 通过段位分 ——》 config
    static getConfigByScore(score: number): table.arena.ArenaRankConfig {
        const allData = this._reversePVPConfigs;
        for (let c of allData) {
            const minScore = c.minScore;
            const maxScore = c.maxScore || 99999999;
            const minRank = c.minRank;
            
            if (minScore <= score && score <= maxScore) {
                return c;
            }
        }
        return null;
    }


    static getConfigById(configId: number): table.arena.ArenaRankConfig {
        return G.TableManager.getDataById(table.arena.ArenaRankConfig, configId);
    }


    // 挑战
    static getChallengeItemId(): number {
        return this._challengeItemId;
    }

    // 购买挑战次数小号的道具id
    static getBuyChallengeCostItemId(): number {
        return this._buyChallengeCostItemId;
    }

    static getHeaderItemId(): number {
        return this._headerItemId1;
    }

    /**
     * 获取挑战消耗道具
     */
    static getChallengeCostItem(): NoOwnerItem | null {
        return this._challengeCostItem;
    }

    // 战场配置id
    static getBattleConfigId(): number {
        return this._battleConfigId;
    }

    /**
     * 购买挑战次数消耗的道具
     * @returns 道具, 如果超出次数, 则不允许购买
     */
    static getCostItemForBuyChallengeCount(): NoOwnerItem | null {
        const todayBuyCount: number = PVPModel.ins().getContext().todayBuyChallengeTimes;
        if (todayBuyCount > this._costItemCountArray.length) {
            return null;
        }
        const count = this._costItemCountArray[todayBuyCount];
        if (!count) {
            return null;
        }
        return NoOwnerItem.create(this.getBuyChallengeCostItemId(), count);
    }


// 最大挑战次数
    static getMaxChallengeTimes(): number {
        return 10;
    }

    // max buy count
    static getTodayMaxBuyCount(): number {
        return this._costItemCountArray.length;
    }

// 到每周下一次刷新时间
    static getPVPWeeklyNextRefreshTimeMs(curTimeMs: number): number {
        const weekday = this._weeklyRefreshWeekday;
        const hour = this._weeklyRefreshHour;

        // 获取当前时间的日期对象
        // const currentDate = new Date(curTimeMs);
        // const currentDay = currentDate.getUTCDay();
        // const currentHour = currentDate.getUTCHours();

        // // 创建一个日期对象来表示本周的刷新时间
        // const refreshDate = new Date(curTimeMs);
        // refreshDate.setUTCHours(hour, 0, 0, 0); // 设置小时和分钟为配置中的值
        // refreshDate.setUTCDate(refreshDate.getUTCDate() - refreshDate.getUTCDay() + weekday); // 设置为配置中的星期几

        // // 如果本周的刷新时间已过，则取下一周的刷新时间
        // if (currentDay > weekday || (currentDay === weekday && currentHour >= hour)) {
        //     refreshDate.setUTCDate(refreshDate.getUTCDate() + 7);
        // }

        // return refreshDate.getTime();
        let todayZero = G.TimeManager.todayZero;
        let refreshTime = todayZero + 3600000 * hour;
        if (refreshTime <= curTimeMs) {
            //下一天刷新
            refreshTime += 24 * 3600000;
        }
        return refreshTime;
    }

// 获取到每日下一次刷新时间的毫秒数
    static getPVPDailyNextRefreshTimeMs(curTimeMs: number): number {
        // 从表中获取刷新时间配置
        const hour = this._dailyRefreshHour;


        // 获取当前时间的日期对象
        const currentDate = new Date(curTimeMs);
        const currentHour = currentDate.getHours();

        // 创建一个日期对象来表示今日的刷新时间
        const refreshDate = new Date(curTimeMs);
        refreshDate.setHours(hour, 0, 0, 0);

        // 如果当前时间已经过了今日的刷新时间，则计算明天的刷新时间
        if (currentHour >= hour) {
            refreshDate.setDate(refreshDate.getDate() + 1);
        }

        return refreshDate.getTime();
    }


    /**
     * 获取周常奖励的最大挑战次数
     */
    static getWeeklyMaxChallengeTimes(): number {
        if (this._weeklyMaxChallengeTimes === 0) {
            const configs = G.TableManager.getAllData(table.arena.ArenaWeeklyRewardConfig);
            let count = 0;
            for (let config of configs) {
                count = Math.max(count, config.id);
            }
            this._weeklyMaxChallengeTimes = count;

        }
        return this._weeklyMaxChallengeTimes;
    }

    /**
     * 获取周常挑战的奖励次数 [ ]
     */
    static getAllWeeklyRewardConfigId(): number[] {
        return this._weeklyConfigIds;
    }

    /**
     * 获取下一个可以获得的周常奖励的配置
     * @param myChallengeCount
     */
    static getCanGainMaxWeeklyRewardBox(myChallengeCount: number): table.arena.ArenaWeeklyRewardConfig | null {
        const context = PVPModel.ins().getContext();

        const configs = G.TableManager.getAllData(table.arena.ArenaWeeklyRewardConfig);
        const reversedConfigs = configs.sort((a, b) => a.id - b.id);
        for (let config of reversedConfigs) {
            const weekCount = config.id;
            if (weekCount <= myChallengeCount) {
                if (context.isHaveGainWeeklyRewardByCount(weekCount)) {
                    continue;
                }
                return config;
            }
        }
        return null;
    }

// tab配置
    static getPVPTabConfigs(): table.arena.ArenaTabConfig[] {
        return G.TableManager.getAllData(table.arena.ArenaTabConfig);
    }

    // 挑战完成奖励
    static getChallengeDoneRewards(): NoOwnerItem[] {
        return this._challengeDoneRewards;
    }

    static getAllRankConfigs(): table.arena.ArenaRankConfig[] {
        return G.TableManager.getAllData(table.arena.ArenaRankConfig);
    }

    // 获取1个当前未领取的段位奖励（需要自己段位超过）
    static getOverRankConfigsByMaxRankId(historyMaxRankConfigId1: number): table.arena.ArenaRankConfig | null {
        const allRankConfigs = this.getAllRankConfigs();
        const context = PVPModel.ins().getContext();

        for (let config of allRankConfigs) {
            const isHaveGain = context.isHaveGainFirstReachReward(config);
            if (isHaveGain) {
                continue;
            }
            return config;
        }
        return null;
    }

    // 获取最大刷新对手次数
    static getMaxRefreshOppoCount(): number {
        return this._maxRefreshOppoCount + PrivilegeAdditionController.ins().getArenaRefreshTimes();
    }

    /**
     * 策划说要默认初始分
     */
    static getDefaultInitScore(): number {
        return 1000;
    }

    /**
     * 是否是首个段位配置
     * @param config
     */
    static isFirstRankConfig(config: table.arena.ArenaRankConfig) {
        return this.getAllRankConfigs()[0].id == config.id;
    }

    // 每日恢复 + 挑战道具上限
    static getDailyRecoverItemCount() : number {
        return this._dailyRecoverChallengeItemCount;
    }
    // 本日挑战额外奖励次数
    static getChallengeRewardsMaxCount() : number {
        return this._challengeRewardsMaxCount;
    }

    static getNextConfigByCurrentId(id: number): table.arena.ArenaRankConfig | null {
        const allRankConfigs = this.getAllRankConfigs();
        for (let config of allRankConfigs) {
            if (config.id > id) {
                return config;
            }
        }
        return null;
    }
}