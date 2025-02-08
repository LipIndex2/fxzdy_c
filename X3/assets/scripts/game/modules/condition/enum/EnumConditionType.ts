/**
 * 前端扩展的为 < 0
 * 扩展后端的条件类型 | 后端部分需要自己手动复制.
 * {@link ServerEnums.PlayerVerifyType}
 */
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export enum EnumConditionType {
    // ---------------------------------- 前端部分 ----------------------------------------

    /**
     * 活动未完成时才显示
     * ACTIVITY_NOT_DONE,${活动id},0
     */
    ACTIVITY_NOT_DONE = -1,

    /**
     * 守卫母舰通关层数
     */
    PASS_GUARD_SHIP_INSTANCE_FLOOR_GE = -2,
    /**
     * 某个活动完成
     * ACTIVITY_IS_OVER,${活动id},0
     */
    ACTIVITY_IS_OVER = -3,

    /**
     * 赛季活动是否开启
     */
    SEASON_ACTIVITY_OPEN = -4,

    /**
     * 某个活动有商品可购买
     * ACTIVITY_HAS_GOODS_BUY,${活动id},0
     */
    ACTIVITY_HAS_GOODS_BUY = -5,

    /**
     * 某个活动有奖励未领取
     * ACTIVITY_HAS_AWARD,${活动id},0
     */
    ACTIVITY_HAS_AWARD = -6,

    /**
     * 未达到挂机关卡
     * ACTIVITY_HAS_AWARD,${关卡id},0
     */
    UNDER_TRUNK_INSTANCE = -7,

    /**
     * 活动冲榜结算弹出状态 0未弹出 1弹出 
     * ACTIVITY_RUSH_RANK_SETTLE_POP,${活动id},0
     */
    ACTIVITY_RUSH_RANK_SETTLE_POP = -8,

    /**
     * 活动今日是否弹出过 0未弹出 1弹出 
     * ACTIVITY_POP_TODAY,${弹框id},0
     */
    ACTIVITY_POP_TODAY = -9, 


    // ---------------------------------- 后端部分 ----------------------------------------

    /**
   * 玩家共鸣等级>=target
   */
    PLAYER_LEVEL_GE = 1,
    /**
    * 主线地图解锁建筑,param配置建筑ID
    */
    UNLOCK_BUILDING = 2,
    /**
    * 挂机关卡通关X关,param配置TrunkInstanceConfig.id
    */
    PASS_TRUNK_INSTANCE = 3,
    /**
    * 完结指定主线任务(指领取任务奖励后),param配置TrunkTaskConfig.id
    */
    FINISH_ASSIGN_TRUNK_TASK = 4,
    /**
    * 完成指定引导ID,param配置GuideConfig.id
    */
    FINISH_ASSIGN_GUIDE = 5,
    /**
    * 创角天数>=target
    */
    ROLE_CREATE_DAYS_GE = 6,
    /**
    * 激活指定星级英雄数量>=target,param配置英雄星级
    */
    ACTIVE_ASSIGN_STAR_HERO_COUNT_GE = 7,
    /**
    * 竞技场最高段位>=target
    */
    ARENA_MAX_RANK_GE = 8,
    /**
    * 每日Boss解锁难度>=target
    */
    DAILY_BOSS_UNLOCK_DIFFICULTY_GE = 9,
    /**
    * 秘境通关层数>=target
    */
    PASS_SECRET_INSTANCE_FLOOR_GE = 10,
    /**
    * 序列校验总层数>=target
    */
    LADDER_FLOOR_SUM_GE = 11,
    /**
    * 探索过X地图,param配置地图ID,对应MapidConfig的id
    */
    EXPLORE_MAP = 12,
    /**
    * 玩家VIP等级>=target
    */
    VIP_LEVEL_GE = 13,
    /**
    * 完成指定主线任务,param配置TrunkTaskConfig.id
    */
    COMPLETE_ASSIGN_TRUNK_TASK = 14,
    /**
    * 联盟等级>=目标值
    */
    LEAGUE_LEVEL_GE = 15,
    /**
    * 秘境通关层数==目标值
    */
    PASS_ASSIGN_SECRET_INSTANCE_FLOOR = 16,
    /**
    * 激活天赋数量>=target，param配置天赋类型(参考"TalentType")
    */
    ACTIVE_TALENT_AMT_GE = 17,
    /**
    * 指定英雄星级>=target，param配置英雄Id，即HeroConfig的Id
    */
    ASSIGN_HERO_STAR_GE = 18,
    /**
    * 最近X天付费金额>=target(单位：分)，param为天数，最大支持30天
    */
    RECENTLY_DAILY_CHARGE_GE = 19,
    /**
    * 最近X天付费金额<target(单位：分)，param为天数，最大支持30天
    */
    RECENTLY_DAILY_CHARGE_LE = 20,
    /**
    * 指定英雄激活皮肤，param配置英雄Id，即HeroConfig的Id，target配置皮肤Id，即HeroSkinConfig的Id
    */
    ASSIGN_HERO_ACTIVE_SKIN = 21,
    /**
    * 指定X英雄升至Y星缺少碎片数<=target，param为heroId_star，其中heroId为HeroConfig的Id，star为星级，二者用“_”分隔
    */
    ASSIGN_HERO_UP_STAR_LACK_FRAGMENT_AMT_LE = 22,
    /**
    * 指定Id特权卡特权卡处于激活状态，param为MonthCardConfig的Id
    */
    ASSIGN_MONTH_CARD_ACTIVATED = 23,
    /**
    * 累计付费金额>=target(单位：分)
    */
    TOTAL_CHARGE_GE = 24,
    /**
    * 玩家拥有X品质Y星级专属武器数量>=target，param为quality_star，二者用“_”分隔
    */
    ASSIGN_QUALITY_STAR_AWAKE_WEAPON_AMT_GE = 25,
    /**
    * 玩家是否参与联盟对决，不支持被动触发，仅支持主动校验
    */
    PLAYER_JOIN_LEAGUE_WAR = 26,
    /**
    * 指定充值商品Id购买数量>=target，param为chargeGoodsId，即ChargeGoodsConfig的Id(注：不包含优惠券购买)
    */
    ASSIGN_GOODS_REAL_CHARGE_SUM_GE = 27,
    /**
    * 指定等级的魔方数量>=target，param为等级
    */
    ASSIGN_LEVEL_MAGIC_CUBE_AMT_GE = 28,
    /**
    * 穿戴装备数量>=target
    */
    WEAR_EQUIP_AMT_GE = 29,
    /**
    * 指定充值商品Id购买数量>=target，param为chargeGoodsId，即ChargeGoodsConfig的Id(注：所有方式购买)
    */
    ASSIGN_GOODS_CHARGE_SUM_GE = 30,
    /**
    * 普通招募总数>=target
    */
    TOTAL_NORMAL_RECRUIT_TIMES_GE = 31,
    /**
    * 激活指定天赋，param为TalentConfig的Id
    */
    ACTIVE_ASSIGN_TALENT = 32,
    /**
    * 玩家进入联盟对决玩法界面次数>=target
    */
    PLAYER_ENTER_LEAGUE_WAR_COUNT_GE = 33,
    /**
    * 获得指定部位装备，param为positionId，即EquipPositionConfig的Id
    */
    GAIN_ASSIGN_POSITION_EQUIP = 34,
    /**
    * 联盟对决挑战次数>=target
    */
    LEAGUE_WAR_CHALLENGE_COUNT_GE = 35,
    /**
    * 开服天数>=target，不支持被动触发，仅支持主动校验
    */
    SYSTEM_OPEN_DAY_GE = 36,
    /**
    * 模拟经营指定设备的等级>=target，param为deviceId，即StimulationDeviceConfig的Id
    */
    STIMULATION_ASSIGN_DEVICE_LEVEL_GE = 37,
    /**
     * 是否加入组队副本队伍,不支持被动触发，仅支持主动校验
     */
    TEAM_INSTANCE_IN = 38,

    /**
    * 开服小时数>=target，如11:59开服，则11:00为开服第一个小时，不支持被动触发，仅支持主动校验
    */
    SYSTEM_OPEN_HOUR_GE = 39,

    /**
   * 玩家道具数量>=target，param为itemId，即ItemConfig的Id，不支持被动触发，仅支持主动校验
   */
    ITEM_AMOUNT_GE = 40,

    /**
     * 指定任务是否完成，param为任务类型(参考"TaskType")，target为taskId
     */
    ASSIGN_TASK_COMPLETED = 43,
    /**
    * 任意战队科技等级>=target
    */
    CAPTAIN_SKILL_LEVEL_GE = 44,
}
