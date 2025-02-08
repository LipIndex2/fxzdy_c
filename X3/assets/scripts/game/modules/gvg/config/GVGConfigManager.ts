import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";

/**
 * 联盟对决
 */
export class GVGConfigManager {

    // 是否初始化过
    private static _isInit: boolean = false;

    // <leagueLv, <layerNum, LeagueWarLadderConfig>>
    private static _leagueLvToLayerToCountMap: Map<number, Map<number, table.leaguewar.LeagueWarLadderConfig>> = new Map();

    // 战斗初始化 hp
    private static _initHp: number = 0;
    // 联盟最小等级
    private static _leagueMinLevel: number = 0;
    // 联盟最小登录成员数
    private static _leagueMinLoginMember: number = 0;
    // 匹配默认分数，公式计算出错时使用
    private static _leagueMatchScoreDefaultScore: number = 0;
    // 每日给与的挑战次数
    private static _maxChallengeTimesPerWar: number = 0;
    // 一个赛季包含几次联盟对决
    private static _warCountPerSeason: number = 0;

    // 开启计算赛季开始时间
    private static _seasonStartCalculationDate: string = "";
    // 匹配积分公式
    private static _leagueMatchScoreFormula: string = "";
    // 个人积分
    private static _personalScoreParams: string = "";
    // 第一场玩法开始时间，格式：05:00:00
    private static _firstWarStartTime: string = "";

    // 个人挑战奖励 win
    private static _rewardsForPersonalChallengeWin: NoOwnerItem[] = [];
    // 个人挑战奖励 fail
    private static _rewardsForPersonalChallengeFail: NoOwnerItem[] = [];
    // 本地联盟奖励 win
    private static _rewardsForLocalLeagueWin: NoOwnerItem[] = [];
    // 本地联盟奖励 fail
    private static _rewardsForLocalLeagueFail: NoOwnerItem[] = [];
    // 跨服联盟奖励 win
    private static _rewardsForCrossLeagueWin: NoOwnerItem[] = [];
    // 跨服联盟奖励 fail
    private static _rewardsForCrossLeagueFail: NoOwnerItem[] = [];


    // 战斗id
    private static _battleId: number = 0;
    // 匹配阶段持续小时数
    private static _matchStageContinueHours: number = 0;
    // 布阵阶段持续小时数
    private static _setFormationStageContinueHours: number = 0;
    // 对战阶段持续小时数
    private static _battleStageContinueHours: number = 0;
    // 结算阶段持续小时数
    private static _settleStageContinueHours: number = 0;
    // 结算阶段持续小时数
    private static _localSeasonCount: number = 0;
    // 计算机器人战力需要的战力排行榜平均值的开始名次
    private static _fromFightRank: number = 0;
    // 计算机器人战力需要的战力排行榜平均值的结束名次
    private static _toFightRank: number = 0;
    // 计算机器人战力需要的联盟战力最低的n名成员的平均战力
    private static _lowestFightCount: number = 0;
    // 战斗战报记录最大数量
    private static _maxFightRecordCount: number = 0;
    // 展示阶段展示积分前多少名得玩家
    private static _showTopCountInSettleStatus: number = 0;
    // 段位差分数
    private static _danDiffScore: number = 0;
    // 战绩记录最大数量
    private static _warReportMaxLimit: number = 0;
    // 开服第几天开启第一场玩法 ? | 1 即开服当天；2 开服第二天。。。。
    private static _firstWarGteServerOpenDay: number = 0;
    // 需要联盟有多少人
    private static _needHaveLeaguePersonCount: number = 1;
    // 需要联盟达到多少活跃度
    private static _needLeagueActiveValue: number = 1;
    // tab 按钮图片 1
    private static _tabLogo1: string = "";
    // tab 按钮图片 2
    private static _tabLogo2: string = "";
    // tab 按钮图片 3
    private static _tabLogo3: string = "";
    // tab 按钮图片 4
    private static _tabLogo4: string = "";

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        // layer count
        this._leagueLvToLayerToCountMap = MapUtils.toLevel2Map(
            TableManager.getAllData(table.leaguewar.LeagueWarLadderConfig),
            it => it.level,
            it => it.layerNum,
            (v1, v2) => v2
        );

        this._seasonStartCalculationDate = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:SEASON_START_CALCULATION_DATE")?.content || "2024-10-01";
        this._leagueMatchScoreFormula = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_MATCH_SCORE_FORMULA")?.content || "";
        this._firstWarStartTime = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:FIRST_WAR_START_TIME")?.content || "05:00:00";
        this._personalScoreParams = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:PERSONAL_SCORE_PARAMS")?.content || "[1,10000]";
        this._tabLogo1 = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:tabLogo1")?.content || "";
        this._tabLogo2 = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:tabLogo2")?.content || "";
        this._tabLogo3 = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:tabLogo3")?.content || "";
        this._tabLogo4 = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:tabLogo4")?.content || "";


