import BaseNotificationKey from "../../core/mvc/event/BaseNotificationKey";

export default class NotificationKey extends BaseNotificationKey {
    /******************************************* Server 错误码 ************************************/

    // Event: 服务端错误
    static readonly SERVER_ERROR_CODE = "SERVER_ERROR_CODE";

    /*******************************************系统 ********************************/

    /**新的一天系统刷新 */
    static readonly SYSTEM_NEW_DAY = "SYSTEM_NEW_DAY";

    /**系统时间刷新 */
    static readonly SYSTEM_TIME_UPDATE = "SYSTEM_TIME_UPDATE";

    /**重连游戏服务器 */
    static readonly RECONNECT_GAME_SERVER = "RECONNECT_GAME_SERVER";

    /******************************************* 主界面  *************************************/

    /** 返回主界面 (新手引导配置事件有用 请勿修改字段名)*/
    static readonly BACK_MAIN_VIEW = "BACK_MAIN_VIEW";

    /******************************************* 通用 ********************************/
    /** GObject的on事件的CLICK触发*/
    static readonly Show_Mobile_Shake = "GObject_On_Click_Event";

    /** 有功能开启  */
    static readonly SYSTEM_OPEN_FUNCTION = "SYSTEM_OPEN_FUNCTION";
    /** 有功能开启(引导用)  args = cfg: table.verify.PlayerSystemOpenConfig */
    static readonly SYSTEM_OPEN_FUNCTION1 = "SYSTEM_OPEN_FUNCTION1";

    /******************************************* GM ********************************/

    /**GM 充值 */
    static readonly GM_ORDER_CHARGE = "GM_ORDER_CHARGE";

    /**GM 属性显示 */
    static readonly GM_SHOW_HERO_ATTR = "GM_SHOW_HERO_ATTR";

    /******************************************* 聊天 ********************************/

    /**
     * new 消息
     * {@link EventChatNewMessage}
     */
    static readonly CHAT_ON_NEW_MESSAGE = "CHAT_ON_NEW_MESSAGE";
    /**
     * 已读消息
     * {@link null}
     */
    static readonly CHAT_READ = "CHAT_READ";
    /**
     * 聊天
     * {@link ServerEnums.ChannelType}
     */
    static readonly CHAT_UPDATE_MESSAGE = "CHAT_UPDATE_MESSAGE";
    /**
     * 聊天选中 tab
     * {@link number} index
     */
    static readonly CHAT_CHOOSE_TAB = "CHAT_CHOOSE_TAB";
    /**
     * 数量
     * {@link null}
     */
    static readonly CHAT_UNREAD_COUNT_REFRESH = "CHAT_UNREAD_COUNT_REFRESH";
    /**
     * 点击设置
     * {@link EventChatChangeTab}
     */
    static readonly CHAT_CLICK_SETTINGS = "CHAT_CLICK_SETTINGS";
    /**
     * 切换 tab
     * {@link EventChatChangeTab}
     */
    static readonly CHAT_CHANGE_TAB_INDEX = "CHAT_CHANGE_TAB_INDEX";
    /**
     * 刷新 tab
     * {@link null}
     */
    static readonly CHAT_TAB_REFRESH = "CHAT_TAB_REFRESH";
    /**
     * {@link number} emojiTypeIndex
     */
    static readonly CHAT_CHANGE_EMOJI_TYPE = "CHAT_CHANGE_EMOJI_TYPE";
    /**
     * {@link id} number
     */
    static readonly CHAT_USE_EMOJI = "CHAT_USE_EMOJI";

    /**公告更新*/
    static readonly CHAT_POST_UPDATE = "CHAT_POST_UPDATE";

    /******************************************* 玩家 ********************************/

    // 玩家信息请求成功
    static readonly PLAYER_INFO_REQ_DONE = "PLAYER_INFO_REQ_DONE";
    // 改名
    static readonly CHANGE_NAME = "CHANGE_NAME";

    /**红点变化事件 后面会接_RedDotKey */
    static readonly RED_DOT_CHANGE = "RED_DOT_CHANGE";

    /** 主动刷新活动红点 */
    static readonly ACTIVITY_RED_DOT_CHANGE = "ACTIVITY_RED_DOT_CHANGE";

    /******************************************* 玩家信息 ********************************/

    /**
     * 玩家信息 选中刷新
     */
    static readonly SETTINGS_CHOOSE_REFRESH = "SETTINGS_CHOOSE_REFRESH";
    /**
     * 玩家设置形象完成
     */
    static readonly SETTINGS_SET_IMAGE_COMPLETE = "SETTINGS_SET_IMAGE_COMPLETE";

    /**
     * 玩家信息 变更
     */
    static readonly PLAYER_INFO_CHANGE = "PLAYER_INFO_CHANGE";

    /******************************************* 每日BOSS ********************************/

    /**
     * 神之序列 top3
     * {@link EventGodSequenceTop3}
     */
    static readonly GOD_SEQUENCE_RANK_TOP_3 = "GOD_SEQUENCE_RANK_TOP_3";
    // 更新
    static readonly GOD_SEQUENCE_CHANGE_LAYER = "GOD_SEQUENCE_CHANGE_LAYER";
    // 开始挑战
    static readonly GOD_SEQUENCE_START_CHALLENGE = "GOD_SEQUENCE_START_CHALLENGE";
    // 开启状态变更
    static readonly GOD_SEQUENCE_OPEN_STATE_CHANGE = "GOD_SEQUENCE_OPEN_STATE_CHANGE";

    /******************************************* 每日BOSS ********************************/

    /**
     * 每日BOSS信息刷新
     * @args null
     */
    static readonly DAILY_BOSS_INFO_CHANGE = "DAILY_BOSS_INFO_CHANGE";
    /**
     * 每日BOSS 排行榜
     * @args null
     */
    static readonly DAILY_BOSS_RANK_UPDATE = "DAILY_BOSS_RANK_UPDATE";
    /**
     * 每日BOSS 阵容推荐
     * @args null
     */
    static readonly DAILY_BOSS_Formation_Rank = "DAILY_BOSS_Formation_Rank";

    /*******************************************地图 ********************************/
    /**加载世界地图 */
    static readonly LOAD_WORLD = "LOAD_WORLD";

    /** 到了新地图 args = mapid{@link number} */
    static readonly SEE_NEW_MAP = "SEE_NEW_MAP";

    /** 地图区域传送开始 args = {@link ITransfer} */
    static readonly MAP_AREA_TRANSFER_START = "MAP_AREA_TRANSFER_START";

    /** 地图区域传送结束 / 换地图 */
    static readonly MAP_AREA_TRANSFER_END = "MAP_AREA_TRANSFER_END";

    /**地图更新战队位置 */
    static readonly MAP_TEAN_POS_UPDATE = "MAP_TEAN_POS_UPDATE";

    /** 解锁迷雾 */
    static readonly MAP_MIST_UNLOCKED = "MAP_MIST_UNLOCKED";

    /** 解锁建筑 */
    static readonly MAP_BUILDING_UNLOCK = "MAP_BUILDING_UNLOCK";

    /** 资源刷新 (主线地图) */
    static readonly MAP_RESOURCE_REFRESH_UPDATE = "MAP_RESOURCE_REFRESH_UPDATE";

    /** 资源刷新 (玩法) */
    static readonly PLAY_RESOURCE_REFRESH_UPDATE = "PLAY_RESOURCE_REFRESH_UPDATE";

    /** 资源刷新时间 */
    static readonly RESOURCE_REFRESH_TIME_UPDATE = "RESOURCE_REFRESH_TIME_UPDATE";

    /** 领取资源奖励 */
    static readonly DRAW_RESOURCE_REWARD = "DRAW_RESOURCE_REWARD";

    /** Boos首杀 */
    static readonly BOOS_FIRST_KILL = "BOOS_FIRST_KILL";

    /** 激活建筑  */
    static readonly MAP_ACTIVE_BUILDING = "MAP_ACTIVE_BUILDING";
    /** 取消激活建筑  */
    static readonly MAP_CANCEL_ACTIVE_BUILDING = "MAP_CANCEL_ACTIVE_BUILDING";

    /** 进入地图传送结束 */
    static readonly MAP_TRANSFER_END = "MAP_TRANSFER_END";

    /** 地图副本战斗结果  data: Vo.map.MapInstanceChallengeVo */
    static readonly MAP_INSTANCE_CHALLENGE_RESULT = "MAP_INSTANCE_CHALLENGE_RESULT";

    /** 地图副本刷boss通知 */
    static readonly MAP_INSTANCE_UPDATE_BOSS = "MAP_INSTANCE_UPDATE_BOSS";

    /** 地图副本战斗胜利退出时间，附带通关的副本id */
    static readonly MAP_INSTANCE_PASS_ID = "MAP_INSTANCE_PASS_ID";

    /** 地图建筑解锁扣除动画通知 */
    static readonly MAP_BUILDING_UNLOCK_COST_ANIM = "MAP_BUILDING_UNLOCK_COST_ANIM";

    /** 采集地图资源 （小地图统计资源） */
    static readonly MAP_COLLECT_RESOURCE = "MAP_COLLECT_RESOURCE";

    /** 小地图某个资源达到上限 */
    static readonly MAP_RESOURCE_REACH_MAX = "MAP_RESOURCE_REACH_MAX";

    /** 领取小地图任务奖励 */
    static readonly MAP_TASK_REWARD = "MAP_TASK_REWARD";

    /** 小地图任务刷新 */
    static readonly MAP_TASK_REFRESH = "MAP_TASK_REFRESH";

    /** 地图广告宝箱刷新 */
    static readonly MAP_AD_BOX_REFRESH = "MAP_AD_BOX_REFRESH";

    /** 地图建筑任务更新 */
    static readonly MAP_BUILDING_TASK_CHG = "MAP_BUILDING_TASK_CHG";

    /** 根据战斗类型指定上一张地图 */
    static readonly MAP_SET_LAST_BY_FIGHT_TYPE = "MAP_SET_LAST_BY_FIGHT_TYPE";
    /** 地图缓存移除 当指定了上一张地图时 其他高层级的缓存地图将无法返回 并且会触发这个事件 其他地图层可监听事件处理跳过时的逻辑 */
    static readonly MAP_REMOVE_CACHE_BY_FIGHT_TYPE = "MAP_REMOVE_CACHE_BY_FIGHT_TYPE";

    /**进入其他玩法非战斗地图*/
    static readonly MAP_ENTER_OTHER = "MAP_ENTER_OTHER";
    /**退出其他玩法非战斗地图*/
    static readonly MAP_EXIT_OTHER = "MAP_EXIT_OTHER";

