declare module table.activity.ActivityConstant{
	class ActivityAutoPopConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *活动id
		 */
		public activityId:number;
		/**
		 *弹出条件(内置默认条件 活动开启)
		 */
		public conditions:Array<any>;
		/**
		 *弹出时机
		 */
		public popEvent:string;
		/**
		 *弹出时机参数
		 */
		public popEventParam:string;
		/**
		 *弹出UI 如果没有配置就按照活动idjump
		 */
		public popUpView:string;
		/**
		 *自动弹出UI 参数
		 */
		public popUpParam:string;
		/**
		 *活动banner
		 */
		public banner:string;
		/**
		 *活动奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *活动标题
		 */
		public title:string;
		/**
		 *活动气泡
		 */
		public bubbleTip:string;
		/**
		 *banner是否显示活动剩余时间
		 */
		public showEndTime:boolean;
		/**
		 *banner是否可选择今日不在提示
		 */
		public canPopOnceToday:boolean;
		/**
		 *是否不可跳转
		 */
		public noJump:boolean;
		/**
		 *自动关闭时间(秒)
		 */
		public autoCloseTime:number;
		/**
		 *优先级
		 */
		public sort:number;
	}
	class ActivityClientConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *按钮类型
		 */
		public type:string;
		/**
		 *类型参数（特别注意这里不能重复）
		 */
		public typeParam:number;
		/**
		 *父入口
		 */
		public parentId:number;
		/**
		 *活动界面
		 */
		public UIView:string;
		/**
		 *按钮排序
		 */
		public order:number;
		/**
		 *客户端的子类型
		 */
		public clientUIType:string;
		/**
		 *显示条件
新增条件,需要改动代码的,新增需要和前端说
PLAYER_LEVEL_GE,0,1; = 玩家>1级
ps:未达到则不显示
		 */
		public conditionText:Array<any>;
		/**
		 *按钮名字
		 */
		public name:string;
		/**
		 *正常按钮图标
		 */
		public upIcon:string;
		/**
		 *选中按钮图标
		 */
		public downIcon:string;
		/**
		 *滚动窗口图片
		 */
		public rollIcon:string;
		/**
		 *头顶道具id
		 */
		public headerItemId:number;
		/**
		 *规则id
		 */
		public ruleId:number;
	}
	class ActivityConfig {
		/**
		 *活动id
		 */
		public id:number;
		/**
		 *活动类型                                                                                                                                                                                                       
		 */
		public type:string;
		/**
		 *玩家参与开启条件
		 */
		public openConditions:Array<any>;
		/**
		 *是否结束了不显示
		 */
		public isEndNotShow:boolean;
		/**
		 *活动名称
		 */
		public name:string;
		/**
		 *开启类型：
		 */
		public startType:string;
		/**
		 *基准时间，当startType==2时，用来比较开服时间，
格式：yyyy-MM-dd HH:mm:ss
		 */
		public baseDateStr:string;
		/**
		 *开服天数-1
		 */
		public openServerDay:number;
		/**
		 *开始时间点类型
		 */
		public startTimeType:string;
		/**
		 *开始时间点
		 */
		public startTimeContent:string;
		/**
		 *结束时间点类型，结束后活动关闭
		 */
		public endTimeType:string;
		/**
		 *结束时间点，结束后活动关闭
		 */
		public endTimeContent:string;
		/**
		 *活动限制：最早开服天数 格式：yyyy-MM-dd HH:mm:ss
		 */
		public minOpenServerDate:string;
		/**
		 *活动限制：最晚开服天数 格式：yyyy-MM-dd HH:mm:ss
		 */
		public maxOpenServerDate:string;
	}
	class ActivityConstantConfig {
		/**
		 *标识
		 */
		public id:string;
		/**
		 *配置值
		 */
		public content:string;
	}
}
declare module table.activity.BattlePass{
	class BattlePassConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *一般通行证充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		/**
		 *经验道具Id，需为积分类型，不同通行证需更换
		 */
		public expItemId:number;
		/**
		 *超级通行证充值Id，即ChargeGoodsConfig的Id
		 */
		public superChargeGoodsId:string;
		/**
		 *差价充值Id，即ChargeGoodsConfig的Id
		 */
		public replaceChargeGoodsId:string;
		/**
		 *超级通行证额外奖励
		 */
		public superRewards:Array<{k:any,v:any}>;
		/**
		 *超级通行证奖励经验
		 */
		public superBattlePassExp:number;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *入口背景图片
		 */
		public iconPath:string;
		/**
		 *入口通行证名字
		 */
		public passName:string;
		/**
		 *基础通行证购买描述
		 */
		public baseDesc:Array<any>;
		/**
		 *豪华通行证购买描述
		 */
		public luxuryDesc:Array<any>;
	}
	class BattlePassRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *等级
		 */
		public level:number;
		/**
		 *升到当前等级所需通行证经验
		 */
		public battlePassExp:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *付费奖励
		 */
		public chargeRewards:Array<{k:any,v:any}>;
		/**
		 *是否是大奖
		 */
		public isBigAward:boolean;
		/**
		 *通行证Id，即BattlePassConfig的Id
		 */
		public battlePassId:number;
	}
	class BattlePassTaskConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *任务描述
		 */
		public taskDesc:string;
		/**
		 *总进度
		 */
		public totalProgress:number;
		/**
		 *奖励通行证经验值
		 */
		public battlePassExp:number;
		/**
		 *通行证任务重置类型，参考"类型说明.md"文件的"BattlePassTaskResetType"
		 */
		public resetType:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *通行证Id，即BattlePassConfig的Id
		 */
		public battlePassId:number;
	}
}
declare module table.activity.BlackShop{
	class BlackShopConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *活动名称
		 */
		public name:string;
		/**
		 *活动背景
		 */
		public bgPath:string;
		/**
		 *跳转图片
		 */
		public jumpBtnImagePath:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *提示id
		 */
		public tipsId:number;
		/**
		 *显示道具id
		 */
		public itemId:number;
		/**
		 *描述文字
		 */
		public desc1:string;
		/**
		 *描述文字
		 */
		public desc2:string;
	}
}
declare module table.activity.CareerRecruit{
	class CareerRecruitConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *职业
		 */
		public career:string;
		/**
		 *招募id
		 */
		public recruitId:number;
		/**
		 *展示英雄ids
		 */
		public showHeroIds:Array<any>;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
}
declare module table.activity.CareerTrial{
	class CareerTrialConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *职业
		 */
		public career:string;
		/**
		 *核心英雄
		 */
		public coreHeroIds:Array<any>;
		/**
		 *展示英雄
		 */
		public showHeros:Array<any>;
		/**
		 *演示关卡，即TrialConfig的Id
		 */
		public showFightId:number;
		/**
		 *试玩奖励
		 */
		public trialRewards:Array<{k:any,v:any}>;
		/**
		 *阵容名称
		 */
		public formationName:string;
		/**
		 *队伍描述
		 */
		public desc:string;
		/**
		 *通行证Id，即BattlePassConfig的Id
		 */
		public battlePassId:number;
		/**
		 *基金Id，即FundConfig的Id
		 */
		public fundId:number;
		/**
		 *基金显示英雄
		 */
		public fundShowHeroId:Array<any>;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *基金角色图
		 */
		public showHeroIcon:string;
		/**
		 *推荐阵容核心说明
		 */
		public coreDesc:string;
		/**
		 *通行证标题
		 */
		public passTitle:string;
	}
}
declare module table.activity.Carnival{
	class CarnivalConfig {
		/**
		 *唯一Id，即活动Id
		 */
		public id:number;
		/**
		 *积分道具Id，需为积分类型，注：不同活动需替换
		 */
		public scoreItemId:number;
	}
	class CarnivalRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *起始积分
		 */
		public scoreStart:number;
		/**
		 *所需积分数
		 */
		public scoreEnd:number;
		/**
		 *奖励列表
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
}
declare module table.activity.DiamondBank{
	class DiamondBankConfig {
		/**
		 *唯一Id，即活动Id
		 */
		public id:number;
		/**
		 *星钻数，每分钟积累
		 */
		public diamondNum:number;
		/**
		 *最大星钻数
		 */
		public maxDiamondNum:number;
		/**
		 *解锁条件
		 */
		public conditions:Array<any>;
		/**
		 *提前解锁充值Id
		 */
		public chargeGoodsId:number;
	}
}
declare module table.activity.DoubleWeekly{
	class DoubleWeeklyConfig {
		/**
		 *唯一id，即活动id
		 */
		public id:number;
		/**
		 *背景图片
		 */
		public icon:string;
		/**
		 *活动标题
		 */
		public title:string;
		/**
		 *跳转图片
		 */
		public jumpIcon:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *显示道具id
		 */
		public itemid:number;
		/**
		 *规则id
		 */
		public ruleId:number;
	}
}
declare module table.activity.FirstCharge{
	class FirstChargeConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *充值商品Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		/**
		 *登录X天可领取
		 */
		public day:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *特效
		 */
		public effects:any;
		/**
		 *展示英雄id
		 */
		public heroId:number;
		/**
		 *道具id(优先级比英雄id高)
		 */
		public itemId:number;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *超值折扣
		 */
		public discount:string;
		/**
		 *未购买按钮气泡提示
		 */
		public bubbleTip:string;
		/**
		 *展示spine动画
		 */
		public spine:string;
		/**
		 *spine动画参数
		 */
		public spineOrders:string;
		/**
		 *展示spine缩放值
		 */
		public spineScale:number;
		/**
		 *位置偏移量
		 */
		public spinePosOffset:Array<any>;
		/**
		 *展示视频id(参考 VideoConfig表)
		 */
		public videoId:number;
		/**
		 *展示视频背景(视频未加载完成时使用)
		 */
		public videoBg:string;
	}
}
declare module table.activity.Fund{
	class FundConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		public desc:string;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *入口背景图片
		 */
		public iconPath:string;
		/**
		 *入口通行证名字
		 */
		public passName:string;
		/**
		 *入口内图片
		 */
		public iconPath2:string;
		/**
		 *入口内背景图片
		 */
		public iconPath3:string;
		/**
		 *入口内提示
		 */
		public tips:string;
		/**
		 *提示字体颜色和描边颜色
		 */
		public colors:Array<any>;
		/**
		 *折扣
		 */
		public discount:number;
		/**
		 *规则详情id
		 */
		public ruleId:number;
	}
	class FundTaskConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *基金Id，即FundConfig的Id
		 */
		public fundId:number;
		/**
		 *事件类型
		 */
		public eventType:string;
		/**
		 *任务进度
		 */
		public totalProgress:string;
		/**
		 *免费奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *付费奖励
		 */
		public chargeRewards:Array<{k:any,v:any}>;
		/**
		 *付费购买上限
		 */
		public chargeGoodsLimit:number;
		/**
		 *充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		/**
		 *任务目标文本
		 */
		public desc:string;
	}
}
declare module table.activity.GirlGroup{
	class GirlGroupConfig {
		/**
		 *唯一Id，即活动Id
		 */
		public id:number;
		/**
		 *每日奖励
		 */
		public dailyRewards:any;
	}
	class GirlGroupConstantConfig {
		/**
		 *标识
		 */
		public id:string;
		/**
		 *配置值
		 */
		public content:string;
	}
	class GirlGroupGoodsConditionConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *活动第X天开放
		 */
		public openDay:number;
		/**
		 *开放条件
		 */
		public conditions:Array<any>;
		/**
		 *提前开放条件
		 */
		public earlyConditions:Array<any>;
		/**
		 *提前开放提示
		 */
		public earlyTips:string;
		/**
		 *飘字提示
		 */
		public tips:string;
		/**
		 *礼包上的提示
		 */
		public goodsTips:string;
		/**
		 *跳转弹窗文字
		 */
		public jumpTips:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
	}
	class GirlGroupGoodsConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *充值Id，对应 ChargeGoodsConfig 的 Id
		 */
		public chargeGoodsId:string;
		/**
		 *条件Id，即GirlGroupGoodsConditionConfig的Id
		 */
		public conditionId:number;
		/**
		 *折扣
		 */
		public discount:number;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
	class GirlGroupModelConfig {
		public id:number;
		/**
		 *模型id
		 */
		public modelId:number;
		/**
		 *默认动作
		 */
		public normalAnimName:string;
		/**
		 *专属动作
		 */
		public exclusiveAnimName:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *对话
		 */
		public dialogs:Array<any>;
		/**
		 *活动id
		 */
		public activityId:number;
	}
	class GirlGroupRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *购买礼包总数限制
		 */
		public buyGoodsNumLimit:number;
		/**
		 *礼包名称
		 */
		public name:string;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *是否需要购买任一礼包
		 */
		public needBuyAnyGoods:boolean;
		/**
		 *是否全服奖励
		 */
		public isAllRewards:boolean;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
	class GirlGroupTextConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *文案
		 */
		public text:string;
		/**
		 *对话类型
		 */
		public type:number;
		/**
		 *活动id
		 */
		public activityId:number;
	}
}
declare module table.activity.HeroSupply{
	class HeroSupplyConfig {
		/**
		 *唯一Id，即ActivityConfig的Id
		 */
		public id:number;
		/**
		 *补给充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeId:string;
	}
	class HeroSupplyRewardConfig {
		/**
		 *奖励id
		 */
		public id:number;
		/**
		 *开服第X天开放
		 */
		public openDay:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
}
declare module table.activity.Lottery{
	class LotteryConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *开始层
		 */
		public startRound:number;
		/**
		 *结束层
		 */
		public endRound:number;
		/**
		 *保底次数
		 */
		public guaranteeTimes:number;
		/**
		 *自由选择的大奖列表
		 */
		public bigRewardArray:Array<{k:any,v:any}>;
		/**
		 *预选的大奖顺序|0,1,2,3...
		 */
		public defaultBigAwardIndex:number;
		/**
		 *奖池Id，即LotteryPoolConfig的poolId
		 */
		public poolId:number;
		/**
		 *边长 | 只支持 2~6
		 */
		public oneLineGridCount:number;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
	class LotteryNormalConfig {
		/**
		 *唯一Id，即活动Id
		 */
		public id:number;
		/**
		 *大奖描述文本
		 */
		public awardDesc:string;
		/**
		 *模型
		 */
		public modelId:number;
		/**
		 *抽奖获得积分道具Id
		 */
		public scoreItemId:number;
		/**
		 *抽奖消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *选择大奖上限列表，-1表示无上限
		 */
		public jackpotLimits:Array<any>;
		/**
		 *图片路径
		 */
		public iconPath:string;
	}
	class LotteryPoolConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *奖池Id
		 */
		public poolId:number;
		/**
		 *一个格子的奖励(大奖牌是空的)
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *奖励类型，参考"类型说明.md"的LotteryRewardType
		 */
		public rewardType:string;
		/**
		 *奖励数量
		 */
		public amount:number;
		/**
		 *轮盘抽奖排序
		 */
		public rouletteSort:number;
		/**
		 *权重
		 */
		public weight:number;
	}
}
declare module table.activity.Mall{
	class ActivityMallCostRewardConfig {
		/**
		 *唯一Id，即ActivityMallGoodsConfig的Id
		 */
		public id:number;
		/**
		 *消耗，不填表示免费
		 */
		public costs:Array<{k:any,v:any}>;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *奖励名称
		 */
		public name:string;
	}
	class ActivityMallGoodsConfig {
		/**
		 *商品Id
		 */
		public id:number;
		/**
		 *商品充值Id，不填表示免费
		 */
		public chargeGoodsId:string;
		/**
		 *商品购买条件
		 */
		public buyConditions:Array<any>;
		/**
		 *商品限购类型
		 */
		public limitBuyType:string;
		/**
		 *限购次数
		 */
		public buyLimit:number;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *折扣百分比(仅前端展示用)
		 */
		public discountShow:number;
		/**
		 *角标提示
		 */
		public markTip:string;
		/**
		 *商品品质配置(目前只是开服特惠背景使用)
		 */
		public quality:number;
		/**
		 *排序
		 */
		public sort:number;
	}
}
declare module table.activity.PetGift{
	class PetGiftConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *活动第X天开放
		 */
		public openDay:number;
		/**
		 *当前档位前端显示“开服X天可购买”
		 */
		public severDay:number;
		/**
		 *充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		/**
		 *购买数量上限，不填表示无限制
		 */
		public buyNumLimit:number;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *星级
		 */
		public stars:number;
		/**
		 *模型显示id
		 */
		public showModelId:number;
		/**
		 *星星资源配置
		 */
		public starIcon:string;
		/**
		 *展示道具id
		 */
		public showItemId:number;
	}
	class PetGiftTalkConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *显示对话
		 */
		public content:string;
	}
}
declare module table.activity.ReachStandard{
	class ReachStandardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *活动名称
		 */
		public name:string;
		/**
		 *活动背景
		 */
		public bgPath:string;
		/**
		 *跳转图片
		 */
		public jumpIcon:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *任务轮次ids
		 */
		public roundTaskIds:Array<any>;
		/**
		 *提示id
		 */
		public tipsId:number;
		/**
		 *显示道具id
		 */
		public itemId:number;
		/**
		 *积分id
		 */
		public scoreId:number;
	}
}
declare module table.activity.Recruit{
	class ActivityRecruitConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *招募获得积分道具Id
		 */
		public scoreItemId:number;
		/**
		 *招募获得积分数量
		 */
		public scoreItemNum:number;
		/**
		 *招募消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *大奖上限信息，不填表示无限制，格式：6030:1;4230:2
		 */
		public jackpotLimitInfo:Array<{k:any,v:any}>;
		/**
		 *试玩Id，即TrialConfig的Id
		 */
		public trialId:number;
		/**
		 *试玩奖励
		 */
		public trialRewards:Array<{k:any,v:any}>;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
	class ActivityRecruitRoundConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *开始层
		 */
		public startRound:number;
		/**
		 *结束层
		 */
		public endRound:number;
		/**
		 *可选大奖Id列表
		 */
		public jackpots:Array<any>;
		/**
		 *大奖对应二等奖列表
		 */
		public seconds:Array<any>;
		/**
		 *预选大奖id
		 */
		public jackpotId:number;
		/**
		 *预选二等奖id
		 */
		public secondId:number;
		/**
		 *奖励预览
		 */
		public awardArray:Array<{k:any,v:any}>;
		/**
		 *奖励概率
		 */
		public probability:Array<any>;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
}
declare module table.activity.RushRank{
	class RushRankConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *冲榜类型
		 */
		public type:string;
		/**
		 *最低上榜条件列表，需与结算时间列表一致
		 */
		public limits:Array<any>;
		/**
		 *结算时间列表，距活动开始后X小时结算
		 */
		public roundSettleHours:Array<any>;
		/**
		 *冲榜名称
		 */
		public title:string;
		/**
		 *冲榜描述
		 */
		public titleDesc:string;
		/**
		 *是否显示全服首通按钮
		 */
		public isShowBtn:boolean;
		/**
		 *规则id
		 */
		public ruleId:number;
		/**
		 *未上榜描述
		 */
		public noRankDesc:string;
		/**
		 *上榜描述
		 */
		public rankDesc:string;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
	class RushRankFirstPassLadderConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *职业
		 */
		public career:string;
		/**
		 *序列校验配置Id
		 */
		public ladderId:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *任务描述
		 */
		public desc:string;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
	class RushRankFirstPassTrunkInstanceConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *关卡Id
		 */
		public instanceId:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *任务描述
		 */
		public desc:string;
		/**
		 *活动Id
		 */
		public activityId:number;
	}
	class RushRankHeroRecruitScoreConfig {
		/**
		 *唯一Id，即RushRankConfig的Id
		 */
		public id:number;
		/**
		 *招募积分道具Id，需为积分类型，不同活动需替换
		 */
		public scoreItemId:number;
		/**
		 *普通招募获得积分数
		 */
		public normalScoreNum:number;
		/**
		 *高级招募获得积分数
		 */
		public specialScoreNum:number;
	}
	class RushRankRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *第X轮，从1开始
		 */
		public round:number;
		/**
		 *最低排名
		 */
		public minRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *所属冲榜Id，即RushRankConfig的Id
		 */
		public rushRankId:number;
		/**
		 *开服限定图标
		 */
		public Limit:number;
	}
}
declare module table.activity.Sign{
	class SignConfig {
		/**
		 *唯一Id,即活动id
		 */
		public id:number;
	}
	class SignInClientConfig {
		/**
		 *活动id
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *签到的处理机制
		 */
		public type:string;
	}
	class SignRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *领取天数
		 */
		public condition:number;
		/**
		 *固定奖励
		 */
		public dailyRewards:Array<{k:any,v:any}>;
		/**
		 *随机奖励
		 */
		public totalDropId:number;
		/**
		 *是否是大奖
		 */
		public isBagAward:boolean;
		/**
		 *图片
		 */
		public awardIcon:string;
		/**
		 *描述
		 */
		public awardDesc:string;
		/**
		 *随机奖励描述
		 */
		public desc:string;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
}
declare module table.activity.Task{
	class ActivityTaskConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *是否需要弹出 UI
		 */
		public isNeedTipsUI:boolean;
		/**
		 *任务类型
		 */
		public type:string;
		/**
		 *前置任务标识
		 */
		public preTaskId:number;
		/**
		 *接取任务限制
		 */
		public acceptConditionArray:Array<{k:any,v:any}>;
		/**
		 *初始化任务体内容
		 */
		public content:string;
		/**
		 *总进度
		 */
		public maxProgress:number;
		/**
		 *任务目标文本
		 */
		public desc:string;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *组Id
		 */
		public groupId:number;
		/**
		 *活动Id
		 */
		public activityId:number;
		/**
		 *版本号，仅对需要处理的活动生效
		 */
		public version:number;
		/**
		 *任务类型2
		 */
		public type2:string;
		/**
		 *是否顶部栏显示|大奖励
		 */
		public isShowHead:boolean;
		/**
		 *成长之路的第几阶
		 */
		public growUpStageId:number;
		/**
		 *跳转id | JumpConfig.id
		 */
		public jumpId:number;
	}
}
declare module table.activity.TotalCharge{
	class TotalChargeConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *累计充值金额，单位：分
		 */
		public chargeMoney:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *特效
		 */
		public effects:any;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
}
declare module table.activity.TotalChargeDay{
	class TotalChargeDayConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *累计充值天数
		 */
		public chargeDay:number;
		/**
		 *充值金额
		 */
		public chargeMoney:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *特效
		 */
		public effects:any;
		/**
		 *活动Id，即ActivityConfig的Id
		 */
		public activityId:number;
	}
}
declare module table.activity.WorldBoss{
	class ActivityWorldbossConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *活动ID
		 */
		public active:number;
		/**
		 *对应Bossid
		 */
		public bossId:number;
		/**
		 *对应奖励预览
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *区域解锁提示
		 */
		public areaLock:string;
		/**
		 *活动说明
		 */
		public tips:string;
	}
}
declare module table.activity.growup{
	class GrowUpKvConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *值
		 */
		public value:string;
	}
}
