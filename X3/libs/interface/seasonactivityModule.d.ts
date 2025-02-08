declare module Vo.seasonactivity{
	
	/**
	 * 赛季子活动新状态信息
	 * @author GameCreator
	 */	
	class SubSeasonActivityNewStateVo	{
		/**
		 * 赛季活动Id
		 */		
		activityId:number;
		
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 活动状态，1-未开启，2-开启中，4-结算(兼容线上数据，故Id较大)，3-结束
		 */		
		state:number;
		
	}


	
	/**
	 * 获取排行榜
	 * @author GameCreator
	 */	
	class GetRankListC2S	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 额外参数
		 */		
		extraParam:string;
		
		/**
		 * 第X页，从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取排行榜
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
	 * 当前赛季活动信息
	 * @author GameCreator
	 */	
	class CurrentSeasonActivitiesVo	{
		/**
		 * 赛季活动状态信息列表
		 */		
		activityStateVos:Array<SeasonActivityStateVo>;
		
		/**
		 * 玩家参与赛季活动信息列表
		 */		
		activityVos:Array<SeasonActivityVo>;
		
	}


	
	/**
	 * 挑战赛季Boss
	 * @author GameCreator
	 */	
	class ChallengeSeasonBossC2S	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 是否模拟
		 */		
		simulated:boolean;
		
	}


	
	/**
	 * 挑战赛季Boss
	 * @author GameCreator
	 */	
	class ChallengeSeasonBossS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 赛季子活动信息
	 * @author GameCreator
	 */	
	class SubSeasonActivityVo	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 活动内容
		 */		
		content:Object;
		
	}


	
	/**
	 * 挑战秘境
	 * @author GameCreator
	 */	
	class ChallengeSecretC2S	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 层数
		 */		
		floor:number;
		
	}


	
	/**
	 * 挑战秘境
	 * @author GameCreator
	 */	
	class ChallengeSecretS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 处理活动事务
	 * @author GameCreator
	 */	
	class HandleStuffC2S	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
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
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 赛季子活动状态信息
	 * @author GameCreator
	 */	
	class SubSeasonActivityStateVo	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 活动状态，1-未开启，2-开启中，4-结算(兼容线上数据，故Id较大)，3-结束
		 */		
		state:number;
		
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结算时间
		 */		
		settleTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
	}


	
	/**
	 * 赛季秘境挑战结果信息
	 * @author GameCreator
	 */	
	class SeasonSecretChallengeResultVo	{
		/**
		 * 子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 赛季秘境配置Id，即SeasonSecretConfig的Id
		 */		
		secretConfigId:number;
		
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 今日已挑战次数
		 */		
		dailyChallengeTimes:number;
		
		/**
		 * 今日领取挑战奖励次数
		 */		
		dailyChallengeRewardTimes:number;
		
		/**
		 * 当前排名
		 */		
		rank:number;
		
		/**
		 * 击杀怪物数量
		 */		
		killMonsterCount:number;
		
		/**
		 * 战斗秒数
		 */		
		battleSeconds:number;
		
		/**
		 * 进度
		 */		
		progress:number;
		
		/**
		 * 本次积分数
		 */		
		scoreNum:number;
		
		/**
		 * 首通奖励信息
		 */		
		firstRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 挑战奖励信息
		 */		
		challengeRewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 赛季达标活动信息
	 * @author GameCreator
	 */	
	class SeasonReachVo	{
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
		
	}


	
	/**
	 * 获取赛季活动
	 * @author GameCreator
	 */	
	class GetSeasonActivityS2C	{
		content:Vo.seasonactivity.SeasonActivityVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取赛季活动
	 * @author GameCreator
	 */	
	class GetSeasonActivityC2S	{
		activityId:number;
		
	}


	
	/**
	 * 赛季子活动任务信息
	 * @author GameCreator
	 */	
	class SeasonActivityTaskVo	{
		/**
		 * 任务信息类型
		 */		
		taskVoType:number;
		
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 任务类型， {@link TaskType}
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
		 * 任务状态，2-进行中，3-已完成未领奖
		 */		
		state:number;
		
	}


	
	/**
	 * 赛季活动状态信息
	 * @author GameCreator
	 */	
	class SeasonActivityStateVo	{
		/**
		 * 赛季活动Id
		 */		
		activityId:number;
		
		/**
		 * 活动状态，1-未开启，2-开启中，3-结束
		 */		
		state:number;
		
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 赛季子活动状态信息列表
		 */		
		subActivityStateVos:Array<SubSeasonActivityStateVo>;
		
	}


	
	/**
	 * 赛季秘境信息
	 * @author GameCreator
	 */	
	class SeasonSecretVo	{
		/**
		 * 今日已挑战次数
		 */		
		dailyChallengeTimes:number;
		
		/**
		 * 今日已购买挑战次数
		 */		
		dailyBuyChallengeTimes:number;
		
		/**
		 * 今日领取挑战奖励次数
		 */		
		dailyChallengeRewardTimes:number;
		
		/**
		 * 最高排名
		 */		
		maxRank:number;
		
		/**
		 * 已通关层数
		 */		
		passFloor:number;
		
		/**
		 * 层数-最少秒数
		 */		
		floor2MinSeconds:Object;
		
		/**
		 * 初始化自定义阵容，不为空则使用此阵容信息，为空则使用通用自定义阵容
		 */		
		customFormationVos:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 积分数
		 */		
		scoreNum:number;
		
	}


	
	/**
	 * 赛季活动信息
	 * @author GameCreator
	 */	
	class SeasonActivityRewardVo	{
		/**
		 * 赛季活动Id
		 */		
		activityId:number;
		
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
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
	 * 赛季秘境战斗信息
	 * @author GameCreator
	 */	
	class SeasonSecretBattleInfo	{
		/**
		 * 当前所在层数，从1开始
		 */		
		currentFloor:number;
		
		/**
		 * 赛季秘境配置Id，即SeasonSecretConfig的Id
		 */		
		secretConfigId:number;
		
		/**
		 * 赛季秘境层数信息，层数-层信息
		 */		
		floorMap:Object;
		
	}


	
	/**
	 * 获取当前所有赛季活动列表
	 * @author GameCreator
	 */	
	class GetCurrentSeasonActivitiesS2C	{
		content:Vo.seasonactivity.CurrentSeasonActivitiesVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 赛季活动新状态信息
	 * @author GameCreator
	 */	
	class SeasonActivityNewStateVo	{
		/**
		 * 赛季活动Id
		 */		
		activityId:number;
		
		/**
		 * 活动状态，1-未开启，2-开启中，3-结束
		 */		
		state:number;
		
	}


	
	/**
	 * 赛季Boss挑战结果信息
	 * @author GameCreator
	 */	
	class SeasonBossChallengeResultVo	{
		/**
		 * 子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 赛季Boss配置Id
		 */		
		bossConfigId:number;
		
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 是否取消
		 */		
		cancel:boolean;
		
		/**
		 * 当前排名
		 */		
		rank:number;
		
		/**
		 * 本次挑战伤害值
		 */		
		hurt:number;
		
		/**
		 * 进度奖励配置Id
		 */		
		progressRewardId:number;
		
		/**
		 * 奖励信息列表
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 是否模拟
		 */		
		simulated:boolean;
		
		/**
		 * 今日已挑战次数
		 */		
		dailyChallengeTimes:number;
		
	}


	
	/**
	 * 领取赛季子活动奖励
	 * @author GameCreator
	 */	
	class DrawItemRewardC2S	{
		/**
		 * 赛季子活动Id
		 */		
		subActivityId:number;
		
		/**
		 * 奖励项Id
		 */		
		itemId:string;
		
	}


	
	/**
	 * 领取赛季子活动奖励
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
	 * 赛季Boss信息
	 * @author GameCreator
	 */	
	class SeasonBossVo	{
		/**
		 * 最高排名
		 */		
		maxRank:number;
		
		/**
		 * 最高伤害
		 */		
		hurt:number;
		
		/**
		 * 今日已挑战次数
		 */		
		dailyChallengeTimes:number;
		
		/**
		 * 排行榜展示值
		 */		
		displayValue:number;
		
		/**
		 * 初始化自定义阵容，不为空则使用此阵容信息，为空则使用通用自定义阵容
		 */		
		customFormationVos:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 已领取奖励Id列表
		 */		
		rewardIds:Array<number>;
		
		/**
		 * 每日刷新时间戳
		 */		
		nextDailyResetTime:number;
		
	}


	
	/**
	 * 报名赛季子活动信息
	 * @author GameCreator
	 */	
	class SignUpVo	{
		/**
		 * 是否已报名
		 */		
		signed:boolean;
		
		/**
		 * 已领取奖励Id列表
		 */		
		rewardIds:Array<number>;
		
	}


	
	/**
	 * 赛季秘境
	 * @author GameCreator
	 */	
	class SeasonSecretFloorVo	{
		/**
		 * 层数
		 */		
		floor:number;
		
		/**
		 * 房间Id列表
		 */		
		roomIds:Array<number>;
		
	}


	
	/**
	 * 赛季活动信息
	 * @author GameCreator
	 */	
	class SeasonActivityVo	{
		/**
		 * 赛季活动Id
		 */		
		activityId:number;
		
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 赛季子活动信息列表
		 */		
		subActivityVos:Array<SubSeasonActivityVo>;
		
	}


}