    /*******************************************地图触发器 ************************************/

    /**触发创建怪物 */
    static readonly TRIGGER_CREATE_MONSTER = "TRIGGER_CREATE_MONSTER";

    /** 触发镜头锁定 [1]:锁定 [0]:解锁*/
    static readonly TRIGGER_LOCK_CAMERA = "TRIGGER_LOCK_CAMERA";

    /*******************************************战斗 ************************************/

    /**
     * 战斗结果 胜负
     * @args event: {@link boolean}
     */
    static readonly BATTLE_RESULT = "BATTLE_RESULT";

    /**
     * 关闭战斗界面
     * @args null
     */
    static readonly CLOSE_BATTLE_VIEW = "CLOSE_BATTLE_VIEW";

    /** 战斗界面显示援助英雄 */
    static readonly BATTLE_VIEW_SHOW_HELP_HERO = "BATTLE_VIEW_SHOW_HELP_HERO";

    /**开始战斗（玩法切换） */
    static readonly START_BATTLE = "START_BATTLE";

    /**退出战斗（切换到主线） args = null */
    static readonly EXIT_BATTLE = "EXIT_BATTLE";

    /**隐藏战斗 */
    static readonly HIDE_BATTLE = "HIDE_BATTLE";

    /**跳过战斗方式开始1场战斗 */
    static readonly SKIP_BATTLE = "SKIP_BATTLE";

    /**跳过当前战斗 */
    static readonly SKIP_NOW_BATTLE = "SKIP_NOW_BATTLE";

    /**跳过当前战斗完成 */
    static readonly SKIP_NOW_BATTLE_COMPLETE = "SKIP_NOW_BATTLE_COMPLETE";

    /**下1场隐藏战斗 */
    static readonly NEXT_HIDE_BATTLE = "NEXT_HIDE_BATTLE";

    /**移除1场隐藏战斗 */
    static readonly REMOVE_HIDE_BATTLE = "REMOVE_HIDE_BATTLE";

    /**结束1场隐藏战斗 */
    static readonly STOP_HIDE_BATTLE = "STOP_HIDE_BATTLE";

    /** 怪物掉落， { itemId: number, num: number }[] */
    static readonly BATTLE_DROP = "BATTLE_DROP";

    /**
     * 显示结算
     * {@link IBattleResultWinData}
     * */
    static readonly BATTLE_RESULT_WIN = "BATTLE_RESULT_WIN";

    /** 设置玩法结束时间 */
    static readonly BATTLE_SET_PLAY_ENDTIME = "BATTLE_SET_PLAY_ENDTIME";

    /**进入世界 */
    static readonly ENTER_WORLD = "ENTER_WORLD";

    /**进入世界资源刷新 */
    static readonly ENTER_WORLD_RESOUCRE_REFRESH = "ENTER_WORLD_RESOUCRE_REFRESH";

    /**进入世界完成 */
    static readonly ENTER_WORLD_COMPLETE = "ENTER_WORLD_COMPLETE";

    /**摇杆改变 */
    static readonly JOYSTICK_CHANGED = "JOYSTICK_CHANGED";

    /**摇杆控制结束 */
    static readonly JOYSTICK_END = "JOYSTICK_END";

    /** 队伍团灭 */
    static readonly TEAM_DIE = "TEAM_DIE";

    /** 复活队伍 */
    static readonly TEAM_REBIRTH = "TEAM_REBIRTH";

    /**服务器刷新怪物*/
    static readonly UPDATE_MONSTER_FROM_SERVER = "UPDATE_MONSTER_FROM_SERVER";

    /** 创建敌方单位 （玩法） */
    static readonly CREATE_ENEMY_UNITS_BY_PLAY = "CREATE_ENEMY_UNITS_BY_PLAY";

    /** 创建矿产单位 （主线地图） */
    static readonly CREATE_MINERAL_UNITS = "CREATE_MINERAL_UNITS";
    /** 创建怪物单位 （主线地图）*/
    static readonly CREATE_MONSTER_UNITS = "CREATE_MONSTER_UNITS";

    /** 战斗上阵英雄发生改变 */
    static readonly BATTLE_FORMATION_CHANGED = "BATTLE_FORMATION_CHANGED";
    /** 战斗上阵英雄属性改变 */
    static readonly BATTLE_ATTR_CHANGED = "BATTLE_ATTR_CHANGED";
    /** 战斗上阵英雄皮肤改变 */
    static readonly BATTLE_SKIN_CHANGED = "BATTLE_SKIN_CHANGED";

    /** 战斗中的一方全部阵亡 */
    static readonly BATTLE_ALL_DEAD = "BATTLE_ALL_DEAD";

    /** 战斗的结束 */
    static readonly BATTLE_END = "BATTLE_END";

    /** 战斗的主动取消 */
    static readonly BATTLE_CANCEL = "BATTLE_CANCEL";

    /** 战斗的结束完成 */
    static readonly BATTLE_RESULT_END = "BATTLE_RESULT_END";

    /** 战斗的英雄CD更新，参数skillData {@link SkillData} */
    static readonly BATTLE_SKILL_CD_UPDATE = "BATTLE_SKILL_CD_UPDATE";

    /** 释放技能，参数skillData {@link SkillData} */
    static readonly BATTLE_USE_SKILL = "BATTLE_USE_SKILL";

    /** 释放技能结束，参数skillData {@link SkillData} */
    static readonly BATTLE_USE_SKILL_COMPLETE = "BATTLE_USE_SKILL_COMPLETE";

    /** 战斗的队长技能CD更新，参数skillData {@link LeaderSkill} */
    static readonly BATTLE_LEADERSKILL_CD_UPDATE = "BATTLE_LEADERSKILL_CD_UPDATE";

    /** 战斗的开始*/
    static readonly BATTLE_START = "BATTLE_START";

    /** 战斗请求结束*/
    static readonly BATTLE_CHECK_END = "BATTLE_CHECK_END";

    /** 战斗的开始状态 {@link IBattleStartState} */
    static readonly BATTLE_START_STATE = "BATTLE_START_STATE";

    /** 战斗的血量变化  {@link IBattleTeamHpChangeVo}  */
    static readonly BATTLE_HP_CHANGED = "BATTLE_HP_CHANGED";

    /** 战斗单位死亡 */
    static readonly BATTLE_PLAY_UNIT_DEAD = "BATTLE_PLAY_UNIT_DEAD";

    /** 战斗单位死亡验证属性 */
    static readonly BATTLE_PLAY_UNIT_VERIFY = "BATTLE_PLAY_UNIT_VERIFY";

    /** 战斗单位复活 */
    static readonly BATTLE_PLAY_UNIT_REVIVE = "BATTLE_PLAY_UNIT_REVIVE";

    /** 战斗单位死亡(只要死亡就派发) */
    static readonly BATTLE_PLAY_UNIT_DIE = "BATTLE_PLAY_UNIT_DIE";

    /**玩法内请求复活 参数true为免费复活*/
    static readonly BATTLE_PLAY_REQUEST_REBIRTH = "BATTLE_PLAY_REQUEST_REBIRTH";
    /**玩法内请求复活获得后端通过 参数true为免费复活*/
    static readonly BATTLE_PLAY_REQUEST_REBIRTH_PASSED = "BATTLE_PLAY_REQUEST_REBIRTH_PASSED";

    /**战斗 死亡事件 @type {Array<IBattleUnitDeadEventData>}*/
    static readonly BATTLE_UNIT_DEAD_INFO = "BATTLE_UNIT_DEAD_INFO";

    /**清理敌方单位 （用于boss出现时清理小怪） */
    static readonly BATTLE_CLEAN_DEFENDER_UNITS = "BATTLE_CLEAN_DEFENDER_UNITS";

    /**清理较远的资源点 （怪和矿） @type { [resourceId: number]: Array<number> }*/
    static readonly BATTLE_CLEAN_FARTHER_RESOURCES = "BATTLE_CLEAN_FARTHER_RESOURCES";

    /**暂停战斗*/
    static readonly PAUSE_BATTLE = "PAUSE_BATTLE";
    /**继续战斗*/
    static readonly CONTINUE_BATTLE = "CONTINUE_BATTLE";
    /**战斗暂停状态变更*/
    static readonly BATTLE_PAUSE_STATE_CHANGE = "BATTLE_PAUSE_STATE_CHANGE";
    /**战斗缓存数据清除*/
    static readonly BATTLE_CLEAR_WAITING_CACHE = "BATTLE_CLEAR_WAITING_CACHE";

    /**观战结束等待结算*/
    static readonly BATTLE_WATCH_COMPLETE = "BATTLE_WATCH_COMPLETE";

    /** 队伍死亡返回主城 */
    static readonly TEAM_DIE_BACK = "TEAM_DIE_BACK";

    /******************************************* 排行榜 *************************************/

    /**
     * 排行榜数据返回
     * @args event: {@link EventRankDataResp}
     */
    static readonly RANK_ON_DATA_RESP = "RANK_ON_DATA_RESP";
    /**
     * 排行榜切换子类型
     * @args subType: {@link number}
     */
    static readonly RANK_SUB_TYPE_CHANGE = "RANK_SUB_TYPE_CHANGE";

    /******************************************* JJC *************************************/

    /**
     * 游戏玩法
     * {@link Vo.arena.ArenaPlayInfo}
     */
    static readonly PVP_GAME_MODE_BASE_DATA_UPDATE: string = "PVP_GAME_MODE_BASE_DATA_UPDATE";

    /**
     * JJC 刷新数据
     */
    static readonly PVP_REFRESH_DATA = "REFRESH_PVP_MAIN_VIEW";

    /**
     * JJC top3 数据
     * @args event: {@link Vo.arena.ArenaRankItemVo[]}
     */
    static readonly PVP_RANK_TOP_3 = "PVP_RANK_TOP_3";

    /**
     * JJC 获取战报记录
     * @args event: {@link Vo.arena.ArenaChallengeRecord[]}
     */
    static readonly PVP_GET_RECORDS = "PVP_GET_RECORDS";

    /**
     * JJC 领取了每周挑战奖励
     * @args null
     */
    static readonly PVP_WEEKLY_CHALLENGE_REWARD_GAIN = "PVP_WEEKLY_CHALLENGE_REWARD_GAIN";

    /**
     * JJC 升段位 | 主动
     * @args newScore: {@link number}
     */
    static readonly PVP_RANK_LV_UP = "PVP_RANK_LV_UP";

