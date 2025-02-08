declare module Vo.dailyboss{
	
	/**
	 * 每日BOSS信息
	 * @author GameCreator
	 */	
	class DailyBossVo	{
		/**
		 * 今日BOSS信息
		 */		
		bossInfoVo:DailyBossInfoVo;
		
		/**
		 * BOSS开启时间MAP, key: bossType, value: 本服开启时间
		 */		
		bossOpenTimeMap:Object;
		
	}


	
	/**
	 * 每日BOSS挑战结果
	 * @author GameCreator
	 */	
	class DailyBossChallengeResultVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 本次挑战伤害值
		 */		
		hurt:number;
		
		/**
		 * 上一难度进度
		 */		
		preDifficultyProgress:number;
		
		/**
		 * 上一难度进度伤害
		 */		
		preDifficultyHurt:number;
		
		/**
		 * 当前最新难度
		 */		
		currentDifficulty:number;
		
		/**
		 * 当前BOSS最新难度进度
		 */		
		currentProgress:number;
		
		/**
		 * 当前BOSS最新难度进度伤害值
		 */		
		currentHurt:number;
		
		/**
		 * 当前BOSS难度已挑战次数
		 */		
		challengeTimes:number;
		
		/**
		 * 进度奖励
		 */		
		progressRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领取奖励的进度配置ID列表
		 */		
		drawProgressIds:Array<number>;
		
	}


	
	/**
	 * 加载BOSS排行榜
	 * @author GameCreator
	 */	
	class LoadBossRankC2S	{
		/**
		 * boss类型
		 */		
		bossType:number;
		
		/**
		 * 第几页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 加载BOSS排行榜
	 * @author GameCreator
	 */	
	class LoadBossRankS2C	{
		content:Vo.dailyboss.DailyBossRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 加载BOSS最高伤害阵容列表
	 * @author GameCreator
	 */	
	class LoadMaxHurtFormationsC2S	{
		/**
		 * boss类型
		 */		
		bossType:number;
		
	}


	
	/**
	 * 加载BOSS最高伤害阵容列表
	 * @author GameCreator
	 */	
	class LoadMaxHurtFormationsS2C	{
		content:Array<Vo.dailyboss.DailyBossFormationRankItemVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 每日Boss信息Vo
	 * @author GameCreator
	 */	
	class DailyBossInfoVo	{
		/**
		 * BOSS类型
		 */		
		bossType:number;
		
		/**
		 * 当前BOSS难度
		 */		
		difficulty:number;
		
		/**
		 * BOSS类型已领奖的进度ID列表,List<进度配置ID>
		 */		
		drawProgressIds:Array<number>;
		
		/**
		 * 上一难度进度
		 */		
		preDifficultyProgress:number;
		
		/**
		 * 上一难度进度伤害
		 */		
		preDifficultyHurt:number;
		
		/**
		 * 当前BOSS难度进度
		 */		
		progress:number;
		
		/**
		 * 当前BOSS难度进度伤害
		 */		
		hurt:number;
		
		/**
		 * 当前BOSS难度已挑战次数
		 */		
		challengeTimes:number;
		
		/**
		 * 购买挑战次数
		 */		
		buyChallengeTimes:number;
		
		/**
		 * 今日获得广告挑战次数
		 */		
		todayGetAdvertTimes:number;
		
	}


	
	/**
	 * 每日BOSS排行榜数据
	 * @author GameCreator
	 */	
	class DailyBossRankingVo	{
		/**
		 * 玩家当前名次,-1表示没排名
		 */		
		rank:number;
		
		/**
		 * 伤害值/进度,进度为万分比
		 */		
		value:number;
		
		/**
		 * 难度,-1表示没参与
		 */		
		difficulty:number;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<DailyBossRankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 每日BOSS排名元素信息
	 * @author GameCreator
	 */	
	class DailyBossRankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 伤害值
		 */		
		value:number;
		
		/**
		 * 进度值
		 */		
		progress:number;
		
		/**
		 * 难度
		 */		
		difficulty:number;
		
		/**
		 * 服务器ID
		 */		
		serverId:string;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
	}


	
	/**
	 * 增加广告挑战次数,返回成功则增加当日广告挑战次数
	 * @author GameCreator
	 */	
	class AddAdvertChallengeTimesS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 每日BOSS玩法信息
	 * @author GameCreator
	 */	
	class DailyBossPlayInfo	{
		/**
		 * 当前BOSS配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 当前排名,没有则为-1
		 */		
		rank:number;
		
		/**
		 * 重置倒计时
		 */		
		dailyResetTime:number;
		
	}


	
	/**
	 * 加载每日BOSS信息
	 * @author GameCreator
	 */	
	class LoadInfoS2C	{
		content:Vo.dailyboss.DailyBossVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 每日BOSS地图信息Vo
	 * @author GameCreator
	 */	
	class DailyBossChallengeVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 当前已购买挑战次数
		 */		
		buyChallengeTimes:number;
		
	}


	
	/**
	 * 挑战BOSS
	 * @author GameCreator
	 */	
	class ChallengeBossC2S	{
		/**
		 * DailyBossConfig的id
		 */		
		bossConfigId:number;
		
		/**
		 * 是否购买挑战次数
		 */		
		buyChallengeTimes:boolean;
		
	}


	
	/**
	 * 挑战BOSS
	 * @author GameCreator
	 */	
	class ChallengeBossS2C	{
		content:Vo.dailyboss.DailyBossChallengeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 每日Boss阵容排名条目信息
	 * @author GameCreator
	 */	
	class DailyBossFormationRankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 排名
		 */		
		rank:number;
		
		/**
		 * 伤害值
		 */		
		value:number;
		
		/**
		 * 阵容信息
		 */		
		formationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 单位统计信息列表
		 */		
		statisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 防守方单位统计信息列表
		 */		
		defendStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 难度
		 */		
		difficulty:number;
		
	}


	
	/**
	 * 每日BOSS购买挑战次数Vo
	 * @author GameCreator
	 */	
	class DailyBossBuyChallengeTimesVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 今日累计购买次数
		 */		
		buyChallengeTimes:number;
		
	}


}
