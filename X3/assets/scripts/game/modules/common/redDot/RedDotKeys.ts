import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotPathFactory } from "db://assets/scripts/game/modules/common/redDot/RedDotPathFactory";

export class RedDotKeys {
    // 无红点
    static readonly Null = RedDotPathFactory.create("/Null");

    // ------------------------------- 天赋 ----------------------------------

    // 天赋
    static readonly talent = RedDotPathFactory.create("/talent", EnumRedDotShowType.HIGH);
    // 天赋/小
    static readonly talent_small = RedDotPathFactory.create(`/talent/small/\${talentId}`, EnumRedDotShowType.LV_UP_GREEN);
    // 天赋/大
    static readonly talent_big = RedDotPathFactory.create(`/talent/big/\${talentId}`, EnumRedDotShowType.LV_UP_RED);

    // ------------------------------- 邮件 ----------------------------------

    // 邮件
    static readonly email = RedDotPathFactory.create("/email");
    // 邮件/领奖
    static readonly email_CanGain = RedDotPathFactory.create("/email/CanGain", EnumRedDotShowType.REWARD);
    // 邮件/领奖
    static readonly email_row = RedDotPathFactory.create(`/email/CanGain/row/\${id}`, EnumRedDotShowType.HIGH);

    // ------------------------------- 每日任务 ----------------------------------
    // 任务
    static readonly task = RedDotPathFactory.create("/task");
    // 主线任务
    static readonly dailyTask = RedDotPathFactory.create("/task/dailyTask");
    // 任务行
    static readonly dailyTask_taskRow = RedDotPathFactory.create("/task/dailyTask/taskRow/${taskId}", EnumRedDotShowType.NORMAL);
    // 日活跃箱子
    static readonly dailyTask_DailyRewardBox = RedDotPathFactory.create(`/task/dailyTask/DailyRewardBox/\${id}`, EnumRedDotShowType.REWARD);
    // 周活跃箱子
    static readonly dailyTask_WeeklyRewardBox = RedDotPathFactory.create(`/task/dailyTask/WeeklyRewardBox/\${id}`, EnumRedDotShowType.REWARD);

    // ------------------------------- 成就 ----------------------------------

    // 成就
    static readonly achievement = RedDotPathFactory.create("/task/achievement");
    // 成就任务
    static readonly achievement_taskRow = RedDotPathFactory.create("/task/achievement/taskRow/${taskId}", EnumRedDotShowType.REWARD);

    // ------------------------------- 战队科技 ----------------------------------

    static readonly captainSkill = RedDotPathFactory.create("/captainSkill/local", EnumRedDotShowType.LV_UP_GREEN);
    // static readonly captainSkill_unlock = RedDotPathFactory.create("/captainSkill/unlock/${key0}", EnumRedDotShowType.HIGH);
    static readonly captainSkill_lvUp = RedDotPathFactory.create("/captainSkill/lvUp/${key0}", EnumRedDotShowType.LV_UP_GREEN);
    static readonly captainSkill_coreLvUp = RedDotPathFactory.create("/captainSkill/coreLvUp", EnumRedDotShowType.LV_UP_GREEN);

    // ------------------------------- 抽卡 ----------------------------------

    // 抽卡
    static readonly drawCard = RedDotPathFactory.create("/drawCard", EnumRedDotShowType.MAIN_CITY);
    // 抽卡
    static readonly drawCard_draw = RedDotPathFactory.create("/drawCard/draw", EnumRedDotShowType.MAIN_CITY);
    // 抽卡/普通抽
    static readonly drawCard_normalHero = RedDotPathFactory.create("/drawCard/draw/normalHero", EnumRedDotShowType.HIGH);
    // 抽卡/普通抽/10抽
    static readonly drawCard_normalHero_draw10 = RedDotPathFactory.create("/drawCard/draw/normalHero/draw10", EnumRedDotShowType.HIGH);
    // 抽卡/普通抽/进度奖励
    static readonly drawCard_normalHero_progress = RedDotPathFactory.create(`/drawCard/draw/normalHero/progress/\${id}`, EnumRedDotShowType.REWARD);

    // 抽卡/自选保底
    static readonly drawCard_chooseHero = RedDotPathFactory.create("/drawCard/draw/poolHero", EnumRedDotShowType.HIGH);
    // 抽卡/自选保底/10抽
    static readonly drawCard_chooseHero_draw10 = RedDotPathFactory.create("/drawCard/draw/poolHero/draw10", EnumRedDotShowType.HIGH);

    // 抽卡/装备
    static readonly drawCard_equip = RedDotPathFactory.create("/drawCard/draw/equip", EnumRedDotShowType.HIGH);
    // 抽卡/装备
    static readonly drawCard_equip_once = RedDotPathFactory.create("/drawCard/draw/equip/once", EnumRedDotShowType.HIGH);
    // 抽卡/装备/免费
    static readonly drawCard_equip_free = RedDotPathFactory.create("/drawCard/draw/equip/once/free", EnumRedDotShowType.HIGH);
    // 抽卡/装备/10抽
    static readonly drawCard_equip_draw10 = RedDotPathFactory.create("/drawCard/draw/equip/draw10", EnumRedDotShowType.HIGH);
    // 抽卡/装备/奖励箱子
    static readonly drawCard_equip_rewardBox = RedDotPathFactory.create("/drawCard/draw/equip/once/rewardBox", EnumRedDotShowType.REWARD);

    // 抽卡/普通抽广告
    static readonly drawCard_normalHero_ad = RedDotPathFactory.create("/drawCard/ad/normalHero", EnumRedDotShowType.REWARD);
    // 抽卡/装备/广告
    static readonly drawCard_equip_ad = RedDotPathFactory.create("/drawCard/ad/equip", EnumRedDotShowType.REWARD);