    /**
     * JJC 升段位 | 被动
     * @args newScore: {@link number}
     */
    static readonly PVP_RANK_BE_LV_UP = "PVP_RANK_BE_LV_UP";

    /******************************************* 任务指引 *************************************/

    /**
     * 引导开始前, 抛出该事件
     * ps: 用于后续做做统一的操作遮罩
     * @args null
     */
    static readonly TASK_GUIDE_START = "TASK_GUIDE_START";

    /**
     * 点击屏幕, 引导结束抛出
     */
    static readonly TASK_GUIDE_END = "TASK_GUIDE_END";

    // 指引箭头
    static readonly TASK_GUIDE_TO_TARGET_DOWN_ARROW = "event:guide:downArrowTips";

    /********************************** 天赋 Talent ************************************/

    /**
     * 天赋升级
     * @args talentId: {@link number}
     */
    static readonly TALENT_CHANGE = "TALENT_CHANGE";

    /**
     * 点击大天赋升级提示
     * @args rowId: {@link number}
     */
    static readonly TALENT_CLICK_BIG_LV_UP_TIPS = "TALENT_CLICK_BIG_LV_UP_TIPS";

    /**
     * 天赋可以升级大的
     * @args rowId: {@link number}
     */
    static readonly TALENT_CAN_LV_UP_BIG = "TALENT_CAN_LV_UP_BIG";

    /********************************** 羁绊 ************************************/

    /**
     * 解锁新的羁绊
     * @args fetterIds: {@link number[]}
     */
    static readonly FETTER_UNLOCK_NEW = "FETTER_UNLOCK_NEW";

    /********************************** 跳转 ************************************/

    /**
     * 跳转到其他功能 (跳转 button)
     * @config {@link table.jump.JumpConfig}
     * @args jumpId: {@link number}
     */
    static readonly EVENT_JUMP_TO_OTHER_FEATURE = "event:jump:jumpToOtherUI";

    /**
     * 跳转到其他功能 带额外参数 (跳转 button)
     * @config {@link table.jump.JumpConfig}
     * @args jumpId: {@link {jumpId:number, arg?:any}}
     */
    static readonly EVENT_JUMP_TO_OTHER_FEATURE_ARGS = "event:jump:jumpToOtherUIArgs";

    /******************************************* loading ************************************/
    /** 显示 loading 界面 */
    static readonly LOADING_VIEW_SHOW = "LOADING_VIEW_SHOW";
    /** loading 界面完成 */
    static readonly LOADING_VIEW_COMPLETE = "LOADING_VIEW_COMPLETE";

    /******************************************* 卡牌培养 ************************************/
    /** 激活英雄 */
    static readonly HERO_ACTIVATE = "HERO_ACTIVATE";
    /** 激活英雄 */
    static readonly HERO_ACTIVATE_FROM_ITEM = "HERO_ACTIVATE_FROM_ITEM";
    /** 英雄（槽位）升级
     * - 共鸣等级说也是用这个
     * */
    static readonly HERO_UP_LEVEL = "HERO_UP_LEVEL";
    /** 英雄升星 */
    static readonly HERO_UP_STAR = "HERO_UP_STAR";
    /** 英雄（槽位）升阶 */
    static readonly HERO_UP_STAGE = "HERO_UP_STAGE";
    /** 筛选英雄 (传HeroSelectData数据) */
    static readonly HERO_SELECT_HERO = "HERO_SELECT_HERO";
    /** 切换英雄 */
    static readonly HERO_SWITCH_HERO = "HERO_SWITCH_HERO";
    /** 切换英雄皮肤展示 */
    static readonly HERO_SKIN_SWITCH = "HERO_SKIN_SWITCH";
    /** 重置英雄皮肤展示 */
    static readonly HERO_SKIN_RESET = "HERO_SKIN_RESET";
    /** 显示技能详情 */
    static readonly HERO_SHOW_SKILL_INFO = "HERO_SKILL_INFO";
    /** 更换英雄皮肤 */
    static readonly HERO_SKIN_WEAR = "HERO_SKIN_WEAR";
    static readonly HERO_UP_COMMON_LV = "HERO_UP_COMMON_LV";
    /** 英雄潜能升级 */
    static readonly HERO_DNA_LEVEL_UP = "HERO_DNA_LEVEL_UP";
    /** 英雄潜能首次觉醒 */
    static readonly HERO_DNA_AWAKEN_FIRST = "HERO_DNA_AWAKEN_FIRST";
    /** 英雄潜能词条刷新 */
    static readonly HERO_DNA_AWAKEN_REFRESH = "HERO_DNA_AWAKEN_REFRESH";
    /** 英雄潜能确认替换 */
    static readonly HERO_DNA_REFRESH_CONFIRM = "HERO_DNA_REFRESH_CONFIRM";
    /** 英雄潜能确取消替换 */
    static readonly HERO_DNA_REFRESH_CANCEL = "HERO_DNA_REFRESH_CANCEL";

    /******************************************* 布阵 ************************************/
    /** 上阵单个英雄,仅支持空的阵位 */
    static readonly FORMATION_IN_BATTLE_HERO = "FORMATION_IN_BATTLE_HERO";
    /** 临时上阵英雄（前端记录布阵信息） */
    static readonly FORMATION_TEMP_IN_BATTLE_HERO = "FORMATION_TEMP_IN_BATTLE_HERO";
    /** 推送阵位解锁 */
    static readonly FORMATION_POSITION_UNLOCK = "FORMATION_POSITION_UNLOCK";
    /** 修改完了主线阵容 */
    static readonly FORMATION_SET_UP_FORMATION = "FORMATION_SET_UP_FORMATION";
    /** 修改完了任意一玩法阵容 */
    static readonly FORMATION_CUSTOM_SET_UP_FORMATION = "FORMATION_CUSTOM_SET_UP_FORMATION";
    /** 布阵推荐英雄选中 */
    static readonly FORMATION_DISCOUNT_SETECT = "FORMATION_DISCOUNT_SETECT";

    /******************************************* 战力 ************************************/
    /** 更新单个英雄战力 */
    static readonly FIGHT_UPDATE_ONE_HERO = "FIGHT_UPDATE_ONE_HERO";
    /** 更新全队战力 | 当战斗力变更 (仅更新战力, 不一定飘字) */
    static readonly FIGHT_UPDATE_ALL_HERO = "FIGHT_UPDATE_ALL_HERO";
    /** 重新计算总战力 (需要飘字时调用, 一般战力有引用可以派发此事件) */
    static readonly FIGHT_RECALCULATE_ALL_HERO = "FIGHT_RECALCULATE_ALL_HERO";

    /******************************************* 道具 ************************************/

    /**
     * 新获得道具 | 之前背包中没有
     * {@link NoOwnerItem}
     */
    static readonly NEW_GAIN_ITEM = "NEW_GAIN_ITEM";

    /**
     * 点击了道具
     * {@link }
     */
    static readonly CLICK_ITEM = "CLICK_ITEM";

    /**
     * 玩家背包中, 物品发生变更, 抛出变更 <itemId, count>
     * @args changeItemIdToCountMap: {@link Map<number, number>}
     */
    static readonly EVENT_CHANGE_ITEMS = "event:item:changeItems";

    /**
     * 道具变更 (获得奖励，不包含扣费)
     * {@link Vo.reward.RewardResult[]}
     * */
    static readonly EVENT_CHANGE_ITEMS2 = "EVENT_CHANGE_ITEMS2";

    // Event: 服务端物品增减
    static readonly EVENT_RECEIVE_SERVER_ITEM_CHANGE = "event:item:serverItemChange";

    /**
     * Event: 服务端增加道具
     * @args serverItems {@link Vo.reward.RewardResult[]}
     */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS = "event:item:serverAddItems";

    /**
     * Event: 服务端扣除道具
     * {@link  Vo.cost.CostItemResult[]}
     */
    static readonly EVENT_RECEIVE_SERVER_COST_ITEMS = "event:item:serverCostItems";

    /** event: 弹出恭喜获得 {@link NoOwnerItem[]} */
    static readonly EVENT_GAIN_ITEM_POP_UP = "event:item:gainItemPopUp";

    /** event: 弹出恭喜获得附带参数 {@link {items:NoOwnerItem[], param:IItemRewardParam}} */
    static readonly EVENT_GAIN_ITEM_POP_UP_WITH_PARAM = "event:item:gainItemPopUpWithParam";

    /** event: 道具不足时，显示来源 {@link itemId:number} */
    static readonly EVENT_ITEM_GET_WAY_POP_UP = "event:item:ItemGetWayPopUp";

    /** event: 道具不足时，显示新的来源框 {@link itemId:number} */
    static readonly EVENT_ITEM_GET_WAY_POP_UP_2 = "event:item:ItemGetWayPopUp2";

    /** Event: 服务端增加道具, 但不弹窗，也不飘字 | Vo.reward.RewardResult[] */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP = "event:item:serverAddItemsNoPopUp";

    /** Event: 服务端增加道具, 不弹窗, 但飘字 */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP = "EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP";

    /** Event: 服务端增加道具, 强制全部弹窗 {@link Vo.reward.RewardResult[]}  */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW = "EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW";
    /** Event: 服务端增加道具, 强制全部弹窗 附带参数 {@see IItemRewardParam}  */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM = "EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM";
    /** Event: 服务端增加道具, 主界面飘道具 | {@see IMainPageAddItemAniArgs} */
    static readonly EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI = "EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI";

    /**
     * event: 点击道具, 打开小提示面板
     * @args uiOpenArgs {@link ItemSmallTipsViewOpenArgs}
     */
    static readonly EVENT_ITEM_CLICK_OPEN_SMALL_TIPS = "event:item:clickOpenSmallTips";

    /******************************************* 邮件 ************************************/

    // 邮件变更
    static readonly EVENT_EMAIL_CHANGE = "event:emailChange";

    /******************************************* 任务主界面 ************************************/

    // Event: 任务 tab
    static readonly EVENT_TASK_TAB_REFRESH = "event:task:taskTabRefresh";

    /******************************************* 每日任务 ************************************/

    /**
     * 新增每日任务
     * @args null
     */
    static readonly DAILY_TASK_ADD_NEW = "DAILY_TASK_ADD_NEW";
    // Event: 每日任务状态变更
    static readonly EVENT_DAILY_TASK_CHANGE = "event:dailyTask:taskChange";

    // Event: 每日任务添加活跃分数
    static readonly EVENT_DAILY_TASK_ADD_SCORE = "event:dailyTask:addScore";

