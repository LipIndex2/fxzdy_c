import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { BattleForDailyBossData } from "db://assets/scripts/game/modules/common/battle/structs/BattleForDailyBossData";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { DailyBossRecommendInfo } from "./DailyBossRecommendInfo";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { TableManager } from "../../../../core/table/TableManager";

/**
 * 每日Boss
 */
export class DailyBossContext {

    // 发起战斗的临时数据
    private __battleTempData: BattleForDailyBossData = BattleForDailyBossData.create(0, 0);

    // boss 信息
    private _bossInfoVo: Vo.dailyboss.DailyBossInfoVo;
    // 排行榜
    private _rankingVo: Vo.dailyboss.DailyBossRankingVo;
    // <bossType, 领取奖励的进度id Set>
    private _bossTypeToGainProgressIdSetMap: Map<number, Set<number>> = new Map();
    private _bossTypeToMaxProgressIdMap: Map<number, number> = new Map();
    // <bossType, 开启时间ms>
    private _bossTypeToOpenTimeMsMap: Map<number, number> = new Map();

    private recommendFormationMap: { [bossType: number]: DailyBossRecommendInfo[] } = {}

    static create(): DailyBossContext {
        return new DailyBossContext();
    }


    @LogBusiness("重置每日boss信息")
    resetBossInfo(content: Vo.dailyboss.DailyBossVo) {
        const bossInfoVo = content.bossInfoVo;
        this._bossInfoVo = bossInfoVo || {
            bossType: 0,
            difficulty: 0,
            progress: 0,
            hurt: 0,
        } as Vo.dailyboss.DailyBossInfoVo;

        this._bossTypeToOpenTimeMsMap = MapUtils.fromObject(
            content.bossOpenTimeMap,
            it => Number(it),
            it => Number(it),
        );
        // 奖励部分
        this._bossTypeToGainProgressIdSetMap.clear();
        if (bossInfoVo) {

            const bossType = bossInfoVo.bossType;
            const array: number[] = bossInfoVo?.drawProgressIds || [];

            const gainProgressIdArray = array || [];
            const progressIdSet = new Set<number>(gainProgressIdArray);
            this._bossTypeToGainProgressIdSetMap.set(bossType, progressIdSet);
            const maxProgressId = array.toDataStream().maxByWeightNumber(it => it, 0);
            this._bossTypeToMaxProgressIdMap.set(bossType, maxProgressId);
        }

        this.refreshRedDot();
    }

    public get bossInfoVo():Vo.dailyboss.DailyBossInfoVo {
        return this._bossInfoVo
    }

    getMyRankNum(): number {
        return this._rankingVo?.rank || 0;
    }

    getBossType(): number {
        return this._bossInfoVo?.bossType || 0;
    }

    getDifficulty(): number {
        return this._bossInfoVo?.difficulty || 1;
    }

    getCurrentBossConfig(): table.dailyboss.DailyBossConfig {
        const bossType = this.getBossType();
        const hardId = this.getDifficulty();

        return DailyBossConfigManager.getBossConfig(
            bossType,
            hardId
        )
    }

    getCurrentHardProgressConfig(): table.dailyboss.DailyBossProgressConfig[] {
        return DailyBossConfigManager.getProgressConfigArrayByHardId(
            this.getDifficulty(),
        );
    }

    updateBossRank(rankingVo: Vo.dailyboss.DailyBossRankingVo) {
        this._rankingVo = rankingVo;
    }

    // 历史最大进度
    getHistoryMaxProgressByBossTypeAndHardId(bossType: number, hardId: number): number {
        if (this._bossInfoVo.bossType != bossType) {
            return 0;
        }
        if (this._bossInfoVo.difficulty != hardId) {
            return 0;
        }
        return this.getHistoryMaxProgressValue();
    }

    // 历史最大进度值
    getHistoryMaxProgressValue(): number {
        const bossType = this.getBossType();
        const curHardId = this.getDifficulty();

        const maxProgressId = this._bossTypeToMaxProgressIdMap.get(bossType);
        if (!maxProgressId) {
            return 0;
        }

        const progressConfig = DailyBossConfigManager.getProgressConfigByProgressId(maxProgressId);
        if (!progressConfig) {
            return 0;
        }
        if (progressConfig.hardId < curHardId) {
            return 0;
        }
        return progressConfig.progressEnd;
    }

    // 当前进度文本
    getMyCurrentProgressText(): string {
        const progress = this._bossInfoVo?.progress || 0;
        const damageValue = this._bossInfoVo?.hurt || 0;
        // 最高难度
        if (this.getDifficulty() == DailyBossConfigManager.getMaxDifficulty()) {
            return `${damageValue}`;
        }

        if (damageValue > 0) {
            // 30% (982000)
            const percentText = progress.toPercentText(100);
            return `${percentText} (${damageValue})`;
        }

        // 如果本难度没有, 则用上一难度的
        const preDifficultyProgress = this._bossInfoVo.preDifficultyProgress;
        const preHurt = this._bossInfoVo.preDifficultyHurt;

        if (preHurt <= 0) {
            return "0% (0)";
        }

        const prePercentText = preDifficultyProgress.toPercentText(100);
        return `${prePercentText} (${preHurt})`;
    }

    // 当前难度, 是否有进度 ?
    isCurrentHardHaveProgressValue(): boolean {
        const maxHistoryProgress = this.getHistoryMaxProgressValue();

        // 只要打过就算有进度 | 需求调整
        if (this._bossInfoVo.progress > 0 || this._bossInfoVo.preDifficultyHurt > 0) {
            return true;
        }
        return maxHistoryProgress > 0;
    }

