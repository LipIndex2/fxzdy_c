import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { DailyBossConfigManager } from "../config/DailBossConfigManager";
import { DailyBossContext } from "db://assets/scripts/game/modules/dailyBoss/context/DailyBossContext";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import G from "db://assets/scripts/core/comm/G";
import { BattleForDailyBossData } from "db://assets/scripts/game/modules/common/battle/structs/BattleForDailyBossData";
import { FightType } from "../../../comm/battle/enum/FightType";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { DailyBossBattleResultViewOpenArgs } from "../interface/IDailyBossArgs";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";

/**
 * 每日BOSS模块
 * @author GameCreator
 */
export class DailyBossModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 30;

    private _context: DailyBossContext = DailyBossContext.create();

    constructor () {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recLoadInfo);

        this.registerMsg(moduleId, 3, this.recChallengeBoss);
        // this.registerMsg(moduleId, 4, this.recDrawProgressReward);
        this.registerMsg(moduleId, 5, this.recLoadBossRank);
        this.registerMsg(moduleId, 6, this.onDailyBossFormationRankItem);
        this.registerMsg(moduleId, 7, this.recAddAdvertChallengeTimes);
        this.registerMsg(moduleId, -1, this.pushChallengeResult);

    }

    /*********************************协议发送*********************************/

    /**
     * 加载每日BOSS信息
     * 模块号：30	指令号：1
     */
    @LogBusiness("加载每日BOSS信息 ")
    public sendLoadInfo(): void {
        this.send(this.MODULE, 1);
    }

    /***获取推荐英雄信息 */
    public sendDailyBossFormationRankItem(bossType: number): void {
        let c2s = {
            bossType: bossType
        } as Vo.dailyboss.LoadMaxHurtFormationsC2S
        this.send(this.MODULE, 6, c2s, bossType);
    }

    /**
     * 挑战BOSS
     * 模块号：30	指令号：3
     */
    @LogBusiness("挑战BOSS ")
    public sendChallengeBoss(isBuy: boolean): void {
        const bossType = this._context.getBossType();
        const difficulty = this._context.getDifficulty();

        let cfg = DailyBossConfigManager.getBossConfig(bossType, difficulty);
        if (!cfg) {
            return;
        }

        this._context.updateBattleTempData(bossType, difficulty)

        let c2s = {
            "bossConfigId": cfg.id,
            "buyChallengeTimes": isBuy
        } as Vo.dailyboss.ChallengeBossC2S;
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 领取当前每日BOSS进度奖励
     * 模块号：30	指令号：4
     */
    @LogBusiness("领取当前每日BOSS进度奖励 ")
    // public sendDrawProgressReward(c2s: Vo.dailyboss.DrawProgressRewardC2S): void {
    //     this.send(this.MODULE, 4, c2s, c2s);
    // }

    /**
     * 加载BOSS排行榜
     * 模块号：30	指令号：5
     */
    @LogBusiness("加载BOSS排行榜 ")
    public sendLoadBossRank(c2s: Vo.dailyboss.LoadBossRankC2S): void {
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
	 * 增加广告挑战次数,返回成功则增加当日广告挑战次数
	 * 模块号：30	指令号：7
	 */
	public sendAddAdvertChallengeTimes(): void {
		this.send(this.MODULE, 7);
	}
    
    /*********************************协议监听*********************************/

    /**
     * 加载每日BOSS信息
     * 模块号：30	指令号：1
     */
    @LogBusiness(" 加载每日BOSS信 ")
    public recLoadInfo(data: Vo.dailyboss.LoadInfoS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        this._context.resetBossInfo(content)

        FacadeManager.ins().emit(NotificationKey.DAILY_BOSS_INFO_CHANGE);
    }

    /**
     * 挑战BOSS
     * 模块号：30	指令号：3
     */
    @LogBusiness(" 挑战BOSS ")
    public recChallengeBoss(data: Vo.dailyboss.ChallengeBossS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;
        const costItemResults = content.costItemResults;
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults);

        const buyChallengeTimes = content.buyChallengeTimes;
        this._context.updateBuyChallengeTimes(buyChallengeTimes);

        console.info("挑战成功! 开始战斗!");


        // loading
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);

    }

    /**
     * 领取当前每日BOSS进度奖励
     * 模块号：30	指令号：4
     */
    // @LogBusiness(" 领取当前每日BO ")
    // public recDrawProgressReward(data: Vo.dailyboss.DrawProgressRewardS2C,
    //     c2s: Vo.dailyboss.DrawProgressRewardC2S
    // ): void {
    //     if (data.code < 0) {
    //         return;
    //     }

    //     const rewards = data.content;
    //     const progressId = c2s.progressId;
    //     this._context.addHaveGainProgressId(progressId);

    //     // add items
    //     G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards);


    //     FacadeManager.ins().emit(NotificationKey.DAILY_BOSS_INFO_CHANGE);
    // }

    /**
     * 加载BOSS排行榜
     * 模块号：30	指令号：5
     */
    @LogBusiness(" 加载BOSS排行榜 ")
    public recLoadBossRank(data: Vo.dailyboss.LoadBossRankS2C, c2s: Vo.dailyboss.LoadBossRankC2S): void {
        if (data.code < 0) {
            return;
        }

        const bossType = c2s.bossType;
        const rankingVo: Vo.dailyboss.DailyBossRankingVo = data.content;

        this._context.updateBossRank(rankingVo);

        // 每日boss
        FacadeManager.ins().emit(NotificationKey.DAILY_BOSS_RANK_UPDATE);

        // rank
        FacadeManager.ins().emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createByDailyBoss(rankingVo, bossType));

    }

    /**
	 * 增加广告挑战次数,返回成功则增加当日广告挑战次数
	 * 模块号：30	指令号：7
	 */
	public recAddAdvertChallengeTimes(data: Vo.dailyboss.AddAdvertChallengeTimesS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
            this.context.bossInfoVo.todayGetAdvertTimes += 1
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.DAILY_BOSS)
		}
	}

    /*********************************协议推送*********************************/

    /***推荐英雄信息 */
    private onDailyBossFormationRankItem(data: Vo.dailyboss.LoadMaxHurtFormationsS2C, bossType: number): void {
        if (data.code < 0) {
            return;
        }
        this._context.updateRecommendFormation(bossType, data.content);
        FacadeManager.ins().emit(NotificationKey.DAILY_BOSS_Formation_Rank);
    }

    /**
     * 推送挑战结果,DailyBossChallengeVo
     * 模块号：30	指令号：-1
     */
    @LogBusiness(" 每日boss-推送挑战结果 ")
    public pushChallengeResult(data: Vo.dailyboss.DailyBossChallengeResultVo): void {
        this._context.updateTempDamageValue(data.hurt);

        const winFlag = data.win;
        const newHardId = data.currentDifficulty;

        let battleProgressValueOrHurt = data.currentProgress;


        const oldHardId = this._context.getMyBattleTempData().hardId;

        const isNextHard = oldHardId != newHardId;
        let oldProgressValue = 0;
        if (isNextHard) {
            battleProgressValueOrHurt = 10000;
        }
        const isNewRecord = this._context.isNewProgress(battleProgressValueOrHurt);
        this._context.updateByBattleResult(data);

        let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.DAILY_BOSS };
        this.emit(NotificationKey.BATTLE_RESULT, resultVo);

        // 最高难度用伤害 | 后端又换成了进度值
        if (oldHardId == DailyBossConfigManager.getMaxDifficulty()) {
            battleProgressValueOrHurt = data.currentProgress;
        }

        // add items
        const rewardResults = data.progressRewardResults;
        if (rewardResults) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewardResults);
        }
        // // progress
        // const drawProgressIds = data.drawProgressIds;
        // if (drawProgressIds) {
        //     this._context.addHaveGainProgressIds(drawProgressIds);
        // }


        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.DAILY_BOSS, exData: DailyBossBattleResultViewOpenArgs.create(
                winFlag,
                oldHardId,
                battleProgressValueOrHurt,
                isNewRecord,
                isNextHard
            )
        } as IBattleResultWinData)
    }

    /*********************************1*********************************/

    // 
    initData(data: Vo.dailyboss.DailyBossVo) {
        DailyBossConfigManager.init();

    }


    get context(): DailyBossContext {
        return this._context;
    }

    getMyBattleTempData(): BattleForDailyBossData {
        return this._context.getMyBattleTempData();
    }

    saveTempDamage(damageValue: number) {
        this._context.updateTempDamageValue(damageValue);
    }

    sendLoadCurrentBossRank() {
        const bossType = this._context.getBossType();

        this.sendLoadBossRank({
            bossType: bossType,
            page: 1,
        });
    }
}
