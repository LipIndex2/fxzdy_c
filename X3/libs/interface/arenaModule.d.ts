declare module Vo.arena{
	
	/**
	 * 挑战
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 挑战者ID
		 */		
		defenderId:number;
		
	}


	
	/**
	 * 挑战
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场排行榜信息
	 * @author GameCreator
	 */	
	class ArenaRankingVo	{
		/**
		 * 当前名次
		 */		
		rank:number;
		
		/**
		 * 玩家当前排行唯一ID
		 */		
		id:number;
		
		/**
		 * 积分
		 */		
		score:number;
		
		/**
		 * 当前段位配置ID
		 */		
		rankConfigId:number;
		
		/**
		 * 排行榜前三名
		 */		
		topList:Array<ArenaRankItemVo>;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<ArenaRankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 获取竞技场信息
	 * @author GameCreator
	 */	
	class LoadArenaInfoS2C	{
		content:Vo.arena.PlayerArenaVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场对手信息
	 * @author GameCreator
	 */	
	class ArenaOpponentVo	{
		/**
		 * 玩家基础信息,null则表示机器人
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 玩家阵容信息
		 */		
		formationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 机器人信息
		 */		
		robotBaseVo:ArenaRobotBaseVo;
		
		/**
		 * 竞技场段位配置ID,ArenaRankConfig的id
		 */		
		rankConfigId:number;
		
		/**
		 * 积分值
		 */		
		score:number;
		
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
	 * 竞技场被挑战信息
	 * @author GameCreator
	 */	
	class ArenaBeChallengeVo	{
		/**
		 * 被挑战后当前段位配置ID
		 */		
		rankConfigId:number;
		
		/**
		 * 挑战后当前积分
		 */		
		score:number;
		
		/**
		 * 已领取奖励的段位id
		 */		
		drawRankRewardIds:Array<number>;
		
		/**
		 * 段位奖励ID
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 竞技场挑战记录
	 * @author GameCreator
	 */	
	class ArenaChallengeRecord	{
		/**
		 * 攻击方基础信息
		 */		
		attackerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 攻击方单位统计列表
		 */		
		attackerStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 防守方基础信息,null则表示机器人
		 */		
		defenderBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 防守方机器人基础信息
		 */		
		defenderRobotBaseVo:ArenaRobotBaseVo;
		
		/**
		 * 防守方单位统计列表
		 */		
		defenderStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 攻击方是否胜利
		 */		
		attackerWin:boolean;
		
		/**
		 * 变化前积分
		 */		
		beforeScore:number;
		
		/**
		 * 积分变化
		 */		
		changeScore:number;
		
		/**
		 * 挑战时间
		 */		
		time:number;
		
	}


	
	/**
	 * 竞技场玩法信息
	 * @author GameCreator
	 */	
	class ArenaPlayInfo	{
		/**
		 * 排名,没有则为-1
		 */		
		rank:number;
		
		/**
		 * 分数,0则表示未参与玩法
		 */		
		score:number;
		
		/**
		 * 每日结算时间
		 */		
		dailySettleTime:number;
		
		/**
		 * 每周结算时间
		 */		
		weeklySettleTime:number;
		
	}


	
	/**
	 * 玩家竞技场登录下发信息
	 * @author GameCreator
	 */	
	class PlayerArenaLoginVo	{
		/**
		 * 今日挑战次数
		 */		
		todayChallengeTimes:number;
		
		/**
		 * 周挑战次数
		 */		
		weeklyChallengeTimes:number;
		
		/**
		 * 已领取奖励的段位id
		 */		
		drawRankRewardIds:Array<number>;
		
		/**
		 * 已领取奖励的周挑战id
		 */		
		drawWeeklyChallengeRewardIds:Array<number>;
		
	}


	
	/**
	 * 领取周挑战次数奖励 优化 -》 改为每日奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyRewardC2S	{
		/**
		 * 周挑战次数
		 */		
		weeklyChallengeTimes:number;
		
	}


	
	/**
	 * 领取周挑战次数奖励 优化 -》 改为每日奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取段位奖励
	 * @author GameCreator
	 */	
	class DrawRankRewardS2C	{
		content:Vo.arena.ArenaDrawRankRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场加载挑战列表信息
	 * @author GameCreator
	 */	
	class ArenaLoadOpponentVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 对手列表
		 */		
		opponentVos:Array<ArenaOpponentVo>;
		
		/**
		 * 本次挑战列表刷新次数
		 */		
		refreshTimes:number;
		
	}


	
	/**
	 * 竞技场排行榜元素
	 * @author GameCreator
	 */	
	class ArenaRankItemVo	{
		/**
		 * 玩家基础信息,null则表示机器人不展示
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 积分值
		 */		
		score:number;
		
		/**
		 * 当前段位配置ID
		 */		
		rankConfigId:number;
		
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
	 * 获取挑战列表
	 * @author GameCreator
	 */	
	class LoadChallengeListS2C	{
		content:Vo.arena.ArenaLoadOpponentVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取挑战记录
	 * @author GameCreator
	 */	
	class LoadChallengeRecordS2C	{
		content:Array<Vo.arena.ArenaChallengeRecord>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取排行榜信息
	 * @author GameCreator
	 */	
	class LoadArenaRankC2S	{
		/**
		 * 分页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取排行榜信息
	 * @author GameCreator
	 */	
	class LoadArenaRankS2C	{
		content:Vo.arena.ArenaRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场刷新对手列表信息
	 * @author GameCreator
	 */	
	class ArenaRefreshOpponentVo	{
		/**
		 * 对手列表
		 */		
		opponentVos:Array<ArenaOpponentVo>;
		
		/**
		 * 本次挑战列表刷新次数
		 */		
		refreshTimes:number;
		
	}


	
	/**
	 * 竞技场领取段位奖励
	 * @author GameCreator
	 */	
	class ArenaDrawRankRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 已领取奖励的段位ID列表
		 */		
		drawRewardRankIds:Array<number>;
		
	}


	
	/**
	 * 购买挑战次数
	 * @author GameCreator
	 */	
	class BuyChallengeTimesS2C	{
		content:Vo.arena.ArenaBuyChallengeTimesVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场购买挑战次数信息
	 * @author GameCreator
	 */	
	class ArenaBuyChallengeTimesVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 今日购买挑战次数
		 */		
		todayBuyChallengeTimes:number;
		
	}


	
	/**
	 * 刷新挑战列表
	 * @author GameCreator
	 */	
	class RefreshChallengeListS2C	{
		content:Vo.arena.ArenaRefreshOpponentVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家竞技场信息
	 * @author GameCreator
	 */	
	class PlayerArenaVo	{
		/**
		 * 积分
		 */		
		score:number;
		
		/**
		 * 历史最高段位配置ID
		 */		
		historyMaxRankConfigId:number;
		
		/**
		 * 本次挑战列表刷新次数
		 */		
		refreshTimes:number;
		
		/**
		 * 今日购买挑战次数
		 */		
		todayBuyChallengeTimes:number;
		
		/**
		 * 今日挑战次数
		 */		
		todayChallengeTimes:number;
		
		/**
		 * 周挑战次数
		 */		
		weeklyChallengeTimes:number;
		
		/**
		 * 当前段位配置ID
		 */		
		arenaRankConfigId:number;
		
		/**
		 * 已领取奖励的段位id
		 */		
		drawRankRewardIds:Array<number>;
		
		/**
		 * 已领取奖励的周挑战id
		 */		
		drawWeeklyChallengeRewardIds:Array<number>;
		
		/**
		 * 挑战对手列表
		 */		
		opponentVos:Array<ArenaOpponentVo>;
		
		/**
		 * 本次请求是否初始化自定义布阵,不为null则将此阵容新增到竞技场自定义布阵,否则忽略此字段读取自定义布阵下发信息
		 */		
		initCustomFormationVo:Vo.formation.CustomFormationVo;
		
		/**
		 * 额外挑战奖励次数
		 */		
		extraChallengeRewardTimes:number;
		
	}


	
	/**
	 * 竞技场挑战结果信息
	 * @author GameCreator
	 */	
	class ArenaChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 挑战奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 段位奖励
		 */		
		rankRewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 挑战列表
		 */		
		opponentVos:Array<ArenaOpponentVo>;
		
		/**
		 * 挑战后当前段位配置ID
		 */		
		rankConfigId:number;
		
		/**
		 * 已领取奖励的段位id
		 */		
		drawRankRewardIds:Array<number>;
		
		/**
		 * 挑战后当前积分
		 */		
		score:number;
		
		/**
		 * 本次挑战积分值变化
		 */		
		changeScore:number;
		
		/**
		 * 额外挑战奖励次数
		 */		
		extraChallengeRewardTimes:number;
		
	}


	
	/**
	 * 竞技场机器人基础信息
	 * @author GameCreator
	 */	
	class ArenaRobotBaseVo	{
		/**
		 * 机器人ID
		 */		
		id:number;
		
		/**
		 * 机器人名称
		 */		
		robotName:string;
		
		/**
		 * 机器人段位配置ID
		 */		
		robotRankConfigId:number;
		
		/**
		 * 机器人配置ID
		 */		
		robotConfigId:number;
		
		/**
		 * 机器人展示信息配置ID,ArenaRobotShowConfig.id
		 */		
		robotShowId:number;
		
		/**
		 * 机器人战队科技等级
		 */		
		robotCaptainLevel:number;
		
		fight:number;
		
	}


}