    // 已挑战次数
    getHaveChallengeTimes(): number {
        return this._bossInfoVo?.challengeTimes || 0;
    }

    // 剩余挑战次数
    getRestChallengeTimes(): number {
        const bossConfig = this.getCurrentBossConfig();
        if (!bossConfig) {
            return 0;
        }
        let totalTimes = this.getTotalChallengeTimes()
        const restCount = totalTimes - this.getHaveChallengeTimes() + this.bossInfoVo.todayGetAdvertTimes;
        return Math.max(0, restCount);
    }

    /**总共可挑战次数*/
    getTotalChallengeTimes(): number {
        const bossConfig = this.getCurrentBossConfig();
        if (!bossConfig) {
            return 0;
        }
        return bossConfig.challengeTimes + PrivilegeAdditionController.ins().getDailyBossFreeChallengeTimes()
    }

    // 是否可以挑战 by 免费
    isCanChallengeByFree(): boolean {
        return this.getRestChallengeTimes() > 0;
    }

    // 今日已买次数
    getTodayBuyChallengeTimes(): number {
        return this._bossInfoVo?.buyChallengeTimes || 0;
    }

    updateBuyChallengeTimes(buyChallengeTimes: number) {
        if (!this._bossInfoVo) {
            return;
        }
        this._bossInfoVo.buyChallengeTimes = buyChallengeTimes;
    }

    getMyBattleTempData(): BattleForDailyBossData {
        return this.__battleTempData;
    }

    updateBattleTempData(bossType: number,
        difficulty: number
    ) {
        this.__battleTempData = BattleForDailyBossData.create(bossType, difficulty);
    }

    // 获取当前boss类型的奖励进度id数组
    addHaveGainProgressId(progressId: number) {
        const bossType = this.getBossType();
        let progressIdSet = this._bossTypeToGainProgressIdSetMap.get(bossType);
        if (!progressIdSet) {
            progressIdSet = new Set();
            this._bossTypeToGainProgressIdSetMap.set(bossType, progressIdSet);
        }
        progressIdSet.add(progressId);
    }

    // 添加进度奖励
    addHaveGainProgressIds(progressIds: number[]) {
        for (let progressId of progressIds) {
            this.addHaveGainProgressId(progressId);
        }
    }

    // 是否领过这个进度奖励
    isHaveGainProgressId(progressId: number): boolean {
        const bossType = this.getBossType();
        const progressIdSet = this._bossTypeToGainProgressIdSetMap.get(bossType);
        if (!progressIdSet) {
            return false;
        }
        // 不存在
        return progressIdSet.has(progressId);
    }

    updateByBattleResult(data: Vo.dailyboss.DailyBossChallengeResultVo) {
        // 后端说直接推最新的难度（可能升降
        this._bossInfoVo.difficulty = data.currentDifficulty;
        this._bossInfoVo.challengeTimes = data.challengeTimes;

    }

    // 是否是新的进度
    isNewProgress(progressValue: number): boolean {
        const maxHistoryProgress = this._bossInfoVo.progress;
        return progressValue > maxHistoryProgress;
    }

    updateTempDamageValue(damageValue: number) {
        this.__battleTempData.damageValue = damageValue;
    }

    getTempDamage(): number {
        return this.__battleTempData.damageValue;
    }

    // boss 是否开启
    isBossTypeOpen(bossType: number): boolean {
        const openTimeMs = this._bossTypeToOpenTimeMsMap.get(bossType);
        if (openTimeMs == null) {
            return false;
        }
        const curTImeMs = TimeManager.serverNow;
        return curTImeMs >= openTimeMs;
    }

    // 是否可以超过某个难度
    isPassDifficult(hardId: number) {
        return (this._bossInfoVo?.difficulty || 0) >= hardId;
    }

    /***更新推荐阵容 */
    updateRecommendFormation(bossType: number, data: Vo.dailyboss.DailyBossFormationRankItemVo[]) {
        if (!this.recommendFormationMap[bossType]) {
            this.recommendFormationMap[bossType] = [];

            //基础阵容
            let baseInfo = new DailyBossRecommendInfo(bossType)
            baseInfo.setDataByCfg(TableManager.getDataById(table.dailyboss.DailyBossThemeConfig, bossType).baseHeros, 0)
            this.recommendFormationMap[bossType].push(baseInfo)

            //进阶阵容
            let advancedInfo = new DailyBossRecommendInfo(bossType)
            advancedInfo.setDataByCfg(TableManager.getDataById(table.dailyboss.DailyBossThemeConfig, bossType).advancedHeros, 1)
            this.recommendFormationMap[bossType].push(advancedInfo)
        }
        else {
            this.recommendFormationMap[bossType].splice(2)
        }

        for (let i = 0; i < data.length; i++) {
            let info = new DailyBossRecommendInfo(bossType)
            info.setData(data[i])
            this.recommendFormationMap[bossType].push(info)
        }
    }

    /***获取推荐阵容 */
    getRecommendFormation(bossType: number): DailyBossRecommendInfo[] {
        let arr = this.recommendFormationMap[bossType]
        if (!arr)
            return [];
        return SortUtils.sortBy2(arr, ["type", "totalHurt"], [false, false], true)
    }

    private refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.DAILY_BOSS)) {
            return;
        }

        const todayChallengeTimes = this._bossInfoVo?.challengeTimes || 0;
        const isFirstChallenge = 0 == todayChallengeTimes;
        RedDotManager.ins().setRedDot(RedDotKeys.dailyBoss_challenge, isFirstChallenge);
    }

}