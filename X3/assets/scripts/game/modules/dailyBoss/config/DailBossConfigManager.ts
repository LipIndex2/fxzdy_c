import { Color, Vec2 } from "cc";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { EnumProgressSide } from "db://assets/scripts/game/modules/common/enum/EnumProgressSide";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { VipModel } from "../../vip/model/VipModel";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * 每日boss
 */
export class DailyBossConfigManager {

    // boss 类型
    private static _bossTypeArray: number[] = [];
    // <bossType, config[]>
    private static _bossTypeToConfigArrayMap: Map<number, table.dailyboss.DailyBossConfig[]> = new Map();
    // <bossType, config[]>
    private static _hardIdToProgressConfigArrayMap: Map<number, table.dailyboss.DailyBossProgressConfig[]> = new Map();
    // <bossType_difficulty, config>
    private static _bossTypeAndHardIdToConfigMap: Map<string, table.dailyboss.DailyBossConfig> = new Map();

    private static _isInit: boolean = false;
    private static _dailyRefreshHour: number = 0;
    private static _maxBuyChallengeTimes: number = 0;
    // 停止挑战多少秒
    private static _stopChallengeTimeMs: number = 0;
    // 最大难度
    private static _maxDifficulty: number = 0;
    private static _scale2DForBoss: Vec2 = new Vec2(1, 1);
    private static _indexToColorMap: Map<number, Color> = new Map();

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._bossTypeToConfigArrayMap = new Map();
        this._bossTypeAndHardIdToConfigMap = new Map();
        let configs = TableManager.getAllData(table.dailyboss.DailyBossConfig);
        this._indexToColorMap = TableManager.getAllData(table.dailyboss.DailyBossHpColorConfig)
            .toDataStream()
            .toMap(
                it => (it.id - 1),
                it => new Color(it.colorStr)
            )
        ;
        let len: number = configs.length;

        this._bossTypeArray = [];
        for (let i = 0; i < len; ++i) {
            let config = configs[i];
            let bossType = config.bossType;

            if (this._bossTypeArray.indexOf(bossType) == -1) {
                this._bossTypeArray.push(bossType);
            }


            if (!this._bossTypeToConfigArrayMap.has(bossType)) {
                this._bossTypeToConfigArrayMap.set(bossType, []);
            }
            this._bossTypeToConfigArrayMap.get(bossType)?.push(config);
            const hardId = config.difficulty;
            this._bossTypeAndHardIdToConfigMap.set(bossType + "_" + hardId, config);
        }

        this._dailyRefreshHour = TableManager.getDataById(table.common.ConfigValue, "SYSTEM:START_HOUR_OF_DAY").content.toInt();
        this._stopChallengeTimeMs = TableManager.getDataById(table.dailyboss.DailyBossConstantConfig, "DAILY_BOSS:STOP_CHALLENGE_SECOND").content.toInt() * 1000;
        
        const scaleArray = TableManager.getDataById(table.dailyboss.DailyBossConstantConfig, "DAILY_BOSS:SCALE_CSV").content.split(",");
        this._scale2DForBoss = new Vec2(
            scaleArray[0]?.toNumber() || 1,
            scaleArray[1]?.toNumber() || 1,
        );

