import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { LeagueBargainContext } from "db://assets/scripts/game/modules/league/context/LeagueBargainContext";
import { LeagueCenterViewOpenArgs } from "db://assets/scripts/game/modules/league/structs/LeagueCenterViewOpenArgs";
import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { UIManager } from "../../../core/mvc/UIManager";
import { LongForNetwork } from "../../../core/prototypes/LongForNetwork";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { FightType } from "../../comm/battle/enum/FightType";
import LocalStorage from "../../comm/cache/LocalStorage";
import { TimeUtils } from "../../comm/utils/TimeUtils";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { LeagueTechConfigDatas } from "../../table/league/LeagueTechConfigDatas";
import { Attribute } from "../attr/AttrEnum";
import { BackpackManager } from "../backpack/BackpackManager";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { BattleUIUtils } from "../battle/utils/BattleUIUtils";
import { IBattleResultWinData } from "../battle/vo/IBattleResultWinData";
import { BtnConfirmViewOpenArgs } from "../common/confirm/BtnConfirmView";
import { UICommonKey } from "../common/const/UICommonConfig";
import { CommonI18nKeys } from "../common/i18n/CommonI18nKeys";
import { ConditionManager } from "../condition/ConditionManager";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";
import { FormationManager } from "../formation/FormationManager";
import { FormationVo } from "../formation/vo/FormationVo";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { PlayerModel } from "../player/model/PlayerModel";
import { RankModel } from "../rank/model/RankModel";
import { ConstLeagueKey, I18LeagueKey, UILeagueKey } from "./const/UILeagueConst";
import { LeagueManager } from "./leagueManager";
import { leagueRedDotCtr } from "./leagueRedDotCtr";
import { ILeagueGiftVo } from "./vo/ILeagueGiftVo";

/**
 * 联盟相关模块
 */
export class LeagueModel extends BaseModel {

    private readonly _bargainContext = new LeagueBargainContext();


    get bargainContext(): LeagueBargainContext {
        return this._bargainContext;
    }


