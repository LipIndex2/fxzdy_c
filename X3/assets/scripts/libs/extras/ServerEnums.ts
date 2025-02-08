export namespace ServerEnums {
    /**
     * 活动招募奖励类型
     */
    export enum ActivityRecruitRewardType {
        /**
        * 大奖
        */
        JACKPOT = 1,
        /**
        * 二等奖
        */
        SECOND = 2,
    }
    /**
     * 活动开启类型
     */
    export enum ActivityStartType {
        /**
        * 正常
        */
        NORMAL = 1,
        /**
        * 老服不开，只在开服时间大于指定时间的新服开
        */
        OPEN_IN_NEW_SERVER = 2,
        /**
        * 不再开启新活动，已开启的继续
        */
        NO_LONGER_OPEN = 3,
    }
    /**
     * 循环活动状态
     */
    export enum ActivityState {
        /**
        * 尚未开启
        */
        NOT_START = 1,
        /**
        * 尚未开始展示
        */
        START_BUT_NO_SHOW = 2,
        /**
        * 开启中
        */
        START = 3,
        /**
        * 领奖阶段
        */
        REWARD = 4,
        /**
        * 整个活动结束
        */
        STOP = 5,
    }
    /**
     * 活动任务重置类型
     */
    export enum ActivityTaskResetType {
        /**
        * 永不重置
        */
        NEVER = 1,
        /**
        * 每天重置
        */
        DAILY = 2,
        /**
        * 每周
        */
        WEEKLY = 3,
    }
    /**
     * 循环活动类型
     */
    export enum ActivityType {
        /**
        * 首充
        */
        FIRST_CHARGE = 1,
        /**
        * 签到
        */
        SIGN = 2,
        /**
        * 成长之路
        */
        GROW_UP = 3,
        /**
        * 展示(无业务逻辑)
        */
        DISPLAY = 4,
        /**
        * 通行证
        */
        BATTLE_PASS = 5,
        /**
        * 开服冲榜
        */
        RUSH_RANK = 6,
        /**
        * 开服累充
        */
        TOTAL_CHARGE = 7,
        /**
        * 开服累天充值
        */
        TOTAL_CHARGE_DAY = 8,
        /**
        * 活动商城
        */
        ACTIVITY_MALL = 9,
        /**
        * 基金
        */
        FUND = 10,
        /**
        * 七日嘉年华
        */
        CARNIVAL = 11,
        /**
        * 星钻银行
        */
        DIAMOND_BANK = 12,
        /**
        * 女团
        */
        GIRL_GROUP = 13,
        /**
        * 英雄补给
        */
        HERO_SUPPLY = 14,
        /**
        * 达标
        */
        REACH_STANDARD = 15,
        /**
        * 星灵礼包
        */
        PET_GIFT = 16,
        /**
        * 双周活动(带版本号控制的任务活动)
        */
        DOUBLE_WEEKLY = 17,
        /**
        * 抽奖活动
        */
        LOTTERY = 19,
        /**
        * 职业试炼
        */
        CAREER_TRIAL = 20,
        /**
        * 职业招募
        */
        CAREER_RECRUIT = 21,
        /**
        * 轮盘抽奖
        */
        ROULETTE_LOTTERY = 22,
        /**
        * 召唤英雄
        */
        CALL_HERO = 23,
        /**
        * 塔抽奖活动
        */
        TOWER_LOTTERY = 24,
        /**
        * 重置达标(即其中的任务进度可能会重置)
        */
        RESET_REACH = 25,
        /**
        * 跨服冲榜
        */
        CROSS_RUSH_RANK = 26,
    }
    /**
     * 通行证任务重置类型
     */
    export enum BattlePassTaskResetType {
        /**
        * 永不重置
        */
        NEVER = 1,
        /**
        * 每天重置
        */
        DAILY = 2,
        /**
        * 每周
        */
        WEEKLY = 3,
    }
    /**
     * 抽奖奖励类型
     */
    export enum LotteryRewardType {
        /**
        * 大奖
        */
        JACKPOT = 1,
        /**
        * 中奖
        */
        MIDDLE = 2,
        /**
        * 小奖
        */
        NORMAL = 3,
    }
    /**
     * 开服冲榜类型
     */
    export enum RushRankType {
        /**
        * 挂机关卡，对应活动类型为RUSH_RANK
        */
        TRUNK_INSTANCE = 1,
        /**
        * 秘境关卡，对应活动类型为RUSH_RANK
        */
        SECRET_INSTANCE = 2,
        /**
        * 英雄招募积分，对应活动类型为RUSH_RANK
        */
        HERO_RECRUIT_SCORE = 3,
        /**
        * 秘境周通关次数，对应活动类型为RUSH_RANK
        */
        SECRET_INSTANCE_WEEK_PASS_AMT = 4,
        /**
        * 冲榜序列校验，对应活动类型为RUSH_RANK
        */
        RUSH_LADDER = 5,
        /**
        * 次元连通活动积分，对应活动类型为CROSS_RUSH_RANK
        */
        PARALLEL_ACTIVITY_SCORE = 6,
    }
    /**
     * 广告特权类型
     */
    export enum AdvertType {
        /**
        * 限购商城广告免费购买,参数:MallGoodsConfig的id
        */
        MALL = 1,
        /**
        * 商店广告免费购买,参数:ShopGoodsConfig的id
        */
        SHOP = 2,
        /**
        * 超武招募广告免费次数
        */
        WEAPON_RECRUIT = 3,
        /**
        * 快速挂机广告免费次数
        */
        FAST_HANG_UP = 4,
        /**
        * 每日BOSS广告免费挑战次数
        */
        DAILY_BOSS = 5,
        /**
        * 大地图BOSS广告首杀额外奖励
        */
        TRUNK_MAP_BOSS_EXTRA_REWARD = 6,
        /**
        * 大地图宝箱广告双倍奖励
        */
        TRUNK_MAP_BOX_DOUBLE_REWARD = 7,
        /**
        * 主城随机宝箱广告奖励
        */
        MAIN_CITY_RANDOM_BOX_REWARD = 8,
        /**
        * 宠物副本刷新宝箱广告
        */
        REFRESH_PET_DUNGEON_TOY_BOX = 9,
        /**
        * 普通招募广告免费次数
        */
        NORMAL_RECRUIT = 10,
        /**
        * 秘境广告免费次数
        */
        SECRET_INSTANCE = 11,
        /**
        * 收藏品副本挑战广告次数
        */
        COLLECTIBLES_DUNGEON = 12,
        /**
        * 联盟boss广告免费挑战次数
        */
        LEAGUE_BOSS = 13,
        /**
        * 模拟经营设备升级
        */
        STIMULATION_DEVICE_UP_LEVEL = 14,
        /**
        * 无尽秘境广告免费次数
        */
        ENDLESS_SECRET = 15,
    }
    /**
     * 专属武器类型
     */
    export enum AwakeWeaponType {
        /**
        * 通用武器
        */
        GENERAL = 1,
        /**
        * 专属武器
        */
        EXCLUSIVE = 2,
    }
    /**
     * 战队科技生效类型
     */
    export enum CaptainEffectType {
        /**
        * 守护
        */
        TANK = 1,
        /**
        * 格斗
        */
        FIGHTER = 2,
        /**
        * 异能
        */
        MAGE = 3,
        /**
        * 射击
        */
        MARKSMAN = 4,
        /**
        * 重骑
        */
        RIDER = 5,
        /**
        * 辅助
        */
        SUPPORT = 6,
        /**
        * 近战
        */
        MELEE = 7,
        /**
        * 远程
        */
        RANGED = 8,
    }
    /**
     * 公告范围
     */
    export enum PostScope {
        /**
        * 本服
        */
        SERVER = 1,
        /**
        * 次元连通
        */
        PARALLEL_SPACE = 2,
    }
    /**
     * 收藏玩法条件类型
     */
    export enum CollectiblesDungeonConditionType {
        /**
        * 战斗后X秒后胜利 START_BATTLE_AFTER,0,X
        */
        START_BATTLE_AFTER = 1,
        /**
        * 阵亡英雄数量小于等于X个 DEAD_HEROES_LESS,0,X
        */
        DEAD_HEROES_LESS = 2,
        /**
        * 通关时保持血量X% KEEP_HP_POINT,0,X
        */
        KEEP_HP_POINT = 3,
        /**
        * 战斗胜利 BATTLE_WIN,0,0
        */
        BATTLE_WIN = 4,
        /**
        * 至少上阵x职业的英雄n名 UP_SET_CAREER,x(TANK),n
        */
        UP_SET_CAREER = 5,
        /**
        * 至少上阵x种族的英雄n名 UP_SET_CAMP,x,n
        */
        UP_SET_CAMP = 6,
    }
    /**
     * 每日BOSS进度类型
     */
    export enum DailyBossProgressType {
        /**
        * 百分比伤害
        */
        PERCENT = 1,
        /**
        * 伤害值
        */
        VALUE = 2,
    }
    /**
     * 每日特惠类型
     */
    export enum DailySaleType {
        /**
        * 免费礼包
        */
        FREE = 1,
        /**
        * 充值礼包
        */
        GOODS = 2,
        /**
        * 打包价礼包
        */
        PACK_GOODS = 3,
    }
    /**
     * 抽卡类型
     */
    export enum DrawCardType {
        /**
        * 宠物抽卡
        */
        PET = 1,
        /**
        * 神装抽卡BIG_REWARD
        */
        GOD_EQUIP = 2,
        /**
        * 收藏品抽卡
        */
        COLLECTIBLES = 3,
    }
    /**
     * 邮件数量限制类型
     */
    export enum PlayerEmailCountLimitType {
        /**
        * 不限制
        */
        NONE = 1,
        /**
        * 每周,每周一凌晨五点重置
        */
        WEEKLY = 2,
        /**
        * 每日,每日凌晨五点重置
        */
        DAILY = 3,
    }
    /**
     * 无尽秘境副本类型
     */
    export enum EndlessSecretType {
        /**
        * 常规模式
        */
        NORMAL = 1,
        /**
        * 地狱模式
        */
        DIFFICULT = 2,
    }
    /**
     * 给与好友礼物状态
     */
    export enum GiveFriendGiftState {
        /**
        * 未赠送
        */
        NOT_GIVE = 1,
        /**
        * 已赠送
        */
        HAD_GIVEN = 2,
        /**
        * 已领取
        */
        HAD_DRAW = 3,
    }
    /**
     * 守卫母舰波次类型
     */
    export enum GuardShipRoundType {
        /**
        * 普通波次
        */
        NORMAL = 1,
        /**
        * Boss波次
        */
        BOSS = 2,
    }
    /**
     * 守卫母舰业务效果类型
     */
    export enum GuardShipStuffEffectType {
        /**
        * 经验增加比率，参数：万分比
        */
        EXP_ADDITION_RATIO = 1,
        /**
        * 升级时多选一个Buff增加的概率，参数：万分比
        */
        EXTRA_SKILL_ADDITION_RATE = 2,
        /**
        * Buff额外备选数量，参数：额外数目
        */
        SKILL_ADDITION_OPTIONAL_COUNT = 3,
        /**
        * 连升X级，参数：加X级
        */
        UP_LEVEL = 4,
        /**
        * 增加道具掉落概率，参数：万分比
        */
        ITEM_DROP_ADDITION_RATE = 5,
    }
    /**
     * 图鉴积分类型
     */
    export enum IllustrationsScoreType {
        /**
        * 首次激活英雄，参数格式：英雄品质
        */
        ACTIVE_HERO = 1,
        /**
        * 英雄升星，参数格式：英雄品质,星级
        */
        HERO_UP_STAR = 2,
        /**
        * 首次激活专属武器，参数格式：专武品质
        */
        ACTIVE_AWAKE_WEAPON = 3,
        /**
        * 专属武器升星，参数格式：专武品质,星级
        */
        AWAKE_WEAPON_UP_STAR = 4,
        /**
        * 星灵宠物升星,参数格式：宠物品质,星级
        */
        PET_UP_STAR = 5,
        /**
        * 首次激活星灵宠物,参数格式：宠物品质
        */
        ACTIVE_PET = 6,
        /**
        * 首次激活收藏品，参数格式：收藏品品质
        */
        ACTIVE_COLLECTIBLES = 7,
        /**
        * 收藏品升星，参数格式：收藏品品质,星级
        */
        COLLECTIBLES_UP_STAR = 8,
    }
    /**
     * 联盟职位类型
     */
    export enum LeagueJobType {
        /**
        * 盟主
        */
        LEADER = 1,
        /**
        * 副盟主
        */
        DEPUTY_LEADER = 2,
        /**
        * 成员
        */
        MEMBER = 3,
    }
    /**
     * 联盟权限类型
     */
    export enum LeaguePermissionType {
        /**
        * 转让盟主
        */
        TRANSFER_LEADER = 1,
        /**
        * 成员任命
        */
        MEMBER_APPOINT = 2,
        /**
        * 联盟设置
        */
        LEAGUE_SETTING = 3,
        /**
        * 移除成员
        */
        REMOVE_MEMBER = 4,
        /**
        * 申请审批
        */
        APPLY_APPROVAL = 5,
        /**
        * 全员邮件
        */
        LEAGUE_EMAIL = 6,
        /**
        * 联盟公告
        */
        LEAGUE_NOTICE = 7,
        /**
        * 成员邀请
        */
        MEMBER_INVITE = 8,
    }
    /**
     * 资源勘探建筑状态
     */
    export enum LeagueExploreBuildingState {
        /**
        * 空闲状态
        */
        IDLE = 1,
        /**
        * 击破状态
        */
        CHANGE_HANDS = 2,
        /**
        * 占领后保护状态
        */
        PROTECTED = 3,
        /**
        * 正常占领状态
        */
        NORMAL_OCCUPY = 4,
    }
    /**
     * 联盟资源勘探建筑类型
     */
    export enum LeagueExploreBuildingType {
        /**
        * 工厂
        */
        FACTORY = 1,
        /**
        * 矿场
        */
        MINE = 2,
    }
    /**
     * 资源勘探日志类型
     */
    export enum LeagueExploreLogType {
        /**
        * 占领建筑
        */
        OCCUPY_BUILDING = 1,
        /**
        * 建筑被占领
        */
        BE_OCCUPY_BUILDING = 2,
        /**
        * 进攻建筑驻守玩家
        */
        ATTACK_BUILDING_DEFENDER = 3,
        /**
        * 防守建筑
        */
        DEFEND_BUILDING = 4,
    }
    /**
     * 资源勘探操作类型
     */
    export enum LeagueExploreOperateType {
        /**
        * 进攻
        */
        ATTACK = 1,
        /**
        * 占领
        */
        OCCUPY = 2,
        /**
        * 交换
        */
        EXCHANGE = 3,
    }
    /**
     * 商城商品限购类型
     */
    export enum MallGoodsLimitBuyType {
        /**
        * 永久限购
        */
        FOREVER = 1,
        /**
        * 每月限购
        */
        MONTHLY = 2,
        /**
        * 每两周限购
        */
        DOUBLE_WEEKLY = 3,
        /**
        * 每周限购
        */
        WEEKLY = 4,
        /**
        * 每日限购
        */
        DAILY = 5,
        /**
        * 不限购
        */
        NEVER = 6,
    }
    /**
     * 商品类型
     */
    export enum MallGoodsType {
        /**
        * VIP类型
        */
        VIP = 1,
        /**
        * 开服类型
        */
        SERVER_OPEN = 2,
        /**
        * 限购类型
        */
        LIMIT_BUY = 3,
        /**
        * 推送类型
        */
        POPUP = 4,
    }
    /**
     * 推送礼包有效时间类型
     */
    export enum MallPopupValidTimeType {
        /**
        * 触发后开始倒计时
        */
        TRIGGER = 1,
        /**
        * 触发当天服务器零点开始倒计时，如：当天12点触发，有效时间也从0点开始计算
        */
        TRIGGER_DAY_ZERO = 2,
    }
    /**
     * 特权卡加成类型
     */
    export enum MonthCardAdditionType {
        /**
        * 主线关卡挂机托管，参数：无，加成值：无
        */
        TRUNK_INSTANCE_HANG_UP = 1,
        /**
        * 领取普通招募次数奖励，参数:无，加成值:无
        */
        DRAW_NORMAL_RECRUIT_TIMES_REWARD = 2,
        /**
        * 免广告，参数:无，加成值:无，纯展示
        */
        SKIP_AD = 3,
        /**
        * 资源勘探道具产出加成，参数：无，加成值：额外万分比
        */
        LEAGUE_EXPLORE_REWARD_ADDITION = 4,
        /**
        * 资源勘探挂机时间上限加成,参数：无，加成值：分钟
        */
        LEAGUE_EXPLORE_HANG_UP_TIME_ADDITION = 5,
    }
    /**
     * 特权卡类型
     */
    export enum MonthCardType {
        /**
        * 月卡
        */
        MONTH = 1,
        /**
        * 终身卡
        */
        FOREVER = 2,
        /**
        * 矿卡
        */
        MINERAL = 3,
    }
    /**
     * 充值商品类型
     */
    export enum ChargeGoodsType {
        /**
        * 普通充值
        */
        NORMAL = 1,
        /**
        * 宝券
        */
        CHARGE_COUPON = 2,
        /**
        * 首充
        */
        FIRST_CHARGE = 3,
        /**
        * 每日特惠
        */
        DAILY_SALE = 4,
        /**
        * 商城
        */
        MALL = 5,
        /**
        * 特权卡
        */
        MONTH_CARD = 6,
        /**
        * 基金
        */
        FUND = 7,
        /**
        * 通行证
        */
        BATTLE_PASS = 8,
        /**
        * 活动商城
        */
        ACTIVITY_MALL = 9,
        /**
        * 星钻银行
        */
        DIAMOND_BANK = 10,
        /**
        * 女团
        */
        GIRL_GROUP = 11,
        /**
        * 达标
        */
        REACH_STANDARD = 12,
        /**
        * 英雄补给
        */
        HERO_SUPPLY = 13,
        /**
        * 星灵礼包
        */
        PET_GIFT = 14,
        /**
        * 职业试炼
        */
        CAREER_TRIAL = 15,
        /**
        * 重置达标
        */
        RESET_REACH = 16,
    }
    /**
     * 玩家限时资源类型
     */
    export enum PlayerTimeLimitResourceType {
    }
    /**
     * 招募类型
     */
    export enum RecruitType {
        /**
        * 普通招募
        */
        NORMAL = 1,
        /**
        * 高级招募
        */
        SPECIAL = 2,
        /**
        * 专属武器普通招募
        */
        AWAKE_WEAPON_NORMAL = 3,
        /**
        * 专属武器高级招募
        */
        AWAKE_WEAPON_SPECIAL = 4,
        /**
        * 活动相关招募
        */
        ACTIVITY_RECRUIT = 5,
    }
    /**
     * 活动特殊掉落类型
     */
    export enum ActivitySpecialDropType {
        /**
        * 主线关卡挂机，参数：间隔秒数
        */
        TRUNK_INSTANCE_HANG_UP = 1,
    }
    /**
     * 奖励记录重置类型
     */
    export enum RewardResetType {
        /**
        * 永远不重置
        */
        NEVER = 1,
        /**
        * 每天
        */
        DAY = 2,
        /**
        * 每周
        */
        WEEK = 3,
        /**
        * 每月
        */
        MONTH = 4,
        /**
        * 每隔几天，个人限制以创角时间为开始的N天，全服限制则为开服时间
        */
        PER_DAY = 5,
    }
    /**
     * 赛季活动开始类型
     */
    export enum SeasonActivityStartType {
        /**
        * 正常
        */
        NORMAL = 1,
        /**
        * 老服不开，仅在开服时间大于指定时间的新服开
        */
        OPEN_IN_NEW_SERVER = 2,
        /**
        * 不再开启新活动，已开启的继续
        */
        NO_LONGER_OPEN = 3,
    }
    /**
     * 赛季活动状态
     */
    export enum SeasonActivityState {
        /**
        * 未开始
        */
        NOT_START = 1,
        /**
        * 开启中
        */
        START = 2,
        /**
        * 已结束
        */
        STOP = 3,
    }
    /**
     * 赛季活动时间类型
     */
    export enum SeasonActivityTimeType {
        /**
        * 手动指定，格式：yyyy-MM-dd HH:mm:ss
        */
        MANUAL = 1,
        /**
        * 开服时间点+延迟小时，格式：延迟小时
        */
        SERVER_OPEN_DELAY_HOUR = 2,
        /**
        * 开服当天零点+延迟小时，格式：延迟小时
        */
        SERVER_OPEN_FIRST_DELAY_HOUR = 3,
        /**
        * 以系统开始时间点为跨天时间点的开服当天延迟小时，格式：延迟小时
        */
        SERVER_OPEN_FIRST_DAY_DELAY_HOUR = 4,
        /**
        * 相对与上一个时间点的延迟小时，仅用于结束时间，格式：延迟小时
        */
        DELAY_HOUR = 5,
    }
    /**
     * 赛季达标积分类型
     */
    export enum SeasonReachScoreType {
        /**
        * 英雄升星，参数格式：英雄品质,星级
        */
        HERO_UP_STAR = 1,
        /**
        * 专属武器升星，参数格式：专武品质,星级
        */
        AWAKE_WEAPON_UP_STAR = 2,
        /**
        * 星灵宠物升星，参数格式：宠物品质,星级
        */
        PET_UP_STAR = 3,
        /**
        * 竞技场挑战胜利，参数格式：无
        */
        ARENA_CHALLENGE_WIN = 4,
        /**
        * 竞技场挑战失败，参数格式：无
        */
        ARENA_CHALLENGE_LOSE = 5,
        /**
        * 竞技场每日结算，参数格式：排名，如填5，则1-5名皆获得此积分值
        */
        ARENA_DAILY_SETTLE = 6,
        /**
        * 资源勘探，参数格式：无，仅需在SeasonReachScoreConvertConfig配置，SeasonReachScoreConfig中不需配置
        */
        LEAGUE_EXPLORE = 7,
    }
    /**
     * 赛季冲榜类型
     */
    export enum SeasonRushRankType {
        /**
        * 赛季积分
        */
        SEASON_SCORE = 1,
        /**
        * 赛季秘境
        */
        SEASON_SECRET = 2,
        /**
        * 赛季Boss
        */
        SEASON_BOSS = 3,
    }
    /**
     * 赛季子活动状态
     */
    export enum SubSeasonActivityState {
        /**
        * 未开始
        */
        NOT_START = 1,
        /**
        * 开启中
        */
        START = 2,
        /**
        * 结算-兼容线上数据，故Id较大
        */
        SETTLE = 4,
        /**
        * 已结束
        */
        STOP = 3,
    }
    /**
     * 赛季子活动类型
     */
    export enum SubSeasonActivityType {
        /**
        * 报名
        */
        SIGN_UP = 1,
        /**
        * 赛季积分冲榜
        */
        SEASON_SCORE_RUSH_RANK = 2,
        /**
        * 赛季达标
        */
        SEASON_REACH = 3,
        /**
        * 赛季秘境
        */
        SEASON_SECRET = 4,
        /**
        * 赛季Boss
        */
        SEASON_BOSS = 5,
    }
    /**
     * 秘境副本类型
     */
    export enum SecretInstanceType {
        /**
        * 常规模式
        */
        NORMAL = 1,
        /**
        * 地狱模式
        */
        DIFFICULT = 2,
    }
    /**
     * 玩家展示信息类型
     */
    export enum ShowInfoType {
        /**
        * 头像
        */
        HEAD_ICON = 1,
        /**
        * 头像框
        */
        HEAD_FRAME = 2,
        /**
        * 称号
        */
        TITLE = 3,
        /**
        * 形象
        */
        IMAGE = 4,
        /**
        * 聊天框
        */
        CHAT_BOX = 5,
        /**
        * 聊天文字颜色
        */
        CHAT_WORD_COLOR = 6,
    }
    /**
     * 商品限购类型
     */
    export enum GoodsLimitBuyType {
        /**
        * 永久限购
        */
        FOREVER = 1,
        /**
        * 每月限购
        */
        MONTH = 2,
        /**
        * 每周限购
        */
        WEEKLY = 3,
        /**
        * 每日限购
        */
        DAILY = 4,
        /**
        * 不限购
        */
        NEVER = 5,
        /**
        * 自定义限购(其他功能手动调用刷新)
        */
        CUSTOM = 6,
    }
    /**
     * 商店刷新类型
     */
    export enum ShopRefreshType {
        /**
        * 自动刷新,不能手动刷新
        */
        AUTO_REFRESH = 1,
        /**
        * 手动刷新,没有自动刷新时间
        */
        MANUAL_REFRESH = 2,
        /**
        * 永不刷新
        */
        NEVER_REFRESH = 3,
        /**
        * 指定自动刷新时间且可以手动刷新
        */
        AUTO_AND_MANUAL_REFRESH = 4,
    }
    /**
     * 天赋生效类型
     */
    export enum TalentEffectType {
        /**
        * 守护
        */
        TANK = 1,
        /**
        * 格斗
        */
        FIGHTER = 2,
        /**
        * 异能
        */
        MAGE = 3,
        /**
        * 射击
        */
        MARKSMAN = 4,
        /**
        * 重骑
        */
        RIDER = 5,
        /**
        * 辅助
        */
        SUPPORT = 6,
        /**
        * 近战
        */
        MELEE = 7,
        /**
        * 远程
        */
        RANGED = 8,
    }
    /**
     * 天赋类型
     */
    export enum TalentType {
        /**
        * 普通天赋
        */
        NORMAL = 1,
        /**
        * 高级天赋
        */
        ADVANCED = 2,
    }
    /**
     * 任务更新事件类型<pre>支持处理器处理多个事件类型和单个事件对应多个处理器处理</pre>
     */
    export enum TaskEventType {
        /**
        * 登录游戏(激活后统计)
        */
        LOGIN = 1,
        /**
        * 分享游戏(激活后统计)
        */
        SHARE_GAME = 2,
        /**
        * X个英雄(阵位)升至level级,X为进度(历史统计)
        */
        POSITION_UP_ASSIGN_LV = 3,
        /**
        * X个英雄(阵位)升至stage阶,X为进度(历史统计)
        */
        POSITION_UP_ASSIGN_STAGE = 4,
        /**
        * X个英雄升至star星,X为进度(历史统计)
        */
        HERO_UP_ASSIGN_STAR = 5,
        /**
        * 激活X个quality品质的英雄,X为进度(历史统计)
        */
        ACTIVE_ASSIGN_QUALITY_HERO = 6,
        /**
        * 在通用商店shopId(不指定为任意商店)购买X次道具,X为进度(激活后统计)
        */
        ASSIGN_SHOP_BUY = 7,
        /**
        * 解锁/激活建筑buildingId,对应MapBuildingConfig.id(历史统计)
        */
        ACTIVE_BUILDING = 8,
        /**
        * 主线地图击杀X个怪物monsterId(MapMonsterConfig.id)，不指定monsterId则为任意怪物，X为进度(激活后统计)
        */
        TRUNK_MAP_KILL_MONSTER = 9,
        /**
        * 主线地图收集X个矿产资源物品itemId(对应Map),X为进度(激活后统计)
        */
        TRUNK_MAP_COLLECT_MINERAL = 10,
        /**
        * 挂机关卡领取X次挂机资源,X为进度(激活后统计)
        */
        DRAW_TRUNK_INSTANCE_HANG_UP = 11,
        /**
        * 挂机关卡领取X次快速挂机,X为进度(激活后统计)
        */
        DRAW_TRUNK_INSTANCE_FAST_HANG_UP = 12,
        /**
        * 获得X件level级quality品质的装备,X为进度(激活后统计)
        */
        GAIN_LEVEL_QUALITY_EQUIP = 13,
        /**
        * 洗练X次装备,X为进度(激活后统计)
        */
        WASH_EQUIP = 14,
        /**
        * 激活装备套装效果suitConfigId,对应EquipSuitConfig.id(激活后统计)
        */
        ACTIVE_EQUIP_SUIT = 15,
        /**
        * 激活羁绊，类型groupType(可选参数)，类型参数typeParam(可选参数)，触发所需上阵英雄数量triggerCount的羁绊(历史统计)
        */
        ACTIVE_FORMATION_GROUP = 16,
        /**
        * 共鸣等级达到X级,X为进度(历史统计)
        */
        TOTAL_HERO_SHARE_LEVEL = 17,
        /**
        * 抽卡X次，特定卡池recruitConfigId(不指定则统计所有卡池)，X为进度(激活后统计)
        */
        RECRUIT_ASSIGN_POOL = 18,
        /**
        * 累计抽卡X次，特定卡池recruitConfigId(不指定则统计所有卡池)，X为进度(历史统计)
        */
        TOTAL_RECRUIT_ASSIGN_POOL = 19,
        /**
        * 通关主线关卡，关卡instanceId，对应TrunkInstanceConfig的Id(历史统计)
        */
        PASS_TRUNK_INSTANCE = 20,
        /**
        * 激活一次天赋(激活后统计)
        */
        ACTIVE_TALENT = 21,
        /**
        * 传送至目标传送点teleportId,对应TeleportlistConfig的id,且需要配置为任务传送点(激活后统计)
        */
        TELEPORT_TARGET = 22,
        /**
        * 升级一次英雄(激活后统计)
        */
        UP_HERO_LEVEL = 23,
        /**
        * 穿戴一次装备(激活后统计)
        */
        WEAR_EQUIP = 24,
        /**
        * 上阵X个英雄,X为进度(历史统计)
        */
        IN_BATTLE_HERO = 25,
        /**
        * 激活队长技能skillId(CaptainConfig的id),skillId为空则代表任意队长技能(历史统计)
        */
        ACTIVE_CAPTAIN_SKILL = 26,
        /**
        * 装备收藏品ID,对应CollectiblesConfig的id(激活后统计)
        */
        IN_BATTLE_COLLECTIBLES_SKILL = 27,
        /**
        * 创建或加入过一个联盟(历史统计)
        */
        CREATE_OR_JOIN_LEAGUE = 28,
        /**
        * 竞技场挑战X次(激活后统计)
        */
        ARENA_CHALLENGE = 29,
        /**
        * 每日Boss挑战X次(激活后统计)
        */
        DAILY_BOSS_CHALLENGE = 30,
        /**
        * 击杀难度X的每日Boss(历史统计)
        */
        DEFEAT_DAILY_BOSS_DIFFICULTY = 31,
        /**
        * 挑战X次秘境副本(激活后统计)
        */
        SECRET_INSTANCE_CHALLENGE = 32,
        /**
        * 通关X层秘境副本(历史统计)
        */
        PASS_SECRET_INSTANCE_FLOOR = 33,
        /**
        * 完成X次地图副本(历史统计)
        */
        PASS_MAP_INSTANCE_COUNT = 34,
        /**
        * 挑战X次挂机关卡(激活后统计)
        */
        TRUNK_INSTANCE_CHALLENGE = 35,
        /**
        * 激活X级天赋(历史统计)
        */
        ACTIVE_TALENT_LEVEL = 36,
        /**
        * 序列总层数达到X(历史统计)
        */
        LADDER_FLOOR_SUM = 37,
        /**
        * 收集X个资源，物品itemId，X为进度(历史统计)
        */
        RESOURCE_COLLECT_SUM = 38,
        /**
        * 穿戴X件装备(历史统计)
        */
        EQUIP_WEAR_SUM = 39,
        /**
        * 穿戴的装备平均等级达到X(历史统计)
        */
        EQUIP_WEAR_AVG_LEVEL = 40,
        /**
        * 指定活动任务组X内的任务完成数量，任务组Id，taskGroupId，对应ActivityTaskConfig的groupId(历史统计)
        */
        ACTIVITY_TASK_GROUP_FINISH_TASK_AMT = 41,
        /**
        * 完成指定引导，引导Id，guideId，对应GuideConfig的id(历史统计)
        */
        FINISH_ASSIGN_GUIDE = 42,
        /**
        * 主线地图收集X个资源，物品itemId，X为进度(历史统计)
        */
        TRUNK_MAP_RESOURCE_COLLECT_SUM = 43,
        /**
        * 主线地图共击杀X个怪物，怪物monsterId(MapMonsterConfig.id，不指定monsterId则为任意怪物，注意：仅统计recordKilled为true的怪物id)，X为进度(历史统计)
        */
        TRUNK_MAP_KILL_MONSTER_SUM = 44,
        /**
        * 曾经传送至目标，传送点teleportId，对应TeleportlistConfig的id，且需要配置为任务传送点(历史统计)
        */
        ONCE_TELEPORT_TARGET = 45,
        /**
        * 每日Boss挑战X次(历史统计)
        */
        DAILY_BOSS_CHALLENGE_SUM = 46,
        /**
        * 解锁/激活建筑buildingId列表，建筑buildingIds:id0,id1,id2，对应MapBuildingConfig.id(历史统计)
        */
        ACTIVE_BUILDING_LIST = 47,
        /**
        * 挂机关卡领取X次快速挂机，X为进度(历史统计)
        */
        DRAW_TRUNK_INSTANCE_FAST_HANG_UP_SUM = 48,
        /**
        * 世界Boss挑战X次(激活后统计)
        */
        WORLD_BOSS_CHALLENGE = 49,
        /**
        * 序列任意塔层数达到X(历史统计)
        */
        LADDER_FLOOR = 50,
        /**
        * 竞技场最高段位达到X(历史统计)
        */
        ARENA_MAX_RANK = 51,
        /**
        * 解锁/激活宝箱类建筑总数达到X(历史统计)
        */
        ACTIVE_BOX_BUILDING_SUM = 52,
        /**
        * 挂机战斗X次(激活后统计)
        */
        TRUNK_INSTANCE_HANG_UP_BATTLE = 53,
        /**
        * 在通用商店购买列表中的商品X次，商品shopGoodsIds:id0,id1,id2，对应ShopGoodsConfig.id(激活后统计)
        */
        ASSIGN_SHOP_GOODS_LIST_BUY = 54,
        /**
        * 竞技场最高积分达到X(历史统计)
        */
        ARENA_MAX_SCORE = 55,
        /**
        * 联盟Boss挑战X次(激活后统计)
        */
        LEAGUE_BOSS_CHALLENGE = 56,
        /**
        * 击杀X个怪物，X为进度(激活后统计)(包含主线地图、挂机关卡、序列校验、每日Boss、秘境)
        */
        KILL_MONSTER_SUM = 57,
        /**
        * 累计消耗Y货币达到X，货币itemId，对应ItemConfig的Id，X为进度(历史统计)
        */
        CURRENCY_COST_SUM = 58,
        /**
        * 收集资源X次(激活后统计)
        */
        RESOURCE_COLLECT_AMOUNT = 59,
        /**
        * 主线挂机托管X次(激活后统计)
        */
        TRUNK_INSTANCE_HANG_UP_AMOUNT = 60,
        /**
        * 累计登录X天(激活后统计)
        */
        TOTAL_LOGIN_DAYS = 61,
        /**
        * 竞技场累计挑战X次(历史统计)
        */
        TOTAL_ARENA_CHALLENGE = 62,
        /**
        * 通过守卫母舰关卡总数(历史统计)
        */
        PASS_GUARD_SHIP_INSTANCE_SUM = 63,
        /**
        * 积分历史总数达到X，积分itemId，对应ItemConfig的Id，X为进度(历史统计)
        */
        INTEGRAL_HISTORICAL_SUM = 64,
        /**
        * 积分总数达到X，积分itemId，对应ItemConfig的Id，X为进度(激活后统计)
        */
        INTEGRAL_SUM = 65,
        /**
        * 领取星际工厂生产线奖励次数达到X(激活后统计)
        */
        DRAW_FACTORY_PRODUCT_LINE_REWARD_COUNT = 66,
        /**
        * 星际工厂中占领Y品质生产线次数达到X，品质quality，对应FactoryProductLineConfig的quality，X为进度(历史统计)
        */
        OCCUPY_QUALITY_PRODUCT_LINE_COUNT = 67,
        /**
        * 激活指定类型天赋达到X级，天赋类型talentType，参考"TalentType"，X为进度(历史统计)
        */
        ACTIVE_ASSIGN_TYPE_TALENT_LEVEL = 68,
        /**
        * 任意一个战队科技(队长技能)提升至X级，X为进度(历史统计)
        */
        CAPTAIN_UP_LEVEL = 69,
        /**
        * 指定Y品质魔方>=Z级的数量达到X，品质quality，级别level，X为进度(历史统计)
        */
        ASSIGN_QUALITY_MAGIC_CUBE_LEVEL_GE_COUNT = 70,
        /**
        * 获得指定Y品质的装备达到X件，品质quality，X为进度(历史统计)
        */
        GAIN_ASSIGN_QUALITY_EQUIP_COUNT = 71,
        /**
        * 参与联盟对决次数达到X，X为进度(激活后统计)
        */
        LEAGUE_WAR_JOIN_COUNT = 72,
        /**
        * 联盟对决挑战其他玩家次数达到X，X为进度(历史统计)
        */
        LEAGUE_WAR_CHALLENGE_COUNT = 73,
        /**
        * 联盟对决击败其他玩家次数达到X，X为进度(历史统计)
        */
        LEAGUE_WAR_DEFEAT_COUNT = 74,
        /**
        * 抽卡X次，特定卡池列表recruitConfigIds，X为进度(激活后统计)
        */
        RECRUIT_ASSIGN_POOLS = 75,
        /**
        * 累计抽卡X次，特定卡池列表recruitConfigIds，X为进度(历史统计)
        */
        TOTAL_RECRUIT_ASSIGN_POOLS = 76,
        /**
        * 通关秘境X次(激活后统计)
        */
        PASS_SECRET_INSTANCE_COUNT = 77,
        /**
        * 星际工厂生产线挑战次数达到X(激活后统计)
        */
        FACTORY_PRODUCT_LINE_CHALLENGE_COUNT = 78,
        /**
        * 指定英雄达到X星，指定英雄heroId，即HeroConfig的Id，X为进度(历史统计)
        */
        ASSIGN_HERO_STAR = 79,
        /**
        * 联盟对决挑战其他玩家次数达到X，X为进度(激活后统计)
        */
        LEAGUE_WAR_CHALLENGE = 80,
        /**
        * 指定战队科技(队长技能)提升至X级，指定战队科技skillId，即CaptainConfig的Id，X为进度(历史统计)
        */
        ASSIGN_CAPTAIN_UP_LEVEL = 81,
        /**
        * 模拟经营收集X个物品，物品itemId，即ItemConfig的Id，X为进度(激活后统计)
        */
        STIMULATION_COLLECT_ITEM = 82,
        /**
        * 守卫母舰通关X次，X为进度(激活后统计)
        */
        GUARD_SHIP_PASS_AMOUNT = 83,
        /**
        * 资源勘探攻击建筑X次，X为进度(激活后统计)
        */
        LEAGUE_EXPLORE_ATTACK_BUILDING_AMOUNT = 84,
        /**
        * 主线地图指定怪物列表共击杀X个，怪物Id列表monsterIds(MapMonsterConfig.id，注意：仅统计recordKilled为true的怪物id)，X为进度(历史统计)
        */
        TRUNK_MAP_KILL_ASSIGN_MONSTERS_SUM = 85,
        /**
        * 战队科技核心等级提升至X级，X为进度(历史统计)
        */
        CAPTAIN_CORE_UP_LEVEL = 86,
        /**
        * 指定收藏品达到X星，收藏品Id，collectiblesId，对应CollectiblesConfig的id，X为进度(历史统计)
        */
        ASSIGN_COLLECTIBLES_UP_STAR = 87,
    }
    /**
     * 任务状态1未开始；2进行中；3已完成未领奖；4已领奖
     */
    export enum TaskState {
        /**
        * 未开始，即还没满足接取条件
        */
        NOT_START = 1,
        /**
        * 进行中
        */
        IN_PROGRESS = 2,
        /**
        * 任务已完成但未领取奖励
        */
        COMPLETED = 3,
        /**
        * 已领取奖励
        */
        FINISHED = 4,
    }
    /**
     * 任务类型
     */
    export enum TaskType {
        /**
        * 日常任务
        */
        DAILY_TASK = 1,
        /**
        * 成就任务
        */
        ACHIEVEMENT = 2,
        /**
        * 主线任务
        */
        TRUNK_TASK = 3,
        /**
        * 联盟挑战
        */
        LEAGUE_CHALLENGE = 4,
        /**
        * 成长之路
        */
        GROW_UP = 5,
        /**
        * 主线小地图任务
        */
        TRUNK_MAP_TASK = 6,
        /**
        * 基金
        */
        FUND = 7,
        /**
        * 通行证
        */
        BATTLE_PASS = 8,
        /**
        * 联盟周常
        */
        LEAGUE_WEEKLY = 9,
        /**
        * 嘉年华
        */
        CARNIVAL = 10,
        /**
        * 达标
        */
        REACH_STANDARD = 12,
        /**
        * 双周活动
        */
        DOUBLE_WEEKLY = 13,
        /**
        * 赛季达标
        */
        SEASON_REACH = 14,
        /**
        * 收藏品
        */
        COLLECTIBLES = 15,
        /**
        * 地图建筑任务
        */
        MAP_BUILDING = 16,
        /**
        * 重置达标
        */
        RESET_REACH = 17,
    }
    /**
     * 任务信息类型
     */
    export enum TaskVoType {
        /**
        * 普通，对应TaskVo
        */
        NORMAL = 1,
        /**
        * 活动，对应ActivityTaskVo
        */
        ACTIVITY = 2,
        /**
        * 赛季活动，对应SeasonActivityTaskVo
        */
        SEASON_ACTIVITY = 3,
    }
    /**
     * 时间类型
     */
    export enum TimeType {
        /**
        * 手动指定，格式：yyyy-MM-dd HH:mm:ss
        */
        MANUAL = 1,
        /**
        * 开服时间点+延迟小时，格式：延迟小时
        */
        SERVER_OPEN_DELAY_HOUR = 2,
        /**
        * 开服当天零点+延迟小时，格式：延迟小时
        */
        SERVER_OPEN_FIRST_DELAY_HOUR = 3,
        /**
        * 以系统开始时间点为跨天时间点的开服当天延迟小时，格式：延迟小时
        */
        SERVER_OPEN_FIRST_DAY_DELAY_HOUR = 4,
        /**
        * 次元连通跨服组开启时间点+延迟小时，格式：ParallelSpaceType:延迟小时数，比如，TWO_CROSS:0
        */
        PARALLEL_SPACE_OPEN_DELAY_HOUR = 5,
        /**
        * 次元连通跨服组开启当天零点+延迟小时，格式：ParallelSpaceType:延迟小时数，比如，TWO_CROSS:0
        */
        PARALLEL_SPACE_OPEN_FIRST_DELAY_HOUR = 6,
        /**
        * 以系统开始时间点为跨天时间点的次元连通跨服组开启当天延迟小时，格式：ParallelSpaceType:延迟小时数，比如，TWO_CROSS:0
        */
        PARALLEL_SPACE_OPEN_FIRST_DAY_DELAY_HOUR = 7,
        /**
        * 相对与上一个时间点的延迟小时，格式：延迟小时
        */
        DELAY_HOUR = 8,
        /**
        * 永不过期(只能用于结束或销毁时间点设置)，无需参数
        */
        FOREVER = 9,
        /**
        * cron表达式，格式：cron;基准时间(不填基准时间则以开服时间为基准)
        */
        CRON = 10,
        /**
        * 玩家创角(注：存在前置时间时，返回前置时间+100年)，格式：相对创角时间延迟X小时
        */
        CREATE_ROLE = 11,
        /**
        * 相对与上一个时间点的每周系统开始时间延迟小时，格式：延迟小时
        */
        WEEK_FIRST_DAY_DELAY_HOUR = 12,
        /**
        * 相对开服当周系统开始时间延迟小时，格式：延迟小时
        */
        SERVER_OPEN_WEEK_FIRST_DAY_DELAY_HOUR = 13,
    }
    /**
     * 挂机托管状态
     */
    export enum HangUpState {
        /**
        * 未挂机状态
        */
        NO_HANG_UP = 1,
        /**
        * 挂机进行中
        */
        HANG_UP_ING = 2,
        /**
        * 挂机完成
        */
        HANG_UP_FINISH = 3,
    }
    /**
     * 隐藏奖励触发类型
     */
    export enum HideRewardTriggerType {
        /**
        * 完成引导步骤,参数为GuideConfig的id
        */
        FINISH_GUIDE_STEP = 1,
        /**
        * 解锁建筑,参数为MapBuildingConfig的id
        */
        UNLOCK_BUILDING = 2,
    }
    /**
     * 玩家条件校验类型
     */
    export enum PlayerVerifyType {
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
        * 指定商店商品购买数量>=target，param为shopGoodsId，即ShopGoodsConfig的Id
        */
        SHOP_GOODS_BUY_AMT_GE = 41,
        /**
        * 指定秘境关卡通关秒数<=target，param为secretInstanceId，即SecretInstanceConfig的Id
        */
        PASS_SECRET_INSTANCE_SECONDS_LE = 42,
        /**
        * 指定任务是否完成，param为任务类型(参考"TaskType")，target为taskId
        */
        ASSIGN_TASK_COMPLETED = 43,
        /**
        * 任意战队科技等级>=target
        */
        CAPTAIN_SKILL_LEVEL_GE = 44,
        /**
        * 战队科技核心等级>=target
        */
        CAPTAIN_CORE_LEVEL_GE = 45,
        /**
        * 指定活动是否可见，param为activityId，即ActivityConfig的Id，不支持被动触发，仅支持主动校验
        */
        ASSIGN_ACTIVITY_VISIBLE = 46,
        /**
        * 指定次元连通类型是否开放，param为次元连通类型(参考"ParallelSpaceType")，不支持被动触发，仅支持主动校验
        */
        ASSIGN_PARALLEL_SPACE_OPEN = 47,
    }
    /**
     * 系统类型
     */
    export enum SystemType {
        /**
        * 充值
        */
        CHARGE = 1,
        /**
        * 礼包
        */
        GIFT = 2,
        /**
        * 商店
        */
        SHOP = 3,
        /**
        * 邮件
        */
        EMAIL = 4,
        /**
        * 地图
        */
        MAP = 5,
        /**
        * 英雄
        */
        HERO = 6,
        /**
        * 阵容
        */
        FORMATION = 7,
        /**
        * 图鉴
        */
        ILLUSTRATIONS = 8,
        /**
        * 日常任务
        */
        DAILY_TASK = 9,
        /**
        * 成就
        */
        ACHIEVEMENT = 10,
        /**
        * 主线任务
        */
        TRUNK_TASK = 11,
        /**
        * 天赋
        */
        TALENT = 12,
        /**
        * 普通招募
        */
        RECRUIT = 13,
        /**
        * 主线关卡
        */
        TRUNK_INSTANCE = 14,
        /**
        * 每日BOSS
        */
        DAILY_BOSS = 15,
        /**
        * 装备
        */
        EQUIP = 16,
        /**
        * 战队科技
        */
        CAPTAIN = 17,
        /**
        * 序列校验
        */
        LADDER = 18,
        /**
        * 秘境副本
        */
        SECRET_INSTANCE = 19,
        /**
        * 竞技场
        */
        ARENA = 20,
        /**
        * 世界BOSS
        */
        WORLD_BOSS = 21,
        /**
        * 通用排行榜
        */
        RANK = 22,
        /**
        * 联盟
        */
        LEAGUE = 23,
        /**
        * 联盟科技
        */
        LEAGUE_TECH = 24,
        /**
        * 设置
        */
        SET = 25,
        /**
        * 联盟BOSS
        */
        LEAGUE_BOSS = 26,
        /**
        * 好友
        */
        FRIEND = 27,
        /**
        * 专属武器
        */
        AWAKE_WEAPON = 28,
        /**
        * 每日特惠
        */
        DAILY_SALE = 29,
        /**
        * 特权卡
        */
        MONTH_CARD = 31,
        /**
        * 基金
        */
        FUND = 32,
        /**
        * 联盟宝箱
        */
        LEAGUE_BOX = 33,
        /**
        * 主线挂机托管
        */
        TRUNK_INSTANCE_HANG_UP = 34,
        /**
        * 专属武器招募
        */
        AWAKE_WEAPON_RECRUIT = 35,
        /**
        * 商城-VIP类型
        */
        MALL_VIP = 36,
        /**
        * 商城-限购类型
        */
        MALL_LIMIT_BUY = 37,
        /**
        * 基础充值
        */
        NORMAL_CHARGE = 38,
        /**
        * 聊天
        */
        CHAT = 39,
        /**
        * 商城-推送类型
        */
        MALL_POPUP = 40,
        /**
        * 守卫母舰
        */
        GUARD_SHIP = 41,
        /**
        * 高级招募
        */
        SPECIAL_RECRUIT = 42,
        /**
        * 阵容推荐
        */
        FORMATION_RECOMMEND = 43,
        /**
        * 魔方
        */
        MAGIC_CUBE = 44,
        /**
        * 英雄皮肤
        */
        HERO_SKIN = 45,
        /**
        * 星际工厂
        */
        FACTORY = 46,
        /**
        * 星灵宠物
        */
        PET = 47,
        /**
        * 羁绊，仅前端使用
        */
        FETTER = 48,
        /**
        * 跑马灯，仅前端使用
        */
        POST = 49,
        /**
        * 每日广告，仅前端使用
        */
        DAILY_AD = 50,
        /**
        * 滚动屏，仅前端使用
        */
        ROLLING_SCREEN = 51,
        /**
        * 联盟砍价
        */
        LEAGUE_BARGAIN = 52,
        /**
        * 模拟经营
        */
        STIMULATION = 53,
        /**
        * 功能预告
        */
        PREVIEW = 54,
        /**
        * 组队副本
        */
        TEAM_INSTANCE = 55,
        /**
        * 资源勘探
        */
        LEAGUE_EXPLORE = 56,
        /**
        * 收藏品
        */
        COLLECTIBLES = 57,
        /**
        * 宠物副本
        */
        PET_DUNGEON = 58,
        /**
        * 收藏品玩法
        */
        COLLECTIBLES_DUNGEON = 59,
        /**
        * 宠物抽卡
        */
        PET_DRAW_CARD = 60,
        /**
        * 职业核心
        */
        CAPTAIN_CORE = 61,
        /**
        * 英雄潜能
        */
        HERO_DNA = 62,
        /**
        * 星灵羁绊
        */
        PET_GROUP = 63,
        /**
        * 次元连通
        */
        PARALLEL_SPACE = 64,
        /**
        * 无尽秘境
        */
        ENDLESS_SECRET = 65,
        /**
        * 宠物抽卡
        */
        GOD_EQUIP_DRAW_CARD = 66,
        /**
        * 神装
        */
        GOD_EQUIP = 67,
        /**
        * 宠物抽卡
        */
        COLLECTIBLES_DRAW_CARD = 68,
        /**
        * 活动入口，仅前端使用
        */
        ACTIVITY = 69,
    }
    /**
     * 自动触发行为类型
     */
    export enum TriggerActionType {
        /**
        * 发奖
        */
        REWARD = 1,
    }
    /**
     * VIP特权类型
     */
    export enum VipAdditionType {
        /**
        * 挂机奖励，参数：道具Id，加成值：额外万分比
        */
        HANG_UP_REWARD = 1,
        /**
        * 挂机时长上限，参数：无，加成值：额外小时数
        */
        HANG_UP_DURATION_LIMIT = 2,
        /**
        * 快速挂机次数，参数：无，加成值：额外次数
        */
        FAST_HANG_UP_TIMES = 3,
        /**
        * 付费挂机次数，参数：无，加成值：额外次数
        */
        PAY_HANG_UP_TIMES = 4,
        /**
        * 竞技场每日免费门票数量，参数：无，加成值：额外门票数
        */
        ARENA_FREE_CHALLENGE_RECOVER_AMT = 5,
        /**
        * 竞技场奖励，参数：道具Id，加成值：额外万分比
        */
        ARENA_REWARD = 6,
        /**
        * 竞技场刷新对手额外次数，参数：无，加成值：额外次数
        */
        ARENA_REFRESH_TIMES = 7,
        /**
        * 每日Boss购买挑战次数，参数：无，加成值：每日额外购买数
        */
        DAILY_BOSS_BUY_CHALLENGE_TIMES = 8,
        /**
        * 好友额外数量，参数：无，加成值：额外数量
        */
        FRIEND_AMOUNT = 9,
        /**
        * 秘境每日免费门票数量，参数：无，加成值：额外门票数
        */
        SECRET_INSTANCE_FREE_CHALLENGE_RECOVER_AMT = 10,
        /**
        * 秘境奖励(仅用于展示，加成由秘境业务自身处理)，参数：无，加成值：无
        */
        SECRET_INSTANCE_REWARD = 11,
        /**
        * 每日Boss免费挑战次数，参数：无，加成值：每日额外挑战数
        */
        DAILY_BOSS_FREE_CHALLENGE_TIMES = 12,
        /**
        * 每日Boss排名奖励，参数：道具Id，加成值：额外万分比
        */
        DAILY_BOSS_RANK_REWARD = 13,
        /**
        * 商店上架商品，参数：商品名，加成值：无
        */
        SHOP_GOODS_ON_SHELVE = 14,
        /**
        * 聊天专属配色，参数：颜色，加成值：无
        */
        CHAT_COLOR = 15,
        /**
        * 无尽秘境每日免费门票数量，参数：无，加成值：额外门票数
        */
        ENDLESS_SECRET_FREE_CHALLENGE_RECOVER_AMT = 16,
    }
    /**
     * 属性类型
     */
    export enum AttributeType {
        /**
        * 攻击
        */
        ATK = 1,
        /**
        * 防御
        */
        DEF = 2,
        /**
        * 生命
        */
        HP = 3,
        /**
        * 攻击%
        */
        ATK_BONUS = 4,
        /**
        * 防御%
        */
        DEF_BONUS = 5,
        /**
        * 生命%
        */
        HP_BONUS = 6,
        /**
        * 额外攻击
        */
        ATK_ADD = 7,
        /**
        * 额外防御
        */
        DEF_ADD = 8,
        /**
        * 额外生命
        */
        HP_ADD = 9,
        /**
        * 闪避率
        */
        DOD_RATE = 10,
        /**
        * 命中率
        */
        DOD_RES = 11,
        /**
        * 暴击率
        */
        CRI_RATE = 12,
        /**
        * 暴击伤害
        */
        CRI_DMG = 13,
        /**
        * 暴击伤害减少
        */
        CRI_DMG_DEC = 14,
        /**
        * 抗暴率
        */
        CRI_RES = 15,
        /**
        * 格挡率
        */
        BLK_RATE = 16,
        /**
        * 格挡伤害
        */
        BLK_DMG = 17,
        /**
        * 格挡伤害减少
        */
        BLK_DMG_DEC = 18,
        /**
        * 抗格挡率
        */
        BLK_RES = 19,
        /**
        * 伤害增加
        */
        DMG_INC = 20,
        /**
        * 伤害减免
        */
        DMG_RES = 21,
        /**
        * 移动速度
        */
        MOVE_SPD = 22,
        /**
        * 攻击速度
        */
        ATK_SPD = 23,
        /**
        * 攻击范围
        */
        ATK_RNG = 24,
        /**
        * 冷却缩减
        */
        CDR = 25,
        /**
        * 攻击增加
        */
        ATK_INC = 26,
        /**
        * 防御增加
        */
        DEF_INC = 27,
        /**
        * 生命(上限)增加
        */
        HP_INC = 28,
        /**
        * 攻击降低
        */
        ATK_DEC = 29,
        /**
        * 防御降低(破甲)
        */
        DEF_DEC = 30,
        /**
        * 生命上限降低
        */
        HP_DEC = 31,
        /**
        * 效果命中
        */
        EFF_RATE = 32,
        /**
        * 效果抗性(韧性)
        */
        EFF_RES = 33,
        /**
        * 吸血
        */
        LIFE_STEAL = 34,
        /**
        * 反伤
        */
        REFLECT_DMG = 35,
        /**
        * 穿甲
        */
        ARP = 36,
        /**
        * 治愈率
        */
        HL_INC = 37,
        /**
        * 减疗
        */
        HR_DEC = 38,
        /**
        * 受愈
        */
        HR_INC = 39,
        /**
        * 普攻增伤
        */
        BAD_INC = 40,
        /**
        * 技能增伤
        */
        SD_INC = 41,
        /**
        * 破甲抵抗
        */
        ARP_RES = 43,
        /**
        * 普攻减伤
        */
        BAD_RES = 44,
        /**
        * 技能减伤
        */
        SD_RES = 45,
        /**
        * 远程防御
        */
        RNG_DEF = 46,
        /**
        * 近战防御
        */
        ML_DEF = 47,
        /**
        * 异常强化
        */
        DOT_INC = 48,
        /**
        * 异常抗性
        */
        DOT_RES = 49,
        /**
        * 对人族伤害提升
        */
        T_DMG_INC = 50,
        /**
        * 来自人族伤害降低
        */
        T_DMG_RES = 51,
        /**
        * 对神裔伤害提升
        */
        P_DMG_INC = 52,
        /**
        * 来自神裔伤害降低
        */
        P_DMG_RES = 53,
        /**
        * 对智械伤害提升
        */
        M_DMG_INC = 54,
        /**
        * 来自智械伤害降低
        */
        M_DMG_RES = 55,
        /**
        * 对异魔伤害提升
        */
        S_DMG_INC = 56,
        /**
        * 来自异魔伤害降低
        */
        S_DMG_RES = 57,
        /**
        * 范围伤害减免
        */
        RANGE_DMG_RES = 58,
        /**
        * 效果强化
        */
        EFF_INC = 59,
        /**
        * PVP增伤
        */
        PVP_DMG_INC = 60,
        /**
        * PVP减伤
        */
        PVP_DMG_RES = 61,
        /**
        * 额外攻击修正
        */
        ATK_ADD_MOD = 62,
        /**
        * 额外防御修正
        */
        DEF_ADD_MOD = 63,
        /**
        * 额外血量修正
        */
        HP_ADD_MOD = 64,
        /**
        * 星灵增伤
        */
        PET_DMG_INC = 65,
        /**
        * 远程增伤
        */
        RNG_DMG_INC = 66,
        /**
        * 近战增伤
        */
        ML_DMG_INC = 67,
        /**
        * 远程减伤
        */
        RNG_DMG_RES = 68,
        /**
        * 近战减伤
        */
        ML_DMG_RES = 69,
        /**
        * 射击增伤
        */
        MM_DMG_INC = 70,
        /**
        * 射击减伤
        */
        MM_DMG_RES = 71,
        /**
        * 异能增伤
        */
        MG_DMG_INC = 72,
        /**
        * 异能减伤
        */
        MG_DMG_RES = 73,
        /**
        * 重骑增伤
        */
        RD_DMG_INC = 74,
        /**
        * 重骑减伤
        */
        RD_DMG_RES = 75,
        /**
        * 格斗增伤
        */
        FT_DMG_INC = 76,
        /**
        * 格斗减伤
        */
        FT_DMG_RES = 77,
    }
    /**
     * 战斗结果
     */
    export enum BattleResult {
        /**
        * 攻方胜利
        */
        ATTACKER = 1,
        /**
        * 守方胜利
        */
        DEFENDER = 2,
        /**
        * 达到最大战斗时长
        */
        MAX_TIME = 3,
    }
    /**
     * 战斗验证类型
     */
    export enum BattleVerifyType {
        /**
        * 
        */
        PVE = 1,
        /**
        * 
        */
        PVP = 2,
    }
    /**
     * 客户端战斗信息类型
     */
    export enum ClientBattleContentType {
        /**
        * 单位死亡，UnitDeadBattleContent
        */
        UNIT_DEAD = 1,
        /**
        * 波次，RoundBattleContent
        */
        ROUND = 2,
        /**
        * Buff选择，BuffSelectBattleContent
        */
        BUFF_SELECT = 3,
        /**
        * Buff刷新，BuffRefreshBattleContent
        */
        BUFF_REFRESH = 4,
        /**
        * 传送至下一层数，TransferNextFloorBattleContent
        */
        TRANSFER_NEXT_FLOOR = 5,
        /**
        * 战斗单位验证,FightUnitVerifyBattleContent
        */
        FIGHT_UNIT_VERIFY = 6,
    }
    /**
     * 战斗类型
     */
    export enum FightType {
        /**
        * 主线地图(使用默认布阵)
        */
        TRUNK_MAP = 1,
        /**
        * 主线关卡(使用默认布阵)
        */
        TRUNK_INSTANCE = 2,
        /**
        * 每日BOSS(保存自定义布阵)
        */
        DAILY_BOSS = 3,
        /**
        * 地图副本
        */
        MAP_INSTANCE = 4,
        /**
        * 序列校验
        */
        LADDER = 5,
        /**
        * 秘境副本
        */
        SECRET_INSTANCE = 6,
        /**
        * 竞技场
        */
        ARENA = 7,
        /**
        * 世界BOSS
        */
        WORLD_BOSS = 8,
        /**
        * 测试战斗
        */
        TEST = 9,
        /**
        * 联盟BOSS
        */
        LEAGUE_BOSS = 10,
        /**
        * 好友切磋
        */
        FRIEND = 11,
        /**
        * 守卫母舰
        */
        GUARD_SHIP = 12,
        /**
        * 联盟对决
        */
        LEAGUE_WAR = 13,
        /**
        * 星际工厂占领
        */
        FACTORY = 14,
        /**
        * 组队副本
        */
        TEAM_INSTANCE = 15,
        /**
        * 资源勘探
        */
        LEAGUE_EXPLORE = 16,
        /**
        * 赛季秘境副本
        */
        SEASON_SECRET = 17,
        /**
        * 赛季Boss
        */
        SEASON_BOSS = 18,
        /**
        * 宠物副本
        */
        PET_DUNGEON = 19,
        /**
        * 收藏品玩法
        */
        COLLECTIBLES_DUNGEON = 20,
        /**
        * 试玩
        */
        TRIAL = 21,
        /**
        * 无尽秘境副本
        */
        ENDLESS_SECRET = 22,
    }
    /**
     * 阵容限制类型
     */
    export enum FormationLimitType {
    }
    /**
     * 英雄单位加成类型
     */
    export enum HeroUnitEnhanceType {
        /**
        * 上阵羁绊
        */
        FORMATION_GROUP = 1,
        /**
        * 天赋
        */
        TALENT = 2,
        /**
        * 装备
        */
        EQUIP = 3,
        /**
        * 战队科技
        */
        CAPTAIN = 4,
        /**
        * 联盟科技
        */
        LEAGUE_TECH = 5,
        /**
        * 专属武器
        */
        AWAKE_WEAPON = 6,
        /**
        * 英雄皮肤
        */
        HERO_SKIN = 7,
        /**
        * 设置展示
        */
        SET_SHOW = 8,
        /**
        * 魔方
        */
        MAGIC_CUBE = 9,
        /**
        * 星灵
        */
        PET = 10,
        /**
        * 收藏品
        */
        COLLECTIBLES = 11,
        /**
        * 英雄潜能
        */
        HERO_AWAKEN = 12,
        /**
        * 神装
        */
        GOD_EQUIP = 13,
    }
    /**
     * 怪物类型
     */
    export enum MonsterType {
        /**
        * 普通小怪
        */
        NORMAL = 1,
        /**
        * 精英怪
        */
        ELITE = 2,
        /**
        * BOSS
        */
        BOSS = 3,
    }
    /**
     * 服务端战斗信息类型
     */
    export enum ServerBattleContentType {
        /**
        * 刷新怪物,RefreshMonsterBattleContent
        */
        REFRESH_MONSTER = 1,
    }
    /**
     * 战斗单位类型
     */
    export enum UnitType {
        /**
        * 英雄
        */
        HERO = 1,
        /**
        * 怪物
        */
        MONSTER = 2,
        /**
        * 战队
        */
        CAPTAIN = 3,
        /**
        * 助战英雄
        */
        HELP_HERO = 4,
        /**
        * 星灵宠物
        */
        PET = 5,
        /**
        * 收藏品
        */
        COLLECTIBLES = 6,
    }
    /**
     * 频道发送消息内容类型
     */
    export enum ChannelSendMessageType {
        /**
        * 文本消息(包含小表情)
        */
        TEXT = 1,
        /**
        * 语音消息
        */
        VOICE = 2,
        /**
        * 模板消息
        */
        TEMPLATE = 3,
    }
    /**
     * 频道处理类型
     */
    export enum ChannelType {
        /**
        * 世界频道
        */
        WORLD = 1,
        /**
        * 次元连通频道
        */
        PARALLEL_SPACE = 2,
        /**
        * 本服
        */
        LOCAL = 3,
        /**
        * 联盟频道
        */
        LEAGUE = 4,
        /**
        * 私聊频道
        */
        PRIVATE = 5,
        /**
        * 联盟对决频道
        */
        LEAGUE_WAR = 6,
        /**
        * 组队副本
        */
        TEAM_INSTANCE = 7,
        /**
        * 组队
        */
        TEAM = 8,
    }
    /**
     * 聊天模板类型
     */
    export enum ChatTemplateType {
        /**
        * 联盟邀请
        */
        LEAGUE_INVITE = 1,
        /**
        * 购买VIP月卡
        */
        BUY_MONTH_VIP_CARD = 2,
        /**
        * 购买VIP终身卡
        */
        BUY_FOREVER_VIP_CARD = 3,
        /**
        * 组队副本邀请
        */
        TEAM_INSTANCE_INVITE = 4,
        /**
        * 组队副本加入队伍
        */
        TEAM_INSTANCE_JOIN = 5,
        /**
        * 组队副本离开队伍
        */
        TEAM_INSTANCE_LEAVE = 6,
        /**
        * 组队副本转让队长
        */
        TEAM_INSTANCE_TRANSFER = 7,
        /**
        * 组队副本关卡胜利
        */
        TEAM_INSTANCE_WIN = 8,
        /**
        * 资源勘探建筑分享
        */
        LEAGUE_EXPLORE_BUILDING = 9,
        /**
        * 资源勘探建筑被占领
        */
        LEAGUE_EXPLORE_BUILDING_BE_OCCUPY = 10,
    }
    /**
     * 公告类型
     */
    export enum PostType {
        /**
        * GM公告
        */
        GM = -1,
        /**
        * 拥有指定称号玩家登录,参数:SetShowConfig的id
        */
        ASSIGN_TITLE_LOGIN = 1,
        /**
        * 充值购买,参数:ChargeGoodsConfig的id
        */
        CHARGE_BUY = 2,
        /**
        * 商店购买,参数:ShopGoodsConfig的id
        */
        SHOP_BUY = 3,
        /**
        * 指定玩法开启,参数:SystemType
        */
        PLAY_START = 4,
        /**
        * 指定玩法等待结算,参数:SystemType
        */
        PLAY_WAIT_END = 5,
        /**
        * 指定玩法结算,参数:SystemType
        */
        PLAY_END = 6,
        /**
        * 指定活动开启,参数:ActivityConfig的id
        */
        ACTIVITY_START = 7,
        /**
        * 指定活动即将结束,参数:ActivityConfig的id
        */
        ACTIVITY_WAIT_END = 8,
        /**
        * 指定活动结束,参数:ActivityConfig的id
        */
        ACTIVITY_END = 9,
        /**
        * 指定开服冲榜活动排行榜即将结算,参数:ActivityConfig的id
        */
        RUSH_RANK_WAIT_SETTLE = 10,
        /**
        * 指定开服冲榜活动排行榜结算,参数:ActivityConfig的id
        */
        RUSH_RANK_SETTLE = 11,
        /**
        * 玩家本人登录，仅前端使用
        */
        SELF_LOGIN = 12,
        /**
        * 玩家本人循环，仅前端使用
        */
        SELF_LOOP = 13,
        /**
        * 赛季子活动开始,参数:SubSeasonActivityConfig的Id
        */
        SUB_SEASON_ACTIVITY_STARTED = 14,
        /**
        * 赛季子活动结束,参数:SubSeasonActivityConfig的Id
        */
        SUB_SEASON_ACTIVITY_STOP = 15,
        /**
        * 赛季子活动冲榜结算,参数:SubSeasonActivityConfig的Id
        */
        SUB_SEASON_ACTIVITY_RUSH_RANK_SETTLE = 16,
        /**
        * 职业招募获得大于等于指定品质英雄,参数:品质
        */
        CAREER_RECRUIT_GAIN_ASSIGN_QUALITY_HERO = 17,
    }
    /**
     * 收藏品生效类型
     */
    export enum CollectiblesEffectType {
        /**
        * 守护
        */
        TANK = 1,
        /**
        * 格斗
        */
        FIGHTER = 2,
        /**
        * 异能
        */
        MAGE = 3,
        /**
        * 射击
        */
        MARKSMAN = 4,
        /**
        * 重骑
        */
        RIDER = 5,
        /**
        * 辅助
        */
        SUPPORT = 6,
        /**
        * 近战
        */
        MELEE = 7,
        /**
        * 远程
        */
        RANGED = 8,
        /**
        * 全体
        */
        ALL = 9,
    }
    /**
     * 收藏品技能目标类型
     */
    export enum CollectiblesSkillTargetType {
        /**
        * 收藏品
        */
        COLLECTIBLES = 1,
        /**
        * 英雄
        */
        HERO = 2,
    }
    /**
     * 重置类型
     */
    export enum ResetType {
        /**
        * 永远不重置
        */
        NEVER = 0,
        /**
        * 每天
        */
        DAY = 1,
        /**
        * 每周
        */
        WEEK = 2,
        /**
        * 每月
        */
        MONTH = 3,
    }
    /**
     * 玩法类型
     */
    export enum SchedulePlayType {
        /**
        * 每日BOSS,DailyBossPlayInfo
        */
        DAILY_BOSS = 1,
        /**
        * 竞技场,ArenaPlayInfo
        */
        ARENA = 2,
        /**
        * 秘境副本,SecretInstancePlayInfo
        */
        SECRET_INSTANCE = 3,
        /**
        * 资源勘探,LeagueExplorePlayInfo
        */
        LEAGUE_EXPLORE = 4,
        /**
        * 无尽秘境,EndlessSecretPlayInfo
        */
        ENDLESS_SECRET = 5,
    }
    /**
     * 流通货币类型
     */
    export enum CurrencyType {
        /**
        * 钻石 充值获得的货币
        */
        DIAMOND = 1,
        /**
        * 宝券，充值券
        */
        CHARGE_COUPON = 2,
        /**
        * 金币
        */
        GOLD = 3,
    }
    /**
     * 自定义阵容类型
     */
    export enum CustomFormationType {
        /**
        * 每日BOSS
        */
        DAILY_BOSS = 1,
        /**
        * 序列校验
        */
        LADDER = 2,
        /**
        * 秘境副本
        */
        SECRET_INSTANCE = 3,
        /**
        * 竞技场防守阵容
        */
        ARENA = 4,
        /**
        * 世界BOSS阵容
        */
        WORLD_BOSS = 5,
        /**
        * 联盟BOSS
        */
        LEAGUE_BOSS = 6,
        /**
        * 守卫母舰
        */
        GUARD_SHIP = 7,
        /**
        * 联盟对决
        */
        LEAGUE_WAR = 8,
        /**
        * 组队副本
        */
        TEAM_INSTANCE = 9,
        /**
        * 联盟资源勘探
        */
        LEAGUE_EXPLORE = 10,
        /**
        * 赛季秘境
        */
        SEASON_SECRET = 11,
        /**
        * 赛季Boss
        */
        SEASON_BOSS = 12,
        /**
        * 宠物副本
        */
        PET_DUNGEON = 13,
        /**
        * 收藏品玩法副本
        */
        COLLECTIBLES_DUNGEON = 14,
        /**
        * 无尽秘境副本
        */
        ENDLESS_SECRET = 15,
    }
    /**
     * 上阵羁绊触发范围类型
     */
    export enum FormationGroupTriggerType {
        /**
        * 触发的英雄
        */
        TRIGGER = 1,
        /**
        * 所有上阵英雄触发
        */
        ALL = 2,
    }
    /**
     * 上阵羁绊类型
     */
    export enum FormationGroupType {
        /**
        * 阵营
        */
        CAMP = 1,
        /**
        * 职业
        */
        CAREER = 2,
    }
    /**
     * 攻击方式
     */
    export enum AttackRange {
        /**
        * 近战
        */
        MELEE = 1,
        /**
        * 远程
        */
        RANGED = 2,
    }
    /**
     * 职业类型
     */
    export enum Career {
        /**
        * 守护
        */
        TANK = 1,
        /**
        * 格斗
        */
        FIGHTER = 2,
        /**
        * 异能
        */
        MAGE = 3,
        /**
        * 射击
        */
        MARKSMAN = 4,
        /**
        * 重骑
        */
        RIDER = 5,
        /**
        * 辅助
        */
        SUPPORT = 6,
    }
    /**
     * 宝箱类型
     */
    export enum ItemBoxType {
        /**
        * 掉落宝箱
        */
        DROP_BOX = 1,
        /**
        * 自选宝箱
        */
        OPTIONAL_BOX = 2,
        /**
        * 页签自选宝箱
        */
        OPTIONAL_TAB_BOX = 3,
        /**
        * 掉落宝箱(前端显示概率)
        */
        DROP_DISPLAY_RATES_BOX = 4,
        /**
        * 挂机宝箱
        */
        HANG_UP_BOX = 5,
        /**
        * 挂机自动宝箱
        */
        HANG_UP_AUTO_BOX = 6,
        /**
        * 自动打开掉落宝箱
        */
        AUTO_DROP_BOX = 7,
    }
    /**
     * 物品第二类型
     */
    export enum ItemSecondsType {
        /**
        * 钻石：充值获得的货币，对应物品类型CURRENCY
        */
        DIAMOND = 1,
        /**
        * 充值券：对应物品类型CURRENCY
        */
        CHARGE_COUPON = 3,
        /**
        * 金币：对应物品类型CURRENCY
        */
        GOLD = 4,
        /**
        * 掉落宝箱：对应物品类型ITEM
        */
        DROP_BOX = 5,
        /**
        * 自选宝箱：对应物品类型ITEM
        */
        OPTIONAL_BOX = 6,
        /**
        * 页签自选宝箱：对应物品类型ITEM
        */
        OPTIONAL_TAB_BOX = 7,
        /**
        * 掉落宝箱(前端显示概率)：对应物品类型ITEM
        */
        DROP_DISPLAY_RATES_BOX = 8,
        /**
        * 挂机宝箱：对应物品类型ITEM
        */
        HANG_UP_BOX = 9,
        /**
        * 挂机自动宝箱：对应物品类型AUTO_ITEM
        */
        HANG_UP_AUTO_BOX = 10,
        /**
        * 限制开放宝箱：对应物品类型ITEM
        */
        LIMITED_BOX = 11,
        /**
        * 自动打开掉落宝箱：对应物品类型AUTO_ITEM
        */
        AUTO_DROP_BOX = 12,
    }
    /**
     * 物品类型
     */
    export enum ItemType {
        /**
        * 流通货币
        */
        CURRENCY = 2,
        /**
        * 道具
        */
        ITEM = 3,
        /**
        * 大数据道具
        */
        LONG_ITEM = 4,
        /**
        * 通用积分货币,只用于奖励扣费
        */
        INTEGRAL = 5,
        /**
        * 资源(基于玩家等级上限,指定超出上限不发邮件且特定方式获得可以超过上限)
        */
        RESOURCE = 6,
        /**
        * 英雄卡牌
        */
        HERO_CARD = 7,
        /**
        * 英雄碎片
        */
        HERO_FRAGMENT = 8,
        /**
        * 装备
        */
        EQUIP = 10,
        /**
        * 联盟个人活跃度,按比例转换增加联盟活跃度/经验
        */
        LEAGUE_ACTIVE = 11,
        /**
        * 自动道具，获得后自动转化为其他道具并发放
        */
        AUTO_ITEM = 12,
        /**
        * 设置展示
        */
        SET_SHOW = 13,
        /**
        * 专属武器
        */
        AWAKE_WEAPON = 14,
        /**
        * VIP经验
        */
        VIP_EXP = 15,
        /**
        * 联盟赠礼
        */
        LEAGUE_GIFT = 16,
        /**
        * 英雄皮肤
        */
        HERO_SKIN = 17,
        /**
        * 星灵宠物整卡
        */
        PET_CARD = 18,
        /**
        * 星灵宠物碎片
        */
        PET_FRAGMENT = 19,
        /**
        * 收藏品整卡
        */
        COLLECTIBLES_CARD = 20,
        /**
        * 收藏品碎片
        */
        COLLECTIBLES_FRAGMENT = 21,
        /**
        * 神装
        */
        GOD_EQUIP = 22,
        /**
        * 神装定制
        */
        GOD_EQUIP_CUSTOM = 23,
    }
    /**
     * 联盟对决赛季状态
     */
    export enum LeagueWarSeasonStatus {
        /**
        * 开始
        */
        START = 1,
        /**
        * 结算
        */
        SETTLE = 2,
        /**
        * 结束
        */
        END = 3,
    }
    /**
     * 联盟对决阶段
     */
    export enum LeagueWarStatus {
        /**
        * 报名
        */
        SIGN_UP = 1,
        /**
        * 布阵
        */
        SET_FORMATION = 2,
        /**
        * 对战
        */
        BATTLE = 3,
        /**
        * 结算
        */
        SETTLE = 4,
        /**
        * 结束
        */
        END = 5,
    }
    /**
     * 地图怪物类型
     */
    export enum MapMonsterType {
        /**
        * 普通小怪
        */
        NORMAL = 1,
        /**
        * BOSS
        */
        BOSS = 2,
    }
    /**
     * 地图资源类型
     */
    export enum MapResourceType {
        /**
        * 怪物
        */
        MONSTER = 1,
        /**
        * 矿产(木材、矿石)
        */
        MINERAL = 2,
    }
    /**
     * 地图类型
     */
    export enum MapType {
        /**
        * 主线地图
        */
        TRUNK_MAP = 1,
    }
    /**
     * 地图资源状态
     */
    export enum ResourceStatus {
        /**
        * 资源点存活
        */
        SURVIVAL = 1,
        /**
        * 资源点已死亡
        */
        DEAD = 2,
        /**
        * 已领取资源点奖励
        */
        DREW = 3,
    }
    /**
     * 次元连通玩法类型
     */
    export enum ParallelSpacePlayType {
        /**
        * 无尽秘境
        */
        ENDLESS_SECRET = 1,
    }
    /**
     * 次元连通类型
     */
    export enum ParallelSpaceType {
        /**
        * 2跨
        */
        TWO_CROSS = 1,
        /**
        * 4跨
        */
        FOUR_CROSS = 2,
        /**
        * 8跨
        */
        EIGHT_CROSS = 3,
        /**
        * 16跨
        */
        SIXTEEN_CROSS = 4,
        /**
        * 32跨
        */
        THIRTY_TWO_CROSS = 5,
        /**
        * 64跨
        */
        SIXTY_FOUR_CROSS = 6,
    }
    /**
     * 性别
     */
    export enum Sex {
        /**
        * 男性
        */
        MALE = 1,
        /**
        * 女性
        */
        FEMALE = 2,
    }
    /**
     * 排行榜类型
     */
    export enum RankingType {
        /**
        * 玩家战力排行榜,RankItemVo
        */
        PLAYER_FIGHT = 1,
        /**
        * 主线关卡排行榜,RankItemVo
        */
        TRUNK_INSTANCE = 2,
        /**
        * 序列校验,RankItemVo
        */
        LADDER = 3,
        /**
        * 竞技场,RankItemVo
        */
        ARENA = 4,
        /**
        * 每日BOSS,DailyBossRankItemVo
        */
        DAILY_BOSS = 5,
        /**
        * 秘境副本,SecretInstanceRankItemVo
        */
        SECRET_INSTANCE = 6,
        /**
        * 世界BOSS,WorldBossRankItemVo
        */
        WORLD_BOSS = 7,
        /**
        * 联盟战力,RankItemVo
        */
        LEAGUE_FIGHT = 8,
        /**
        * 联盟BOSS,RankItemVo
        */
        LEAGUE_BOSS = 9,
        /**
        * 每日Boss伤害阵容排行榜,DailyBossFormationRankItemVo
        */
        DAILY_BOSS_HURT_FORMATION = 10,
        /**
        * 守卫母舰,GuardShipRankItemVo
        */
        GUARD_SHIP = 11,
        /**
        * 星际工厂,FactoryRankItemVo
        */
        FACTORY = 12,
        /**
        * 英雄招募积分,RankItemVo
        */
        HERO_RECRUIT_SCORE = 13,
        /**
        * 秘境周通关次数,RankItemVo
        */
        SECRET_INSTANCE_WEEK_PASS_AMT = 14,
        /**
        * 组队副本,RankItemVo
        */
        TEAM_INSTANCE = 15,
        /**
        * 赛季积分,RankItemVo
        */
        SEASON_SCORE = 16,
        /**
        * 资源勘探联盟积分排行榜,LeagueExploreRankItemVo
        */
        LEAGUE_EXPLORE_SCORE = 17,
        /**
        * 资源勘探个人积分排行榜,RankItemVo
        */
        LEAGUE_EXPLORE_PERSON_SCORE = 18,
        /**
        * 赛季秘境,RankItemVo
        */
        SEASON_SECRET = 19,
        /**
        * 赛季Boss,RankItemVo
        */
        SEASON_BOSS = 20,
        /**
        * 宠物副本,RankItemVo
        */
        PET_DUNGEON = 21,
        /**
        * 收藏品副本,RankItemVo
        */
        COLLECTIBLES_DUNGEON = 22,
        /**
        * 冲榜序列校验,RankItemVo
        */
        RUSH_LADDER = 23,
        /**
        * 无尽秘境,RankItemVo
        */
        ENDLESS_SECRET = 24,
        /**
        * 次元连通活动积分,RankItemVo
        */
        PARALLEL_ACTIVITY_SCORE = 25,
    }
    /**
     * 掉落奖励类型
     */
    export enum DropType {
        /**
        * 掉落ID
        */
        REWARD = 1,
        /**
        * 物品ID
        */
        ITEM = 2,
    }
    /**
     * 奖励配置类型
     */
    export enum RewardConfigType {
        /**
        * 普通，掉落其中的全部奖励
        */
        NORMAL = 1,
        /**
        * 概率，每个奖励独立按概率掉落，即可能掉落多个，也可能一个都不掉落
        */
        ODDS = 2,
        /**
        * 权重，按权重掉落其中一个奖励，循环多次可能会有重复
        */
        WEIGHT = 3,
        /**
        * 权重，按权重掉落其中一个奖励，循环多次也不会有重复，全部抽取后重置
        */
        WEIGHT_NO_REPLACE = 4,
    }
    /**
     * 模拟经营加成类型
     */
    export enum StimulationAdditionType {
        /**
        * 生产速度，加成值：额外数量
        */
        SPEED = 1,
        /**
        * 生产速度，加成值：额外万分比
        */
        SPEED_RATIO = 2,
        /**
        * 储量，加成值:额外数量
        */
        CAPACITY = 3,
        /**
        * 储量，加成值:额外万分比
        */
        CAPACITY_RATIO = 4,
    }
}