    /******************************************* 主线任务 ************************************/

    // Event: 主线任务状态变更
    static readonly EVENT_TRUNK_TASK_CHANGE = "event:trunkTask:taskChange";
    /**
     * 下1个主线任务变更
     * args: {@link number } taskId
     */
    static readonly EVENT_TRUNK_TASK_ID_NEXT = "event:trunkTask:nextTask";
    /**
     * 主线任务完成了未领奖
     * args: {@link number } taskId
     */
    static readonly EVENT_TRUNK_TASK_COMPLETE = "EVENT_TRUNK_TASK_COMPLETE";

    /**
     * GM的自动完成
     */
    static readonly EVENT_TRUNK_TASK_GM_AUTO_FINISH = "EVENT_TRUNK_TASK_GM_AUTO_FINISH";

    /******************************************* 成就任务 ************************************/

    // Event: 成就任务状态变更
    static readonly EVENT_ACHIEVEMENT_CHANGE = "event:achievement:change";

    /*******************************************商店 *****************************************/
    // Event: 商店购买返回
    static readonly EVENT_SHOP_BUY_RESP = "event:shop:buyResp";

    //商店信息返回
    static readonly EVENT_SHOP_INFO_RESP = "event:shop:infoResp";

    /******************************************* 世界boss ************************************/
    // Event: 世界boss信息返回
    static readonly EVENT_WORLD_BOSS_INFO_RESP = "event:worldBoss:infoResp";
    // Event: 世界boss排行榜返回
    static readonly EVENT_WORLD_BOSS_RANK_RESP = "event:worldBoss:rankResp";
    // Event: 世界boss领取奖励完成
    static readonly EVENT_WORLD_BOSS_DRAWSERVERREWARD_COMPLETE = "event:worldBoss:drawServerRewardComplete";
    // Event: 世界boss全量boss信息
    static readonly EVENT_WORLD_BOSS_ALL_INFO_RESP = "event:worldBoss:allInfoResp";

    /******************************************* 联盟 ************************************/
    /**
     * 成员数量变化
     */
    static readonly LEAGUE_MEMBER_COUNT_CHANGE = "LEAGUE_MEMBER_COUNT_CHANGE";
    //拥有联盟，包括创建和加入
    static readonly EVENT_HAVE_LEAGUE = "event:league:haveLeague";
    //退出联盟 / 被踢出联盟
    static readonly EVENT_EXIT_LEAGUE = "event:league:exitLeague";
    //联盟信息变更
    static readonly EVENT_LEAGUE_INFO_CHANGE = "event:league:infoChange";
    //联盟成员变更
    static readonly EVENT_LEAGUE_MEMBER_CHANGE = "event:league:memberChange";
    //联盟公告变更
    static readonly EVENT_LEAGUE_NOTICE_CHANGE = "event:league:noticeChange";
    //公会列表变更
    static readonly EVENT_LEAGUE_LIST_CHANGE = "event:league:listChange";
    //联盟  图标和banner变更
    static readonly EVENT_LEAGUE_ICON_BANNER_CHANGE = "event:league:iconBannerChange";
    //申请我的联盟的列表更新
    static readonly EVENT_LEAGUE_apply_LIST = "event:league:applyList";
    //审批返回
    static readonly EVENT_LEAGUE_APPROVAL_RESP = "event:league:approvalResp";
    /**名字变更 */
    static readonly EVENT_LEAGUE_NAME_CHANGE = "event:league:nameChange";
    /**联盟升级 */
    static readonly EVENT_LEAGUE_UPGRADE = "event:league:upgrade";
    /**联盟排行榜返回 */
    static readonly EVENT_LEAGUE_RANK_RESP = "event:league:rankResp";

    /**根据id返回联盟信息 */
    static readonly EVENT_LEAGUE_INFO_BY_ID = "event:league:infoById";

    /**联盟官员职称变化 */
    static readonly EVENT_LEAGUE_MEMBER_JOB_CHANGE = "event:league:memberJobChange";

    /**推送审批结果 */
    static readonly EVENT_LEAGUE_PUSH_APPROVAL = "event:league:pushApproval";

    /**联盟挑战信息更新 */
    static readonly EVENT_LEAGUE_CHALLENGE_INFO_UPDATE = "event:league:challengeInfoUpdate";
    /**完成任务的成员列表 */
    static readonly EVENT_TASK_COMPLETE_MEMBER_LIST = "event:task:completeMemberList";

    /**邀请次数变更 */
    static readonly EVENT_LEAGUE_INVITE_CHANGE = "event:league:inviteChange";

    /**邀请完成 */
    static readonly EVENT_LEAGUE_INVITE_COMPLETE = "event:league:inviteComplete";

    /************************************************************联盟科技 ************************/
    /**科技升级成功 */
    static readonly EVENT_LEAGUE_TECHNOLOGY_UPGRADE = "event:league:technologyUpgrade";

    /*******************************联盟boss ***************************** */
    /**联盟boss信息返回 */
    static readonly EVENT_LEAGUE_BOSS_INFO_CHANGE = "event:league:bossInfoChange";
    /**联盟boss 阶段信息返回 */
    static readonly EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE = "event:league:bossStageInfoChange";
    /**挑战次数变化 */
    static readonly EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE = "event:league:bossChallengeCountChange";
    /**联盟排行榜返回 */
    static readonly EVENT_LEAGUE_BOSS_RANK_RESP = "event:league:bossRankResp";
    /**联盟阶段推送 */
    static readonly EVENT_LEAGUE_BOSS_STAGE_CHANGE = "event:league:bossStageChange";
    /**联盟boss阶段推送 */
    static readonly EVENT_LEAGUE_BOSS_KILL = "event:league:bossKill";

    /*******************************************联盟宝箱**************************** */
    /**联盟宝箱周任务变更 */
    static readonly EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE = "event:league:weeklyTaskRewardChange";

    /**赠礼条目变更  */
    static readonly EVENT_LEAGUE_GIFT_CHANGE = "event:league:giftChange";

    /**送礼条目变更  */
    static readonly EVENT_LEAGUE_SENDd_GIFT_CHANGE = "event:league:sendGiftChange";

    /**联盟宝箱宝箱进度推送 */
    static readonly EVENT_LEAGUE_BOX_PROGRESS_CHANGE = "event:league:boxProgressChange";

    /******************************************* 所有任务 ************************************/

    // Event: 所有任务添加进度
    static readonly EVENT_TASK_ADD_PROGRESS = "event:task:addProgress";

    /******************************************* 挂机 ************************************/

    /**
     * 打开战斗界面
     * {@link number} levelId 关卡id
     */
    static HANG_UP_OPEN_BATTLE_VIEW: string = "HANG_UP_OPEN_BATTLE_VIEW";

    /**
     * 领取挂机奖励
     * null
     */
    static HANG_UP_GAIN_IN_BG_REWARD: string = "HANG_UP_GAIN_IN_BG_REWARD";

    /**
     * 挂机奖励结果
     * {@link Map<number, number>}  itemIdToCountMap
     */
    static readonly HANG_UP_GAIN_ITEM_RESULT = "HANG_UP_GAIN_ITEM_RESULT";
    /**
     * 挂机设置进入后台
     * @args null
     */
    static readonly HANG_UP_SET_IN_BG = "HANG_UP_SET_IN_BG";
    /**
     * 挂机 - 后台战斗托管结束
     * @args null
     */
    static readonly HANG_UP_IN_BG_END = "HANG_UP_IN_BG_END";
    /**
     * 挂机 - 后台战斗更新
     * @args isInBg {@link boolean}
     */
    static readonly HANG_UP_IN_BG_UPDATE = "HANG_UP_IN_BG_UPDATE";
    /**
     * 退出关卡主界面
     * @args null
     */
    static readonly HANG_UP_EXIT_MAIN_VIEW = "HANG_UP_EXIT_MAIN_VIEW";

    /**
     * Event: 玩家最大通关关卡id变更
     * @args null
     */
    static readonly HANG_UP_MAX_PASS_LEVEL_ID_CHANGE = "event:hangUp:maxPassLevelIdChange";

    /**
     * Event: 玩家最大通关关卡id变更
     * @args 最大通关关卡id
     */
    static readonly HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2 = "event:hangUp:maxPassLevelIdChange2";

    /**
     * Event: 玩家后台通关
     * @args null
     */
    static readonly HANG_UP_IN_BG_PASS_NEW_LEVEL_ID = "HANG_UP_IN_BG_PASS_NEW_LEVEL_ID";

    /**
     * Event: 更新了领奖关卡
     * @args null
     */
    static readonly HANG_UP_UPDATE_GAIN_LEVEL_ID = "event:hangUp:updateGainLevelId";

    /**
     * Event: 挂机加速次数变更
     * @args null
     */
    static readonly HANG_UP_SPEED_UP_COUNT_CHANGE = "event:hangUp:speedUpCountChange";

    /**
     * Event: 挑战关卡
     * @args levelId: {@link number}
     */
    static readonly HANG_UP_CHALLENGE_LEVEL = "event:hangUp:challengeLevel";

    /**
     * Event: 挂机关卡战斗结果
     * @args winFlag: {@link boolean}
     */
    static readonly HANG_UP_LEVEL_BATTLE_RESULT = "event:hangUp:battleResult";

    /******************************************* 飘字 ************************************/
    /**
     * Event: 漂浮提示字体
     * @deprecated
     */
    static readonly EVENT_FLOATING_TEXT: string = "event:floatingText:show";

    /**
     * Event: 漂浮提示字体
     * @deprecated
     */
    static readonly EVENT_SET_FLOATING_TEXT: string = "EVENT_SET_FLOATING_TEXT";

    /**
     * Event: 漂浮提示字体（DEBUG 模式打印）
     * @deprecated
     */
    static readonly EVENT_FLOATING_TEXT_DEBUG: string = "event:floatingText:debug";

    /**
     * (新)漂浮提示字体
     * {@link TextData}
     */
    static readonly EVENT_NEW_FLOATING_TEXT: string = "EVENT_NEW_FLOATING_TEXT";

    /**播放获得道具动画    传Vo.reward.RewardResult[]*/
    static readonly EVENT_GET_ITEM_ANIM: string = "EVENT_GET_ITEM_ANIM";

    /******************************************* 装备 ************************************/
    /** 穿戴装备 */
    static readonly EQUIP_WEAR_EQUIP = "EQUIP_WEAR_EQUIP";
    /** 分解装备 */
    static readonly EQUIP_RECYCLE_EQUIP = "EQUIP_RECYCLE_EQUIP";

