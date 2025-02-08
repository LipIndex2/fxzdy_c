import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 竞技场
 */
export class PVPContext implements INotification {


    /**
     * 积分
     */
    private _score: number = 0;
    /**
     * 历史最大段位配置id
     */
    private _historyMaxRankConfigId: number = 0;

    /**
     * 本轮挑战对手的刷新次数
     */
    private _refreshOppoInfoCount: number = 0;

    /**
     * 今日购买挑战次数
     */
    private _todayBuyChallengeTimes: number = 0;

    /**
     * 周挑战次数
     */
    private _weeklyChallengeTimes: number = 0;

    /**
     * 当前段位配置ID
     */
    private _myConfigId: number = 0;

    /**
     * 已领取奖励的段位id
     */
    private _drawRankRewardIds: Array<number> = [];

    /**
     * 已领取奖励的周挑战id
     */
    private _drawWeeklyChallengeRewardIds: Array<number> = [];

    /**
     * 挑战对手列表
     */
    private _opponentVos: Array<Vo.arena.ArenaOpponentVo> = [];
    // 排名 | TODO 后端没有这个机制
    private _myRankNum: number = 0;
    // 今日挑战次数
    private _todayChallengeTimes: number = 0;

    private _extraChallengeRewardTimes: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_REFRESH_DATA
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PVP_REFRESH_DATA: {
                this.refreshRedDot();
                break;
            }
        }
    }

    static create(): PVPContext {
        const pvpContext = new PVPContext();

        FacadeManager.ins().removeNotification(pvpContext);
        FacadeManager.ins().registerNotification(pvpContext);
        return pvpContext;
    }

    initData(data: Vo.arena.PlayerArenaLoginVo) {

        this._todayChallengeTimes = data.todayChallengeTimes;
        this._weeklyChallengeTimes = data.weeklyChallengeTimes;
        this._drawWeeklyChallengeRewardIds = data.drawWeeklyChallengeRewardIds || [];
    }


    @LogBusiness("竞技场打开时才有登录数据 ")
    reset(content: Vo.arena.PlayerArenaVo) {
        const myScore = content.score;
        this._score = myScore > 0 ? myScore : PVPUtils.getDefaultInitScore();
        const refreshTimes = content.refreshTimes;
        this._refreshOppoInfoCount = refreshTimes == null ? 0 : refreshTimes;
        this._historyMaxRankConfigId = content.historyMaxRankConfigId;
        this._todayBuyChallengeTimes = content.todayBuyChallengeTimes;
        this._weeklyChallengeTimes = content.weeklyChallengeTimes;
        this._todayChallengeTimes = content.todayChallengeTimes;
        this._myConfigId = content.arenaRankConfigId;
        this._drawRankRewardIds = content.drawRankRewardIds || [];
        this._drawWeeklyChallengeRewardIds = content.drawWeeklyChallengeRewardIds || [];
        this._opponentVos = content.opponentVos || [];
        this._extraChallengeRewardTimes = content.extraChallengeRewardTimes;
        this.refreshRedDot();
    }

    get myRankNum(): number {
        return this._myRankNum;
    }

    // 红点
    refreshRedDot() {

        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.ARENA)) {
            return;
        }

        // 每周奖励
        const isCanGainReward = this.isCanGainAnyWeeklyReward();
        RedDotManager.ins().setRedDot(RedDotKeys.jjcRewardWeekly, isCanGainReward);

        // 首次挑战 | TODO 红点依赖今日任意挑战次数, 后端说准备加
        const isFirstChallenge = this._todayChallengeTimes == 0;
        RedDotManager.ins().setRedDot(RedDotKeys.jjcChallenge, isFirstChallenge);
    }

    isCanGainAnyWeeklyReward(): boolean {
        return this.getCanGainNextWeeklyChallengeRewardId() > 0;
    }

    get score(): number {
        return this._score;
    }

    get refreshOppoInfoCount(): number {
        return this._refreshOppoInfoCount;
    }

    get todayBuyChallengeTimes(): number {
        return this._todayBuyChallengeTimes;
    }

    /**每日挑战次数*/
    get todayChallengeTimes(): number {
        return this._todayChallengeTimes
    }

    /**每周挑战次数*/
    get weeklyChallengeTimes(): number {
        return this._weeklyChallengeTimes;
    }

    get myConfigId(): number {
        return this._myConfigId;
    }

    get drawRankRewardIds(): Array<number> {
        return this._drawRankRewardIds;
    }

    get drawWeeklyChallengeRewardIds(): Array<number> {
        return this._drawWeeklyChallengeRewardIds;
    }

    get opponentVos(): Array<Vo.arena.ArenaOpponentVo> {
        return this._opponentVos;
    }


    get historyMaxRankConfigId(): number {
        return this._historyMaxRankConfigId;
    }

    /**额外挑战奖励次数*/
    get extraChallengeRewardTimes(): number {
        return this._extraChallengeRewardTimes;
    }

    public setExtraChallengeRewardTimes(value: number): void {
        this._extraChallengeRewardTimes = value;
    }

    // 更新对手信息
    updateChallengeOppoInfoByServer(content: Vo.arena.ArenaRefreshOpponentVo) {
        const dailyRefreshTimes = content.refreshTimes;
        const opponentVos = content.opponentVos;

        if (dailyRefreshTimes) {
            this._refreshOppoInfoCount = dailyRefreshTimes;
        }

        if (opponentVos) {
            this._opponentVos = opponentVos;
        }
    }

    // 挑战次数
    updateTodayBuyChallengeTimes(todayBuyChallengeTimes: number) {
        this._todayBuyChallengeTimes = todayBuyChallengeTimes;

        this.refreshRedDot();
    }

    // update opponents
    updateOppos(opponentVos: Array<Vo.arena.ArenaOpponentVo>) {
        this._opponentVos = opponentVos;
    }


    // 对手
    getOpponentById(defenderId: number): Vo.arena.ArenaOpponentVo | null {
        for (const opponent of this._opponentVos) {
            if (opponent?.baseVo?.id === defenderId) {
                return opponent;
            }
            if (opponent?.robotBaseVo?.id === defenderId) {
                return opponent;
            }
        }
        return null;
    }

    getRankConfigByScore(): table.arena.ArenaRankConfig {
        return PVPUtils.getConfigById(this._myConfigId);
    }

    isHaveGainWeeklyRewardByCount(weekId: number): boolean {
        return this._drawWeeklyChallengeRewardIds.indexOf(weekId) != -1;
    }

    isCanGainWeeklyReward(targetWeeklyRewardTimes: number) {
        return this._weeklyChallengeTimes >= targetWeeklyRewardTimes;
    }

    addHaveGainWeeklyChallengeTimes(weeklyChallengeTimes: number) {
        if (this._drawWeeklyChallengeRewardIds.indexOf(weeklyChallengeTimes) != -1) {
            return;
        }
        this._drawWeeklyChallengeRewardIds.push(weeklyChallengeTimes);

        G.FacadeManager.emit(NotificationKey.PVP_WEEKLY_CHALLENGE_REWARD_GAIN);

        this.refreshRedDot();
    }

    // 是否领过首次到达段位的奖励
    isHaveGainFirstReachReward(config: table.arena.ArenaRankConfig): boolean {
        return this._drawRankRewardIds.indexOf(config.id) != -1;
    }

    getSmallLogoAssetPath(): string {
        return this.getRankConfigByScore()?.logoSmallAssetPath || "";
    }

    // 玩法入口重置
    resetByGameModeData(data: Vo.arena.ArenaPlayInfo) {
        const myScore = data.score;
        this._score = myScore > 0 ? myScore : PVPUtils.getDefaultInitScore();
        this._myRankNum = data.rank;

    }

    // 是否领取完最大次数
    isHaveGainMaxWeeklyReward(): boolean {
        const weeklyMaxChallengeTimes = PVPUtils.getWeeklyMaxChallengeTimes();
        return this._drawWeeklyChallengeRewardIds.indexOf(weeklyMaxChallengeTimes) != -1;
    }

    // 获取下一个可以领取的每周挑战次数奖励id | 0 = 没有
    getCanGainNextWeeklyChallengeRewardId(): number {
        const isMax = this.isHaveGainMaxWeeklyReward();
        if (isMax) {
            return 0;
        }

        const count = PVPUtils.getAllWeeklyRewardConfigId();
        for (let i of count) {
            const notGain = this._drawWeeklyChallengeRewardIds.indexOf(i) == -1;
            if (notGain) {
                // enough
                if (this.todayChallengeTimes >= i) {
                    return i;
                }
            }
        }
        return 0;

    }

    getForgetGainRewardRankId() {
        const historyMaxRankConfigId1 = this._historyMaxRankConfigId;
        PVPUtils.getOverRankConfigsByMaxRankId(historyMaxRankConfigId1)
    }

    getCurrentRankConfig(): table.arena.ArenaRankConfig | null {
        return PVPUtils.getConfigById(this._myConfigId);
    }

    updateScore(score: number) {
        this._score = score;
    }

    public havaRankReward: boolean = false
    updateGainRewardByRankIds(drawRankRewardIds: number[]) {
        this.havaRankReward = false;
        for (let i = 0; i < drawRankRewardIds.length; i++) {
            if (this._drawRankRewardIds.indexOf(drawRankRewardIds[i]) == -1) {
                this.havaRankReward = true;
                break
            }
        }
        this._drawRankRewardIds = drawRankRewardIds;
    }

    getCurrentRankConfigId(): number {
        return this.getCurrentRankConfig()?.id || 0;
    }

    updateRefreshChallengeCount(refreshTimes: number) {
        this._refreshOppoInfoCount = refreshTimes;
    }

    changeScore(scoreChange: number) {
        this._score += scoreChange;

        G.FacadeManager.emit(NotificationKey.PVP_REFRESH_DATA);
    }

}