        // player
        const winPersonalRewardStr =
            TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
                "LEAGUE_WAR:PERSON_CHALLENGE_WIN")?.content || "";
        this._rewardsForPersonalChallengeWin = ItemUtils.parseStringToNoOwnerItemArray(winPersonalRewardStr);
        const failPersonalRewardStr = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:PERSON_CHALLENGE_FAIL")?.content || "";
        this._rewardsForPersonalChallengeFail = ItemUtils.parseStringToNoOwnerItemArray(failPersonalRewardStr);

        // league local server
        const winLocalLeagueRewardStr = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_WIN_REWARDS_LOCAL")?.content || "";
        this._rewardsForLocalLeagueWin = ItemUtils.parseStringToNoOwnerItemArray(winLocalLeagueRewardStr);
        const failLocalLeagueRewardStr = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_FAIL_REWARDS_LOCAL")?.content || "";
        this._rewardsForLocalLeagueFail = ItemUtils.parseStringToNoOwnerItemArray(failLocalLeagueRewardStr);

        // league cross server
        const winCrossLeagueRewardStr = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_WIN_REWARDS_REMOTE")?.content || "";
        this._rewardsForCrossLeagueWin = ItemUtils.parseStringToNoOwnerItemArray(winCrossLeagueRewardStr);
        const failCrossLeagueRewardStr = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_FAIL_REWARDS_REMOTE")?.content || "";
        this._rewardsForCrossLeagueFail = ItemUtils.parseStringToNoOwnerItemArray(failCrossLeagueRewardStr);

        this._needHaveLeaguePersonCount = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_MIN_MEMBER")?.content?.toInt() || 0;
        this._needLeagueActiveValue = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:needLeagueActiveCount")?.content?.toInt() || 0;
        this._leagueMinLevel = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_MIN_LEVEL")?.content?.toInt() || 0;
        this._leagueMinLoginMember = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_MIN_LOGIN_MEMBER")?.content?.toInt() || 0;
        this._leagueMatchScoreDefaultScore = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LEAGUE_MATCH_SCORE_DEFAULT_SCORE")?.content?.toInt() || 0;
        this._maxChallengeTimesPerWar = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:CHALLENGE_TIMES_PER_WAR")?.content?.toInt() || 0;
        this._warCountPerSeason = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:WAR_COUNT_PER_SEASON")?.content?.toInt() || 0;

        // this._startCron = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
        //     "LEAGUE_WAR:START_CRON")?.content || "0 0 5 ? * TUE,FRI";
        this._matchStageContinueHours = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:MATCH_STAGE_CONTINUE_HOURS")?.content?.toInt() || 3;
        this._setFormationStageContinueHours = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:SET_FORMATION_STAGE_CONTINUE_HOURS")?.content?.toInt() || 4;
        this._battleStageContinueHours = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:BATTLE_STAGE_CONTINUE_HOURS")?.content?.toInt() || 34;
        this._settleStageContinueHours = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:SETTLE_STAGE_CONTINUE_HOURS")?.content?.toInt() || 2;
        this._localSeasonCount = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LOCAL_SEASON_COUNT")?.content?.toInt() || 1;
        this._fromFightRank = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:FROM_FIGHT_RANK")?.content?.toInt() || 50;
        this._toFightRank = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:TO_FIGHT_RANK")?.content?.toInt() || 200;
        this._lowestFightCount = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:LOWEST_FIGHT_COUNT")?.content?.toInt() || 5;
        this._maxFightRecordCount = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:FIGHT_REPORT_MAX_LIMIT")?.content?.toInt() || 30;
        this._showTopCountInSettleStatus = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:SHOW_TOP_COUNT_IN_SETTLE_STATUS")?.content?.toInt() || 20;
        this._danDiffScore = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:DAN_DIFF_SCORE")?.content?.toInt() || 50;
        this._warReportMaxLimit = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:WAR_REPORT_MAX_LIMIT")?.content?.toInt() || 30;
        this._firstWarGteServerOpenDay = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:FIRST_WAR_START_DAY")?.content?.toInt() || 0;
        this._initHp = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:INIT_HP")?.content?.toInt() || 2;
        this._battleId = TableManager.getDataById(table.leaguewar.LeagueWarConstantConfig,
            "LEAGUE_WAR:BATTLE_ID")?.content?.toInt() || 2;

    }


    // 段位
    static getDanConfig(id: number): table.leaguewar.LeagueWarDanConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarDanConfig, id)
    }

    // 段位奖励
    static getDanRewardConfig(id: number): table.leaguewar.LeagueWarDanRewardConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarDanRewardConfig, id)
    }

    // 赛季段位奖励
    static getDanRewardConfigByDanId(id: number): table.leaguewar.LeagueWarSeasonRankRewardConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarSeasonRankRewardConfig, id)
    }


    static get isInit(): boolean {
        return this._isInit;
    }


    static get battleId(): number {
        return this._battleId;
    }

    static get needHaveLeaguePersonCount(): number {
        return this._needHaveLeaguePersonCount;
    }

    static get needLeagueActiveValue(): number {
        return this._needLeagueActiveValue;
    }

    static get leagueMinLevel(): number {
        return this._leagueMinLevel;
    }

    static get leagueMinLoginMember(): number {
        return this._leagueMinLoginMember;
    }

    static get leagueMatchScoreDefaultScore(): number {
        return this._leagueMatchScoreDefaultScore;
    }

    static get maxChallengeTimesPerWar(): number {
        return this._maxChallengeTimesPerWar;
    }

    static get warCountPerSeason(): number {
        return this._warCountPerSeason;
    }

    static get seasonStartCalculationDate(): string {
        return this._seasonStartCalculationDate;
    }

    static get leagueMatchScoreFormula(): string {
        return this._leagueMatchScoreFormula;
    }

    static get personalScoreParams(): string {
        return this._personalScoreParams;
    }

    static get firstWarStartTime(): string {
        return this._firstWarStartTime;
    }

    static get matchStageContinueHours(): number {
        return this._matchStageContinueHours;
    }

    static get setFormationStageContinueHours(): number {
        return this._setFormationStageContinueHours;
    }

    static get battleStageContinueHours(): number {
        return this._battleStageContinueHours;
    }

    static get settleStageContinueHours(): number {
        return this._settleStageContinueHours;
    }

    static get localSeasonCount(): number {
        return this._localSeasonCount;
    }

    static get fromFightRank(): number {
        return this._fromFightRank;
    }

    static get toFightRank(): number {
        return this._toFightRank;
    }

    static get lowestFightCount(): number {
        return this._lowestFightCount;
    }

    static get maxFightRecordCount(): number {
        return this._maxFightRecordCount;
    }

    static get showTopCountInSettleStatus(): number {
        return this._showTopCountInSettleStatus;
    }

    static get danDiffScore(): number {
        return this._danDiffScore;
    }

    static get warReportMaxLimit(): number {
        return this._warReportMaxLimit;
    }

    static get firstWarGteServerOpenDay(): number {
        return this._firstWarGteServerOpenDay;
    }

    static get tabLogo1(): string {
        return this._tabLogo1;
    }

    static get tabLogo2(): string {
        return this._tabLogo2;
    }

    static get tabLogo3(): string {
        return this._tabLogo3;
    }

    static get tabLogo4(): string {
        return this._tabLogo4;
    }

    static getInitMaxHpCount(): number {
        return Math.max(0, this._initHp / 10000);
    }

    static getLayerConfigByLadderId(ladderId: number): table.leaguewar.LeagueWarLadderConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarLadderConfig, ladderId);
    }

    static getLayerConfig(leagueLv: number, layer: number): table.leaguewar.LeagueWarLadderConfig {
        return this._leagueLvToLayerToCountMap.get(leagueLv)?.get(layer);
    }


    /**
     * 层级 start index
     * @param leagueLv
     * @param layer
     */
    static getLayerStartIndex(leagueLv: number, layer: number): number {
        const map = this._leagueLvToLayerToCountMap.get(leagueLv);
        if (!map) {
            return 0;
        }
        let count = 0;
        for (let [layerNum, config] of map.entries()) {
            if (layer > layerNum) {
                count += config.capacity;
            }
        }
        return count;
    }

    /**
     * 层级 end index
     * @param leagueLv
     * @param layer
     */
    static getLayerEndIndex(leagueLv: number, layer: number): number {
        const map = this._leagueLvToLayerToCountMap.get(leagueLv);
        if (!map) {
            return 0;
        }
        let count = 0;
        for (let [layerNum, config] of map.entries()) {
            if (layer >= layerNum) {
                count += config.capacity;
            }
        }
        return count;
    }

    /**
     * get 奖励 by 联盟参与次数
     * @param isWin
     * @param isLocalServer
     */
    static getRewardConfigByChallengeCount(isWin: boolean, isLocalServer: boolean): NoOwnerItem[] {
        if (!isLocalServer) {
            if (isWin) {
                return this._rewardsForCrossLeagueWin;
            }
            return this._rewardsForCrossLeagueFail;
        }

        if (isWin) {
            return this._rewardsForLocalLeagueWin;
        }
        return this._rewardsForLocalLeagueFail;
    }

    /**
     * 挑战奖励
     * @param isWin
     */
    static getPersonalChallengeRewards(isWin: boolean): NoOwnerItem[] {
        if (isWin) {
            return this._rewardsForPersonalChallengeWin;
        }
        return this._rewardsForPersonalChallengeFail;
    }

    /**
     * 机器人 team 配置
     * @param id
     */
    static getRobotTeamConfigById(id: number): table.leaguewar.LeagueWarRobotFormationConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarRobotFormationConfig, id)
    }

    static getRobotConfigById(robotConfigId: number): table.leaguewar.LeagueWarRobotConfig {
        return TableManager.getDataById(table.leaguewar.LeagueWarRobotConfig, robotConfigId)
    }


}