    /******************************************* 战队科技 ************************************/
    /**
     * 战队技能, 布阵中变更
     * {@link EventCaptainSkillChange}
     * */
    static readonly CAPTAIN_SKILL_CHANGE = "CAPTAIN_SKILL_CHANGE";

    /**
     * 战队技能全部等级改变 参数为0代表全部改变 其他情况参数就是具体的战队科技id
     * {@link EventCaptainSkillLvUp}
     * */
    static readonly CAPTAIN_SKILL_LV_UPDATE = "CAPTAIN_SKILL_LV_UPDATE";

    /**
     * 战队核心科技等级变更
     * */
    static readonly CAPTAIN_SKILL_CORE_LV_UPDATE = "CAPTAIN_SKILL_CORE_LV_UPDATE";

    /******************************************* 抽卡 ************************************/

    /**
     * 抽卡状态变更
     * @args null
     */
    static readonly DRAW_CARD_STATE_CHANGE = "event:drawCard:stateChange";

    /**
     * 抽卡获得xx道具, 传
     * {@link  DrawCardResultViewOpenArgs}
     */
    static readonly DRAW_CARD_GAIN_ITEMS = "event:drawCard:gainItems";

    // 抽卡动画
    static readonly DRAW_CARD_RESULT_ANIM = "DRAW_CARD_RESULT_ANIM";

    /**
     * 抽卡 score
     * null
     */
    static readonly DRAW_CARD_WEAPON_BOX_SCORE_CHANGE = "DRAW_CARD_WEAPON_BOX_SCORE_CHANGE";

    /**
     * 退出抽卡结果界面
     * {@link  DrawCardResultViewOpenArgs}
     */
    static readonly DRAW_CARD_EXIT_RESULT = "event:drawCard:exitResult";

    /**
     * 关闭抽卡获得新英雄界面
     */
    static readonly CLOSE_GET_NEW_HERO_VIEW = "event:drawCard:getNewHero";

    /** 刷新心愿英雄信息 */
    static readonly DRAW_CARD_UPDATE_HERO_INFO = "DRAW_CARD_UPDATE_HERO_INFO";

    /** 播放抽卡动画 */
    static readonly DRAW_CARD_PLAY_GET_ANIM = "DRAW_CARD_PLAY_GET_ANIM";

    /** 抽卡广告次数重置 */
    static readonly DRAW_CARD_AD_TIMES_RESET = "DRAW_CARD_AD_TIMES_RESET";

    /******************************************* 新手引导 ************************************/

    /** 引导开始 args:guideId*/
    static readonly GUIDE_START = "GUIDE_START";
    /** 执行下一个步骤 args:groupId */
    static readonly GUIDE_NEXT = "GUIDE_NEXT";
    /** 引导结束 args:groupId */
    static readonly GUIDE_END = "GUIDE_END";
    /** 引导结束 */
    static readonly GUIDE_FINISH = "GUIDE_FINISH";
    /**引导聚焦结束事件 */
    static readonly GUIDE_FOCUS_END = "GUIDE_FOCUS_END";

    /** 新手请求刷怪(隐藏怪) */
    static readonly GUIDE_GET_ENEMY_VISIBLE_FALSE = "GUIDE_GET_ENEMY_VISIBLE_FALSE";
    /** 新手请求刷怪(显示怪) */
    static readonly GUIDE_GET_ENEMY_VISIBLE_TRUE = "GUIDE_GET_ENEMY_VISIBLE_TRUE";
    /** 新手营救队友 */
    static readonly GUIDE_GET_HERO = "GUIDE_GET_HERO";
    /** 点击某个按钮 事件发送按钮ID，按钮ID找策划确认，按钮ID写死就不要改了 */
    static readonly GUIDE_CLICK_BTN = "GUIDE_CLICK_BTN";

    /** 引导记录完成 */
    static readonly GUIDE_MARK_COMPLETED = "GUIDE_MARK_COMPLETED";

    // /** 打开UI界面 */
    // static readonly OPEN_ViEW = "OPEN_ViEW";
    // /** 关闭UI界面 */
    // static readonly CLOSE_ViEW = "CLOSE_ViEW";

    /** GM 引导结束 */
    static readonly GUIDE_GM_END = "GUIDE_GM_END";

    /**引导怪刷新了 */
    static readonly CREATE_GUIDE_MONSTERS = "CREATE_GUIDE_MONSTERS";

    /** 清理引导剧情 根据剧情组ID */
    static readonly GUIDE_CLEAN_PLOT_BY_GROUP_ID = "GUIDE_CLEAN_PLOT_BY_GROUP_ID";

    /**引导玩法列表滚动事件*/
    static readonly GUIDE_GAME_MODE_SCOLL = "GUIDE_GAME_MODE_SCOLL";

    /******************************************* 奇点秘境 ************************************/

    /** 刷新信息 */
    static readonly SECRET_AREA_UPDATE_INFO = "SECRET_AREA_UPDATE_INFO";
    /** 挑战结束刷新最新界面信息 */
    static readonly SECRET_AREA_CHALLENGE_UPDATE = "SECRET_AREA_CHALLENGE_UPDATE";
    /** 刷新秘境boss */
    static readonly SECRET_AREA_UPDATE_BOSS = "SECRET_AREA_UPDATE_BOSS";
    /** 秘境战斗胜利 */
    static readonly SECRET_AREA_BATTLE_WIN = "SECRET_AREA_BATTLE_WIN";
    /** 秘境地图传送 */
    static readonly SECRET_AREA_TRANSFER = "SECRET_AREA_TRANSFER";
    /** 秘境扫荡 */
    static readonly SECRET_AREA_SWEEP = "SECRET_AREA_SWEEP";
    /** 秘境退出副本 */
    static readonly SECRET_AREA_EXIT_CLICK = "SECRET_AREA_EXIT_CLICK";

    /*********************************活动***************************************** */
    /**活动数据刷新 */
    static readonly ACTIVITY_DATA_RELOAD = "ACTIVITY_DATA_RELOAD";
    /**活动到期结束-刷新 */
    static readonly ACTIVITY_END_REFRESH = "ACTIVITY_END_REFRESH";
    /**活动请求返回更新 */
    static readonly ACTIVITY_REQUEST_BACK = "ACTIVITY_REQUEST_BACK";
    /**活动请求-请求单个活动返回更新--携带一个活动id参数 */
    static readonly ACTIVITY_SINGLE_REQUEST_BACK = "ACTIVITY_SINGLE_REQUEST_BACK";
    /**
     * 活动更新
     * {@link number} activityId
     */
    static readonly ACTIVITY_UPDATE = "ACTIVITY_UPDATE";
    /**推送活动奖励，一般是无需领取，完成直接发奖的活动奖励--携带一个活动id参数*/
    static readonly ACTIVITY_REWARD_UPDATE = "ACTIVITY_REWARD_UPDATE";
    /**对应活动排行榜更新--携带一个活动id参数 */
    static readonly ACTIVITY_RANK_UPDATE = "ACTIVITY_RANK_UPDATE";
    /**对应活动子排行榜更新--携带一个活动id参数 */
    static readonly ACTIVITY_SUB_RANK_UPDATE = "ACTIVITY_SUB_RANK_UPDATE";
    /** 推送活动事务相关信息， Vo.activity.ActivityStuffVo */
    static readonly ACTIVITY_STUFF_UPDATE = "ACTIVITY_STUFF_UPDATE";

    static readonly OPEN_HALL_LEFT_RIGHT_MENU = "OPEN_HALL_LEFT_RIGHT_MENU";

    /**打开活动id对应的界面--弹窗/页面--携带一个活动id参数 */
    static readonly ACTIVITY_OPEN_VIEW = "ACTIVITY_OPEN_VIEW";

    /**播放震动动效 */
    static readonly ACTIVITY_PLAY_SHAKE = "ACTIVITY_PLAY_SHAKE";

    /**
     * 支持策划表挑转
     */
    static readonly ACTIVITY_JUMP_VIEW_EVENT = "ACTIVITY_JUMP_VIEW_EVENT";
    /**选择活动对应的活动id--携带一个活动id参数 */
    /**活动面板详细展示页面设置底栏隐藏 */
    static readonly ACTIVITY_SETBOTTOM_HIDE = "ACTIVITY_SETBOTTOM_HIDE";
    /**活动banner推送打开事件 */
    static readonly ACTIVITY_BANNER_OPEN_VIEW = "ACTIVITY_BANNER_OPEN_VIEW";
    /**全部活动banner推送完成 */
    static readonly ACTIVITY_BANNER_PUSH_COMPLETE = "ACTIVITY_BANNER_PUSH_COMPLETE";

    /** 刷新活动入口Tab */
    static readonly ACTIVITY_TAB_UPDATE = "ACTIVITY_TAB_UPDATE";

    /** 活动入口下边栏样式  */
    static readonly ACTIVITY_SET_BOTTOM_STYLE = "ACTIVITY_SET_BOTTOM_STYLE";

    // ------------------------------------------ 成长之路 ----------------------------------------------------

    // 成长之路, 任务变更
    static readonly GROW_UP_TASK_UPDATE = "GROW_UP_TASK_UPDATE";

    // ------------------------------------------ 赋能武器 ----------------------------------------------------

    /**武器道具变更*/
    static readonly WEAPON_ITEM_CHANGE = "WEAPON_ITEM_CHANGE";
    /**武器升星完成*/
    static readonly WEAPON_UP_STAR_COMPLETE = "WEAPON_UP_STAR_COMPLETE";
    /**武器穿戴完成*/
    static readonly WEAPON_WEAR_COMPLETE = "WEAPON_WEAR_COMPLETE";
    /**武器卸下完成*/
    static readonly WEAPON_TAKE_OFF_COMPLETE = "WEAPON_TAKE_OFF_COMPLETE";
    /**武器锁定完成*/
    static readonly WEAPON_LOCK_COMPLETE = "WEAPON_LOCK_COMPLETE";
    /**武器消耗选择完成*/
    static readonly WEAPON_SELECT_CONSUME_COMPLETE = "WEAPON_SELECT_CONSUME_COMPLETE";
    /**武器升星确认*/
    static readonly WEAPON_UP_STAR_CONFIRM = "WEAPON_UP_STAR_CONFIRM";
    /**角色武器变更*/
    static readonly WEAPON_CHANGE_FOR_HERO = "WEAPON_CHANGE_FOR_HERO";