    // ------------------------------- 每日boss ----------------------------------

    // 每日boss
    static readonly dailyBoss = RedDotPathFactory.create("/dailyBoss");
    // 每日boss/挑战
    static readonly dailyBoss_challenge = RedDotPathFactory.create("/dailyBoss/challenge", EnumRedDotShowType.HIGH);

    // ------------------------------- 挂机 ----------------------------------

    // 挂机
    static readonly hangUp = RedDotPathFactory.create("/hangUp");
    // 挂机 路径奖励
    static readonly hangUp_roadReward = RedDotPathFactory.create("/hangUp/roadReward", EnumRedDotShowType.REWARD);
    // 挂机 快速挂机 首次免费
    static readonly hangUp_quickGain = RedDotPathFactory.create("/hangUp/quickGain", EnumRedDotShowType.HIGH);

    // ------------------------------- 竞技场 ----------------------------------

    // 竞技场
    static readonly jjc = RedDotPathFactory.create("/jjc");
    // 竞技场 每日挑战
    static readonly jjcChallenge = RedDotPathFactory.create(`/jjc/challenge`, EnumRedDotShowType.HIGH);
    // 竞技场 每周进度奖励
    static readonly jjcRewardWeekly = RedDotPathFactory.create(`/jjc/rewardWeekly`, EnumRedDotShowType.REWARD);

    // ------------------------------- 背包 ----------------------------------

    // 背包入口
    static readonly backpack = RedDotPathFactory.create("/backpack");
    // 背包道具
    static readonly backpackItem = RedDotPathFactory.create(`/backpack/item/\${key0}`, EnumRedDotShowType.NORMAL);