        const array = TableManager.getAllData(table.dailyboss.DailyBossProgressConfig);
        this._hardIdToProgressConfigArrayMap = array.toDataStream()
            .groupBy(it => it.hardId)
        ;
        this._maxDifficulty = array.toDataStream().maxByWeightNumber(it => it.hardId)?.hardId || 1;
        this._maxBuyChallengeTimes = TableManager.getAllData(table.dailyboss.DailyBossBuyChallengeTimesConfig)
            .toDataStream()
            .map(it => it.id)
            .maxByWeightNumber(it => it)
        ;
    }


    /**
     * 获取类型难度配置
     * @param bossType boss类型
     * @param difficulty 难度
     */
    static getBossConfig(bossType: number, difficulty: number): table.dailyboss.DailyBossConfig | undefined {
        return this._bossTypeAndHardIdToConfigMap.get(bossType + "_" + difficulty);
    }

    // 难度配置
    static getDifficultyConfig(hardId: number): table.dailyboss.DailyBossDifficultyConfig | undefined {
        return TableManager.getDataById(table.dailyboss.DailyBossDifficultyConfig, hardId);
    }

    static getBossThemeConfigByBossType(bossType: number): table.dailyboss.DailyBossThemeConfig {
        return TableManager.getDataById(table.dailyboss.DailyBossThemeConfig, bossType);
    }

    static getAllTabConfigs(): table.dailyboss.DailyBossTabConfig[] {
        return TableManager.getAllData(table.dailyboss.DailyBossTabConfig);
    }

    // 获取进度配置数组
    static getProgressConfigArrayByHardId(hardId: number): table.dailyboss.DailyBossProgressConfig[] {
        return this._hardIdToProgressConfigArrayMap.get(hardId) || [];
    }


    static get dailyRefreshHour(): number {
        return this._dailyRefreshHour;
    }

    // 排名奖励
    static getRankRewardConfigs(): table.dailyboss.DailyBossRankConfig[] {
        return TableManager.getAllData(table.dailyboss.DailyBossRankConfig);
    }

    // 我的排名获取奖励
    static getRankRewardConfigByRankNum(myRankNum: number): table.dailyboss.DailyBossRankConfig | null {
        let rankConfigs = this.getRankRewardConfigs();
        for (let i = 0; i < rankConfigs.length; i++) {
            let rankConfig = rankConfigs[i];
            if (rankConfig.minRank <= myRankNum && myRankNum <= rankConfig.maxRank) {
                return rankConfig;
            }
        }
        return null;
    }

    // 根据难度 + 奖励获取配置
    static getProgressConfigByHardIdAndProgress(hardId: number,
                                                progressValue: number
    ): table.dailyboss.DailyBossProgressConfig | null {
        const configs = this._hardIdToProgressConfigArrayMap.get(hardId) || [];
        for (let config of configs) {
            if (config.progressStart <= progressValue && progressValue <= config.progressEnd) {
                return config;
            }
        }
        return null;
    }

    // 根据难度 + 奖励获取配置
    static getProgressConfigByProgressId(progressId: number): table.dailyboss.DailyBossProgressConfig | null {
        return TableManager.getDataById(table.dailyboss.DailyBossProgressConfig, progressId);
    }

    // 最大购买挑战次数
    static getMaxBuyChallengeTimes(): number {
        return this._maxBuyChallengeTimes + PrivilegeAdditionController.ins().getDailyBossBuyChallengeTimes();
    }

    // 获取购买次数配置
    static getBuyChallengeConfigByCount(count: number): table.dailyboss.DailyBossBuyChallengeTimesConfig | null {
        let maxCount = this._maxBuyChallengeTimes + PrivilegeAdditionController.ins().getDailyBossBuyChallengeTimes()
        if (count < maxCount) {
            let id = Math.min(count, this._maxBuyChallengeTimes)
            return TableManager.getDataById(table.dailyboss.DailyBossBuyChallengeTimesConfig, id);
        }
        return null
    }

    // 获取所有boss类型
    static getAllBossTypeArray(): number[] {
        return this._bossTypeArray;
    }

    static getDifficultyRankSmallIcon(difficulty: number): string {
        const config = this.getDifficultyConfigByDifficulty(difficulty);
        return config?.logoAssetPath;
    }

    private static getDifficultyConfigByDifficulty(difficulty: number): table.dailyboss.DailyBossDifficultyConfig {
        return TableManager.getDataById(table.dailyboss.DailyBossDifficultyConfig, difficulty);
    }

    static getBossScale2D(): Vec2 {
        return this._scale2DForBoss;
    }

    static getMaxDifficulty(): number {
        return this._maxDifficulty;
    }

    /**
     * 获取进度值 | 后端分了不同类型
     * @param config
     * @param side
     */
    static getProgressValueByConfig(config: table.dailyboss.DailyBossProgressConfig, side: EnumProgressSide) {
        let value = config.progressEnd;
        if (side == EnumProgressSide.START) {
            value = config.progressStart;
        }
        if (ServerEnums.DailyBossProgressType[config.progressType] == ServerEnums.DailyBossProgressType.VALUE) {
            return value * 10000;
        }
        return value;
    }

    static getDailyBossHpColorMap(): Map<number, Color> {

        return this._indexToColorMap;
    }


    static get stopChallengeTimeMs(): number {
        return this._stopChallengeTimeMs;
    }
}