    // ------------------------------------------ 好友 ----------------------------------------------------
    /**好友数据初始化完成)*/
    static readonly FRIEND_INIT_COMPLETE = "FRIEND_INIT_COMPLETE";
    /**好友数据改变 (外部使用时 可能还没有好友数据 需要读取id数据)*/
    static readonly FRIEND_DATA_CHANGE = "FRIEND_DATA_CHANGE";
    /**推荐好友数据改变 (外部使用时 可能还没有好友数据 需要读取id数据)*/
    static readonly FRIEND_RECOMMEND_CHANGE = "FRIEND_RECOMMEND_CHANGE";
    /**好友申请列表改变 (外部使用时 可能还没有好友数据 需要读取id数据)*/
    static readonly FRIEND_APPLY_CHANGE = "FRIEND_APPLY_CHANGE";
    /**黑名单列表改变 (外部使用时 可能还没有好友数据 需要读取id数据)*/
    static readonly FRIEND_BLACK_CHANGE = "FRIEND_BLACK_CHANGE";
    /**我的申请数据改变*/
    static readonly FRIEND_MY_APPLY_CHANGE = "FRIEND_MY_APPLY_CHANGE";
    /**好友id变更(但是列表数据还未刷新)*/
    static readonly FRIEND_DATA_ID_CHANGE = "FRIEND_DATA_ID_CHANGE";
    /**黑名单id变更(但是列表数据还未刷新)*/
    static readonly FRIEND_BLACK_ID_CHANGE = "FRIEND_BLACK_ID_CHANGE";
    /**好友申请数量变更*/
    static readonly FRIEND_APPLY_COUNT_CHANGE = "FRIEND_APPLY_COUNT_CHANGE";
    /**赠送好友礼物完成*/
    static readonly FRIEND_GIVE_GIFT_COMPLETE = "FRIEND_GIVE_GIFT_COMPLETE";
    /**申请好友返回*/
    static readonly FRIEND_APPLY_COMPLETE = "FRIEND_APPLY_COMPLETE";
    /**好友离线*/
    static readonly FRIEND_OFFLINE_COMPLETE = "FRIEND_OFFLINE_COMPLETE";
    /**好友上线*/
    static readonly FRIEND_ONLINE_COMPLETE = "FRIEND_ONLINE_COMPLETE";
    /**删除完成*/
    static readonly FRIEND_DELETE_COMPLETE = "FRIEND_DELETE_COMPLETE";
    /**好友简要数据变更*/
    static readonly FRIEND_SIMPLE_DATA_CHANGE = "FRIEND_SIMPLE_DATA_CHANGE";

    // ------------------------------------------ 图鉴 ----------------------------------------------------
    /**图鉴初始化完成*/
    static readonly ILLUSTRATIONS_INIT_COMPLETE = "ILLUSTRATIONS_INIT_COMPLETE";
    /**角色图鉴数据变更*/
    static readonly ILLUSTRATIONS_HERO_CHANGE = "ILLUSTRATIONS_HERO_CHANGE";
    /**武器图鉴数据变更*/
    static readonly ILLUSTRATIONS_WEAPON_CHANGE = "ILLUSTRATIONS_WEAPON_CHANGE";
    /**宠物图鉴数据变更*/
    static readonly ILLUSTRATIONS_PET_CHANGE = "ILLUSTRATIONS_PET_CHANGE";
    /**图鉴积分数据变更*/
    static readonly ILLUSTRATIONS_SCORE_CHANGE = "ILLUSTRATIONS_SCORE_CHANGE";
    /**图鉴奖励等级变更*/
    static readonly ILLUSTRATIONS_REWARD_LV_CHANGE = "ILLUSTRATIONS_REWARD_LV_CHANGE";
    /**图鉴一键激活*/
    static readonly ILLUSTRATIONS_ONE_KEY = "ILLUSTRATIONS_ONE_KEY";

    // ------------------------------------------ 充值 ----------------------------------------------------
    /**充值完成*/
    static readonly CHARGE_COMPLETE = "CHARGE_COMPLETE";
    /**前往vip页签*/
    static readonly GOTO_VIP_PAGE = "GOTO_VIP_PAGE";

    // ------------------------------------------ vip ----------------------------------------------------
    /**vip等级变更*/
    static readonly VIP_LV_CHANGE = "VIP_LV_CHANGE";
    /**vip经验变更*/
    static readonly VIP_EXP_CHANGE = "VIP_EXP_CHANGE";

    // ------------------------------------------ 商城 ----------------------------------------------------
    /**商城商品初始化完成*/
    static readonly MALL_DATA_INIT_COMPLETE = "MALL_DATA_INIT_COMPLETE";
    /**商城商品变更 整个类型*/
    static readonly MALL_DATA_CHANGE_BY_TYPE = "MALL_DATA_CHANGE_BY_TYPE";
    /**商城商品变更 单个商品*/
    static readonly MALL_DATA_CHANGE_BY_ID = "MALL_DATA_CHANGE_BY_ID";
    /**商城限购礼包变更*/
    static readonly MALL_POPUP_CHANGE = "MALL_POPUP_CHANGE";
    /**商城限购礼包主动弹出*/
    static readonly MALL_POPUP = "MALL_POPUP";

    // ------------------------------------------ 每日特惠 ----------------------------------------------------
    /**每日特惠数据变更 附带groupId 为0代表全量*/
    static readonly DAILY_SALE_CHANGE = "DAILY_SALE_CHANGE";

    // ------------------------------------------ 特权卡 ----------------------------------------------------
    /**特权卡信息变更*/
    static readonly MONTHCARD_DATA_CHANGE = "MONTHCARD_DATA_CHANGE";
    /**特权卡购买完成*/
    static readonly MONTHCARD_BUY_COMPLETE = "MONTHCARD_BUY_COMPLETE";

    // ------------------------------------------ 魔方 ----------------------------------------------------
    /** 激活魔方 arge = heroId */
    static readonly MAGICCUBE_ACTIVATE = "MAGICCUBE_ACTIVATE";
    /** 增幅(升级)魔方 */
    static readonly MAGICCUBE_INCREASE = "MAGICCUBE_INCREASE";
    /** 转换魔方 */
    static readonly MAGICCUBE_CONVERT = "MAGICCUBE_CONVERT";
    /** 保存转换魔方 */
    static readonly MAGICCUBE_SAVE_CONVERT = "MAGICCUBE_SAVE_CONVERT";
    /** 刷新魔方数据 */
    static readonly MAGICCUBE_REFRESH_DATA = "MAGICCUBE_REFRESH_DATA";

    // ------------------------------------------ 守卫母舰 ----------------------------------------------------
    /**守卫母舰数据更新*/
    static readonly GUARDSHIP_UPDATE_INFO = "GUARDSHIP_UPDATE_INFO";
    /** 守卫母舰挑战完成 */
    static readonly GUARDSHIP_CHALLENGE_COMPLETE = "GUARDSHIP_CHALLENGE_COMPLETE";
    /** 守卫母舰扫荡完成 */
    static readonly GUARDSHIP_SWEEP_COMPLETE = "GUARDSHIP_SWEEP_COMPLETE";
    /** 守卫母舰可选buff数据更新 */
    static readonly GUARDSHIP_SELECT_BUFF_UPDATE = "GUARDSHIP_SELECT_BUFF_UPDATE";
    /** 守卫母舰刷新buffid刷新 */
    static readonly GUARDSHIP_SELECT_BUFF_REFRESH = "GUARDSHIP_SELECT_BUFF_REFRESH";
    /** 守卫母舰波次更新 */
    static readonly GUARDSHIP_ROUND_UPDATE = "GUARDSHIP_ROUND_UPDATE";
    /** 守卫母舰buff更新 */
    static readonly GUARDSHIP_BUFF_UPDATE = "GUARDSHIP_BUFF_UPDATE";
    /** 守卫母舰经验相关信息更新 */
    static readonly GUARDSHIP_STUFF_EFFECT_UPDATE = "GUARDSHIP_STUFF_EFFECT_UPDATE";
    /** 守卫母舰选择buff完成 */
    static readonly GUARDSHIP_SELECT_BUFF_COMPLETE = "GUARDSHIP_SELECT_BUFF_COMPLETE";
    /** 守卫母舰掉落道具改变 */
    static readonly GUARDSHIP_DROP_ITEM_CHANGE = "GUARDSHIP_DROP_ITEM_CHANGE";

    // ------------------------------------------ gvg ----------------------------------------------------

    /**
     * 联盟对决信息更新
     */
    static readonly GVG_INFO_CHANGE = "GVG_INFO_CHANGE";
    /**
     * 联盟对决 加载敌人信息
     * {@link Vo.leaguewar.LeagueWarDefenceVo}
     */
    static readonly GVG_LOAD_OPPO_PLAYER_CHALLENGE_INFO = "GVG_LOAD_OPPO_PLAYER_CHALLENGE_INFO";
    /**
     * 联盟对决 加载我方信息
     * {@link Vo.leaguewar.LeagueWarDefenceVo}
     */
    static readonly GVG_LOAD_OUR_PLAYER_CHALLENGE_INFO = "GVG_LOAD_OUR_PLAYER_CHALLENGE_INFO";
    /**
     * 联盟对决 玩家信息变更
     * {@link } null
     */
    static readonly GVG_FIGHTER_DATA_CHANGE = "GVG_FIGHTER_DATA_CHANGE";
    /**
     * 联盟对决 排行榜加载完成
     * {@link Vo.leaguewar.LeagueWarPlayerScoreRankItemVo[]}
     */
    static readonly GVG_LOAD_MY_CONTRIBUTION_DONE = "GVG_LOAD_MY_CONTRIBUTION_DONE";
    /**
     * 联盟对决 加载贡献完成
     * {@link Vo.leaguewar.LeagueWarPlayerScoreRankItemVo[]}
     */
    static readonly GVG_LOAD_OPPO_CONTRIBUTION_DONE = "GVG_LOAD_OPPO_CONTRIBUTION_DONE";
    /**
     * 联盟对决 玩家信息变更
     * {@link Vo.leaguewar.LeagueWarFightReportVo[]}
     */
    static readonly GVG_LOAD_RECORDS_DONE = "GVG_LOAD_RECORDS_DONE";

    // ------------------------------------------ 广告 ----------------------------------------------------
    /**播放广告*/
    static readonly AD_START_PLAY = "AD_START_PLAY";
    /**广告奖励获取完成 {args 广告类型 ServerEnums.AdvertType }*/
    static readonly AD_GET_REWARD_COMPLETE = "AD_GET_REWARD_COMPLETE";