    // ------------------------------- 英雄 ----------------------------------
    /**英雄入口 */
    static readonly Hero_enter = RedDotPathFactory.create("/hero");
    /**英雄列表 */
    static readonly Hero_list = RedDotPathFactory.create("/hero/list");
    static readonly Hero_item = RedDotPathFactory.create("/hero/list/Hero_item/${key0}");
    /** 英雄列表item 升级或升阶 */
    static readonly Hero_item_train = RedDotPathFactory.create(`/ItemForHero/\${key0}`, EnumRedDotShowType.LV_UP_GREEN);
    /** 英雄列表item 升5级 */
    static readonly Hero_item_train_five = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_trainFive`, EnumRedDotShowType.LV_UP_GREEN);
    /** 英雄列表item 升星 */
    static readonly Hero_item_star = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_star`, EnumRedDotShowType.LV_UP_RED);
    /** 英雄列表item 激活 */
    static readonly Hero_item_activate = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_activate`, EnumRedDotShowType.HIGH);
    /** 英雄列表item 皮肤 */
    static readonly Hero_item_skin = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_skin`, EnumRedDotShowType.HIGH);
    /** 英雄列表item 皮肤 */
    static readonly Hero_item_skin_item = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_skin/\${key1}`, EnumRedDotShowType.HIGH);
    /** 英雄列表 开启潜能 */
    static readonly Hero_item_dna = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_dna`, EnumRedDotShowType.NEW);
    /** 英雄列表 潜能升级 */
    static readonly Hero_item_dna_level_up = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_dna/dna_levelUp`, EnumRedDotShowType.LV_UP_GREEN);
    /** 英雄列表 潜能觉醒 */
    static readonly Hero_item_dna_awaken = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Hero_dna/dna_awaken`, EnumRedDotShowType.LV_UP_RED);

    // ------------------------------- 装备 ----------------------------------
    /**装备入口 */
    static readonly Equip_enter = RedDotPathFactory.create("/Equip_enter");
    /** 装备列表 */
    static readonly Equip_list = RedDotPathFactory.create("/Equip_enter/list", EnumRedDotShowType.LV_UP_GREEN);
    /**装备列表item */
    static readonly Equip_item = RedDotPathFactory.create(`/Equip_enter/list/\${key0}`, EnumRedDotShowType.LV_UP_GREEN);
    /** 单个装备item */
    static readonly Equip_item2 = RedDotPathFactory.create(`/Equip_enter/list2/\${key0}`, EnumRedDotShowType.LV_UP_GREEN);

    // ------------------------------- 魔方 ----------------------------------
    /** 魔方入口 （在英雄详情界面） */
    static readonly Cube_enter = RedDotPathFactory.create("/hero/list/Hero_item/${key0}/Cube_enter");
    /** 魔方激活 */
    static readonly Cube_activate = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Cube_enter/Cube_activate`, EnumRedDotShowType.HIGH);
    /** 魔方升级 */
    static readonly Cube_upgrade = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Cube_enter/Cube_upgrade`, EnumRedDotShowType.LV_UP_RED);
    /** 魔方转换 */
    static readonly Cube_convert = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/Cube_enter/Cube_convert`, EnumRedDotShowType.LV_UP_GREEN);

    // ------------------------------- 联盟  ----------------------------------
    /**联盟系统入口 */
    static readonly League = RedDotPathFactory.create("/League");

    /**联盟中心入口 */
    static readonly League_center = RedDotPathFactory.create("/League/center");
    /**申请列表 */
    static readonly League_apply = RedDotPathFactory.create("/League/center/apply", EnumRedDotShowType.HIGH);

    /**联盟挑战 */
    static readonly League_challenge = RedDotPathFactory.create("/League/challenge", EnumRedDotShowType.REWARD);

    /**联盟商店 */
    static readonly League_shop = RedDotPathFactory.create("/League/shop");

    /**联盟科技入口 */
    static readonly League_tech = RedDotPathFactory.create("/League/tech", EnumRedDotShowType.LV_UP_RED);

    // 联盟宝箱 入口
    static readonly League_box = RedDotPathFactory.create("/League/box", EnumRedDotShowType.REWARD);
    // 联盟宝箱 任务完成提示
    static readonly League_box_TabTask = RedDotPathFactory.create("/League/box/TabTask", EnumRedDotShowType.REWARD);

    // 盟友赠礼 领取提示
    static readonly League_Box_TabGift = RedDotPathFactory.create("/League/box/TabGift", EnumRedDotShowType.REWARD);
    // 联盟赠礼 领取列表
    static readonly League_Box_giftList = RedDotPathFactory.create("/League/box/TabGift/giftList", EnumRedDotShowType.REWARD);
    // 联盟赠礼 发放提示
    static readonly League_Box_sendGiftBtn = RedDotPathFactory.create("/League/box/TabGift/sendGiftBtn", EnumRedDotShowType.NEW);

    // 联盟boss
    static readonly leagueBoss = RedDotPathFactory.create("/League/boss");
    // 联盟boss/挑战
    static readonly leagueBoss_challenge = RedDotPathFactory.create("/League/boss/challenge", EnumRedDotShowType.HIGH);
    // 联盟boss/广告
    static readonly leagueBoss_ad = RedDotPathFactory.create("/League/boss/ad", EnumRedDotShowType.REWARD);

    // 联盟砍价
    static readonly leagueBargain = RedDotPathFactory.create("/League/bargain");
    // 联盟砍价 砍一刀
    static readonly leagueBargain_kill = RedDotPathFactory.create("/League/bargain/skill", EnumRedDotShowType.HIGH);

    // ------------------------------- GVG ----------------------------------

    // 联盟对决
    static readonly gvg = RedDotPathFactory.create("/League/gvg", EnumRedDotShowType.NULL);
    // 联盟对决 有挑战次数
    static readonly gvg_haveChallengeCount = RedDotPathFactory.create(`/League/gvg/haveChallengeCount`, EnumRedDotShowType.HIGH);

    // ------------------------------- 每日特惠 ----------------------------------

    /** 每日特惠 */
    static readonly Charge_dailySale = RedDotPathFactory.create("/dailySale", EnumRedDotShowType.REWARD);
    /** 每日特惠 免费礼包 */
    static readonly Charge_dailySale_free = RedDotPathFactory.create("/dailySale/dailySale_free", EnumRedDotShowType.REWARD);

    // ------------------------------- 黑店 ----------------------------------
    static readonly BlackShop = RedDotPathFactory.create("/BlackShop");
    static readonly BlackShop_Good = RedDotPathFactory.create(`/BlackShop/\${goodId}`);

    // ------------------------------- 商店 ----------------------------------

    /**商店 */
    static readonly Shop_enter = RedDotPathFactory.create("/more/Shop");
    /**商店具体分类 */
    static readonly Shop_type = RedDotPathFactory.create("/more/Shop/${key0}");
    /**商店每个商品 */
    static readonly Shop_item = RedDotPathFactory.create("/more/Shop/${key0}/${key1}", EnumRedDotShowType.REWARD);

    /**主界面按钮 */
    static readonly moreBtn = RedDotPathFactory.create("/more");

    // 图鉴总红点 | 在英雄入口里面
    static readonly Illustrations_Main = RedDotPathFactory.create("/hero/Illustrations_Main", EnumRedDotShowType.HIGH);
    /**图鉴全部英雄页签*/
    static readonly Illustrations_Hero_All = RedDotPathFactory.create("/hero/Illustrations_Main/AllHero", EnumRedDotShowType.HIGH);
    /**图鉴英雄阵营页签1*/
    static readonly Illustrations_Hero_Camp1 = RedDotPathFactory.create("/hero/Illustrations_Main/AllHero/Camp1", EnumRedDotShowType.HIGH);
    /**图鉴英雄阵营页签2*/
    static readonly Illustrations_Hero_Camp2 = RedDotPathFactory.create("/hero/Illustrations_Main/AllHero/Camp2", EnumRedDotShowType.HIGH);
    /**图鉴英雄阵营页签3*/
    static readonly Illustrations_Hero_Camp3 = RedDotPathFactory.create("/hero/Illustrations_Main/AllHero/Camp3", EnumRedDotShowType.HIGH);
    /**图鉴英雄阵营页签4*/
    static readonly Illustrations_Hero_Camp4 = RedDotPathFactory.create("/hero/Illustrations_Main/AllHero/Camp4", EnumRedDotShowType.HIGH);
    /**图鉴全部武器页签*/
    static readonly Illustrations_Weapon_All = RedDotPathFactory.create("/hero/Illustrations_Main/Weapon_All", EnumRedDotShowType.HIGH);
    /**图鉴全部宠物页签*/
    static readonly Illustrations_Pet_All = RedDotPathFactory.create("/hero/Illustrations_Main/Pet_All", EnumRedDotShowType.HIGH);
    /**图鉴奖励*/
    static readonly Illustrations_Reward = RedDotPathFactory.create("/hero/Illustrations_Main/Reward", EnumRedDotShowType.REWARD);

    /**充值入口*/
    static readonly Charge_enter = RedDotPathFactory.create("/Charge", EnumRedDotShowType.REWARD);
    /**充值(限购商城)*/
    static readonly Charge_limit = RedDotPathFactory.create("/Charge/limit", EnumRedDotShowType.REWARD);
    /**充值(vip)*/
    static readonly Charge_vip = RedDotPathFactory.create("/Charge/vip", EnumRedDotShowType.REWARD);
    /**充值(vip)免费商品*/
    static readonly Charge_vip_free = RedDotPathFactory.create("/Charge/vip/free", EnumRedDotShowType.REWARD);
    /**充值(vip) 星钻商品*/
    static readonly Charge_vip_item = RedDotPathFactory.create("/Charge/vip/item/${key0}", EnumRedDotShowType.NORMAL);

    /**活动-开服活动总key*/
    static readonly Activity_openCharge = RedDotPathFactory.create("/openCharge", EnumRedDotShowType.REWARD);
    /**活动-开服特惠子项*/
    static readonly Activity_openCharge_item = RedDotPathFactory.create("/openCharge/activity/${key0}", EnumRedDotShowType.REWARD);
    /**活动-七天签到*/
    static readonly Activity_signIn = RedDotPathFactory.create("/signIn", EnumRedDotShowType.REWARD);
    // static readonly Activity_signIn = RedDotPathFactory.create("/entrance/${key0}/activity/${key1}/signIn", EnumRedDotShowType.REWARD);
    /**活动-七天签到*/
    static readonly Activity_signIn_reward = RedDotPathFactory.create("/signIn/reward", EnumRedDotShowType.REWARD);
    // static readonly Activity_signIn_reward = RedDotPathFactory.create("/entrance/${key0}/activity/${key1}/signIn/reward", EnumRedDotShowType.REWARD);
    /**活动-入口*/
    static readonly Activity_entrance = RedDotPathFactory.create("/entrance/${key0}", EnumRedDotShowType.REWARD);
    /**活动-入口子项*/
    static readonly Activity_entrance_item = RedDotPathFactory.create("/entrance/${key0}/activity/${key1}", EnumRedDotShowType.REWARD);
    /**活动-入口子项 新*/
    static readonly Activity_entrance_item_new = RedDotPathFactory.create("/entrance/${key0}/activity/${key1}/new", EnumRedDotShowType.NEW);

    // 好友
    static readonly Friend = RedDotPathFactory.create("/Friend");
    /**好友申请*/
    static readonly Friend_apply = RedDotPathFactory.create("/Friend/apply", EnumRedDotShowType.NORMAL);
    /**好友列表*/
    static readonly Friend_list = RedDotPathFactory.create("/Friend/list", EnumRedDotShowType.HIGH);
    /**好友领取赠送礼物*/
    static readonly Friend_giveAndDrawGift = RedDotPathFactory.create("/Friend/list/giveAndDrawGift", EnumRedDotShowType.REWARD);

    /**特权卡入口*/
    static readonly MonthCard_enter = RedDotPathFactory.create("/Pass/MonthCard");
    /**特权卡一键领取*/
    static readonly MonthCard_drawAll = RedDotPathFactory.create("/Pass/MonthCard/drawAll", EnumRedDotShowType.REWARD);
    /**特权卡免费奖励*/
    static readonly MonthCard_free = RedDotPathFactory.create("/Pass/MonthCard/drawAll/free", EnumRedDotShowType.REWARD);
    /**特权卡每项奖励*/
    static readonly MonthCard_item = RedDotPathFactory.create("/Pass/MonthCard/drawAll/${key0}", EnumRedDotShowType.REWARD);
    /**月卡激活*/
    static readonly MonthCard_act = RedDotPathFactory.create("/Pass/MonthCard/btnBuy", EnumRedDotShowType.REWARD);
    /**月卡每日领取*/
    static readonly MonthCard_dayReward = RedDotPathFactory.create("/Pass/MonthCard/btnDraw/${key0}", EnumRedDotShowType.REWARD);

    /**通行证入口*/
    static readonly Pass_enter = RedDotPathFactory.create("/Pass");
    /**通行证*/
    static readonly Pass_Fund = RedDotPathFactory.create("/Pass/Fund");
    /**所有通行证*/
    static readonly Pass_all = RedDotPathFactory.create("/Pass/Fund/all", EnumRedDotShowType.REWARD);
    /**单个通行证奖励 */
    static readonly Pass_item = RedDotPathFactory.create("/Pass/Fund/all/${key0}", EnumRedDotShowType.REWARD);

    /**首充入口*/
    static readonly FirstCharge_enter = RedDotPathFactory.create("/FirstCharge");
    /**首充tab项*/
    static readonly FirstCharge_tab = RedDotPathFactory.create("/FirstCharge/tab/${key0}", EnumRedDotShowType.REWARD);
    /**首充item项*/
    static readonly FirstCharge_item = RedDotPathFactory.create("/FirstCharge/item/${key0}", EnumRedDotShowType.REWARD);

    /** 星际通行证  入口 */
    static readonly StarPass_enter = RedDotPathFactory.create("/StarPass");
    /** 星际通行证  所有红点 */
    static readonly StarPass_all = RedDotPathFactory.create("/StarPass/all");
    /** 星际通行证  所有任务红点 */
    static readonly StarPass_taskAll = RedDotPathFactory.create("/StarPass/all/task");
    /** 星际通行证  任务Tab红点 */
    static readonly StarPass_taskTab = RedDotPathFactory.create("/StarPass/all/task/taskTab${key0}", EnumRedDotShowType.REWARD);
    /** 星际通行证  单个任务红点 */
    static readonly StarPass_task = RedDotPathFactory.create("/StarPass/all/task/${key0}", EnumRedDotShowType.REWARD);
    /** 星际通行证  奖励列表 */
    static readonly StarPass_reward = RedDotPathFactory.create("/StarPass/all/reward");
    /** 星际通行证  普通奖励列表 */
    static readonly StarPass_item = RedDotPathFactory.create("/StarPass/all/reward/common/${key0}", EnumRedDotShowType.REWARD);
    /** 星际通行证  付费奖励列表 */
    static readonly StarPass_pay = RedDotPathFactory.create("/StarPass/all/reward/pay/${key0}", EnumRedDotShowType.REWARD);

    /** 设置免费改名 */
    static readonly Set_changename_free = RedDotPathFactory.create("/Set/changename_free", EnumRedDotShowType.NORMAL);
    /**头像设置*/
    static readonly Set_avatar = RedDotPathFactory.create("/Set/avatar", EnumRedDotShowType.NEW);
    /** 头像*/
    static readonly Set_skin_head = RedDotPathFactory.create("/Set/avatar/head_icon", EnumRedDotShowType.NEW);
    /** 头像*/
    static readonly Set_skin_head_item = RedDotPathFactory.create("/Set/avatar/head_icon/${key0}", EnumRedDotShowType.NEW);
    /** 头像框*/
    static readonly Set_skin_head_frame = RedDotPathFactory.create("/Set/avatar/head_frame", EnumRedDotShowType.NEW);
    /** 头像框*/
    static readonly Set_skin_head_frame_item = RedDotPathFactory.create("/Set/avatar/head_frame/${key0}", EnumRedDotShowType.NEW);
    /** 称号*/
    static readonly Set_skin_title = RedDotPathFactory.create("/Set/avatar/title", EnumRedDotShowType.NEW);
    /** 称号 item*/
    static readonly Set_skin_title_item = RedDotPathFactory.create("/Set/avatar/title/${key0}", EnumRedDotShowType.NEW);
    /** 皮肤形象*/
    static readonly Set_skin_image = RedDotPathFactory.create("/Set/avatar/skin_image", EnumRedDotShowType.NEW);
    /** 皮肤形象 item*/
    static readonly Set_skin_image_item = RedDotPathFactory.create("/Set/avatar/skin_image/${key0}", EnumRedDotShowType.NEW);


    /** 世界boss 活动界面 */
    static readonly Activity_worldBoss = RedDotPathFactory.create("/entrance/worldBoss/${key0}");
    /** 世界boss 活动界面可挑战 */
    static readonly Activity_worldBoss_challenge = RedDotPathFactory.create("/entrance/worldBoss/${key0}/challenge", EnumRedDotShowType.NORMAL);
    /** 世界boss 活动界面可领取奖励 */
    static readonly Activity_worldBoss_reward = RedDotPathFactory.create("/entrance/worldBoss/${key0}/reward", EnumRedDotShowType.REWARD);

    /** 世界boss */
    static readonly WorldBoss = RedDotPathFactory.create("/WorldBoss");
    /** 世界boss 布阵 */
    static readonly WorldBoss_setup = RedDotPathFactory.create("/WorldBoss/setUp/${key0}", EnumRedDotShowType.NORMAL);
    /** 世界boss 挑战 */
    static readonly WorldBoss_challenge = RedDotPathFactory.create("/WorldBoss/challenge/${key0}", EnumRedDotShowType.HIGH);

    // ----------------------------------------星钻银行------------------------------------------
    static readonly DIAMOND_BANK = RedDotPathFactory.create("/DiamondBank");
    /** 锁定情况下，提醒玩家领取奖励 */
    static readonly DIAMOND_BANK_LOCK_REWARD = RedDotPathFactory.create("/DIAMOND_BANK_LOCK_REWARD", EnumRedDotShowType.REWARD);
    /** 解锁情况下，提醒玩家领取奖励 */
    static readonly DIAMOND_BANK_REWARD = RedDotPathFactory.create("/DiamondBank/DIAMOND_BANK_REWARD", EnumRedDotShowType.REWARD);
    /** 提醒玩家领取奖励的弱红点，即使未达到领取条件奖励是锁定的，也要提醒 */
    static readonly DIAMOND_BANK_WEAK_TIP = RedDotPathFactory.create("/DiamondBank/DIAMOND_BANK_WEAK_TIP", EnumRedDotShowType.REWARD);

    // ----------------------------------------功能预告------------------------------------------
    /** 功能预告/入口*/
    static readonly FunctionPreview = RedDotPathFactory.create("/FunctionPreview", EnumRedDotShowType.REWARD);
    /** 功能预告/入口/任务*/
    static readonly FunctionPreview_task = RedDotPathFactory.create("/FunctionPreview/task/${key0}", EnumRedDotShowType.REWARD);

    // ----------------------------------------星灵------------------------------------------
    /** 星灵 入口*/
    static readonly Pet_enter = RedDotPathFactory.create("/Pet");
    /** 星灵 可进阶/可升级*/
    static readonly Pet_upLVStage = RedDotPathFactory.create("/Pet/Pet_upLVStage", EnumRedDotShowType.LV_UP_GREEN);
    /** 星灵 可激活*/
    static readonly Pet_active = RedDotPathFactory.create("/Pet/active/${key0}", EnumRedDotShowType.HIGH);
    /** 星灵 可升星*/
    static readonly Pet_UpStar = RedDotPathFactory.create("/Pet/UpStar/${key0}", EnumRedDotShowType.LV_UP_RED);
    /** 星灵羁绊入口 */
    static readonly Pet_group_enter = RedDotPathFactory.create("/Pet/Pet_group_enter", EnumRedDotShowType.HIGH);
    /** 星灵羁绊可激活/升级 */
    static readonly Pet_group_active_up = RedDotPathFactory.create("/Pet/Pet_group_enter/Pet_group_active_up", EnumRedDotShowType.HIGH);
    /** 星灵招募红点入口 */
    static readonly Pet_Hub_Enter = RedDotPathFactory.create("/Pet/Pet_Hub_Enter", EnumRedDotShowType.HIGH);
    /** 星灵招募免费红点 */
    static readonly Pet_Hub_Free = RedDotPathFactory.create("/Pet/Pet_Hub_Enter/Pet_Hub_Free", EnumRedDotShowType.REWARD);
    /** 星灵招募红点 */
    static readonly Pet_Hub_Cost = RedDotPathFactory.create("/Pet/Pet_Hub_Enter/Pet_Hub_Cost", EnumRedDotShowType.HIGH);

    // ---------------------------------------- 收藏品 ------------------------------------------
    /** 收藏品 入口 */
    static readonly Collections_enter = RedDotPathFactory.create("/Collection");
    /** 收藏品 item */
    static readonly Collections_item_all = RedDotPathFactory.create("/Collection/item");
    /** 收藏品 item */
    static readonly Collections_item = RedDotPathFactory.create("/Collection/item/${key0}");
    /** 收藏品 升级升星激活 */
    static readonly Collections_item_up_active = RedDotPathFactory.create("/Collection/item/${key0}/up_active");
    /** 收藏品 收藏品可合成 */
    static readonly Collections_item_compound = RedDotPathFactory.create("/Collection/item/${key0}/up_active/compound", EnumRedDotShowType.HIGH);
    /** 收藏品 收藏品可升星 */
    static readonly Collections_item_upStar = RedDotPathFactory.create("/Collection/item/${key0}/up_active/upStar", EnumRedDotShowType.LV_UP_RED);
    /** 收藏品 收藏品可升级 */
    static readonly Collections_item_upLV = RedDotPathFactory.create("/Collection/item/${key0}/up_active/upLV", EnumRedDotShowType.LV_UP_GREEN);
    /** 收藏品 套装所有 */
    static readonly Collections_suit_all = RedDotPathFactory.create("/Collection/suit");
    /** 收藏品 套装 */
    static readonly Collections_suit = RedDotPathFactory.create("/Collection/suit/${key0}");
    /** 收藏品 套装激活或者升级 */
    static readonly Collections_suit_up_active = RedDotPathFactory.create("/Collection/suit/${key0}/up_active", EnumRedDotShowType.HIGH);

    // ---------------------------------------- 七日嘉年华 ------------------------------------------
    /** 七日入口 */
    static readonly SevenDay = RedDotPathFactory.create("/SevenDay");
    /** 七日入口/登录 */
    static readonly SevenDay_Login = RedDotPathFactory.create("/SevenDay/Login");
    /** 七日入口/任务 */
    static readonly SevenDay_Task = RedDotPathFactory.create("/SevenDay/Task");
    /** 七日入口/任务/天 */
    static readonly SevenDay_Task_DAY = RedDotPathFactory.create(`/SevenDay/Task/\${day}`, EnumRedDotShowType.REWARD);
    /** 七日入口/任务/天/row */
    static readonly SevenDay_Task_DAY_ROW = RedDotPathFactory.create(`/SevenDay/Task/\${day}/\${taskId}`, EnumRedDotShowType.REWARD);

    // ---------------------------------------- 英雄补给 ------------------------------------------

    /** /英雄补给 */
    static readonly HeroSupply = RedDotPathFactory.create(`/HeroSupply`, EnumRedDotShowType.NULL);
    /** /英雄补给/红点 */
    static readonly HeroSupply_day = RedDotPathFactory.create(`/HeroSupply/\${day}`, EnumRedDotShowType.ITEM_HEIGHT_LIGHT);

    // ----------------------------------------小地图------------------------------------------
    /** 小地图入口 */
    static readonly Map_enter = RedDotPathFactory.create("/Map");
    /** 小地图入口-星球 */
    static readonly Map_star = RedDotPathFactory.create("/Map/star/${key0}", EnumRedDotShowType.REWARD);
    /** 小地图入口-任务 */
    static readonly Map_task = RedDotPathFactory.create("/Map/task/${key0}", EnumRedDotShowType.REWARD);

    // ----------------------------------------小地图------------------------------------------
    /** 女团 -- 入口 */
    // static readonly GirlGroup_enter = RedDotPathFactory.create("/entrance/GirlGroup/${key0}");
    static readonly GirlGroup_enter = RedDotPathFactory.create("/GirlGroup");
    /** 女团 -- 新页签红点 */
    static readonly GirlGroup_tab = RedDotPathFactory.create("/GirlGroup/tab/${key0}", EnumRedDotShowType.NEW);
    /** 女团 -- 每日应援 */
    static readonly GirlGroup_reward1 = RedDotPathFactory.create("/GirlGroup/reward1", EnumRedDotShowType.REWARD);
    /** 女团 -- 全服成团礼 */
    static readonly GirlGroup_reward2 = RedDotPathFactory.create("/GirlGroup/reward2", EnumRedDotShowType.REWARD);
    /** 女团 -- 全服奖励item */
    static readonly GirlGroup_reward2_item = RedDotPathFactory.create("/GirlGroup/reward2/${key0}", EnumRedDotShowType.REWARD);

    // 星际工厂
    static readonly Factory = RedDotPathFactory.create("/Friend/factory", EnumRedDotShowType.MAIN_CITY);
    /**星际工厂我占领奖励*/
    static readonly Factory_occupyReward_item = RedDotPathFactory.create("/Friend/factory/occupyReward/${key0}", EnumRedDotShowType.REWARD);
    /**星际工厂获得新战报*/
    static readonly Factory_record = RedDotPathFactory.create("/Friend/factory/record", EnumRedDotShowType.NORMAL);
    /**星际工厂战报item*/
    static readonly Factory_record_item = RedDotPathFactory.create("/Friend/factory/record/${key0}", EnumRedDotShowType.NORMAL);

    // ----------------------------------------达标活动------------------------------------------
    /**达标活动 -- 入口*/
    static readonly StandardActivity_enter = RedDotPathFactory.create("/StandardActivity/${key0}", EnumRedDotShowType.REWARD);
    /**达标活动 -- 任务页签*/
    static readonly StandardActivity_taskTab = RedDotPathFactory.create("/StandardActivity/${key0}/taskTab", EnumRedDotShowType.REWARD);
    /**达标活动 -- 任务item*/
    static readonly StandardActivity_task = RedDotPathFactory.create("/StandardActivity/${key0}/taskTab/${key1}", EnumRedDotShowType.REWARD);
    /**达标活动 -- 免费礼包页签*/
    static readonly StandardActivity_freeTab = RedDotPathFactory.create("/StandardActivity/${key0}/freeTab", EnumRedDotShowType.REWARD);
    /**达标活动 -- 免费礼包item*/
    static readonly StandardActivity_free = RedDotPathFactory.create("/StandardActivity/${key0}/freeTab/${key1}", EnumRedDotShowType.REWARD);

    // ----------------------------------------冲榜活动------------------------------------------
    /**冲榜活动 -- 入口*/
    static readonly RankActivity_enter = RedDotPathFactory.create("/RankActivity");
    /**冲榜活动 -- 奖励*/
    static readonly RankActivity_reward = RedDotPathFactory.create("/RankActivity/${key0}/reward", EnumRedDotShowType.REWARD);
    /**冲榜活动 -- 奖励item*/
    static readonly RankActivity_reward_item = RedDotPathFactory.create("/RankActivity/${key0}/reward/${key1}", EnumRedDotShowType.REWARD);
    /**冲榜活动 -- tab红点 */
    static readonly RankActivity_tab = RedDotPathFactory.create("/RankActivity/${key0}/tab/${key0}", EnumRedDotShowType.REWARD);

    // ----------------------------------------专武------------------------------------------
    /** 英雄专武激活 */
    static readonly Hero_item_weapon_active = RedDotPathFactory.create(`/hero/list/Hero_item/weapon_active`, EnumRedDotShowType.NEW);
    /** 英雄专武穿戴 */
    static readonly Hero_item_weapon_wear = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/weapon/wear`, EnumRedDotShowType.HIGH);
    /** 英雄专武升级 */
    static readonly Hero_item_weapon_up = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/weapon/up`, EnumRedDotShowType.LV_UP_RED);
    /** 英雄专武专属 */
    static readonly Hero_item_weapon_exclusive = RedDotPathFactory.create(`/hero/list/Hero_item/\${key0}/weapon/exclusive`, EnumRedDotShowType.HIGH);
    /** 背包武器 */
    static readonly backpack_weapon_item = RedDotPathFactory.create(`/backpack/weaponItem/\${key0}`, EnumRedDotShowType.NEW);

    // ----------------------------------------秘境------------------------------------------
    /** 秘境入口 */
    static readonly Secret_enter = RedDotPathFactory.create(`/secret`);
    /** 秘境有挑战次数 */
    static readonly Secret_challenge_times = RedDotPathFactory.create(`/secret/chanllengeTimes`, EnumRedDotShowType.HIGH);
    /** 秘境解锁新层数 */
    static readonly Secret_new_floor = RedDotPathFactory.create(`/secret/new_floor/\${key0}`, EnumRedDotShowType.NEW);
    /** 秘境广告扫荡 */
    static readonly Secret_sweepAd = RedDotPathFactory.create(`/secret/sweepAd`, EnumRedDotShowType.REWARD);

    // ----------------------------------------序列校验------------------------------------------
    /** 序列入口 */
    static readonly Ladder_enter = RedDotPathFactory.create(`/ladder`);
    /** 序列挑战次数 */
    static readonly Ladder_challenge_times = RedDotPathFactory.create(`/ladder/chanllengeTimes`, EnumRedDotShowType.HIGH);

    // ---------------------------------------- 翻牌 ------------------------------------------

    static readonly ActivityFlipCard_grid = RedDotPathFactory.create("/ActivityFlipCard_grid", EnumRedDotShowType.NORMAL);

    // ----------------------------------------双周活动------------------------------------------
    /** 双周活动 - 入口 */
    static readonly DoubleWeekActivity_enter = RedDotPathFactory.create("/DoubleWeekActivity", EnumRedDotShowType.REWARD);
    /** 双周活动 - 任务 */
    static readonly DoubleWeekActivity_task = RedDotPathFactory.create("/DoubleWeekActivity/task/${key0}", EnumRedDotShowType.REWARD);

    // ----------------------------------------组队副本（异星合击）------------------------------------------
    /** 组队副本（异星合击）*/
    static readonly TeamChallenge = RedDotPathFactory.create("/TeamChallenge");
    /** 组队副本（异星合击）章节通关奖励*/
    static readonly TeamChallenge_ALLCRewards = RedDotPathFactory.create("/TeamChallenge/CRewards", EnumRedDotShowType.REWARD);
    /** 组队副本（异星合击）章节通关奖励 单个*/
    static readonly TeamChallenge_CRewards = RedDotPathFactory.create("/TeamChallenge/ChapterRewards/${key0}", EnumRedDotShowType.REWARD);
    /** 是否有加入申请 */
    static readonly TeamChallenge_join = RedDotPathFactory.create("/TeamChallenge/join", EnumRedDotShowType.NORMAL);

    // ----------------------------------------资源勘探------------------------------------------
    /**勘探*/
    static readonly LeagueExplore = RedDotPathFactory.create("/League/explore");
    /**勘探收益*/
    static readonly LeagueExplore_Income = RedDotPathFactory.create("/League/explore/income", EnumRedDotShowType.NORMAL);
    /**勘探占领*/
    static readonly LeagueExplore_occupy = RedDotPathFactory.create("/League/explore/occupy", EnumRedDotShowType.HIGH);

    // ---------------------------------------- 职业试炼 ------------------------------------------
    /** 职业试炼 -- 入口 */
    static readonly CareerTrials_enter = RedDotPathFactory.create("/CareerTrials");
    /** 职业试炼 -- 试玩奖励 */
    static readonly CareerTrials_reward = RedDotPathFactory.create("/CareerTrials/reward/${key0}", EnumRedDotShowType.REWARD);
    /** 职业试炼 -- 登录红点（活动期间永久一次） */
    static readonly CareerTrials_login = RedDotPathFactory.create("/CareerTrials/${key0}/new", EnumRedDotShowType.REWARD);

    /** 职业试炼 -- 异能之路（通行证）入口 */
    static readonly CareerTrials_pass_enter = RedDotPathFactory.create("/CareerTrials_pass");
    /** 职业试炼 -- 异能之路（通行证）奖励tab */
    static readonly CareerTrials_pass_tab = RedDotPathFactory.create("/CareerTrials_pass/tab/award", EnumRedDotShowType.REWARD);
    /** 职业试炼 -- 异能之路（通行证）免费奖励item */
    static readonly CareerTrials_pass_item_free = RedDotPathFactory.create("/CareerTrials_pass/tab/award/free/${key0}", EnumRedDotShowType.REWARD);
    /** 职业试炼 -- 异能之路（通行证）付费奖励item */
    static readonly CareerTrials_pass_item_pay = RedDotPathFactory.create("/CareerTrials_pass/tab/award/pay/${key0}", EnumRedDotShowType.REWARD);
    /** 职业试炼 -- 异能之路（通行证）任务tab */
    static readonly CareerTrials_pass_task = RedDotPathFactory.create("/CareerTrials_pass/tab/task");
    /** 职业试炼 -- 异能之路（通行证）任务tab - 任务类型tab */
    static readonly CareerTrials_pass_task_type = RedDotPathFactory.create("/CareerTrials_pass/tab/task/${key0}");
    /** 职业试炼 -- 异能之路（通行证）任务item */
    static readonly CareerTrials_pass_task_item = RedDotPathFactory.create("/CareerTrials_pass/tab/task/${key0}/${key1}", EnumRedDotShowType.REWARD);

    /** 职业试炼 -- 养成赠礼（基金）入口 */
    static readonly CareerTrials_fund_enter = RedDotPathFactory.create("/CareerTrials_fund");
    /** 职业试炼 -- 养成赠礼（基金）奖励item */
    static readonly CareerTrials_fund_item = RedDotPathFactory.create("/CareerTrials_fund/${key0}", EnumRedDotShowType.REWARD);
    // ---------------------------------------- 赛季活动 ------------------------------------------
    /**赛季入口 */
    static readonly Season = RedDotPathFactory.create("/Season_entrance");
    /**赛季子活动-入口*/
    static readonly Season_sub_entrance = RedDotPathFactory.create("/Season_entrance/${key0}", EnumRedDotShowType.REWARD);
    /**赛季子活动分页红点*/
    static readonly Season_entrance_Rewards = RedDotPathFactory.create("/Season_entrance/${key0}/${key0}", EnumRedDotShowType.REWARD);

    // ---------------------------------------- 职业招募 ------------------------------------------
    /** 职业招募 -- 入口 */
    static readonly CareerRecruit_enter = RedDotPathFactory.create("/CareerRecruit");
    /** 职业招募 -- 单抽 */
    static readonly CareerRecruit_single = RedDotPathFactory.create("/CareerRecruit/single", EnumRedDotShowType.REWARD);
    /** 职业招募 -- 十连抽 */
    static readonly CareerRecruit_ten = RedDotPathFactory.create("/CareerRecruit/ten", EnumRedDotShowType.REWARD);

    /**限时礼包*/
    static readonly LIMIT_PACK = RedDotPathFactory.create("/Limit/", EnumRedDotShowType.REWARD);
    /**限时礼包是否有免费礼包可领取*/
    static readonly LIMIT_PACK_FREE_REWARD_GET = RedDotPathFactory.create("/Limit/freeGet", EnumRedDotShowType.REWARD);

    // ---------------------------------------- 收藏品副本 ------------------------------------------
    /** 收藏品副本入口 */
    static readonly CollectiblesDungeon = RedDotPathFactory.create("/CollectiblesDungeon");
    /** 收藏品副本扫荡 */
    static readonly CollectiblesDungeon_sweep = RedDotPathFactory.create("/CollectiblesDungeon/sweep", EnumRedDotShowType.HIGH);
    /** 收藏品副本章节*/
    static readonly CollectiblesDungeon_chapter = RedDotPathFactory.create("/CollectiblesDungeon/chapter");
    /** 收藏品副本章节*/
    static readonly CollectiblesDungeon_chapter_item = RedDotPathFactory.create("/CollectiblesDungeon/chapter/${key0}");
    /** 收藏品副本入口 */
    static readonly CollectiblesDungeon_chapter_item_reward = RedDotPathFactory.create("/CollectiblesDungeon/chapter/${key0}/reward//${key1}", EnumRedDotShowType.REWARD);

    // ---------------------------------------- 宠物副本 ------------------------------------------
    /** 宠物副本入口 */
    static readonly PetDungeon = RedDotPathFactory.create("/PetDungeon");
    /** 宠物副本新玩具 红点独立不传递外部*/
    static readonly PetDungeon_newToy = RedDotPathFactory.create("/NewToyPetDungeon", EnumRedDotShowType.NORMAL);

    // ---------------------------------------- 模拟经营 ------------------------------------------
    /** 模拟经营入口 */
    static readonly Stimulation = RedDotPathFactory.create("/Stimulation/${key0}");
    /** 模拟经营广告 */
    static readonly Stimulation_Ad = RedDotPathFactory.create("/Stimulation/${key0}/Ad", EnumRedDotShowType.HIGH);
}