    /**
     * 模块标识
     */
    private MODULE = 37;
    private cmds = {
        /**
         * 获取联盟信息
         */
        LOAD_LEAGUE_INFO: 1,
        /**
         * 获取联盟列表
         */
        LOAD_LEAGUE_LIST: 2,
        /**
         * 根据名称查找联盟
         */
        SEARCH_LEAGUE_BY_NAME: 3,
        /**
         * 根据id查找联盟
         */
        SEARCH_LEAGUE_BY_ID: 4,
        /**
         * 根据id查看联盟成员列表
         */
        VIEW_LEAGUE_MEMBER_LIST: 5,
        /**
         * 创建联盟
         */
        CREATE_LEAGUE: 6,
        /**
         * 获取联盟成员列表
         */
        LOAD_LEAGUE_MEMBER_LIST: 7,
        /**
         * 修改联盟名称
         */
        CHANGE_LEAGUE_NAME: 8,
        /**
         * 修改联盟旗帜
         */
        CHANGE_LEAGUE_BANNER: 9,
        /**
         * 发送联盟邮件
         */
        SEND_LEAGUE_EMAIL: 10,
        /**
         * 修改联盟公告
         */
        CHANGE_LEAGUE_NOTICE: 11,
        /**
         * 申请加入联盟
         */
        APPLY_JOIN_LEAGUE: 12,
        /**
         * 获取联盟申请列表
         */
        LOAD_LEAGUE_APPLY: 13,
        /**
         * 审批联盟申请
         */
        APPROVAL_LEAGUE_APPLY: 14,
        /**
         * 一键确认申请
         */
        ONE_KEY_AGREE: 15,
        /**
         * 修改联盟申请自动审批
         */
        CHANGE_AUTO_ACCEPT: 16,
        /**
         * 成员任命
         */
        MEMBER_APPOINT: 17,
        /**
         * 移除成员
         */
        REMOVE_MEMBER: 18,
        /**
         * 聊天招募
         */
        CHAT_INVITE: 19,
        /**
         * 退出联盟
         */
        QUIT_LEAGUE: 20,
        /**
         * 领取挑战任务奖励
         */
        DRAW_CHALLENGE_TASK: 21,
        /**
         * 查看完成挑战任务的玩家
         */
        VIEW_CHALLENGE_TASK_MEMBER: 22,
        /**
         * 升级联盟科技
         */
        UPGRADE_LEAGUE_TECH: 23,


        /**
         * 获取当前阶段BOSS信息
         */
        LOAD_STAGE_LEAGUE_BOSS: 24,
        /**
         * 获取联盟BOSS信息
         */
        LOAD_LEAGUE_BOSS_INFO: 25,
        /**
         * 挑战联盟BOSS
         */
        CHALLENGE_LEAGUE_BOSS: 26,
        /**
         * 获取联盟BOSS排行榜
         */
        LOAD_LEAGUE_BOSS_RANK: 27,

        /*******联盟宝箱************************************************** */
        /**
         * 领取周常任务奖励
         */
        DRAW_WEEKLY_TASK_REWARD: 28,
        /**
         * 发放联盟赠礼
         */
        SEND_LEAGUE_GIFT: 29,

        /**
         * 领取联盟赠礼
         */

        DRAW_LEAGUE_GIFT: 30,
        /**
         * 领取上周联盟宝箱
         */

        DRAW_LAST_WEEK_LEAGUE_BOX: 31,

        /********************************************************* */


        /**
         * 推送联盟名称变更,联盟名称
         */
        PUSH_LEAGUE_NAME_CHANGE: -1,
        /**
         * 推送联盟旗帜变更,LeagueBannerChangeVo
         */
        PUSH_LEAGUE_BANNER_CHANGE: -2,
        /**
         * 推送联盟公告变更,LeagueNoticeChangeVo
         */
        PUSH_LEAGUE_NOTICE_CHANGE: -3,
        /**
         * 推送发送联盟邮件,当前发送联盟邮件次数
         */
        PUSH_SEND_LEAGUE_EMAIL: -4,
        /**
         * 推送加入家族,联盟ID
         */
        PUSH_JOIN_LEAGUE: -5,
        /**
         * 推送成员职位变更列表,List<LeagueJobChangeVo>
         */
        PUSH_MEMBER_APPOINT: -6,
        /**
         * 推送成员退出,退出的成员ID
         */
        PUSH_REMOVE_MEMBER: -7,
        /**
         * 推送联盟等级信息变更,LeagueLevelInfoChangeVo
         */
        PUSH_LEAGUE_LEVEL_INFO_CHANGE: -8,
        /**
         * 推送成员加入,加入的成员ID
         */
        PUSH_LEAGUE_MEMBER_JOIN: -9,
        /**
         * 推送联盟拒绝申请,拒绝申请的联盟ID
         */
        PUSH_LEAGUE_REJECT_APPLY: -10,
        /**
         * 推送联盟申请列表变更,无参数
         */
        PUSH_LEAGUE_APPLY_LIST_CHANGE: -11,
        /**
         * 推送退出联盟,是否被踢
         */
        PUSH_QUIT_LEAGUE: -12,
        /**
         * 推送联盟自动审批变更,是否自动审批
         */
        PUSH_LEAGUE_AUTO_ACCEPT_CHANGE: -13,
        /**
         * 推送更新挑战任务,List<LeagueChallengeTaskVo>
         */
        PUSH_UPDATE_CHALLENGE_TASK: -14,


        /**
         * 推送联盟BOSS挑战结果,
         */
        PUSH_LEAGUE_BOSS_CHALLENGE_RESULT: -15,
        /**
         * 推送联盟BOSS阶段更新,boss阶段
         */
        PUSH_LEAGUE_BOSS_STAGE_UPDATE: -16,

        /**
         * 推送联盟赠礼道具奖励,List<RewardResult>
         */
        PUSH_LEAGUE_GIFT_REWARD: -17,
        /**
         * 推送联盟宝箱进度值,联盟宝箱进度值
         */
        PUSH_LEAGUE_BOX_PROGRESS: -18,
        /**
         * 推送联盟赠礼发放,LeagueGiftVo
         */
        PUSH_LEAGUE_GIFT: -19,
        /**
         * 推送联盟周常任务重置,LeagueWeeklyTaskResetVo
         */
        PUSH_WEEKLY_TASK_RESET: -20,
        /**
         * 推送退出联盟取消未完成的周常任务,取消周常任务ID列表
         */
        PUSH_CANCEL_WEEKLY_TASK: -21,
        /**
         * 推送联盟宝箱信息更新,LeagueBoxUpdateVo
         */
        PUSH_LEAGUE_BOX_UPDATE: -22,
        /**
         * 推送联盟BOSS死亡,LeagueBossDeadVo
         */
        PUSH_LEAGUE_BOSS_DEAD: -23,
        /**
         * 推送发送联盟邀请，今日邀请数
         */
        PUSH_SEND_LEAGUE_INVITE: -24,

    }

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**登录下发 */
    public initData(vo: Vo.league.PlayerLeagueLoginVo) {
        LeagueManager.ins().mPlayerLeagueLoginVo = vo;

        this._bargainContext.onLoginData(vo)

        if (vo.leagueId) {
            leagueRedDotCtr.ins().newGiftItem = this.getSendGiftList();
            this.loadLeagueMemberList();
            this.loadLeagueInfo();
            this.loadLeagueApply();
            this.loadStageLeagueBoss();
        }
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;


        this.registerMsg(moduleId, 1, this.recLeagueInfo);
        this.registerMsg(moduleId, 2, this.recLeagueList);
        this.registerMsg(moduleId, this.cmds.SEARCH_LEAGUE_BY_NAME, this.recSearchLeagueByName);
        this.registerMsg(moduleId, this.cmds.SEARCH_LEAGUE_BY_ID, this.recSearchLeagueById);
        this.registerMsg(moduleId, 5, this.recViewLeagueMemberList, true);
        this.registerMsg(moduleId, this.cmds.CREATE_LEAGUE, this.recCreateLeague);
        this.registerMsg(moduleId, this.cmds.LOAD_LEAGUE_MEMBER_LIST, this.recLoadLeagueMemberList);
        this.registerMsg(moduleId, this.cmds.CHANGE_LEAGUE_NAME, this.recChangeLeagueName);
        this.registerMsg(moduleId, this.cmds.CHANGE_LEAGUE_BANNER, this.recChangeLeagueBanner);
        this.registerMsg(moduleId, this.cmds.SEND_LEAGUE_EMAIL, this.recSendLeagueEmail);
        this.registerMsg(moduleId, this.cmds.CHANGE_LEAGUE_NOTICE, this.recChangeLeagueNotice);
        this.registerMsg(moduleId, 12, this.recApplyJoinLeague);
        this.registerMsg(moduleId, this.cmds.LOAD_LEAGUE_APPLY, this.recLoadLeagueApply);
        this.registerMsg(moduleId, this.cmds.APPROVAL_LEAGUE_APPLY, this.recApprovalLeagueApply);
        this.registerMsg(moduleId, this.cmds.ONE_KEY_AGREE, this.recOneKeyAgree);
        this.registerMsg(moduleId, this.cmds.CHANGE_AUTO_ACCEPT, this.recChangeAutoAccept);
        this.registerMsg(moduleId, this.cmds.MEMBER_APPOINT, this.recMemberAppoint);
        this.registerMsg(moduleId, this.cmds.REMOVE_MEMBER, this.recRemoveMember);
        this.registerMsg(moduleId, this.cmds.CHAT_INVITE, this.recChatInvite);
        this.registerMsg(moduleId, 20, this.recQuitLeague);
        this.registerMsg(moduleId, this.cmds.DRAW_CHALLENGE_TASK, this.recDrawChallengeTask);
        this.registerMsg(moduleId, this.cmds.VIEW_CHALLENGE_TASK_MEMBER, this.recViewChallengeTaskMember);
        this.registerMsg(moduleId, this.cmds.UPGRADE_LEAGUE_TECH, this.recUpgradeLeagueTech);

        // bargain
        this.registerMsg(moduleId, 32, this.recLoadLeagueBargainInfo);
        this.registerMsg(moduleId, 33, this.recBargainGift);
        this.registerMsg(moduleId, 34, this.recBuyBargainGift);
        this.registerMsg(moduleId, 35, this.recLoadBargainMemberInfo);
        this.registerMsg(moduleId, 36, this.recAddAdvertBossCount);

        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_NAME_CHANGE, this.pushLeagueNameChange);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BANNER_CHANGE, this.pushLeagueBannerChange);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_NOTICE_CHANGE, this.pushLeagueNoticeChange);
        this.registerMsg(moduleId, this.cmds.PUSH_SEND_LEAGUE_EMAIL, this.pushSendLeagueEmail);
        this.registerMsg(moduleId, this.cmds.PUSH_JOIN_LEAGUE, this.pushJoinLeague);
        this.registerMsg(moduleId, this.cmds.PUSH_MEMBER_APPOINT, this.pushMemberAppoint);
        this.registerMsg(moduleId, this.cmds.PUSH_REMOVE_MEMBER, this.pushRemoveMember);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_LEVEL_INFO_CHANGE, this.pushLeagueLevelInfoChange);
        this.registerMsg(moduleId, -9, this.pushLeagueMemberJoin);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_REJECT_APPLY, this.pushLeagueRejectApply);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_APPLY_LIST_CHANGE, this.pushLeagueApplyListChange);
        this.registerMsg(moduleId, this.cmds.PUSH_QUIT_LEAGUE, this.pushQuitLeague);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_AUTO_ACCEPT_CHANGE, this.pushLeagueAutoAcceptChange);
        this.registerMsg(moduleId, this.cmds.PUSH_UPDATE_CHALLENGE_TASK, this.pushUpdateChallengeTask);

        this.registerMsg(moduleId, this.cmds.LOAD_STAGE_LEAGUE_BOSS, this.recLoadStageLeagueBoss);
        this.registerMsg(moduleId, this.cmds.LOAD_LEAGUE_BOSS_INFO, this.recLoadLeagueBossInfo);
        this.registerMsg(moduleId, this.cmds.CHALLENGE_LEAGUE_BOSS, this.recChallengeLeagueBoss);
        this.registerMsg(moduleId, this.cmds.LOAD_LEAGUE_BOSS_RANK, this.recLoadLeagueBossRank);
        //PUSH_LEAGUE_BOSS_CHALLENGE_RESULT
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BOSS_CHALLENGE_RESULT, this.pushLeagueBossChallengeResult);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BOSS_STAGE_UPDATE, this.pushLeagueBossStageUpdate);

        /**联盟宝箱 ********************************************/
        this.registerMsg(moduleId, this.cmds.DRAW_WEEKLY_TASK_REWARD, this.recDrawWeeklyTaskReward);
        this.registerMsg(moduleId, this.cmds.SEND_LEAGUE_GIFT, this.recSendLeagueGift);
        this.registerMsg(moduleId, this.cmds.DRAW_LEAGUE_GIFT, this.recGetLeagueGift);
        this.registerMsg(moduleId, this.cmds.DRAW_LAST_WEEK_LEAGUE_BOX, this.recOpenLeagueBox);

        //推送
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_GIFT_REWARD, this.pushLeagueGiftReward);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BOX_PROGRESS, this.pushLeagueBoxProgress);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_GIFT, this.pushLeagueGift);
        this.registerMsg(moduleId, this.cmds.PUSH_WEEKLY_TASK_RESET, this.pushWeeklyTaskReset);
        this.registerMsg(moduleId, this.cmds.PUSH_CANCEL_WEEKLY_TASK, this.pushCancelWeeklyTask);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BOX_UPDATE, this.pushLeagueBoxUpdate);
        this.registerMsg(moduleId, this.cmds.PUSH_LEAGUE_BOSS_DEAD, this.pushLeagueBossDead);
        this.registerMsg(moduleId, this.cmds.PUSH_SEND_LEAGUE_INVITE, this.pushSendLeagueInvite);

        this.registerMsg(moduleId, -25, this.pushBargainStart);
        this.registerMsg(moduleId, -26, this.pushBargainGiftUpdate);
        this.registerMsg(moduleId, -27, this.pushBargainGiftBuy);
        this.registerMsg(moduleId, -28, this.pushBargainLimitTime);

        /************************************ */


    }


    /**
     * 获取联盟砍价信息
     * 模块号：37	指令号：32
     */
    public sendLoadLeagueBargainInfo(): void {
        this.send(this.MODULE, 32);
    }

    /**
     * 礼包砍价,返回最后一次砍价时间
     * 模块号：37	指令号：33
     */
    public sendBargainGift(): void {
        this.send(this.MODULE, 33);
    }

    /**
     * 购买砍价礼包
     * 模块号：37	指令号：34
     */
    public sendBuyBargainGift(): void {
        let c2s = {
            bargainGiftId: this._bargainContext.getGiftId()
        } as Vo.league.BuyBargainGiftC2S;
        this.send(this.MODULE, 34, c2s);
    }

    /**
     * 加载砍价玩家信息
     * 模块号：37	指令号：35
     */
    public sendLoadBargainMemberInfo(): void {
        this.send(this.MODULE, 35);
    }

	/**
	 * 
	 * 模块号：37	指令号：36
	 */
	public sendAddAdvertBossCount(): void {
		this.send(this.MODULE, 36);
	}

    /**************联盟boss相关*********** */

    /**
     * 获取当前阶段BOSS信息
     */
    public loadStageLeagueBoss() {
        let open = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.LEAGUE_BOSS, false)
        if (open) {
            this.send(this.MODULE, this.cmds.LOAD_STAGE_LEAGUE_BOSS);
        }
        return open;
    }

    /**返回当前阶段BOSS信息 */
    private recLoadStageLeagueBoss(data: Vo.league.LoadStageLeagueBossS2C) {
        if (data.code >= 0) {
            LeagueManager.ins().leagueBossStageInfo = data.content;
            LeagueManager.ins().mPlayerLeagueLoginVo.bossChallengeTimes = data.content.bossChallengeTimes;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE);
            //更新挑战次数
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE);
        }
    }

    /**
     * 获取联盟BOSS信息
     */

    public loadLeagueBossInfo(bossConfigId: number) {
        let c2s = {} as Vo.league.LoadLeagueBossInfoC2S;
        c2s.bossConfigId = bossConfigId;
        this.send(this.MODULE, this.cmds.LOAD_LEAGUE_BOSS_INFO, c2s, c2s);
    }

    /**返回联盟BOSS信息 */
    private recLoadLeagueBossInfo(data: Vo.league.LoadLeagueBossInfoS2C) {
        if (data.code >= 0) {
            let bossVos = LeagueManager.ins().leagueBossStageInfo.bossVos;
            bossVos.forEach(bossVo => {
                if (bossVo.bossConfigId == data.content.bossConfigId) {
                    bossVo = data.content;
                }
            });
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_INFO_CHANGE);
        }


    }

    /**
     * 挑战联盟BOSS
     */
    public challengeLeagueBoss(bossConfigId: number) {

        //检查挑战次数
        let cfgCount = LeagueModel.ins().getLeagueBossChallengeCount();
        let voCount = LeagueManager.ins().mPlayerLeagueLoginVo.bossChallengeTimes;

        if (cfgCount <= voCount) {
            let limitStr = "挑战次数不足";
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }

        // 是否需要布阵
        let isFormation = this.isNeedFormation(bossConfigId);
        if (isFormation) {
            //每次点击挑战进入该界面 ,飘字“请先进行布阵”
            let limitStr = "请先进行布阵";
            GIns.floatingTextMgr.showTips(limitStr);
            this.openBuzhen(bossConfigId);
            return;
        }

        let c2s = {} as Vo.league.ChallengeLeagueBossC2S;
        c2s.bossConfigId = bossConfigId;
        this.send(this.MODULE, this.cmds.CHALLENGE_LEAGUE_BOSS, c2s, c2s);
    }

    /**返回联盟BOSS挑战结果 */
    private recChallengeLeagueBoss(data: Vo.league.ChallengeLeagueBossS2C) {
        if (data.code >= 0) {
            //增加挑战次数
            let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
            loginVo.bossChallengeTimes++;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE);

        }
    }

    /**
     * 获取联盟BOSS排行榜
     * */
    public loadLeagueBossRank(bossConfigId: number, page: number) {
        let c2s = {} as Vo.league.LoadLeagueBossRankC2S;
        c2s.bossConfigId = bossConfigId;
        c2s.page = page;
        this.send(this.MODULE, this.cmds.LOAD_LEAGUE_BOSS_RANK, c2s, c2s);
    }

    /**返回联盟BOSS排行榜 */
    private recLoadLeagueBossRank(data: Vo.league.LoadLeagueBossRankS2C, clientData: Vo.league.LoadLeagueBossRankC2S) {
        if (data.code >= 0) {
            LeagueManager.ins().addLeagueBossRank(data.content);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_RANK_RESP, clientData.bossConfigId);
        }
    }

    /**
     * 推送联盟BOSS挑战结果
     * */
    private pushLeagueBossChallengeResult(data: Vo.league.LeagueBossChallengeVo) {

        LeagueManager.ins().mPlayerLeagueLoginVo.bossChallengeTimes = data.todayChallengeTimes;

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults as Vo.reward.RewardResult[]);
        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.LEAGUE_BOSS,
            exData: data
        } as IBattleResultWinData);
        this.loadStageLeagueBoss();
    }

    /**
     *  推送联盟BOSS阶段更新
     * */
    private pushLeagueBossStageUpdate(bossStage: number) {
        // TODO
        LeagueManager.ins().leagueBossStageInfo.bossStage = bossStage;
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_STAGE_CHANGE);
    }


    /**打开联盟boss排行榜 */
    openLeagueBossRankView(cfg: table.league.LeagueBossConfig) {
        UIManager.ins().open(UILeagueKey.LeagueBossRankView, cfg);
    }

    /**打开联盟boss奖励窗口 */
    openLeagueBossRewardView(cfg: table.league.LeagueBossConfig) {
        UIManager.ins().open(UILeagueKey.LeagueBossRewardView, cfg);
    }

    /**根据 LocalStorage 记录的当前难度和当前难度对比，看是否需要弹出解锁新难度 */
    openNewDifficulty() {
        let localStage = LocalStorage.sys.league.leagueBossStage;
        if (localStage) {

        }
    }

    /**添加联盟赠礼奖励*/
    public addRewardsToLeaugeGift(rewards: Vo.reward.RewardResult[]): void {
        let hasNew: boolean = false;
        let map = LeagueManager.ins().mPlayerLeagueLoginVo.giftMap;
        rewards?.forEach((reward) => {
            let cfg = G.TableManager.getDataById(table.item.ItemConfig, reward.baseId);
            if (cfg && ServerEnums.ItemType[cfg.type] == ServerEnums.ItemType.LEAGUE_GIFT) {
                let giftVo = reward.contents as ILeagueGiftVo;
                if (giftVo) {
                    map[giftVo.id] = giftVo;
                    leagueRedDotCtr.ins().newGiftItem.push(giftVo);
                    hasNew = true;
                }
            }
        });
        if (hasNew) {
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE);
        }
    }


    /******************************************************************* */


    /**联盟宝箱相关************************************************ */

    /**请求领取周任务奖励 */
    public drawWeeklyTaskReward(taskConfigId: number) {
        let c2s = {} as Vo.league.DrawWeeklyTaskRewardC2S;
        c2s.taskConfigId = taskConfigId;
        this.send(this.MODULE, this.cmds.DRAW_WEEKLY_TASK_REWARD, c2s, c2s);
    }

    public recDrawWeeklyTaskReward(data: Vo.league.DrawWeeklyTaskRewardS2C,
        clientData: Vo.league.DrawWeeklyTaskRewardC2S
    ) {
        if (data.code >= 0) {
            //奖励加入背包
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.taskRewardVo.rewardsResult as Vo.reward.RewardResult[]);
            LeagueManager.ins().mPlayerLeagueLoginVo.weeklyDrawLeagueGoldAmount = data.content.weeklyDrawLeagueGoldAmount;

            let taksVo = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.currentTasks.find((vo) => {

                return vo.taskId == data.content.taskRewardVo.taskId;
            });
            taksVo.state = ServerEnums.TaskState.FINISHED;
            LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.finishedTaskIds.push(data.content.taskRewardVo.taskId);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE);
        }
    }

    /**请求领取赠礼
     * giftItemId 服务端下发的唯一id
     */
    public sendGetLeagueGift(giftItemId: number) {
        let c2s = {} as Vo.league.DrawLeagueGiftC2S;
        c2s.leagueGiftId = giftItemId;
        this.send(this.MODULE, this.cmds.DRAW_LEAGUE_GIFT, c2s, c2s);
    }

    public recGetLeagueGift(data: Vo.league.DrawLeagueGiftS2C, clientData: Vo.league.DrawLeagueGiftC2S) {
        if (data.code >= 0) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults as Vo.reward.RewardResult[]);
            //删除赠礼条目
            LeagueManager.ins().deleteLeagueBoxGift(clientData.leagueGiftId);
            LeagueManager.ins().mPlayerLeagueLoginVo.todayGiftDrawDiamondAmount = data.content.leagueGiftDrawDiamondAmount;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_GIFT_CHANGE);
        }
    }

    /**请求送出一个赠礼 */
    public sendLeagueGift(giftItemId: number) {
        let c2s = {} as Vo.league.SendLeagueGiftC2S;
        c2s.giftItemId = giftItemId;
        this.send(this.MODULE, this.cmds.SEND_LEAGUE_GIFT, c2s, c2s);
    }

    public recSendLeagueGift(data: Vo.league.SendLeagueGiftS2C, clientData: Vo.league.SendLeagueGiftC2S) {
        if (data.code >= 0) {
            // G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content as Vo.reward.RewardResult[]);
            LeagueManager.ins().deleteSendLeagueBoxGift(clientData.giftItemId);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE);

            //飘字
            let limitStr = "送出成功";
            GIns.floatingTextMgr.showTips(limitStr);

            // G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_GIFT_CHANGE);
        }
    }

    /**请求打开宝箱 */
    public sendOpenLeagueBox() {

        this.send(this.MODULE, this.cmds.DRAW_LAST_WEEK_LEAGUE_BOX);
    }

    public recOpenLeagueBox(data: Vo.league.DrawLastWeekLeagueBoxS2C) {
        if (data.code >= 0) {
            //奖励加入背包
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content as Vo.reward.RewardResult[]);
            //更新宝箱进度
            LeagueManager.ins().mPlayerLeagueLoginVo.drawLastWeekLeagueBox = true;
            LeagueManager.ins().mLeagueVo.lastWeekBoxLevel = 0;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE);
            //关闭界面
            UIManager.ins().close(UILeagueKey.LeagueBoxRewardView);
        }
    }

    /**联盟宝箱进度更新 */
    public pushLeagueBoxProgress(boxProgress: number) {
        if (LeagueManager.ins().mLeagueVo) {
            LeagueManager.ins().mLeagueVo.leagueBoxProgress = boxProgress;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE);
        }
    }

    /**购买礼包后返回 添加到可送赠列表 */
    public pushLeagueGiftReward(data: Array<Vo.reward.RewardResult>) {
        this.addRewardsToLeaugeGift(data);
    }

    public pushLeagueBoxUpdate(data: Vo.league.LeagueBoxUpdateVo) {
        let mLeagueVo = LeagueManager.ins().mLeagueVo;
        if (mLeagueVo) {
            mLeagueVo.lastWeekBoxLevel = data.lastWeekBoxLevel;
            mLeagueVo.leagueBoxProgress = data.leagueBoxProgress;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE);
        }
        // G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOX_UPDATE_CHANGE);
    }

    /**推送联盟boss死亡 */
    public pushLeagueBossDead(data: Vo.league.LeagueBossDeadVo): void {
        if (!LeagueManager.ins().leagueBossStageInfo) return;

        let bossVos = LeagueManager.ins().leagueBossStageInfo.bossVos;
        bossVos.forEach(bossVo => {
            if (bossVo.bossConfigId == data.bossConfigId) {
                bossVo.bossTotalBeHurt = data.bossTotalBeHurt;
                bossVo.bossTotalHp = data.bossTotalHp;
                bossVo.killTime = data.killTime;
            }
        });
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_BOSS_KILL);
    }

    /**推送发送联盟邀请 */
    public pushSendLeagueInvite(todayInviteTimes: number): void {
        let mLeagueVo = LeagueManager.ins().mLeagueVo;
        if (mLeagueVo) {
            mLeagueVo.todayInviteTimes = todayInviteTimes;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_INVITE_CHANGE);
        }
    }


    /**
     * 推送砍价活动开始,LeagueBargainStartVo
     * 模块号：37	指令号：-25
     */
    public pushBargainStart(resp: Vo.league.LeagueBargainStartVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this._bargainContext.onRespStart(resp);
    }

    /**
     * 推送砍价礼包折扣更新,LeagueBargainGiftUpdateVo
     * 模块号：37	指令号：-26
     */
    public pushBargainGiftUpdate(resp: Vo.league.LeagueBargainGiftUpdateVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this._bargainContext.onUpdate(resp);
    }

    /**
     * 推送砍价礼包购买,成员ID
     * 模块号：37	指令号：-27
     */
    public pushBargainGiftBuy(memberId: number): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        // const data = GIns.LeagueManager.getLeaguePlayerDataByMemberId(memberId)
        this._bargainContext.onOtherBuy(memberId);
    }

    /**
     * 推送砍价CD时间,砍价CD时间
     * 模块号：37	指令号：-28
     */
    public pushBargainLimitTime(limitTimeMs: number): void {
        //TODO 推送消息-在这里处理服务端返回的数据

        this._bargainContext.onUpdateLimitTimeMs(limitTimeMs)
    }

    /**更新可领取赠礼条目 */
    public pushLeagueGift(data: Vo.league.LeagueGiftVo) {
        let map = LeagueManager.ins().mLeagueVo.leagueGiftVoMap;
        map[data.id] = data;
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_GIFT_CHANGE);
    }

    public pushWeeklyTaskReset(data: Vo.league.LeagueWeeklyTaskResetVo) {

        LeagueManager.ins().mPlayerLeagueLoginVo.weeklyDrawLeagueGoldAmount = data.weeklyDrawLeagueGoldAmount;
        let currentTasks = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.currentTasks;
        let finishedTaskIds = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.finishedTaskIds;
        //移除任务
        const taskRemovedVo = data.taskRemovedVo;
        if (taskRemovedVo) {

            for (let i = currentTasks.length - 1; i >= 0; i--) {
                const task = currentTasks[i];
                if (taskRemovedVo.currentTaskIds.indexOf(task.taskId) != -1) {
                    currentTasks.splice(i, 1);

                } else {
                    task.progress = 0;
                    task.state = ServerEnums.TaskState.IN_PROGRESS;
                }

            }

            if (taskRemovedVo.finishedTaskIds.length > 0) {
                for (let i = finishedTaskIds.length - 1; i >= 0; i--) {
                    const taskId = finishedTaskIds[i];
                    if (taskRemovedVo.finishedTaskIds.indexOf(taskId) != -1) {
                        finishedTaskIds.splice(i, 1);

                    }
                }
            }

        }

        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE);
    }

    /**
     * 推送退出联盟取消未完成的周常任务,取消的周常任务ID列表
     */
    public pushCancelWeeklyTask(data: number[]) {
        //任务进度重置
        let currentTasks = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.currentTasks;
        for (let i = currentTasks.length - 1; i >= 0; i--) {
            const task = currentTasks[i];
            if (data.indexOf(task.taskId) != -1) {
                // task.progress = 0;
                currentTasks.splice(i, 1);
                break;
            }
        }
        // G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE);
    }


    /***************************************************************** */


    /**
     * 获取联盟信息
     */
    public loadLeagueInfo() {
        // let c2s = {} as Vo.league.LoadLeagueInfoC2S;
        this.send(this.MODULE, 1);
    }

    /**
     * 返回联盟信息
     */
    private recLeagueInfo(data: Vo.league.LoadLeagueInfoS2C) {
        // TODO
        const content = data.content;
        LeagueManager.ins().mLeagueVo = content;

        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_INFO_CHANGE);

        if (this.getLeagueId() > 0) {
            //获取砍价信息
            this.onLeagueChange0();
        }
    }


    /**
     * 获取联盟列表
     * @param page 页码 从1开始
     */
    public loadLeagueList(page: number) {
        let c2s = {} as Vo.league.LoadLeagueListC2S;
        c2s.page = page;

        if (page == 1) {
            LeagueManager.ins().serverLeagueList = [];
        }

        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 返回联盟列表
     */
    private recLeagueList(data: Vo.league.LoadLeagueListS2C) {
        // TODO PageRes  LeagueBriefVo
        let vo: Vo.common.PageRes = data.content as Vo.common.PageRes;
        LeagueManager.ins().serverLeagueListPageRes = vo;
        if (vo) {
            if (vo.curPage == 1) {
                LeagueManager.ins().serverLeagueList = [];
            }
            if (vo.data) {

                LeagueManager.ins().addLeagueListVo(vo.data);
                G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_LIST_CHANGE);

            }

        }
    }

    /**
     * 查找联盟 通过名字或者id
     */
    public searchLeague(name: string, page = 1): void {
        name = name.trim();
        //空字符
        if (name == "") {
            let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot);
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }
        //获取联盟名字最大数字
        let maxLen = this.getLeagueNameMaxLen();
        //判断是否纯数字
        if (/^\d+$/.test(name) && name.length > maxLen) {
            let c2s = {} as Vo.league.SearchLeagueByIdC2S;
            c2s.leagueId = LongForNetwork.fromNumber(Number(name));
            this.send(this.MODULE, this.cmds.SEARCH_LEAGUE_BY_ID, c2s);

        } else {
            let c2s = {} as Vo.league.SearchLeagueByNameC2S;
            let maxLen = this.getLeagueNameMaxLen();
            c2s.name = name.slice(0, maxLen);
            c2s.page = page;
            this.send(this.MODULE, this.cmds.SEARCH_LEAGUE_BY_NAME, c2s);
        }
    }

    /**
     * 返回联盟列表
     */
    private recSearchLeagueByName(data: Vo.league.SearchLeagueByNameS2C) {
        // TODO 
        let vo: Vo.common.PageRes = data.content as Vo.common.PageRes;
        LeagueManager.ins().serverLeagueListPageRes = vo;


        if (vo) {
            if (vo.curPage == 1) {
                LeagueManager.ins().serverLeagueList = [];
            }
            if (vo.data) {

                LeagueManager.ins().addLeagueListVo(vo.data);
                G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_LIST_CHANGE);

            }

        }
    }

    /**
     * 返回联盟列表
     */
    private recSearchLeagueById(data: Vo.league.SearchLeagueByIdS2C) {
        // TODO
        this.recSearchLeague({ content: [data.content], code: data.code });
    }

    //搜索返回
    private recSearchLeague(vo: {
        content: Vo.league.LeagueBriefVo[],
        code: number
    }) {
        LeagueManager.ins().serverLeagueList = [];
        LeagueManager.ins().serverLeagueListPageRes = null;
        // 没找到
        if (vo.code < 0) {
            // let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNotFind);
            // GIns.floatingTextMgr.showTips(limitStr);
            return;
        } else {

            LeagueManager.ins().addLeagueListVo(vo.content);

        }
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_LIST_CHANGE);
    }

    /**
     * 根据id查看联盟成员列表
     * cmd = 5
     */
    public viewLeagueInfoById(leagueId: number,
        callback: (data: Vo.league.LeagueViewVo) => void = null
    ) {
        let c2s = {} as Vo.league.ViewLeagueInfoC2S;
        c2s.leagueId = leagueId;
        this.send(this.MODULE, 5, c2s, callback);
    }

    /**
     * 返回联盟成员列表
     * cmd = 5
     */
    private recViewLeagueMemberList(resp: Vo.league.ViewLeagueInfoS2C,
        callback: (data: Vo.league.LeagueViewVo) => void = null
    ) {
        // TODO
        // LeagueManager.ins().mLeagueMemberList = data.content;
        if (resp.code >= 0) {
            const content = resp.content;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_INFO_BY_ID, content);

            if (callback) {
                callback(content)
            }
        }
    }

    /**
     * 创建联盟
     */
    public createLeague(name: string, icon: number, banner: number) {

        if (!name) {
            let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot2);
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }

        //检查消耗
        let cost = this.getCreateLeagueCost();
        let costItem = NoOwnerItem.create(cost.itemId, cost.count);
        let isCanPay = BackpackManager.ins().isCanPayItem(costItem, true);
        if (isCanPay) {
            let c2s = {} as Vo.league.CreateLeagueC2S;
            c2s.name = name;
            c2s.icon = icon;
            c2s.banner = banner;
            this.send(this.MODULE, this.cmds.CREATE_LEAGUE, c2s);
        }

    }

    /**
     * 返回创建联盟
     */
    private recCreateLeague(data: Vo.league.CreateLeagueS2C) {
        if (data.code >= 0) {
            // 消耗弹窗
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults as Vo.cost.CostItemResult[]);

            let vo = data.content.leagueVo;
            let pvo = LeagueManager.ins().mPlayerLeagueLoginVo;
            //你就是盟主啦
            if (!pvo) {
                pvo = {} as Vo.league.PlayerLeagueLoginVo;
            }
            pvo.applyLeagueIds = [];

            pvo.jobType = ServerEnums.LeagueJobType.LEADER;
            pvo.leagueId = vo.leagueId;
            pvo.active = vo.active;

            LeagueManager.ins().mPlayerLeagueLoginVo = pvo;
            LeagueManager.ins().mLeagueVo = data.content.leagueVo;
            LeagueManager.ins().addLeagueListVo([vo]);
            this.loadLeagueMemberList();

            // 创建成功
            G.FacadeManager.emit(NotificationKey.EVENT_HAVE_LEAGUE);
            //关闭创建联盟界面
            G.UIManager.close(UILeagueKey.LeagueCreateView);

            this.onLeagueChange0();
        }

    }

    /**
     * 获取联盟成员列表
     */
    public loadLeagueMemberList() {
        this.send(this.MODULE, this.cmds.LOAD_LEAGUE_MEMBER_LIST);

    }

    /**
     * 返回联盟成员列表
     */

    private recLoadLeagueMemberList(data: Vo.league.LoadLeagueMemberListS2C) {
        // 成员列表
        LeagueManager.ins().mLeagueMemberList = data.content;
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE);
    }

    private getRenameLeagueCoolTime(): number {
        let timeStr = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueRenameCoolDown).content;
        return Number(timeStr);

    }

    private getLeagueChangeBannerCoolTime(): number {
        let timeStr = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueChangeBannerCoolDown).content;
        return Number(timeStr);

    }

    /**
     * 修改联盟名称
     */

    public changeLeagueName(name: string) {

        //冷却时间
        if (!this.checkChangeNameCool()) {
            return;
        }
        //空字符
        if (name == "") {
            let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot2);
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }


        //消耗检查
        let cost = this.getChangeLeagueNameCost();
        let costItem = NoOwnerItem.create(cost.itemId, cost.count);
        let isCanPay = BackpackManager.ins().isCanPayItem(costItem, true);
        if (isCanPay) {
            let c2s = {} as Vo.league.ChangeLeagueNameC2S;
            c2s.name = name;
            this.send(this.MODULE, this.cmds.CHANGE_LEAGUE_NAME, c2s, c2s);
        }

    }

    /**
     * 返回修改联盟名称
     */

    private recChangeLeagueName(data: Vo.league.ChangeLeagueNameS2C, clientData: Vo.league.ChangeLeagueNameC2S) {
        if (data.code >= 0) {
            // 消耗
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content as Vo.cost.CostItemResult[]);
            // 修改登录信息
            let myLeague = LeagueManager.ins().mLeagueVo;
            myLeague.name = clientData.name;
            //关闭窗口
            UIManager.ins().close(UILeagueKey.LeagueNewNameView);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_NAME_CHANGE);
            let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_changeTips);
            GIns.floatingTextMgr.showTips(limitStr);
        }
    }

    /**
     * 修改联盟旗帜
     */
    public changeLeagueBanner(icon: number, banner: number) {
        if (!this.checkChangeBannerCool()) {
            return;
        }
        //消耗检查
        let cost = this.getChangeLeagueBannerCost();
        let costItem = NoOwnerItem.create(cost.itemId, cost.count);
        let isCanPay = BackpackManager.ins().isCanPayItem(costItem, true);
        if (isCanPay) {
            let c2s = {} as Vo.league.ChangeLeagueBannerC2S;
            c2s.banner = banner;
            c2s.icon = icon;
            this.send(this.MODULE, this.cmds.CHANGE_LEAGUE_BANNER, c2s, c2s);
        }
    }

    /**
     * 返回修改联盟旗帜
     */
    private recChangeLeagueBanner(data: Vo.league.ChangeLeagueBannerS2C, clientData: Vo.league.ChangeLeagueBannerC2S) {
        //消耗
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content as Vo.cost.CostItemResult[]);

        // 修改登录信息
        let myLeague = LeagueManager.ins().mLeagueVo;
        myLeague.icon = clientData.icon;
        myLeague.banner = clientData.banner;
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE);
        //关闭
        UIManager.ins().close(UILeagueKey.LeagueFlagSelectView);
        //飘字
        let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_changeTips);
        GIns.floatingTextMgr.showTips(limitStr);
    }

    /**
     * 发送联盟邮件
     */
    public sendLeagueEmail(content: string) {

        //空字符
        if (content == "") {
            let limitStr = "请输入邮件内容！";
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }

        //判断次数
        let cost = this.getChangeLeagueMailCost();
        let myLeague = LeagueManager.ins().mLeagueVo;
        if (myLeague.weekEmailTimes >= cost) {
            let limitStr = "本周发送次数已用完";
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }


        let c2s = {} as Vo.league.SendLeagueEmailC2S;
        c2s.content = content;
        this.send(this.MODULE, this.cmds.SEND_LEAGUE_EMAIL, c2s);
    }

    /**
     * 返回发送联盟邮件
     */
    private recSendLeagueEmail(data: Vo.league.SendLeagueEmailS2C) {
        if (data.code >= 0) {
            //加次数
            let myLeague = LeagueManager.ins().mLeagueVo;
            myLeague.weekEmailTimes++;
            // 关闭窗口
            UIManager.ins().close(UILeagueKey.LeagueMailView);

            //发送成功提示
            let limitStr = "发送成功"
            GIns.floatingTextMgr.showTips(limitStr);
        }
    }

    /**
     * 修改联盟公告
     */
    public changeLeagueNotice(notice: string) {
        //空字符
        if (notice == "") {
            let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot2);
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }

        //消耗检查
        // let cost = this.getChangeLeagueNoticeCost();
        //  let myLeague = LeagueManager.ins().mLeagueVo;
        // if (cost > myLeague.weekEmailTimes) {


        let c2s = {} as Vo.league.ChangeLeagueNoticeC2S;
        c2s.content = notice;
        this.send(this.MODULE, this.cmds.CHANGE_LEAGUE_NOTICE, c2s);
        // }
        // else {
        //     let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot);
        //     GIns.floatingTextMgr.showTips(limitStr);

        // }
    }

    /**
     * 返回修改联盟公告
     */
    private recChangeLeagueNotice(data: Vo.league.ChangeLeagueNoticeS2C) {
        // TODO
    }

    /**
     * 申请加入联盟
     */
    public applyJoinLeague(type: number, leagueId: number) {

        if (this.canJoinLeague()) {

            let c2s = {} as Vo.league.ApplyJoinLeagueC2S;
            c2s.leagueId = leagueId;

            // apply join
            this.send(this.MODULE, 12, c2s, [type, c2s]);
        }
    }

    /**
     * 返回申请加入联盟
     */
    private recApplyJoinLeague(data: Vo.league.ApplyJoinLeagueS2C, clientData: any[]) {
        if (data.code >= 0) {
            let c2s = clientData[1] as Vo.league.ApplyJoinLeagueC2S;
            if (!LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds) {
                LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds = [];
            }
            // 加入申请列表
            //判断是否已经申请过
            let isHave = LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds.indexOf(c2s.leagueId) != -1;
            if (!isHave) {
                LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds.push(c2s.leagueId);
                G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_LIST_CHANGE);

                //true-加入成功,false-等待审核
                if (data.content) {
                    GIns.floatingTextMgr.showTips("成功加入联盟");

                    this.onLeagueChange0();

                } else {
                    GIns.floatingTextMgr.showTips("申请成功");
                }
            }
        }

    }

    /**
     * 获取联盟申请列表
     */
    public loadLeagueApply() {
        let hasPe = this.hasPermission(LeagueManager.ins().mPlayerLeagueLoginVo.jobType, ServerEnums.LeaguePermissionType.APPLY_APPROVAL);
        if (hasPe) {
            this.send(this.MODULE, this.cmds.LOAD_LEAGUE_APPLY);
        }
    }

    /**
     * 返回联盟申请列表
     */
    private recLoadLeagueApply(data: Vo.league.LoadLeagueApplyS2C) {
        // TODO
        LeagueManager.ins().applyPlayers = data.content;
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_apply_LIST);
        //  this.checkApplyRedDot();
    }

    /**
     * 审批联盟申请
     */
    public approvalLeagueApply(applyId: number, isAgree: boolean) {
        let c2s = {} as Vo.league.ApprovalLeagueApplyC2S;
        c2s.applyId = applyId;
        c2s.agree = isAgree;
        this.send(this.MODULE, this.cmds.APPROVAL_LEAGUE_APPLY, c2s, c2s);
    }

    /**
     * 返回审批联盟申请
     */
    private recApprovalLeagueApply(data: Vo.league.ApprovalLeagueApplyS2C,
        clientData: Vo.league.ApprovalLeagueApplyC2S
    ) {
        // TODO
        if (data.code >= 0) {
            //审批成功
            this.loadLeagueApply();
            if (clientData.agree) {
                let tips = G.I18nManager.lang(I18LeagueKey.i18n_league_agreet);
                GIns.floatingTextMgr.showTips(tips);
            }
        }
    }

    /**
     * 一键同意联盟申请
     */
    public oneKeyAgree() {

        //看看是不是空列表
        if (LeagueManager.ins().applyPlayers.length == 0) {
            let tips = "暂无匹配的申请选项";
            GIns.floatingTextMgr.showTips(tips);
            return;
        }

        this.send(this.MODULE, this.cmds.ONE_KEY_AGREE);
    }

    /**
     * 返回一键同意联盟申请
     */
    private recOneKeyAgree(data: Vo.league.OneKeyAgreeS2C) {
        // TODO
        if (data.code >= 0) {
            //看看有没有最新的
            this.loadLeagueApply();
            GIns.floatingTextMgr.showTips("操作成功");

        }
    }

    /**
     * 修改联盟自动审批设置
     */
    public changeAutoAccept(isAutoAccept: boolean) {
        let c2s = {} as Vo.league.ChangeAutoAcceptC2S;
        c2s.autoAccept = isAutoAccept;
        this.send(this.MODULE, this.cmds.CHANGE_AUTO_ACCEPT, c2s, c2s);
    }

    /**
     * 返回修改联盟自动审批设置
     */
    private recChangeAutoAccept(data: Vo.league.ChangeAutoAcceptS2C, clientData: Vo.league.ChangeAutoAcceptC2S) {
        if (data.code >= 0) {
            let myLeague = LeagueManager.ins().mLeagueVo;
            myLeague.autoAccept = clientData.autoAccept;
            //看看列表里有没有变化
            this.loadLeagueApply();
            // G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_INFO_CHANGE);
        }


    }

    /**
     * 任命联盟成员职位
     */
    public memberAppoint(memberId: number, memberName: string, jobType: number) {
        let jobStr = ""// jobType == ServerEnums.LeagueJobType.DEPUTY_LEADER ? "副盟主" : "普通成员";
        if (jobType == ServerEnums.LeagueJobType.DEPUTY_LEADER) {
            jobStr = "副盟主"
        } else if (jobType == ServerEnums.LeagueJobType.MEMBER) {
            jobStr = "普通成员"
        } else {
            jobStr = "盟主"
        }
        let content = G.I18nManager.lang(I18LeagueKey.i18n_league_job, memberName, jobStr);
        //二次确认
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            title: null,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            content: content,
            onBtnYes: () => {
                let c2s = {} as Vo.league.MemberAppointC2S;
                c2s.memberId = memberId;
                c2s.jobType = jobType;
                this.send(this.MODULE, this.cmds.MEMBER_APPOINT, c2s, c2s);
            },
            closeCb: () => {
                G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE);
            }
        } as BtnConfirmViewOpenArgs);


    }

    /**
     * 返回任命联盟成员职位
     */
    private recMemberAppoint(data: Vo.league.MemberAppointS2C, clientData: Vo.league.MemberAppointC2S) {
        // 成功后改变
        if (data.code >= 0) {
            let data = LeagueManager.ins().mLeagueMemberList.find((vo) => {
                return vo.id == clientData.memberId;
            });
            if (data) {
                data.jobType = clientData.jobType;
            }

        }
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE);
    }

    /**
     * 移除联盟成员
     */
    public removeMember(memberId: number, name: string) {
        let content = G.I18nManager.lang(I18LeagueKey.i18n_league_kickOut, name);
        //二次确认
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            title: null,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            content: content,
            onBtnYes: () => {
                let c2s = {} as Vo.league.RemoveMemberC2S;
                c2s.memberId = memberId;
                this.send(this.MODULE, this.cmds.REMOVE_MEMBER, c2s, c2s);
            }
        } as BtnConfirmViewOpenArgs);

    }

    /**
     * 返回移除联盟成员
     */
    private recRemoveMember(data: Vo.league.RemoveMemberS2C, clientData: Vo.league.RemoveMemberC2S) {
        // 成功
        if (data.code >= 0) {
            //移除
            let index = LeagueManager.ins().mLeagueMemberList.findIndex((vo) => {
                return vo.id == clientData.memberId;
            });
            if (index != -1) {
                LeagueManager.ins().mLeagueMemberList.splice(index, 1);
            }
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE);
        }
    }

    /**
     * 邀请玩家加入联盟
     */
    public chatInvite(content: string) {
        let c2s = {} as Vo.league.ChatInviteC2S;
        c2s.content = content;
        this.send(this.MODULE, this.cmds.CHAT_INVITE, c2s);
    }

    /**
     * 返回邀请玩家加入联盟
     */
    private recChatInvite(data: Vo.league.ChatInviteS2C) {
        if (data.code >= 0) {
            // TODO
            //消耗
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content as Vo.cost.CostItemResult[]);
            // 关闭窗口
            this.emit(NotificationKey.EVENT_LEAGUE_INVITE_COMPLETE)
        }
    }

    /**
     * 退出联盟
     */
    public quitLeague() {
        //退出联盟再次加入时间间隔配置
        let timeCfg = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueExitCoolMinutes).content;
        let time = Number(timeCfg) * 60 * 1000;
        //转成小时或分钟
        let timeStr = TimeUtils.formatTimeMsHourOrmin(time);
        let content = G.I18nManager.lang(I18LeagueKey.i18n_league_quit, timeStr);

        //二次确认
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            title: null,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            content: content,
            onBtnYes: () => {
                this.sendQuitLeague();
            }
        } as BtnConfirmViewOpenArgs);


    }

    private sendQuitLeague() {
        this.send(this.MODULE, 20);
    }

    /**
     * 返回退出联盟
     */
    private recQuitLeague(data: Vo.league.QuitLeagueS2C) {
        // 主动退出成功
        if (data.code >= 0) {
            LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds = [];
            LeagueManager.ins().mPlayerLeagueLoginVo.leagueId = null;
            // 不知道为什么没有清空数据, 但时间紧急, 先把联盟等级 = 0
            if (LeagueManager.ins().mLeagueVo) {
                LeagueManager.ins().mLeagueVo.level = 0;
                LeagueManager.ins().mLeagueVo.leagueId = 0;
            }


            // G.FacadeManager.emit(NotificationKey.EVENT_EXIT_LEAGUE); //走 pushQuitLeague
            //关闭联盟中心
            // UIManager.ins().close(UILeagueKey.LeagueCenterView); //走 pushQuitLeague

            // clean league message
            // GIns.chatModel.context.clearLeagueMessage(); //走 pushQuitLeague
        }
    }

    /**
     * 领取联盟挑战任务
     */
    public drawChallengeTask(taskId: number) {
        //已领取的飘字
        let myLeague = LeagueManager.ins().mPlayerLeagueLoginVo;
        let isHave = myLeague.drawChallengeTaskIds.indexOf(taskId) != -1;
        if (isHave) {
            // let limitStr = G.I18nManager.lang(I18LeagueKey.i18n_league_wordNot2);
            // GIns.floatingTextMgr.showTips(limitStr);
            return;
        }
        let c2s = {} as Vo.league.DrawChallengeTaskC2S;
        c2s.taskId = taskId;
        this.send(this.MODULE, this.cmds.DRAW_CHALLENGE_TASK, c2s, c2s);
    }

    /**
     * 返回领取联盟挑战任务
     */
    private recDrawChallengeTask(data: Vo.league.DrawChallengeTaskS2C, clientData: Vo.league.DrawChallengeTaskC2S) {
        // 显示奖励，更改登录数据
        if (data.code >= 0) {
            // 消耗
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content as Vo.cost.CostItemResult[]);
            // 更改登录数据
            let myLeague = LeagueManager.ins().mPlayerLeagueLoginVo;
            myLeague.drawChallengeTaskIds.push(clientData.taskId);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE);
        }

    }

    /**打开已完成的挑战任务列表*/
    public openLeagueCompletedList(taskId: number) {
        //查看有没有完成的
        let vo = LeagueManager.ins().mLeagueVo.challengeTaskVos;
        let taskVo = vo.find((value) => {
            return value.taskId == taskId;
        });
        if (taskVo && taskVo.progress) {
            UIManager.ins().open(UILeagueKey.LeagueCompletedList, taskId);
        } else {
            GIns.floatingTextMgr.showTips(`暂无玩家完成`);
        }
    }

    /**
     * 查看挑战任务成员列表
     */
    public viewChallengeTaskMember(taskId: number) {
        let c2s = {} as Vo.league.ViewChallengeTaskMemberC2S;
        c2s.taskId = taskId;
        this.send(this.MODULE, this.cmds.VIEW_CHALLENGE_TASK_MEMBER, c2s);
    }

    /**
     * 返回查看挑战任务成员列表
     */
    private recViewChallengeTaskMember(data: Vo.league.ViewChallengeTaskMemberS2C) {
        if (data.code >= 0) {
            // 抛事件


            G.FacadeManager.emit(NotificationKey.EVENT_TASK_COMPLETE_MEMBER_LIST, data.content);
        }
    }

    /**
     * 升级联盟科技
     */
    public upgradeLeagueTech(career: number, slotId: number) {

        //检查效果
        let cfg = this.getLeagueTechCfg(career, slotId);
        let level = cfg ? cfg.level : 0;
        let nextLvCfg = this.getLeagueTechCfg(career, slotId, level + 1);
        if (nextLvCfg) {
            let cost = nextLvCfg.costItems;
            let noOwnerItem = NoOwnerItem.createByConfigKv(cost[0]);
            let isCanPay = BackpackManager.ins().isCanPayItem(noOwnerItem, true);
            if (!isCanPay) {

                return;
            }
        }

        let c2s = {} as Vo.league.UpgradeLeagueTechC2S;
        c2s.career = career;
        c2s.slotId = slotId;
        this.send(this.MODULE, this.cmds.UPGRADE_LEAGUE_TECH, c2s, c2s);
    }

    protected _updateHeroTimerKey: string = null

    /**
     * 返回升级联盟科技
     */
    private recUpgradeLeagueTech(data: Vo.league.UpgradeLeagueTechS2C, clientData: Vo.league.UpgradeLeagueTechC2S) {
        // TODO
        if (data.code >= 0) {

            //消耗
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults as Vo.cost.CostItemResult[]);
            let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;

            let vo = loginVo.leagueTechVos.find((vo) => {
                return vo.career == clientData.career && vo.slotId == clientData.slotId;
            })
            if (!vo) {
                vo = {} as Vo.league.LeagueTechVo;
                vo.career = clientData.career;
                vo.slotId = clientData.slotId;
                loginVo.leagueTechVos.push(vo);
            }

            vo.level = data.content.techVo.level;

            //属性变更
            //HeroController.ins().updateAllHeroFight();
            //FightManager.ins().getFightByDefault()
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_TECHNOLOGY_UPGRADE);


            //延时更新角色战力 防止频繁更新卡顿
            if (this._updateHeroTimerKey) {
                G.GameTimer.clearByKey(this._updateHeroTimerKey)
                this._updateHeroTimerKey = null
            }
            this._updateHeroTimerKey = G.GameTimer.once(1000, this, () => {
                this._updateHeroTimerKey = null
                G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
            })

        }
    }


    /**
     * 获取联盟砍价信息
     * 模块号：37	指令号：32
     */
    public recLoadLeagueBargainInfo(data: Vo.league.LoadLeagueBargainInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据

        this._bargainContext.reset(data.content);

    }

    /**
     * 礼包砍价,返回最后一次砍价时间
     * 模块号：37	指令号：33
     */
    public recBargainGift(data: Vo.league.BargainGiftS2C): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据


        const lastBargainTimeMs = data.content;
        this._bargainContext.updateLastBargainTime(lastBargainTimeMs);

    }

    /**
     * 购买砍价礼包
     * 模块号：37	指令号：34
     */
    public recBuyBargainGift(data: Vo.league.BuyBargainGiftS2C): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据

        const content = data.content;
        this._bargainContext.onBuy(content);

        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, content.costItemResults);
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, content.rewardResults);


    }

    /**
     * 加载砍价玩家信息
     * 模块号：37	指令号：35
     */
    public recLoadBargainMemberInfo(data: Vo.league.LoadBargainMemberInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        //TODO 在这里处理服务端返回的数据
        const content = data.content;

        this._bargainContext.onUpdateBargainInfo(content);

    }

    /**
     * 
     * 模块号：37	指令号：36
     */
    public recAddAdvertBossCount(data: Vo.league.AddAdvertBossCountS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            LeagueManager.ins().mPlayerLeagueLoginVo.bossAdvertChallengeTimes = data.content.bossAdvertChallengeTimes;
            this.emit(NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE);
        }
    }

    /**
     * 推送联盟名称变更
     */
    private pushLeagueNameChange(data: Vo.league.LeagueChangeNameVo) {

        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            vo.name = data.name;
            vo.lastChangeNameTime = data.lastChangeNameTime;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_NAME_CHANGE);

            this.onLeagueChange0();
        }
    }

    onLeagueChange0() {
        G.GameTimer.once(1000, this, () => {
            // 砍价
            GIns.LeagueBargainManager.sendLoadInit();
        });
    }

    /**
     * 推送联盟旗帜变更
     */
    private pushLeagueBannerChange(data: Vo.league.LeagueBannerChangeVo) {
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            vo.banner = data.banner;
            vo.icon = data.icon;
            vo.lastChangeIconTime = data.lastChangeIconTime;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE);
        }
    }

    /**
     * 推送联盟公告变更
     */
    private pushLeagueNoticeChange(data: Vo.league.LeagueNoticeChangeVo) {
        // 改变公告并推送
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            vo.notice = data.notice;

            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_NOTICE_CHANGE);
        }

    }

    /**
     * 推送发送联盟邮件
     */
    private pushSendLeagueEmail(data: Vo.league.SendLeagueEmailS2C) {
        // TODO

    }

    /**
     * 推送加入联盟
     */
    private pushJoinLeague(leagueId: number) {
        // TODO
        LeagueManager.ins().mPlayerLeagueLoginVo.leagueId = leagueId;
        LeagueManager.ins().mPlayerLeagueLoginVo.jobType = ServerEnums.LeagueJobType.MEMBER;
        //申请列表删除
        LeagueManager.ins().mPlayerLeagueLoginVo.applyLeagueIds = []

        this.loadLeagueInfo();
        // 加入成功
        G.FacadeManager.emit(NotificationKey.EVENT_HAVE_LEAGUE);

        this.onLeagueChange0();
    }

    /**
     * 推送成员任命
     */
    private pushMemberAppoint(data: Vo.league.LeagueJobChangeVo[]) {

        // 任命成功
        for (let i = 0; i < data.length; i++) {
            let jobVo = data[i];
            let findVo = LeagueManager.ins().mLeagueMemberList.find((vo) => {
                return vo.id == jobVo.memberId;
            });
            if (findVo && findVo.id == PlayerModel.ins().Vo.id) {
                // 自己被任命了
                LeagueManager.ins().mPlayerLeagueLoginVo.jobType = jobVo.jobType;

            }
        }
        this.loadLeagueMemberList();
        let hasPermission = this.hasPermission(LeagueManager.ins().mPlayerLeagueLoginVo.jobType, ServerEnums.LeaguePermissionType.APPLY_APPROVAL);
        if (hasPermission) {
            this.loadLeagueApply();
        }
        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_JOB_CHANGE);
    }

    /**
     * 推送移除成员
     */
    private pushRemoveMember(data: Vo.league.RemoveMemberC2S) {
        let vo = LeagueManager.ins().mLeagueVo;
        if (!vo) {
            return;
        }
        // 其他人被踢了 从联盟成员列表中移除
        let index = LeagueManager.ins().mLeagueMemberList.findIndex((vo) => {
            return vo.id == data.memberId;
        });
        if (index >= 0) {
            LeagueManager.ins().mLeagueMemberList.splice(index, 1);
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE);
        }

        FacadeManager.ins().emit(NotificationKey.LEAGUE_MEMBER_COUNT_CHANGE);
    }

    /**被踢了，关闭所有窗口 */
    private closeAll() {
        //关闭联盟中心
        UIManager.ins().close(UILeagueKey.LeagueCenterView);
        //关闭联盟成员列表
        UIManager.ins().close(UILeagueKey.LeagueMemberMgrView);
        //关闭联盟申请列表
        UIManager.ins().close(UILeagueKey.LeagueApplyListView);
        //关闭联盟邮件
        UIManager.ins().close(UILeagueKey.LeagueMailView);
        //关闭联盟邀请
        UIManager.ins().close(UILeagueKey.LeagueInviteView);
    }

    /**
     * 推送联盟等级信息变更
     */
    private pushLeagueLevelInfoChange(data: Vo.league.LeagueLevelInfoChangeVo) {

        // 联盟等级以及活跃度推送
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            vo.level = data.level;
            vo.active = data.active;
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_INFO_CHANGE);
        }
    }

    /**
     * 推送联盟成员加入
     *
     * 37 / -9
     */
    private pushLeagueMemberJoin(memberId: number) {
        if (memberId) {
            // 有人加入了
            let vo = LeagueManager.ins().mLeagueVo;
            if (vo) {
                vo.memberCount++;
                this.loadLeagueMemberList();


                FacadeManager.ins().emit(NotificationKey.LEAGUE_MEMBER_COUNT_CHANGE);

                this.onLeagueChange0();
            }

        }
    }

    /**
     * 推送联盟拒绝申请
     */
    private pushLeagueRejectApply(leagueId: number) {
        //从申请列表中移除
        let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
        if (vo) {
            let index = vo.applyLeagueIds.indexOf(leagueId);
            if (index >= 0) {
                vo.applyLeagueIds.splice(index, 1);
                G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_PUSH_APPROVAL);
            }
        }

    }

    /**
     * 推送联盟申请列表变更
     */
    private pushLeagueApplyListChange(data: any) {
        // TODO
        this.loadLeagueApply();
    }

    /**
     * 推送退出联盟
     */
    private pushQuitLeague(kicked: boolean) {
        // 我被踢或者主动退出

        this.closeAll();

        GIns.chatModel.context.clearLeagueMessage();

        LeagueManager.ins().mPlayerLeagueLoginVo.leagueId = null;
        if (!kicked)
            LeagueManager.ins().mPlayerLeagueLoginVo.exitTime = G.TimeManager.serverNow;
        LeagueManager.ins().mLeagueVo!.leagueId = null;

        G.FacadeManager.emit(NotificationKey.EVENT_EXIT_LEAGUE);
    }

    /**
     * 推送联盟自动审批设置变更
     */
    private pushLeagueAutoAcceptChange(autoAccept: boolean) {
        // 变更自动审批
        let vo = LeagueManager.ins().mLeagueVo;
        vo.autoAccept = autoAccept;
        //看看列表里有没有变化

        this.loadLeagueApply();


    }

    /**
     * 推送更新挑战任务
     */
    private pushUpdateChallengeTask(data: Vo.league.LeagueChallengeTaskVo[]) {
        // TODO
        if (!LeagueManager.ins().mLeagueVo) {
            LeagueManager.ins().mLeagueVo = {} as Vo.league.LeagueVo;
            LeagueManager.ins().mLeagueVo.level = 1;
            LeagueManager.ins().mLeagueVo.challengeTaskVos = [];
        }
        let challengeTaskVos = LeagueManager.ins().mLeagueVo.challengeTaskVos;
        data.forEach((item) => {
            let index = challengeTaskVos.findIndex((vo) => {
                return vo.taskId == item.taskId;
            });
            if (index >= 0) {
                challengeTaskVos[index].finished = item.finished;
                challengeTaskVos[index].progress = item.progress;
            } else {
                challengeTaskVos.push(item);
            }
        });


        G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE);
    }

    /**
     * 是否有联盟
     */

    public hasLeague(): boolean {
        let vo = LeagueManager.ins().mLeagueVo;
        let vo2 = LeagueManager.ins().mPlayerLeagueLoginVo;
        if (vo2 && vo2.leagueId) {
            return true;
        }
        if (vo && vo.leagueId && vo.level) {
            return true;
        }

        return false;
    }

    /**获取联盟id*/
    public getLeagueId(): number {
        if (this.hasLeague()) {
            if (LeagueManager.ins().mPlayerLeagueLoginVo) {
                return LeagueManager.ins().mPlayerLeagueLoginVo.leagueId;
            }
            return LeagueManager.ins().mLeagueVo.leagueId;
        }
        return 0;
    }

    /**获取联盟名称*/
    public getLeagueName(): string {
        if (LeagueManager.ins().mLeagueVo) {
            return LeagueManager.ins().mLeagueVo.name;
        }
        return "";
    }

    /**获取联盟等级配置 */
    public getLeagueLevelConfig(level: number): table.league.LeagueLevelConfig {
        return TableManager.getDataById(table.league.LeagueLevelConfig, level);
    }

    /**打开创建联盟界面 */
    public openCreateLeagueView(): void {
        UIManager.ins().open(UILeagueKey.LeagueCreateView);
    }

    /**
     * 联盟列表 状态 0=自动加入 1=申请加入 2=已满员 3=已申请
     */

    public getLeagueState(leagueId: number): number {
        let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
        if (vo.applyLeagueIds) {
            if (vo.applyLeagueIds.indexOf(leagueId) >= 0) {
                //已经申请
                return 3;
            }
        }
        let autoAccept = 0;
        let list = LeagueManager.ins().serverLeagueList;
        list.forEach((item) => {

            if (item.leagueId == leagueId) {
                //满员
                let cfg = this.getLeagueLevelConfig(item.level);
                if (item.memberCount >= cfg.memberCount) {
                    autoAccept = 2;
                } else
                    autoAccept = item.autoAccept ? 0 : 1;
            }
        })

        return autoAccept;


    }


    /**打开旗帜选择界面 */
    public openSelectBannerView(): void {
        if (!this.checkChangeBannerCool()) {
            return;
        }
        UIManager.ins().open(UILeagueKey.LeagueFlagSelectView);
    }


    /**获取旗帜路径 */
    public getLeagueBannerAllCfg(): table.league.LeagueBannerConfig[] {
        let cfgs = TableManager.getAllData(table.league.LeagueBannerConfig);
        return cfgs;

    }

    /**获取联盟图标 */
    public getLeagueIconAllCfg(): table.league.LeagueIconConfig[] {
        let cfgs = TableManager.getAllData(table.league.LeagueIconConfig);
        return cfgs;
    }


    /**获取旗帜路径 */
    public getLeagueBannerUrl(banner: number): string {
        let cfg = TableManager.getDataById(table.league.LeagueBannerConfig, banner);
        return cfg ? cfg.path : "";

    }

    /**获取联盟图标 */
    public getLeagueIconUrl(icon: number): string {
        let cfg = TableManager.getDataById(table.league.LeagueIconConfig, icon);
        return cfg ? cfg.path : "";
    }

    /**创建需要的消耗 */
    public getCreateLeagueCost() {
        let cost = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueCreateCosts).content;
        let arr = cost.split(";")[0].split(":");
        let id = Number.parseInt(arr[0]);
        let num = Number.parseInt(arr[1]);
        return { itemId: id, count: num };

    }

    /**
     * 打开旗帜选择界面
     */
    public openFlagSelectView(): void {
        //检查冷却
        if (!this.checkChangeBannerCool()) {
            return;
        }
        UIManager.ins().open(UILeagueKey.LeagueFlagSelectView);
    }

    /**打开名字编辑界面 */
    openNameEditView(): void {
        //检查冷却
        if (!this.checkChangeNameCool()) {
            return;
        }
        UIManager.ins().open(UILeagueKey.LeagueNewNameView);
    }

    /**
     * 检查改旗帜是否冷却
     */
    checkChangeBannerCool() {
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo && vo.lastChangeIconTime) {
            let cdTime = this.getLeagueChangeBannerCoolTime() * 1000;
            const diffTimeMs = G.TimeManager.serverNow - vo.lastChangeIconTime;
            if (cdTime > diffTimeMs) {
                let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond(diffTimeMs);
                GIns.floatingTextMgr.showTips(`修改联盟旗帜冷却中`);
                return false;
            }

        }

        return true;
    }

    /**
     * 检查改名是否冷却
     */
    checkChangeNameCool() {
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo && vo.lastChangeNameTime) {
            let cdTime = this.getRenameLeagueCoolTime() * 1000;
            const diffTimeMs = G.TimeManager.serverNow - vo.lastChangeNameTime;
            if (cdTime > diffTimeMs) {
                let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond(diffTimeMs);
                GIns.floatingTextMgr.showTips(`修改联盟名称冷却中`);
                return false;
            }

        }

        return true;
    }


    /**
     *
     * @returns 联盟改名消耗
     */
    public getChangeLeagueNameCost() {
        let cost = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueChangeNameCosts).content;
        let arr = cost.split(";")[0].split(":");
        let id = Number.parseInt(arr[0]);
        let num = Number.parseInt(arr[1]);
        return { itemId: id, count: num };
    }

    /**名字最大字数 */
    public getLeagueNameMaxLen() {
        let maxLen = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueNameMaxLen).content;
        return Number(maxLen);
    }

    /**公告最大字数 */
    public getLeagueNoticeMaxLen() {
        let maxLen = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueNoticeMaxLen).content;
        return Number(maxLen);
    }

    /**招募最大字数 */
    public getLeagueInviteMaxLen() {
        let maxLen = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueChatInviteContentMaxLen).content;
        return Number(maxLen);
    }


    /**打开全员邮件 */
    public openMailView(): void {
        UIManager.ins().open(UILeagueKey.LeagueMailView);
    }

    /**打开邀请界面 */
    public openInviteView(): void {
        let vo = LeagueManager.ins().mLeagueVo
        if (vo) {
            if (vo.todayInviteTimes < LeagueManager.ins().maxInviteTimes) {
                UIManager.ins().open(UILeagueKey.LeagueInviteView);
            } else {
                //次数不足
                GIns.floatingTextMgr.showTips('今日邀请次数用尽');
            }
        }
    }

    /**
     *
     * @returns 邮件每周次数
     */
    public getChangeLeagueMailCost() {
        let cost = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueWeekEmailTimes).content;

        return Number(cost);
    }

    /**邮件的最大字数 */
    public getLeagueMailMaxLen() {
        let maxLen = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueEmailContentMaxLen).content;
        return Number(maxLen);
    }

    /**邮件标题 */
    public getLeagueMailTitle() {
        let title = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueEmailTitle).content;
        return title;
    }

    /**
     *联盟修改旗帜消耗
     */
    public getChangeLeagueBannerCost() {
        let cost = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueChangeBannerCosts).content;
        let arr = cost.split(";")[0].split(":");
        let id = Number.parseInt(arr[0]);
        let num = Number.parseInt(arr[1]);
        return { itemId: id, count: num };
    }

    /**获取邀请消耗*/
    public getInviteCost(): { k: any, v: any }[] {
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            let cfg = G.TableManager.getDataById(table.league.LeagueInviteTimesConfig, vo.todayInviteTimes + 1);
            if (cfg) {
                return cfg.costItems
            }
        }
        return null
    }

    /**打开联盟排行榜 */
    public openLeagueRank(): void {
        LeagueManager.ins().clearRankData();
        UIManager.ins().open(UILeagueKey.LeagueRankView);
    }

    /**打开联盟中心 */
    public openLeagueCenter(): void {
        UIManager.ins().open(UILeagueKey.LeagueCenterView, LeagueCenterViewOpenArgs.createForMe());
    }

    /** 打开联盟挑战 */
    public openLeagueChallenge(): void {
        UIManager.ins().open(UILeagueKey.LeagueChallengeView);
    }

    /**通过通用排行榜获取联盟排行榜 */
    public getLeagueRankList(page: number): void {
        let c2s = {} as Vo.ranking.RankListC2S;
        c2s.page = page;
        c2s.type = ServerEnums.RankingType.LEAGUE_FIGHT;
        c2s.subRankParam = null;
        RankModel.ins().sendRankList(c2s);
    }


    /**获取成员在线状态 0是在线 1是离线 */
    public getMemberOnlineState(member: Vo.league.LeagueMemberVo): { state: number, timeStr: string } {
        //最后离线时间,<=0则表示在线
        let offlineTime = member.offlineTime;
        if (offlineTime <= 0) {
            return { state: 0, timeStr: "在线" };
        }
        const diffTimeMs = G.TimeManager.serverNow - offlineTime;
        const timeStr = TimeUtils.formatDiffTimeMsToPVPChallengeRecordTimeText(diffTimeMs);
        return { state: 1, timeStr: timeStr };
    }

    /**打开申请列表 */
    public openApplyListView(): void {
        UIManager.ins().open(UILeagueKey.LeagueApplyListView);
    }

    /**打开成员管理界面 */
    public openMemberManageView(): void {
        UIManager.ins().open(UILeagueKey.LeagueMemberMgrView);
    }

    //距离上次退出时间判断能否加入
    public canJoinLeague(): boolean {
        let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let lastTime = vo.exitTime;
        if (lastTime <= 0) {
            return true;
        }


        //退出冷却时间 分钟
        let timeCfg = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueExitCoolMinutes).content;
        let time = Number(timeCfg) * 60 * 1000;
        let leftTime = lastTime + time - G.TimeManager.serverNow;
        if (leftTime <= 0) {
            return true;
        }
        //xx分钟后才能加入
        let timeStr = TimeUtils.formatTimeMsHourOrmin(leftTime);
        let limitStr = `${timeStr}才能重新申请加入`;

        GIns.floatingTextMgr.showTips(limitStr);
        return false;
    }


    public openLeagueDetailView(leagueId: number): void {
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo && vo.leagueId == leagueId) {
            return;
        }
        UIManager.ins().open(UILeagueKey.LeagueCenterView, LeagueCenterViewOpenArgs.createForReq(leagueId));
    }


    /**获取符合条件的联盟任务配置 */
    public getLeagueTaskCfg(): Array<table.league.LeagueChallengeTaskConfig[]> {
        let cfgs = TableManager.getAllData(table.league.LeagueChallengeTaskConfig);
        let list: table.league.LeagueChallengeTaskConfig[] = [];
        cfgs.map((cfg) => {
            let ok = ConditionManager.ins().checkCondition(cfg.conditions);
            if (ok) {
                list.push(cfg);
            }
        });
        let vo = LeagueManager.ins().mLeagueVo;
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let challengeTaskVos = vo?.challengeTaskVos;
        //排序 可领取>未达成>已领取>id
        //可领取
        let list1 = [];
        //个人未完成
        let list2 = [];
        //未达成
        let list3 = [];
        //已领取
        let list4 = [];

        list.map((cfg) => {
            let taskVo = challengeTaskVos?.find((taskVo) => taskVo.taskId == cfg.id);
            if (taskVo) {
                if (loginVo?.drawChallengeTaskIds && loginVo?.drawChallengeTaskIds?.indexOf(taskVo.taskId) >= 0) {
                    //已领取
                    list4.push(cfg);
                } else if (taskVo.finished) {

                    //可领取，但是自己未完成
                    if (loginVo?.exitTime > 0 && loginVo?.finishTaskIds && loginVo?.finishTaskIds?.indexOf(cfg.id) == -1) {
                        //联盟已完成个人任务未完成
                        list2.push(cfg);
                    } else {
                        //已完成
                        list1.push(cfg);
                    }

                } else {
                    //未达成
                    list3.push(cfg);
                }
            } else {
                list3.push(cfg);
            }

        });


        return [list1, list2, list3, list4];
    }

    /**
     * 进度变更
     * @param changedTask
     */
    updateTaskState(changedTask: Vo.task.TaskVo) {
        const taskId = changedTask.taskId;
        const newProgressValue = changedTask.progress;
        const taskState = changedTask.state as ServerEnums.TaskState;
        if (taskState == ServerEnums.TaskState.COMPLETED) {
            //完成,加到已完成列表
            let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
            vo.finishTaskIds.push(taskId);
            //更新抛事件
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE);
        }


        G.Logger.debug(`联盟任务 = ${taskId}, progress = ${newProgressValue}`)

    }

    /**
     * 排序：在线》离线 盟主》副盟主》战力高
     */
    sortLeagueMemberList(list: Array<Vo.league.LeagueMemberVo | Vo.league.LeagueMemberBriefVo | Vo.league.LeagueApplyVo>) {
        let result = list.sort((a, b) => {

            if (a["offlineTime"] <= 0 && b["offlineTime"] > 0) {
                return -1;
            } else if (a["offlineTime"] > 0 && b["offlineTime"] <= 0) {
                return 1;
            }
            //根据盟主和副盟主排序
            if (a["jobType"] && a["jobType"] != b["jobType"]) {
                return a["jobType"] - b["jobType"];
            }


            //根据战力排序
            return b.fight - a.fight;
        });

        return result;
    }

    //根据职位获取所有权限
    public getPermission(jobType: ServerEnums.LeagueJobType): table.league.LeaguePermissionConfig[] {
        let cfgs = TableManager.getAllData(table.league.LeaguePermissionConfig);
        let resultList = [];

        cfgs.map((cfg) => {
            let jobTypes = cfg.jobTypes;
            jobTypes.map((job) => {
                let jobId = ServerEnums.LeagueJobType[job] as any;
                if (jobId == jobType) {
                    resultList.push(cfg);
                }
            });
        });


        return resultList;
    }

    //指定职位是否有指定权限
    public hasPermission(jobType: ServerEnums.LeagueJobType, permission: ServerEnums.LeaguePermissionType): boolean {
        let cfg = TableManager.getDataById(table.league.LeaguePermissionConfig, ServerEnums.LeaguePermissionType[permission]);
        let result = false;
        cfg.jobTypes.map((job) => {
            let jobId = ServerEnums.LeagueJobType[job] as any;
            if (jobId == jobType) {
                result = true;
            }
        });

        return result;
    }


    /**获取对应槽位的配置
     * level = -1 则取当前等级
     */
    public getLeagueTechCfg(careerIndex: ServerEnums.Career, slotId: number, level: number = -1) {
        let career = ServerEnums.Career[careerIndex];

        if (level == -1) {
            //先看看有没有服务端数据
            let leagueTechVos = LeagueManager.ins().mPlayerLeagueLoginVo.leagueTechVos;
            let vo = leagueTechVos.find((vo) => {
                return vo.career == careerIndex && vo.slotId == slotId;
            });

            if (vo) {
                level = vo.level;
            } else {
                //没有0级的配置 
                level = 0;
            }
        }

        return LeagueTechConfigDatas.ins().getConfigByLevel(career, slotId, level);
    }

    /**获取对应槽位的配置 */
    getAllTechCfg(careerIndex: ServerEnums.Career, slotId: number) {
        let career = ServerEnums.Career[careerIndex];

        let cfgs = LeagueTechConfigDatas.ins().getConfigsByCareerSlot(career, slotId);
        return cfgs;
    }

    /**槽位状态 0=可升级 1=未解锁 2=已满级 3=与最小等级差值超出限定 4=刚解锁*/
    public getSlotState(careerIndex: ServerEnums.Career, slotId: number) {
        if (slotId > 1) {
            //上一槽位等级升满后，才可解锁

            let lastSlotState = this.getSlotState(careerIndex, slotId - 1);
            if (lastSlotState != 2) {
                //未解锁
                return 1;
            }
        }

        let cfg = this.getLeagueTechCfg(careerIndex, slotId);

        let level = cfg ? cfg.level : 0;
        let nextCfg = this.getLeagueTechCfg(careerIndex, slotId, level + 1);
        if (nextCfg) {
            //有下一级


            let minLevel = this.getMinTotalLevel();
            let totalLevel = this.getTotalLevel(careerIndex);
            //差值常量
            let LeagueTechMaxLevelDiff = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueTechDifference).content.toInt();
            if ((totalLevel - minLevel) >= LeagueTechMaxLevelDiff) {
                //当前职业超出最大等级差值 不能升级，要等最小的升上来
                return 3;
            }

        } else {
            //无下一级
            return 2;
        }
        if (!cfg)
            return 4;

        return 0;
    }

    /**通过服务端数据获取获取职业的总等级 */
    public getTotalLevel(careerIndex: ServerEnums.Career) {
        let leagueTechVos = LeagueManager.ins().mPlayerLeagueLoginVo.leagueTechVos;
        let totalLevel = 0;
        leagueTechVos.map((vo) => {
            if (vo.career == careerIndex) {
                totalLevel += vo.level;
            }
        });
        return totalLevel;
    }

    /**比较所有职业的总等级，获得最小总等级等级 */
    public getMinTotalLevel() {
        let minLevel = 999999999;
        let careerList = LeagueManager.ins().mCareerList;
        careerList.map((career) => {
            let level = this.getTotalLevel(career);
            if (level < minLevel) {
                minLevel = level;
            }
        });
        return minLevel;
    }

    /**联盟科技属性累计 */
    public getTechAttrTotal(careerIndex: ServerEnums.Career, slotId: number, level: number): {
        k: Attribute,
        v: number
    } {

        let v = 0;
        let k: Attribute = Attribute.ATK;
        //当前等级以及以下的属性累加
        for (let i = 1; i <= level; i++) {
            let cfg = this.getLeagueTechCfg(careerIndex, slotId, i);
            if (cfg) {
                k = cfg.attrs[0].k;
                v += cfg.attrs[0].v;
            }
        }


        return { k, v };
    }

    /**挑战次数配置 */
    getLeagueBossChallengeCount() {

        let cfg = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueBossDailyChallengeTimes).content;
        return Number(cfg) + LeagueManager.ins().mPlayerLeagueLoginVo.bossAdvertChallengeTimes;
        // return Number(cfg);
    }

    /**获取当前阶段的boss配置 */
    getLeagueBossConfigInStage(stage: number) {
        let allCfg = TableManager.getAllData(table.league.LeagueBossConfig);
        let result = allCfg.filter((cfg) => {

            return cfg.stage == stage;

        });
        return result;
    }

    /**获取当前阶段的boss配置 */
    getLeagueBossConfigInStage2(stage: number, bossConfigId: number) {
        let allCfg = TableManager.getAllData(table.league.LeagueBossConfig);
        let result = allCfg.find((cfg) => {

            return cfg.stage == stage && cfg.id == bossConfigId;

        });
        return result;
    }


    /**获取战斗配置 */
    public getMonsterCfgAndModel(battleConfigId: number) {
        let cfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
        let cfg = cfgs[0];
        //怪物模型
        let spineModelId = cfg.showModelId;


        return { cfg, spineModelId };
    }

    /**技能配置/羁绊配置 */
    public getPassivitySkillConfig(skillId: number) {

        //被动
        let effCfg = TableManager.getDataById(table.battle.PassivitySkillConfig, skillId);
        return effCfg;
    }

    /**获取联盟boss状态
     * 0=已击杀 1=存活
     * */
    public getLeagueBossState(bossIndex: number) {
        let bossVos = LeagueManager.ins().leagueBossStageInfo.bossVos;
        let vo = bossVos.find((vo) => {
            return vo.bossConfigId == bossIndex;
        });
        if (vo)
            return vo.killTime > 0 ? 0 : 1;
        return 0;

    }

    /**初始化boss伤害*/
    public initBossHurt(bossConfigId: number): boolean {
        let hurt = LeagueManager.ins().mPlayerLeagueLoginVo.bossMaxHurtMap[bossConfigId];
        if (hurt == undefined) {
            //没伤害
            LeagueManager.ins().mPlayerLeagueLoginVo.bossMaxHurtMap[bossConfigId] = 0;
            return true;
        }
        return false
    }


    /**是否需要布阵 */
    public isNeedFormation(bossConfigId: number): boolean {
        //首次挑战打开
        let hurt = this.initBossHurt(bossConfigId);
        if (hurt == true) {
            //没伤害
            return true;
        }

        let careerStr = TableManager.getDataById(table.league.LeagueBossConfig, bossConfigId).career;
        let career = ServerEnums.Career[careerStr];
        //判断是否已经布阵
        const formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(ServerEnums.FightType.LEAGUE_BOSS, 0, career.toString());
        if (!formationVo) {
            return true;
        }

        return false;
    }


    /**打开布阵 */
    public openBuzhen(bossId: number): void {
        let careerStr = TableManager.getDataById(table.league.LeagueBossConfig, bossId).career;
        let career = ServerEnums.Career[careerStr];
        const subType = career;
        FormationManager.ins().addAutoFightParam(FightType.LEAGUE_BOSS, bossId)
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW,
            FormationMainViewOpenArgs.create(
                FightType.LEAGUE_BOSS,
                subType.toString()
            ));

    }

    /**获取对应联盟boss排名奖励配置 */
    public getBossRankRewardConfig(bossConfigId: number) {
        let cfgs = TableManager.getAllData(table.league.LeagueBossRankRewardConfig);
        let result: table.league.LeagueBossRankRewardConfig[] = [];
        cfgs.map((cfg) => {
            if (cfg.bossConfigId == bossConfigId) {
                result.push(cfg);
            }
        });
        return result;
    }

    /**判断是否新阶段 */
    public isNewStage(stage: number) {
        //本地数据
        if (!LocalStorage.sys.league) {
            LocalStorage.sys.league = { leagueBossStage: stage }
            return false;
        }
        let localStage = LocalStorage.sys.league.leagueBossStage;
        if (localStage) {
            if (stage > localStage) {
                LocalStorage.sys.league = { leagueBossStage: stage };
                return true;
            }
        }
        LocalStorage.sys.league = { leagueBossStage: stage }
        return false;
    }

    /**根据选择id返回背景旋转角度 */
    public getBgRotateAngle(index: number) {
        let angle = 0 - index * 90;
        return angle;
    }

    /********************联盟宝箱***********************/
    public getLeagueGiftConfig(giftId: number) {
        return TableManager.getDataById(table.league.LeagueGiftConfig, giftId);
    }

    /**获取可领取的赠礼 */
    public getLeagueGiftList() {
        let leagueGiftVoMap = LeagueManager.ins().mLeagueVo.leagueGiftVoMap;
        //转成数组

        let result: Vo.league.LeagueGiftVo[] = [];
        let myPlayerId = PlayerModel.ins().Vo.id;
        for (const key in leagueGiftVoMap) {

            let value = leagueGiftVoMap[key];
            //没领过的
            if (value.drawPlayerIds.indexOf(myPlayerId) == -1) {
                if (value.expireTime >= G.TimeManager.serverNow)
                    result.push(value);
            }

        }

        //根据时间戳排序 时间较大的排在前面
        result.sort((a, b) => {
            return b.expireTime - a.expireTime;
        });


        return result;
    }

    /**获取可以送出的赠礼 */
    public getSendGiftList() {
        let giftMap = LeagueManager.ins().mPlayerLeagueLoginVo.giftMap;
        let result: ILeagueGiftVo[] = [];
        //转成数组
        for (const key in giftMap) {
            result.push(giftMap[key]);
        }
        //根据id
        result.sort((a, b) => {
            return b.leagueGiftConfigId - a.leagueGiftConfigId;
        });


        return result;

    }

    //根据当前宝箱经验获取宝箱等级
    public getLeagueBoxLevel(exp: number) {
        let cfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, 1);
        let level = 1;
        let expMax = cfg.progress;
        let result = 0;
        while (exp >= expMax && cfg) {
            level++;
            cfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, level);
            result++;
            if (cfg) {

                expMax = cfg.progress;
            }

        }
        return result;
    }

    /**获取当前宝箱的经验和最大经验 */
    public getLeagueBoxExp(exp: number) {
        let curLv = this.getLeagueBoxLevel(exp);

        //减掉前面配置的经验
        let curCfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, curLv);
        // let lastCfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, curLv);
        let curExp = exp - curCfg.progress;
        let nextCfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, curLv + 1);
        if (!nextCfg)
            return { exp: curExp, maxExp: curCfg.progress };
        return { exp: curExp, maxExp: nextCfg.progress };
    }

    /**获取宝箱钻石的上限 */
    public getLeagueBoxDiamondMax() {
        let content = TableManager.getDataById(table.league.LeagueConstantConfig, "LEAGUE:GIFT_DIAMOND_LIMIT").content;
        return content.toInt();
    }

    /**获取联盟币id和上限上限 */
    public getLeagueCoinIdAndMax() {
        let id = TableManager.getDataById(table.league.LeagueConstantConfig, "LEAGUE:GOLD_ITEM_ID").content;
        let limit = TableManager.getDataById(table.league.LeagueConstantConfig, "LEAGUE:WEEKLY_TASK_DRAW_GOLD_LIMIT").content;
        return { id: id.toInt(), limit: limit };
    }


    /**联盟宝箱获得赠礼的礼包默认名字 */
    public getLeagueBoxGiftDefaultName() {
        let content = TableManager.getDataById(table.league.LeagueConstantConfig, "LEAGUE:GIFT_DEFAULT_NAME").content;
        return content;
    }


    /**获取所有联盟宝箱赠礼配置 */
    public getLeagueBoxGiftConfig() {

        return TableManager.getAllData(table.league.LeagueGiftConfig);
    }

    /**更新联盟宝箱周日常任务 */
    public updateLeagueWeeklyTask(taskVo: Vo.task.TaskVo) {
        let taskMap = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo.currentTasks;
        let taskIndex = taskMap.findIndex((task) => {
            return task.taskId == taskVo.taskId
        });
        if (taskIndex != -1) {
            taskMap[taskIndex] = taskVo;
        } else {
            taskMap.push(taskVo);
        }

    }

    /**能否打开联盟宝箱上周宝箱 */
    public canOpenLeagueBoxWeekBox() {
        let lastWeekBoxLevel = LeagueManager.ins().mLeagueVo.lastWeekBoxLevel;
        return !LeagueManager.ins().mPlayerLeagueLoginVo.drawLastWeekLeagueBox && lastWeekBoxLevel;

    }


    /**
     * 联盟等级
     * 没有参与 = 0 级
     */
    getLevel(): number {
        return LeagueManager.ins()?.mLeagueVo?.level || 0;
    }


}


