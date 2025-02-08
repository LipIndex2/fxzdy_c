
export enum UILeagueKey {
    // 联盟主页
    LeagueMainView = "LeagueMainView",
    //联盟列表
    LeagueListView = "LeagueListView",
    //联盟创建
    LeagueCreateView = "LeagueCreateView",

    /**旗帜选择 */
    LeagueFlagSelectView = "LeagueFlagSelectView",
    /**联盟新名字 */
    LeagueNewNameView = "LeagueNewNameView",
    /** 联盟信息面板 | 如果是自己就有管理 */
    LeagueCenterView = "LeagueCenterView",
    /**联盟邀请 */
    LeagueMailView = "LeagueMailView",
    /**联盟排行 */
    LeagueRankView = "LeagueRankView",
    /**联盟挑战 */
    LeagueChallengeView = "LeagueChallengeView",
    /**招募界面 */
    LeagueInviteView = "LeagueInviteView",

    /**申请列表 */
    LeagueApplyListView = "LeagueApplyListView",
    /**成员管理 */
    LeagueMemberMgrView = "LeagueMemberMgrView",
    /**完成联盟任务的人员列表 */
    LeagueCompletedList = "LeagueCompletedList",

    /**联盟科技 */
    LeagueTechView = "LeagueTechView",

    /**联盟boss */
    LeagueBossView = "LeagueBossView",
    /**联盟boss排行榜 */
    LeagueBossRankView = "LeagueBossRankView",
    /**联盟boss奖励界面 */
    LeagueBossRewardView = "LeagueBossRewardView",
    /**联盟boss挑战成功 */
    LeagueBossChallengeSuccess = "LeagueBossChallengeSuccess",
    /**新阶段开启弹窗 */
    LeagueNewStageView = "LeagueNewStageView",

    /**联盟宝箱主界面 */
    LeagueBoxMainView = "LeagueBoxMainView",
    /**联盟宝箱赠礼列表界面 */
    LeagueBoxGiftListView = "LeagueBoxGiftListView",
    /**宝箱领取奖励 */
    LeagueBoxRewardView = "LeagueBoxRewardView",

    /**玩法列表界面*/
    LeagueGameModeWin = "LeagueGameModeWin",
}
/**常量 */
export enum ConstLeagueKey {
    LeagueCreateCosts = "LEAGUE:CREATE_COSTS",
    LeagueChangeNameCosts = "LEAGUE:CHANGE_NAME_COSTS",
    LeagueChangeBannerCosts = "LEAGUE:CHANGE_BANNER_COSTS",
    LeagueWeekEmailTimes = "LEAGUE:WEEK_EMAIL_TIMES",
    LeagueNameMaxLen = "LEAGUE:NAME_MAX_LEN",
    LeagueEmailTitle = "LEAGUE:EMAIL_TITLE",
    LeagueChatInviteContentMaxLen = "LEAGUE:CHAT_INVITE_CONTENT_MAX_LEN",
    LeagueEmailContentMaxLen = "LEAGUE:EMAIL_CONTENT_MAX_LEN",
    LeagueEmailExpireHours = "LEAGUE:EMAIL_EXPIRE_HOURS",
    LeagueExitCoolMinutes = "LEAGUE:EXIT_COOL_MINUTES",
    LeagueApplyMaxCount = "LEAGUE:APPLY_MAX_COUNT",
    LeagueDeputyLeaderCount = "LEAGUE:DEPUTY_LEADER_COUNT",
    LeagueNoticeMaxLen = "LEAGUE:NOTICE_MAX_LEN",
    LeagueOfflineDayTransferLeader = "LEAGUE:OFFLINE_DAY_TRANSFER_LEADER",


    LeagueRenameCoolDown = "LEAGUE:RENAME_COOL_DOWN",

    LeagueChangeBannerCoolDown = "LEAGUE:CHANGE_BANNER_COOL_DOWN",

    //LEAGUE:TECH_DIFFERENCE
    LeagueTechDifference = "LEAGUE:TECH_DIFFERENCE",

    //LEAGUE:BOSS_DAILY_CHALLENGE_TIMES
    LeagueBossDailyChallengeTimes = "LEAGUE:BOSS_DAILY_CHALLENGE_TIMES",
}


export enum I18LeagueKey {

    //i18n:league:wordNot
    i18n_league_wordNot = "i18n:league:wordNot",
    //i18n:league:wordNotFind
    i18n_league_wordNotFind = "i18n:league:wordNotFind",
    //i18n:league:wordNot2
    i18n_league_wordNot2 = "i18n:league:wordNot2",
    //i18n:league:quit
    i18n_league_quit = "i18n:league:quit",
    //i18n:league:kickOut
    i18n_league_kickOut = "i18n:league:kickOut",
    //i18n:league:job
    i18n_league_job = "i18n:league:job",
    //i18n:league:NoNotice
    i18n_league_NoNotice = "i18n:league:NoNotice",
    //i18n:league:changeTips
    i18n_league_changeTips = "i18n:league:changeTips",
    //i18n:league:agreet
    i18n_league_agreet = "i18n:league:agreet",

}

/**联盟玩法枚举*/
export enum LeagueGameMode {
    /**联盟对决*/
    LEAGUE_WAR = 'LEAGUE_WAR',
    /**资源勘探*/
    LEAGUE_EXPLORE = 'LEAGUE_EXPLORE',
}