    // ------------------------------------------ 星钻银行 ----------------------------------------------------
    static readonly DIAMOND_BANK_ON_INIT_END = "DIAMOND_BANK_ON_INIT_END";

    // ------------------------------------------ 星灵 ----------------------------------------------------
    /** 激活星灵 */
    static readonly PET_ACTIVER = "PET_ACTIVER";
    /** 星灵升星 */
    static readonly PET_UP_STAR = "PET_UP_STAR";
    /**升级共享等级 */
    static readonly PET_UP_SHARE_LV = "PET_UP_SHARE_LV";
    /**升级共享阶级 */
    static readonly PET_UP_STAGE_LV = "PET_UP_STAGE_LV";
    /** 当前上阵的宠物技能改变（升星） */
    static readonly PET_SKILL_CHANGED = "PET_SKILL_CHANGED";

    /**布阵中变更* */
    static readonly PET_CHANGE = "PET_CHANGE";

    /** 羁绊激活/升级 */
    static readonly PET_GROUP_ACTIVE_UP = "PET_GROUP_ACTIVE_UP";

    // ------------------------------------------ 收藏品 ----------------------------------------------------
    /** 激活收藏品 */
    static readonly COLLECTIONS_ACTIVE = "COLLECTIONS_ACTIVE";
    /** 限时收藏品过期推送  */
    static readonly COLLECTIONS_PUSH_EXPIRED = "COLLECTIONS_PUSH_EXPIRED";
    /** 升星 */
    static readonly COLLECTIONS_UP_STAR = "COLLECTIONS_UP_STAR";
    /** 升级 */
    static readonly COLLECTIONS_UP_LV = "COLLECTIONS_UP_LV";
    /** 新手教程用，显示升级标签 */
    static readonly GUIDE_COLLECTION_SHOW_UP_LV_TAB = "GUIDE_COLLECTION_SHOW_UP_LV_TAB";
    /** 激活套装 */
    static readonly COLLECTIONS_ACTIVE_SET = "COLLECTIONS_ACTIVE_SET";
    /** 给战斗用 刷新当前收藏品跟套装技能
     * （切换上阵收藏品也需要发送这个消息）
     * ===
     */
    static readonly COLLECTIONS_EQUIP_COLL_CHG = "COLLECTIONS_EQUIP_COLL_CHG";

    /** 套装激活弹窗关闭 */
    static readonly COLLECTIONS_SET_ACTIVE_WIN_CLOSE = "COLLECTIONS_SET_ACTIVE_WIN_CLOSE";
    /** 收藏品招募结果 */
    static readonly COLLECTIONS_DRAW_CARD = "COLLECTIONS_DRAW_CARD";
    /** 收藏品招募信息 */
    static readonly COLLECTIONS_CARD_INFO = "COLLECTIONS_CARD_INFO";
    // ------------------------------------------ 聊天皮肤 ----------------------------------------------------

    /**
     * 聊天皮肤关闭设置界面
     * null
     * */
    static readonly CHAT_SKIN_CLOSE_SETTING_VIEW = "CHAT_SKIN_CLOSE_SETTING_VIEW";

    // ------------------------------------------ 七日任务 ----------------------------------------------------

    /**
     * 七日任务 | 玄天
     * {@link number}
     * */
    static readonly SEVEN_DAY_TASK_CHOOSE_DAY = "SEVEN_DAY_TASK_CHOOSE_DAY";

    /**
     * 七日任务 | update
     * {@link number}
     * */
    static readonly SEVEN_DAY_TASK_UPDATE = "SEVEN_DAY_TASK_UPDATE";

    // ------------------------------------------ 星际工厂 ----------------------------------------------------
    /**我的工厂信息更新 包含所有信息*/
    static readonly FACTORY_UPDATE_INFO = "FACTORY_UPDATE_INFO";
    /**生产线信息更新*/
    static readonly FACTORY_PRODUCT_LINE_UPDATE = "FACTORY_PRODUCT_LINE_UPDATE";
    /**其他玩家信息更新*/
    static readonly FACTORY_VISIT_UPDATE = "FACTORY_VISIT_UPDATE";
    /**体力更新*/
    static readonly FACTORY_POWER_UPDATE = "FACTORY_POWER_UPDATE";
    /**购买体力完成*/
    static readonly FACTORY_BUY_POWER_COMPLETE = "FACTORY_BUY_POWER_COMPLETE";
    /**战报更新*/
    static readonly FACTORY_RECORD_UPDATE = "FACTORY_RECORD_UPDATE";
    /**战报已读*/
    static readonly FACTORY_RECORD_READ = "FACTORY_RECORD_READ";
    /**战报删除*/
    static readonly FACTORY_RECORD_DEL = "FACTORY_RECORD_DEL";
    /**好友列表更新*/
    static readonly FACTORY_FRIEND_UPDATE = "FACTORY_FRIEND_UPDATE";
    /**排行榜更新*/
    static readonly FACTORY_RANK_UPDATE = "FACTORY_RANK_UPDATE";
    /**最大占领数量变更*/
    static readonly FACTORY_MAX_OCCUPY_COUNT_CHANGE = "FACTORY_MAX_OCCUPY_COUNT_CHANGE";
    /**占领完成(未战斗)*/
    static readonly FACTORY_OCCUPY_COMPLETE = "FACTORY_OCCUPY_COMPLETE";
    /**占领状态变更推送*/
    static readonly FACTORY_OCCUPY_PUSH = "FACTORY_OCCUPY_PUSH";

    // ------------------------------------------ 达标活动 ----------------------------------------------------
    /**达标活动数据更新*/
    /** 达标活动任务更新 */
    static readonly REACH_ACTIVITY_TASK_UPDATE = "REACH_ACTIVITY_TASK_UPDATE";

    // ------------------------------------------ 英雄供给 ----------------------------------------------------

    /** 英雄供给/更新 */
    static readonly HERO_SUPPLY_UPDATE = "HERO_SUPPLY_UPDATE";

    // ------------------------------------------ 星灵礼包 ----------------------------------------------------

    /**
     * 星灵礼包点击
     * {@link number}
     * */
    static readonly PET_GIFT_CHOOSE_DAY = "PET_GIFT_CHOOSE_DAY";

    // ------------------------------------------ 联盟砍价 ----------------------------------------------------

    /**
     * 联盟砍价
     * {@link } null
     * */
    static readonly LEAGUE_BARGAIN_UPDATE = "LEAGUE_BARGAIN_UPDATE";
    /**
     * 联盟砍价
     * {@link number} 砍掉的价格
     * */
    static readonly LEAGUE_BARGAIN_NEW = "LEAGUE_BARGAIN_NEW";

    /**
     * 联盟砍价 结束了
     */
    static readonly LEAGUE_BARGAIN_CLOSE = "LEAGUE_BARGAIN_CLOSE";

    // ------------------------------------------ 功能预告 ----------------------------------------------------
    /** 数据刷新 */
    static readonly FUNCTION_NOTICE_UPDATE = "FUNCTION_NOTICE_UPDATE";
    // ------------------------------------------ 模拟经营 ----------------------------------------------------

    /**设备信息变化 参数为设备id 0代表全部 */
    static readonly STIMULATION_DEVICE_UPDATE = "STIMULATION_DEVICE_UPDATE";
    /**领取奖励完成 @see IStimulationRewards */
    static readonly STIMULATION_DRAW_REWARD_COMPLETE = "STIMULATION_DRAW_REWARD_COMPLETE";
    /** 派遣完成*/
    static readonly STIMULATION_DISPATCH_COMPLETE = "STIMULATION_DISPATCH_COMPLETE";
    /** 升级完成*/
    static readonly STIMULATION_UP_LEVEL_COMPLETE = "STIMULATION_UP_LEVEL_COMPLETE";
    /** 回收完成*/
    static readonly STIMULATION_RECYCLE_COMPLETE = "STIMULATION_RECYCLE_COMPLETE";

    // ------------------------------------------ 模拟经营 ----------------------------------------------------

    /**视频缩放比例变化 */
    static readonly VIDEO_SCALE_CHANGE = "VIDEO_SCALE_CHANGE";

    // ------------------------------------------ 任务 ----------------------------------------------------

    /**
     * 任务进度变化
     */
    static readonly TASK_PROGRESS_CHANGE = "TASK_PROGRESS_CHANGE";

    // ------------------------------------------ 双周活动 ----------------------------------------------------
    /**双周活动任务数据更新*/
    static readonly DOUBLE_WEEK_TASK_UPDATE = "DOUBLE_WEEK_TASK_UPDATE";

    // ------------------------------------------ 组队副本 ----------------------------------------------------
    /**
     * 组队大厅数据刷新,自己申请的列表
     */
    static readonly EVENT_MALL_TEAM_CHANGE = "EVENT_MALL_TEAM_CHANGE";
    /**
     * 组队管理切换
     */
    static readonly EVENT_TEAM_MGR_VIEW_CHANGE = "EVENT_TEAM_MGR_VIEW_CHANGE";
    /**
     * 成员数据改变更新
     */
    static readonly EVENT_TEAM_MEMBER_CHANGE = "EVENT_TEAM_MEMBER_CHANGE";
    /**
     * 队长变更
     */
    static readonly EVENT_TEAM_LEADER_CHANGE = "EVENT_TEAM_LEADER_CHANGE";
    /**
     * 申请列表数据刷新,别人申请的列表
     */
    static readonly EVENT_TEAM_APPLYLIST_CHANGE = "EVENT_TEAM_APPLYLIST_CHANGE";
    /**
     * 组队邀请界面分页切换
     */
    static readonly EVENT_TEAM_INVITE_PAGE_CHANGE = "EVENT_TEAM_INVITE_PAGE_CHANGE";
    /**
     * 组队副本布阵信息刷新
     */
    static readonly EVENT_TEAM_TEAM_INFO_CHANGE = "EVENT_TEAM_TEAM_INFO_CHANGE";
    /**
     * 创建队伍成功
     */
    static readonly EVENT_TEAM_CREATE_SUCCESS = "EVENT_TEAM_CREATE_SUCCESS";

