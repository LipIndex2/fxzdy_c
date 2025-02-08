/**
 * 所有活动的key都写在这里 绑定写在对应页面中
 *   方便查找和管理
 */

/** 活动 */
export enum UIActivityKey {
    /** 首充主界面 */
    FirstChargeWin = "FirstChargeWin",
    /** 首充预览界面 */
    FirstChargeDemoWin = "FirstChargeDemoWin",

    /** 七日签到主界面 */
    SignInWin = "SignInWin",
    /** 英雄补给 */
    HeroSupplySubView = "HeroSupplySubView",
    /** 英雄补给 */
    HeroSupplyBuyTipsWin = "HeroSupplyBuyTipsWin",

    /** 头七, 登录 */
    SevenDayLoginSubPage = "SevenDayLoginSubPage",
    /** 头七, 任务 */
    SevenDayTaskPage = "SevenDayTaskPage",
    /** 头七活动 */
    SevenDayMainView = "SevenDayMainView",

    /** 签到送英雄主界面 */
    GiveHeroView = "GiveHeroView",
    /** 签到送英雄--奖励预览界面 */
    GiveHeroAwardWin = "GiveHeroAwardWin",

    /** 活动合集入口 */
    EntranceMainView = "EntranceMainView",

    /**开服冲榜 */
    rushRankView = "rushRankView",
    rushRankFirstRewardWin = "rushRankFirstRewardWin",

    /**开服商城 */
    openChargeView = "openChargeView",

    /**开服累充 */
    totalChargeView = "totalChargeView",

    /**开服累天 */
    totalChargeDayView = "totalChargeDayView",

    /** 通行证 */
    BattlePassMainWin = "BattlePassMainWin",
    BattlePassPreviewWin = "BattlePassPreviewWin",

    PassGroupWin = "PassGroupWin",
    //基金
    FundMainWin = "FundMainWin",
    FundRewardPreview = "FundRewardPreview",

    /**新手特惠*/
    rookieSaleView = "rookieSaleView",
    // 黑店
    BlackShopSubView = "BlackShopSubView",

    /**星钻银行 */
    DiamondBankView = "DiamondBankView",

    /** 达标活动 */
    ReachStandardMainView = "ReachStandardMainView",
    ReachStandardTaskView = "ReachStandardTaskView",

    /**星灵礼包*/
    PetGiftMainView = "PetGiftMainView",

    /** 双周活动 */
    DoubleWeekMainView = "DoubleWeekMainView",
    DoubleWeekTaskTipsWin = "DoubleWeekTaskTipsWin",

    ActivityFlipCardSubView = "ActivityFlipCardSubView",
    ActivityFlipCardChooseBigRewardWin = "ActivityFlipCardChooseBigRewardWin",
    ActivityFlipCardScoreRewardSubView = "ActivityFlipCardScoreRewardSubView",

    /** 职业试炼 */
    CareerTrialsMainView = "CareerTrialsMainView",
    CareerTrialsFundView = "CareerTrialsFundView",
    CareerTrialsBattlePassView = "CareerTrialsBattlePassView",
    CareerTrialsBattlePassBuyTipsWin = "CareerTrialsBattlePassBuyTipsWin",

    /** 职业招募 */
    LimitTimeCareerDrawMainView = "LimitTimeCareerDrawMainView",
    LimitTimeCareerDrawWishWin = "LimitTimeCareerDrawWishWin",

    /** 轮盘抽奖 (抽奖活动组2) */
    RouletteLotteryMainView = "RouletteLotteryMainView",
    RouletteLotteryChooseBigRewardWin = "RouletteLotteryChooseBigRewardWin",

    /** 召唤英雄（抽奖活动组3） */
    SummonHeroMainView = "SummonHeroMainView",
    SummonHeroChooseBigRewardWin = "SummonHeroChooseBigRewardWin",

    /**banner界面*/
    ActivityBannerWin = "ActivityBannerWin",

    LifelongMainView = "LifelongMainView",
}
