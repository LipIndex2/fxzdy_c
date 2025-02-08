import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { PVPContext } from "db://assets/scripts/game/modules/pvp/context/PVPContext";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { PVPInfoUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPInfoUtils";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { PVPBattleResultViewOpenArgs } from "../interface/IPvpArgs";

/**
 * 竞技场
 * @author GameCreator
 */
export class PVPModel extends BaseModel {

    private _context: PVPContext = PVPContext.create();

    /**
     * 模块标识
     */
    private MODULE = 35;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_GAME_MODE_BASE_DATA_UPDATE,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.PVP_GAME_MODE_BASE_DATA_UPDATE:
                this.resetByGameModeData(args as Vo.arena.ArenaPlayInfo);
                break;
        }
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {

        // 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recLoadArenaInfo);
        this.registerMsg(moduleId, 2, this.recLoadChallengeList);
        this.registerMsg(moduleId, 3, this.recRefreshChallengeList);
        this.registerMsg(moduleId, 4, this.recChallenge);
        this.registerMsg(moduleId, 5, this.recDrawRankReward);
        this.registerMsg(moduleId, 6, this.recDrawWeeklyReward);
        this.registerMsg(moduleId, 7, this.recLoadChallengeRecord);
        this.registerMsg(moduleId, 8, this.recLoadArenaRank);
        this.registerMsg(moduleId, 9, this.recBuyChallengeTimes);
        this.registerMsg(moduleId, -1, this.pushChallengeResult);
        this.registerMsg(moduleId, -2, this.pushBeChallenge);

    }

    /*********************************协议发送*********************************/

    /**
     * 获取竞技场信息
     * 模块号：35	指令号：1
     */
    @LogBusiness("获取竞技场信息")
    public sendLoadArenaInfo(): void {
        this.send(this.MODULE, 1);
    }

    /**
     * 获取挑战列表
     * 模块号：35	指令号：2
     */
    @LogBusiness("获取挑战列表")
    public sendLoadChallengeList(): void {
        this.send(this.MODULE, 2);
    }

    /**
     * 刷新挑战列表
     * 模块号：35	指令号：3
     */
    @LogBusiness("刷新挑战列表")
    public sendRefreshChallengeList(): void {
        this.send(this.MODULE, 3);
    }

    /**
     * 挑战
     * 模块号：35	指令号：4
     */
    @LogBusiness("挑战")
    public sendChallenge(c2s: Vo.arena.ChallengeC2S): void {
        this.send(this.MODULE, 4, c2s, c2s);
    }

    /**
     * 领取段位奖励
     * 模块号：35	指令号：5
     */
    @LogBusiness("领取段位奖励")
    public sendDrawRankReward(): void {
        this.send(this.MODULE, 5);
    }

    /**
     * 领取周挑战次数奖励
     * 模块号：35	指令号：6
     */
    @LogBusiness("领取周挑战次数奖励")
    public sendDrawWeeklyReward(c2s: Vo.arena.DrawWeeklyRewardC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**
     * 获取挑战记录
     * 模块号：35	指令号：7
     */
    @LogBusiness("获取挑战记录")
    public sendLoadChallengeRecord(): void {
        this.send(this.MODULE, 7);
    }

    /**
     * 获取排行榜信息
     * 模块号：35	指令号：8
     */
    @LogBusiness("获取排行榜信息")
    public sendLoadArenaRank(c2s: Vo.arena.LoadArenaRankC2S): void {
        this.send(this.MODULE, 8, c2s, c2s);
    }

    /**
     * 购买挑战次数
     * 模块号：35	指令号：9
     */
    @LogBusiness("购买挑战次数")
    public sendBuyChallengeTimes(): void {
        this.send(this.MODULE, 9);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取竞技场信息
     * 模块号：35	指令号：1
     */
    @LogBusiness("获取竞技场信息")
    public recLoadArenaInfo(data: Vo.arena.LoadArenaInfoS2C): void {
        if (data.code < 0) {
            return;
        }

        const content: Vo.arena.PlayerArenaVo = data.content;

        this._context.reset(content);

        G.FacadeManager.emit(NotificationKey.PVP_REFRESH_DATA);
    }

    /**
     * 获取挑战列表
     * 模块号：35	指令号：2
     */
    @LogBusiness("获取挑战列表")
    public recLoadChallengeList(data: Vo.arena.LoadChallengeListS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        const costItemResults = content.costItemResults;
        const opponentVos = content.opponentVos;


        this._context.updateOppos(opponentVos);
        this._context.updateRefreshChallengeCount(content.refreshTimes);

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Array<Vo.cost.CostItemResult>);

        G.FacadeManager.emit(NotificationKey.PVP_REFRESH_DATA);

        G.UIManager.open(PVPUIKeys.PVPChooseOppoView);
    }

    /**
     * 刷新挑战列表
     * 模块号：35	指令号：3
     */
    @LogBusiness("刷新挑战列表")
    public recRefreshChallengeList(data: Vo.arena.RefreshChallengeListS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        this._context.updateChallengeOppoInfoByServer(content);

        G.FacadeManager.emit(NotificationKey.PVP_REFRESH_DATA);
    }

    /**
     * 挑战
     * 模块号：35	指令号：4
     */
    @LogBusiness("挑战")
    public recChallenge(data: Vo.arena.ChallengeS2C, c2s: Vo.arena.ChallengeC2S): void {
        if (data.code < 0) {
            return;
        }

        const defenderId = c2s.defenderId;
        const oppo = this._context.getOpponentById(defenderId)

        let title = "";
        if (oppo) {
            title = PVPInfoUtils.getNameByOppo(oppo);
        }

        console.info("挑战成功! 开始战斗!");

        const battleConfigId = PVPUtils.getBattleConfigId();

        // loading
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);
    }

    /**
     * 领取段位奖励
     * 模块号：35	指令号：5
     */
    @LogBusiness("领取段位奖励")
    public recDrawRankReward(data: Vo.arena.DrawRankRewardS2C): void {
        if (data.code < 0) {
            return;
        }

    }

    /**
     * 领取周挑战次数奖励
     * 模块号：35	指令号：6
     */
    @LogBusiness("领取周挑战次数奖励")
    public recDrawWeeklyReward(data: Vo.arena.DrawWeeklyRewardS2C, c2s: Vo.arena.DrawWeeklyRewardC2S): void {
        if (data.code < 0) {
            return;
        }

        const weeklyChallengeTimes = c2s.weeklyChallengeTimes;
        this._context.addHaveGainWeeklyChallengeTimes(weeklyChallengeTimes);

        const content = data.content;

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, content as Array<Vo.reward.RewardResult>);

    }

    /**
     * 获取挑战记录
     * 模块号：35	指令号：7
     */
    @LogBusiness("获取挑战记录")
    public recLoadChallengeRecord(data: Vo.arena.LoadChallengeRecordS2C): void {
        if (data.code < 0) {
            return;
        }
        const content = data.content;


        G.FacadeManager.emit(NotificationKey.PVP_GET_RECORDS, content as Array<Vo.arena.ArenaChallengeRecord>)
    }

    /**
     * 获取排行榜信息
     * 模块号：35	指令号：8
     */
    @LogBusiness("获取竞技场排行榜信息")
    public recLoadArenaRank(data: Vo.arena.LoadArenaRankS2C): void {
        if (data.code < 0) {
            return;
        }


        const content = data.content;
        const topList: RankCommonData[] = (content.topList || [])
            .map(it => {
                return RankCommonData.createByPVP(it);
            });

        G.FacadeManager.emit(NotificationKey.PVP_RANK_TOP_3, topList as Array<RankCommonData>);

        G.FacadeManager.emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createByPVP(
            ServerEnums.RankingType.ARENA,
            content
        ));

    }

    /**
     * 购买挑战次数
     * 模块号：35	指令号：9
     */
    @LogBusiness("购买挑战次数")
    public recBuyChallengeTimes(data: Vo.arena.BuyChallengeTimesS2C): void {
        if (data.code < 0) {
            return;
        }
        const content = data.content;

        const costItemResults = content.costItemResults;
        const rewardResults = content.rewardResults;
        const todayBuyChallengeTimes = content.todayBuyChallengeTimes;

        this._context.updateTodayBuyChallengeTimes(todayBuyChallengeTimes);

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Array<Vo.cost.CostItemResult>);
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP, rewardResults as Array<Vo.reward.RewardResult>);
        G.FacadeManager.emit(NotificationKey.PVP_REFRESH_DATA);

    }

    /*********************************协议推送*********************************/

    /**
     * 推送挑战结果,ArenaChallengeVo
     * 模块号：35	指令号：-1
     */
    @LogBusiness("推送 PVP 挑战结果")
    public pushChallengeResult(data: Vo.arena.ArenaChallengeVo): void {
        const context = PVPModel.ins().getContext();

        const winFlag = data.win;

        context.setExtraChallengeRewardTimes(data.extraChallengeRewardTimes);

        const drawRankRewardIds = data.drawRankRewardIds || [];
        context.updateGainRewardByRankIds(drawRankRewardIds);

        let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.ARENA };
        this.emit(NotificationKey.BATTLE_RESULT, resultVo);

        // rewards
        const challengeServerRewards = data.rewardResults;
        const rankLvUpRewards = data.rankRewardResults;
        if (ArrayUtils.isNotEmpty(challengeServerRewards)) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, challengeServerRewards as Array<Vo.reward.RewardResult>)
        }
        if (ArrayUtils.isNotEmpty(rankLvUpRewards)) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rankLvUpRewards as Array<Vo.reward.RewardResult>)
        }

        const challengeRewards = ItemUtils.parseServerRewardToItems(challengeServerRewards);

        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.ARENA, exData: PVPBattleResultViewOpenArgs.create(
                winFlag,
                challengeRewards,
                data.score,
                data.changeScore,
                data.rankConfigId
            )
        } as IBattleResultWinData)
    }

    /**
     * 推送被挑战信息,ArenaBeChallengeVo
     * 模块号：35	指令号：-2
     */
    @LogBusiness("推送被挑战信息")
    public pushBeChallenge(data: Vo.arena.ArenaBeChallengeVo): void {
        const context = PVPModel.ins().getContext();

        const currentRankConfig = context.getCurrentRankConfig();
        if (!currentRankConfig) {
            return
        }

        // 奖励
        const rewardResults = data.rewardResults;
        if (rewardResults) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewardResults as Array<Vo.reward.RewardResult>);
        }

        const oldScore = PVPModel.ins().getContext().score;
        const newScore = data.score;
        PVPModel.ins().getContext().updateScore(newScore);

        const drawRankRewardIds = data.drawRankRewardIds || [];
        context.updateGainRewardByRankIds(drawRankRewardIds);

        // 被挑战前后段位相同
        const newRankId = data.rankConfigId;
        if (currentRankConfig.id < newRankId) {
            G.FacadeManager.emit(NotificationKey.PVP_RANK_BE_LV_UP, { newScore: newScore, oldScore: oldScore });
        }
    }


    /********************************* init *********************************/

    initData(data: Vo.arena.PlayerArenaLoginVo): void {
        PVPUtils.init();

        this._context.initData(data);


    }



    getContext(): PVPContext {
        return this._context;
    }

    private resetByGameModeData(data: Vo.arena.ArenaPlayInfo) {
        this._context.resetByGameModeData(data);
    }

    changeScore(scoreChange: number) {
        this._context.changeScore(scoreChange);
    }

    getMyRankConfigId(): number {
        return this._context.myConfigId;
    }
}
