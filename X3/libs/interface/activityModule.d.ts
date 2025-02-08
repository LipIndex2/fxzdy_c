declare module Vo.activity{
	
	/**
	 * 七日嘉年华信息
	 * @author GameCreator
	 */	
	class CarnivalVo	{
		/**
		 * 初始时间戳
		 */		
		initTime:number;
		
		/**
		 * 任务信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 已领取奖励Id列表
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 获取活动信息
	 * @author GameCreator
	 */	
	class ActivityC2S	{
		activityId:number;
		
	}


	
	/**
	 * 获取活动信息
	 * @author GameCreator
	 */	
	class ActivityS2C	{
		content:Vo.activity.ActivityVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 轮盘抽奖结果信息
	 * @author GameCreator
	 */	
	class RouletteLotteryResultVo	{
		/**
		 * 奖励Id列表
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 额外奖励Id列表
		 */		
		extraRewardIds:Array<number>;
		
		/**
		 * 额外奖励信息列表
		 */		
		extraRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 积分奖励信息列表
		 */		
		scoreRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 是否触发包揽奖励
		 */		
		takeAll:boolean;
		
	}


	
	/**
	 * 活动事务信息
	 * @author GameCreator
	 */	
	class ActivityStuffVo	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 事务key值
		 */		
		key:string;
		
		/**
		 * 事务信息，根据key值决定
		 */		
		stuffVo:Object;
		
	}


	
	/**
	 * 女团购买商品信息
	 * @author GameCreator
	 */	
	class GirlGroupBuyGoodsVo	{
		/**
		 * 总购买数
		 */		
		totalBuyNum:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
		/**
		 * 商品Id
		 */		
		goodsId:number;
		
	}


	
	/**
	 * 女团玩家信息
	 * @author GameCreator
	 */	
	class GirlGroupPlayerVo	{
		/**
		 * 是否已领取每日奖励
		 */		
		gainDailyReward:boolean;
		
		/**
		 * 已购买商品Id列表
		 */		
		goodsIds:Array<number>;
		
		/**
		 * 已领取奖励Id列表
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 召唤英雄信息
	 * @author GameCreator
	 */	
	class CallHeroVo	{
		/**
		 * 当前轮次，从1开始
		 */		
		round:number;
		
		/**
		 * 第X轮-选择大奖Id
		 */		
		round2JackpotId:Object;
		
		/**
		 * 总召唤数
		 */		
		totalCallNum:number;
		
		/**
		 * 保底次数
		 */		
		guaranteedTimes:number;
		
		/**
		 * 大奖Id-获得次数
		 */		
		jackpotId2Num:Object;
		
		/**
		 * 是否通关试玩
		 */		
		passTrial:boolean;
		
		/**
		 * 是否领取试玩奖励
		 */		
		receivedTrialReward:boolean;
		
		/**
		 * 大奖记录列表
		 */		
		recordVos:Array<CallHeroJackpotRecordVo>;
		
	}


	
	/**
	 * 描述
	 * @author GameCreator
	 */	
	class GirlGroupBuyGoodsRecordVo	{
		/**
		 * 玩家Id
		 */		
		playerId:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
		/**
		 * 商品Id
		 */		
		goodsId:number;
		
	}


	
	/**
	 * 处理活动事务
	 * @author GameCreator
	 */	
	class HandleStuffC2S	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 事务
		 */		
		stuff:string;
		
		/**
		 * 处理次数
		 */		
		times:number;
		
		/**
		 * 其它参数
		 */		
		otherParams:string;
		
	}


	
	/**
	 * 处理活动事务
	 * @author GameCreator
	 */	
	class HandleStuffS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 轮盘抽奖活动信息
	 * @author GameCreator
	 */	
	class RouletteLotteryVo	{
		/**
		 * 当前轮次，从1开始
		 */		
		round:number;
		
		/**
		 * 第X轮-<奖池配置Id，数量>
		 */		
		round2PoolConfigIdNum:Object;
		
		/**
		 * 第X轮-选择大奖下标
		 */		
		round2JackpotIndex:Object;
		
		/**
		 * 大奖下标-获得次数
		 */		
		jackpotIndex2Num:Object;
		
	}


	
	/**
	 * 开服累天充值活动信息
	 * @author GameCreator
	 */	
	class TotalChargeDayVo	{
		/**
		 * 累计充值天数
		 */		
		chargeDay:number;
		
		/**
		 * 当日充值金额，单位：分
		 */		
		dailyMoney:number;
		
		/**
		 * 今日是否已达到充值金额条件
		 */		
		dailyReached:boolean;
		
		/**
		 * 已领取的奖励配置Id
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 每日刷新时间戳
		 */		
		nextDailyResetTime:number;
		
	}


	
	/**
	 * 职业试炼信息
	 * @author GameCreator
	 */	
	class CareerTrialVo	{
		/**
		 * 通行证任务信息
		 */		
		battlePassTaskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 是否已购买通行证
		 */		
		boughtPassIds:Array<number>;
		
		/**
		 * 已领取通行证普通奖励Id列表
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 已领取通行证付费奖励Id列表
		 */		
		chargeRewardIds:Array<number>;
		
		/**
		 * 基金任务信息
		 */		
		fundTaskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 已领取基金普通奖励Id列表
		 */		
		fundRewardIds:Array<number>;
		
		/**
		 * 基金普通奖励Id-购买数量
		 */		
		fundChargeRewardId2Num:Object;
		
		/**
		 * 已通过试玩的试炼Id列表
		 */		
		passTrialFightIds:Array<number>;
		
		/**
		 * 已领取试玩奖的试炼Id列表
		 */		
		trialFightRewardIds:Array<number>;
		
		/**
		 * 每日刷新时间戳
		 */		
		nextDailyResetTime:number;
		
		/**
		 * 每周刷新时间戳
		 */		
		nextWeeklyResetTime:number;
		
	}


	
	/**
	 * 抽奖活动信息
	 * @author GameCreator
	 */	
	class LotteryVo	{
		/**
		 * 当前轮次，从1开始
		 */		
		round:number;
		
		/**
		 * 第X轮-<已抽取格子，奖池配置Id>
		 */		
		round2GridPoolConfigId:Object;
		
		/**
		 * 第X轮-已领取格子列表
		 */		
		round2ReceivedGrids:Object;
		
		/**
		 * 第X轮-选择大奖下标
		 */		
		round2JackpotIndex:Object;
		
		/**
		 * 第X轮-抽奖次数
		 */		
		round2Num:Object;
		
		/**
		 * 大奖下标-获得次数
		 */		
		jackpotIndex2Num:Object;
		
	}


	
	/**
	 * 职业招募信息
	 * @author GameCreator
	 */	
	class CareerRecruitVo	{
		/**
		 * 当前选择的职业招募Id，即CareerRecruitConfig的Id
		 */		
		recruitId:number;
		
		/**
		 * 招募总次数
		 */		
		recruitTimes:number;
		
		/**
		 * 指定品质次数
		 */		
		assignQualityTimes:number;
		
	}


	
	/**
	 * 英雄补给信息
	 * @author GameCreator
	 */	
	class HeroSupplyVo	{
		/**
		 * 是否购买补给
		 */		
		buySupply:boolean;
		
		/**
		 * 奖励Id列表
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 领取奖励结果
	 * @author GameCreator
	 */	
	class DrawRewardResultVo	{
		/**
		 * 领奖结果
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 附加信息
		 */		
		additional:Object;
		
	}


	
	/**
	 * 活动状态信息
	 * @author GameCreator
	 */	
	class ActivityStateVo	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 活动状态：1-未开启，2-尚未开始展示，3-开启中，4-发奖阶段，5-结束
		 */		
		state:number;
		
		/**
		 * 活动开始时间
		 */		
		startTime:number;
		
		/**
		 * 玩家可见开始时间，>0时生效
		 */		
		visibleStartTime:number;
		
		/**
		 * 玩家可见结束时间，>0时生效
		 */		
		visibleEndTime:number;
		
		/**
		 * 活动结束时间
		 */		
		endTime:number;
		
	}


	
	/**
	 * 首充活动信息
	 * @author GameCreator
	 */	
	class FirstChargeVo	{
		/**
		 * 充值商品Id列表
		 */		
		chargeIds:Array<string>;
		
		/**
		 * 已领取的奖励Id列表
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 女团活动信息
	 * @author GameCreator
	 */	
	class GirlGroupVo	{
		/**
		 * 累计购买数量
		 */		
		totalBuyNum:number;
		
		/**
		 * 累计观看数
		 */		
		totalVisitNum:number;
		
		/**
		 * 购买信息列表
		 */		
		buyGoodsRecordVos:Array<GirlGroupBuyGoodsRecordVo>;
		
		/**
		 * 女团玩家相关信息
		 */		
		playerVo:GirlGroupPlayerVo;
		
	}


	
	/**
	 * 达标活动信息
	 * @author GameCreator
	 */	
	class ReachStandardVo	{
		/**
		 * 第X轮
		 */		
		group:number;
		
		/**
		 * 总轮数
		 */		
		totalGroupNum:number;
		
		/**
		 * 任务相关信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 商城信息
		 */		
		mallVo:Vo.mall.MallVo;
		
	}


	
	/**
	 * 活动任务信息
	 * @author GameCreator
	 */	
	class ActivityTaskVo	{
		/**
		 * 任务信息类型
		 */		
		taskVoType:number;
		
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 任务类型, {@link TaskType}
		 */		
		type:number;
		
		/**
		 * 任务标识(任务的唯一标识)
		 */		
		taskId:number;
		
		/**
		 * 任务的完成情况
		 */		
		progress:number;
		
		/**
		 * 任务状态: 2 进行中；3已完成未领奖
		 */		
		state:number;
		
	}


	
	/**
	 * 通行证奖励附属信息
	 * @author GameCreator
	 */	
	class BattlePassRewardAdditionalVo	{
		/**
		 * 本次获得奖励Id列表
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 本次获得付费奖励Id列表
		 */		
		chargeRewardIds:Array<number>;
		
	}


	
	/**
	 * 获取活动排行榜
	 * @author GameCreator
	 */	
	class GetRankListC2S	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 第X页(从1开始)
		 */		
		page:number;
		
	}


	
	/**
	 * 获取活动排行榜
	 * @author GameCreator
	 */	
	class GetRankListS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 开服冲榜信息
	 * @author GameCreator
	 */	
	class RushRankVo	{
		/**
		 * 结算信息列表
		 */		
		settleVos:Array<RushRankSettleVo>;
		
		/**
		 * 挂机关卡首通信息列表
		 */		
		firstPassVos:Array<Vo.trunkinstance.TrunkInstanceFirstPassVo>;
		
		/**
		 * 已领取首通挂机关卡配置Id列表
		 */		
		firstPassTrunkInstanceIds:Array<number>;
		
		/**
		 * 序列校验首通信息列表
		 */		
		ladderFirstPassVos:Array<Vo.ladder.LadderFirstPassVo>;
		
		/**
		 * 已领取首通序列校验配置Id列表
		 */		
		firstPassLadderIds:Array<number>;
		
	}


	
	/**
	 * 召唤英雄大奖记录信息
	 * @author GameCreator
	 */	
	class CallHeroJackpotRecordVo	{
		/**
		 * 玩家Id
		 */		
		playerId:number;
		
		/**
		 * 玩家名
		 */		
		playerName:string;
		
		/**
		 * 大奖Id
		 */		
		jackpotId:number;
		
	}


	
	/**
	 * 签到活动信息
	 * @author GameCreator
	 */	
	class SignVo	{
		/**
		 * 累计登录天数
		 */		
		totalLoginDays:number;
		
		/**
		 * 已领取的每日奖励Id列表
		 */		
		dailyRewardIds:Array<number>;
		
		/**
		 * 已领取的累计奖励Id-道具Id
		 */		
		totalRewardId2ItemIdMap:Object;
		
		/**
		 * 最后更新时间
		 */		
		lastUpdateTime:number;
		
	}


	
	/**
	 * 描述
	 * @author GameCreator
	 */	
	class GirlGroupVisitorVo	{
		/**
		 * 累计访问数
		 */		
		totalVisitNum:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
	}


	
	/**
	 * 星灵礼包信息
	 * @author GameCreator
	 */	
	class PetGiftVo	{
		/**
		 * 礼包配置Id-购买数量
		 */		
		giftId2BuyNum:Object;
		
	}


	
	/**
	 * 活动任务奖励信息
	 * @author GameCreator
	 */	
	class ActivityTaskRewardVo	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 任务奖励信息
		 */		
		rewardVo:Vo.task.TaskRewardVo;
		
	}


	
	/**
	 * 全服活动新状态
	 * @author GameCreator
	 */	
	class GlobalActivityNewStateVo	{
		/**
		 * 活动id
		 */		
		activityId:number;
		
		/**
		 * 活动状态 ,1:未开启；2:尚未开始展示；3 开启中 4；发奖阶段；5 结束
		 */		
		state:number;
		
	}


	
	/**
	 * 基金信息
	 * @author GameCreator
	 */	
	class FundVo	{
		/**
		 * 任务相关信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 是否已购买基金
		 */		
		boughtFund:boolean;
		
		/**
		 * 已领取奖励任务Id列表
		 */		
		rewardTaskIds:Array<number>;
		
		/**
		 * 已领取付费奖励任务Id列表
		 */		
		chargeRewardTaskIds:Array<number>;
		
	}


	
	/**
	 * 开服冲榜结算信息
	 * @author GameCreator
	 */	
	class RushRankSettleVo	{
		/**
		 * 轮次下标，从0开始
		 */		
		roundIndex:number;
		
		/**
		 * 该轮榜首玩家信息
		 */		
		firstPlayerBaseVo:Vo.player.PlayerBaseVo;
		
	}


	
	/**
	 * 获取活动排行榜
	 * @author GameCreator
	 */	
	class GetSubRankListC2S	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 额外参数
		 */		
		extraParam:string;
		
		/**
		 * 第几页(从1开始)
		 */		
		page:number;
		
	}


	
	/**
	 * 获取活动排行榜
	 * @author GameCreator
	 */	
	class GetSubRankListS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 召唤英雄结果信息
	 * @author GameCreator
	 */	
	class CallHeroResultVo	{
		/**
		 * 当前保底次数
		 */		
		guaranteeTimes:number;
		
		/**
		 * 实际召唤次数
		 */		
		realTimes:number;
		
		/**
		 * 积分奖励信息
		 */		
		scoreRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 是否触发大奖
		 */		
		triggerJackpot:boolean;
		
	}


	
	/**
	 * 开服累充活动信息
	 * @author GameCreator
	 */	
	class TotalChargeVo	{
		/**
		 * 已充值金额，单位分
		 */		
		money:number;
		
		/**
		 * 已领取的奖励配置Id
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 活动排行榜数据Vo
	 * @author GameCreator
	 */	
	class ActivityRankingVo	{
		/**
		 * 当前名次
		 */		
		rank:number;
		
		/**
		 * 玩家当前排行唯一ID
		 */		
		id:number;
		
		/**
		 * 当前值
		 */		
		value:number;
		
		/**
		 * 附加值
		 */		
		addition:number;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<Object>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 获取当前所有的活动信息
	 * @author GameCreator
	 */	
	class CurrentActivitiesS2C	{
		content:Vo.activity.CurrentActivitiesVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取活动项奖励
	 * @author GameCreator
	 */	
	class DrawItemRewardC2S	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 活动项Id
		 */		
		itemId:string;
		
	}


	
	/**
	 * 领取活动项奖励
	 * @author GameCreator
	 */	
	class DrawItemRewardS2C	{
		content:Vo.activity.DrawRewardResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星钻银行信息
	 * @author GameCreator
	 */	
	class DiamondBankVo	{
		/**
		 * 当前累计星钻数
		 */		
		diamondNum:number;
		
		/**
		 * 开始累计时间戳
		 */		
		startTime:number;
		
		/**
		 * 累计已领取星钻数
		 */		
		totalDrawDiamondNum:number;
		
		/**
		 * 是否已购买解锁商品
		 */		
		boughtUnlock:boolean;
		
	}


	
	/**
	 * 当前的活动信息
	 * @author GameCreator
	 */	
	class CurrentActivitiesVo	{
		/**
		 * 活动状态信息列表
		 */		
		activityStateVos:Array<ActivityStateVo>;
		
		/**
		 * 玩家参与活动信息列表
		 */		
		activityVos:Array<ActivityVo>;
		
	}


	
	/**
	 * 活动奖励信息
	 * @author GameCreator
	 */	
	class ActivityRewardVo	{
		/**
		 * 活动Id
		 */		
		activityId:number;
		
		/**
		 * 奖励key值，不同的活动有不同的意义
		 */		
		item:string;
		
		/**
		 * 奖励结果列表
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 活动vo
	 * @author GameCreator
	 */	
	class ActivityVo	{
		/**
		 * 活动id
		 */		
		id:number;
		
		/**
		 * 开启时间
		 */		
		startTime:number;
		
		/**
		 * 领奖阶段开始时间
		 */		
		rewardTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 循环周期
		 */		
		period:number;
		
		/**
		 * 活动内容
		 */		
		content:Object;
		
		/**
		 * 已领取奖励活动项-最后领奖日期
		 */		
		drawTimeMap:Object;
		
		/**
		 * 活动项奖励领取次数
		 */		
		drawCountMap:Object;
		
		/**
		 * 活动不可见时间
		 */		
		visibleEndTime:number;
		
		/**
		 * 整个活动是否完成
		 */		
		done:boolean;
		
		/**
		 * 完成时间戳
		 */		
		doneTime:number;
		
		/**
		 * 版本号，默认为0，即不需要考虑版本号
		 */		
		version:number;
		
	}


	
	/**
	 * 空内容
	 * @author GameCreator
	 */	
	class EmptyContentVo	{
	}


	
	/**
	 * 通行证信息
	 * @author GameCreator
	 */	
	class BattlePassVo	{
		/**
		 * 任务信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 是否已购买普通通行证
		 */		
		boughtPass:boolean;
		
		/**
		 * 是否已购买超级通行证
		 */		
		boughtSuperPass:boolean;
		
		/**
		 * 已获取普通奖励Id列表
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 已获取付费奖励Id列表
		 */		
		chargeRewardIds:Array<number>;
		
		/**
		 * 每日刷新时间戳
		 */		
		nextDailyResetTime:number;
		
		/**
		 * 每周刷新时间戳
		 */		
		nextWeeklyResetTime:number;
		
	}


}