    /**
     * 队伍基本信息刷新
     */
    static readonly EVENT_TEAM_BASEINFO_UPDATE = "EVENT_TEAM_BASEINFO_UPDATE";
    /**
     *邀请玩家列表更新
     */
    static readonly EVENT_TEAM_INVITE_LIST_UPDATE = "EVENT_TEAM_INVITE_LIST_UPDATE";
    /**
     * 章节奖励领取
     */
    static readonly EVENT_TEAM_CHAPTER_REWARD_UPDATE = "EVENT_TEAM_CHAPTER_REWARD_UPDATE";
    /**
     * 退出队伍
     */
    static readonly EVENT_TEAM_LEFT_UPDATE = "EVENT_TEAM_LEFT_UPDATE";
    /**
     * 入队推送（自己）
     */
    static readonly EVENT_TEAM_JOIN = "EVENT_TEAM_JOIN";
    /**
     * 入队推送（其他成员）
     */
    static readonly EVENT_MEMBER_JOIN = "EVENT_MEMBER_JOIN";
    /**
     * 关卡刷新
     */
    static readonly EVENT_TEAM_STAGE_UPDATE = "EVENT_TEAM_STAGE_UPDATE";
    /**
     * 分享成功
     */
    static readonly EVENT_TEAM_SHARE_SUCESS = "EVENT_TEAM_SHARE_SUCESS";
    /**
     * 一键分享
     */
    static readonly EVENT_TEAM_SHARE_ALL_SUCESS = "EVENT_TEAM_SHARE_ALL_SUCESS";
    /**
     * 申请成功推送
     */
    static readonly EVENT_TEAM_APPLY_SUCESS = "EVENT_TEAM_APPLY_SUCESS";
    /**
     * 开放队员挑战权限
     */
    static readonly EVENT_TEAM_PERMISSION_CHANGE = "EVENT_TEAM_PERMISSION_CHANGE";
    /**
     * 组队战斗状态改变
     */
    static readonly EVENT_TEAM_BATTLE_STATE = "EVENT_TEAM_BATTLE_STATE";
    // ------------------------------------------ 资源勘探 ----------------------------------------------------
    /**小地图item状态改变 展开或者关闭*/
    static readonly LEAGUE_EXPLORE_MINI_ITEM_CHANGE = "LEAGUE_EXPLORE_MINI_ITEM_CHANGE";
    /**分享频道勾选*/
    static readonly LEAGUE_EXPLORE_SHARE_SELECT = "LEAGUE_EXPLORE_SHARE_SELECT";
    /**分享频道勾选取消*/
    static readonly LEAGUE_EXPLORE_SHARE_SELECT_CANCEL = "LEAGUE_EXPLORE_SHARE_SELECT_CANCEL";
    /**勘探活动时间变化*/
    static readonly LEAGUE_EXPLORE_TIME_CHANGE = "LEAGUE_EXPLORE_TIME_CHANGE";
    /**勘探我的信息变化*/
    static readonly LEAGUE_EXPLORE_MY_INFO_CHANGE = "LEAGUE_EXPLORE_MY_INFO_CHANGE";
    /**星球信息变化*/
    static readonly LEAGUE_EXPLORE_STAR_INFO_CHANGE = "LEAGUE_EXPLORE_STAR_INFO_CHANGE";
    /**建筑信息变化(整个星球)*/
    static readonly LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR = "LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR";
    /**建筑信息变化*/
    static readonly LEAGUE_EXPLORE_BUILDING_INFO_CHANGE = "LEAGUE_EXPLORE_BUILDING_INFO_CHANGE";
    /**我的日志更新*/
    static readonly LEAGUE_EXPLORE_MY_RECORD_CHANGE = "LEAGUE_EXPLORE_MY_RECORD_CHANGE";
    /**联盟日志更新*/
    static readonly LEAGUE_EXPLORE_LEAGUE_RECORD_CHANGE = "LEAGUE_EXPLORE_LEAGUE_RECORD_CHANGE";
    /**分享完成*/
    static readonly LEAGUE_EXPLORE_SHARE_COMPLETE = "LEAGUE_EXPLORE_SHARE_COMPLETE";
    /**踢出星球*/
    static readonly LEAGUE_EXPLORE_KICKED_OUT_STAR = "LEAGUE_EXPLORE_KICKED_OUT_STAR";
    /**购买进攻次数完成*/
    static readonly LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE = "LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE";

    // ------------------------------------------ 活动翻牌 ----------------------------------------------------

    /**
     * 翻牌
     */
    static readonly FLIP_CARD_NEW = "FLIP_CARD_NEW";

    /**
     * 翻牌获得
     */
    static readonly FLIP_CARD_GAIN = "FLIP_CARD_GAIN";
    /**
     * 翻牌设大奖
     */
    static readonly FLIP_CARD_CHOOSE_BIG_REWARD = "FLIP_CARD_GAIN";
    /**
     * 翻牌下一轮
     */
    static readonly FLIP_CARD_NEXT_ROUND = "FLIP_CARD_NEXT_ROUND";

    /** 刷新奖励列表 */
    static readonly FLIP_CARD_REWARD_LIST_UPDATE = "FLIP_CARD_REWARD_LIST_UPDATE";

    // ------------------------------------------ 赛季活动 ----------------------------------------------------
    /**积分类型切换 */
    static readonly SEASON_SCORE_TYPE_CHANGE = "SEASON_SCORE_TYPE_CHANGE";
    /**排行榜数据更新 */
    static readonly SEASON_RANK_UPDATE = "SEASON_RANK_UPDATE";
    /**赛季活动状态变化 */
    static readonly SEASON_ACTIVITY_NEWSTATE = "SEASON_ACTIVITY_NEWSTATE";
    /**秘境关卡选中 */
    static readonly SEASON_SECRET_SELECT = "SEASON_SECRET_SELECT";
    /**秘境信息刷新 */
    static readonly SEASON_SECRET_UPDATE = "SEASON_SECRET_UPDATE";
    /**秘境挑战次数刷新 */
    static readonly SEASON_SECRET_TIMES_UPDATE = "SEASON_SECRET_TIMES_UPDATE";
    /**赛季活动报名更新*/
    static readonly SEASON_SIGNUP_UPDATE = "SEASON_SIGNUP_UPDATE";
    /**竞技类型切换 */
    static readonly SEASON_COMPETITION_TYPE_CHANGE = "SEASON_COMPETITION_TYPE_CHANGE";
    /**关闭菜单主界面 */
    static readonly SEASON_MENU_VIEW_CLOSE = "SEASON_MENU_VIEW_CLOSE";
    /**冲榜活动任务更新 */
    static readonly SEASON_TASK_UPDATE = "SEASON_TASK_UPDATE";
    /**BOSS战更新 */
    static readonly SEASON_BOSS_UPDATE = "SEASON_BOSS_UPDATE";

    static readonly SECRET_SEASON_AREA_UPDATE_BOSS = "SECRET_SEASON_AREA_UPDATE_BOSS";

    // ------------------------------------------ 次元裂缝(宠物副本) ----------------------------------------------------
    /**次元裂缝活动时间变化*/
    static readonly PET_DUNGEON_TIME_CHANGE = "PET_DUNGEON_TIME_CHANGE";
    /**次元裂缝我的信息变化*/
    static readonly PET_DUNGEON_INFO_CHANGE = "PET_DUNGEON_INFO_CHANGE";
    /**次元裂缝选择英雄变更*/
    static readonly PET_DUNGEON_SELECT_HERO_CHANGE = "PET_DUNGEON_SELECT_HERO_CHANGE";
    /**次元裂缝关卡变更*/
    static readonly PET_DUNGEON_FLOOR_CHANGE = "PET_DUNGEON_FLOOR_CHANGE";
    /**次元裂缝重置完成*/
    static readonly PET_DUNGEON_RESET_COMPLETE = "PET_DUNGEON_RESET_COMPLETE";
    /**次元裂缝扫荡完成*/
    static readonly PET_DUNGEON_SWEEP_COMPLETE = "PET_DUNGEON_SWEEP_COMPLETE";
    /**次元裂缝拖动玩具开始*/
    static readonly PET_DUNGEON_DRAG_TOY_STAR = "PET_DUNGEON_DRAG_TOY_STAR";
    /**次元裂缝拖动玩具结束*/
    static readonly PET_DUNGEON_DRAG_TOY_END = "PET_DUNGEON_DRAG_TOY_END";
    /**次元裂缝玩具更新*/
    static readonly PET_DUNGEON_TOY_UPDATE = "PET_DUNGEON_TOY_UPDATE";
    /**次元裂缝玩具返回仓库*/
    static readonly PET_DUNGEON_TOY_BACK_TO_BOX = "PET_DUNGEON_TOY_BACK_TO_BOX";

    // ------------------------------------------ 收藏品副本 ----------------------------------------------------
    /**收藏品副本信息变化*/
    static readonly COLLECTIBLES_DUNGEON_INFO_CHANGE = "COLLECTIBLES_DUNGEON_INFO_CHANGE";
    /**收藏品副本扫荡完成*/
    static readonly COLLECTIBLES_DUNGEON_SWEEP_COMPLETE = "COLLECTIBLES_DUNGEON_SWEEP_COMPLETE";
    /**收藏品副本章节选择*/
    static readonly COLLECTIBLES_DUNGEON_SELECT_CHAPTER = "COLLECTIBLES_DUNGEON_SELECT_CHAPTER";
    /**收藏品副本显示章节星级奖励*/
    static readonly COLLECTIBLES_DUNGEON_SHOW_CHAPTER_REWARD = "COLLECTIBLES_DUNGEON_SHOW_CHAPTER_REWARD";
    /**挑战开始*/
    static readonly COLLECTIBLES_DUNGEON_CHALLENGE_START = "COLLECTIBLES_DUNGEON_CHALLENGE_START";
    /**收藏品副本信息更新通过gm*/
    static readonly COLLECTIBLES_DUNGEON_UPDATE_FROM_GM = "COLLECTIBLES_DUNGEON_UPDATE_FROM_GM";

    // ------------------------------------------ 抽奖组活动3 （召唤英雄） ----------------------------------------------------
    /**抽奖组活动3 新获得大奖对话*/
    static readonly LOTTERY_GROUP_NEW_BIG_REWARD = "LOTTERY_GROUP_NEW_BIG_REWARD";

    // ------------------------------------------ 自动弹框 ----------------------------------------------------
    /**自动弹窗数据改变*/
    static readonly AUTO_POP_CHANGE = "AUTO_POP_CHANGE";

    // ------------------------------------------ 跨服相关 ----------------------------------------------------
    /**跨服状态更新*/
    static readonly CROSS_SERVER_STATE_UPDATE = "CROSS_SERVER_STATE_UPDATE";
    /**跨服页签切换 */
    static readonly CROSS_SERVER_PAGE_UPDATE = "CROSS_SERVER_PAGE_UPDATE";
}
