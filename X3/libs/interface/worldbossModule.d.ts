declare module Vo.worldboss{
	
	/**
	 * 获取所有世界BOSS信息
	 * @author GameCreator
	 */	
	class LoadAllBossInfoS2C	{
		content:Array<Vo.worldboss.WorldBossBriefVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取世界BOSS服务器奖励
	 * @author GameCreator
	 */	
	class DrawServerRewardC2S	{
		/**
		 * 世界BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


	
	/**
	 * 领取世界BOSS服务器奖励
	 * @author GameCreator
	 */	
	class DrawServerRewardS2C	{
		content:Vo.worldboss.DrawWorldBossServerRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取世界BOSS服务器奖励vo
	 * @author GameCreator
	 */	
	class DrawWorldBossServerRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领奖的WorldBossServerProgressConfig.id
		 */		
		serverProgressConfigId:number;
		
	}


	
	/**
	 * 获取世界BOSS信息
	 * @author GameCreator
	 */	
	class LoadWorldBossInfoC2S	{
		bossConfigId:number;
		
	}


	
	/**
	 * 获取世界BOSS信息
	 * @author GameCreator
	 */	
	class LoadWorldBossInfoS2C	{
		content:Vo.worldboss.WorldBossVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取排行榜信息
	 * @author GameCreator
	 */	
	class LoadRankListC2S	{
		/**
		 * 世界BOSS配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 页码,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取排行榜信息
	 * @author GameCreator
	 */	
	class LoadRankListS2C	{
		content:Vo.worldboss.WorldBossRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 世界BOSS排名信息
	 * @author GameCreator
	 */	
	class WorldBossRankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 排行榜值
		 */		
		value:number;
		
		/**
		 * 附加值
		 */		
		addition:number;
		
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
	 * 领取世界BOSS排名奖励
	 * @author GameCreator
	 */	
	class DrawRankRewardC2S	{
		/**
		 * 世界BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


	
	/**
	 * 领取世界BOSS排名奖励
	 * @author GameCreator
	 */	
	class DrawRankRewardS2C	{
		content:Vo.worldboss.DrawWorldBossRankRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战世界BOSS
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 世界BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


	
	/**
	 * 挑战世界BOSS
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 世界BOSS信息
	 * @author GameCreator
	 */	
	class WorldBossVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * boss配置id
		 */		
		bossConfigId:number;
		
		/**
		 * 击杀时间,没有则为0
		 */		
		killTime:number;
		
		/**
		 * boss受到总伤害
		 */		
		bossTotalBeHurt:number;
		
		/**
		 * boss总血量
		 */		
		bossTotalHp:number;
		
		/**
		 * 玩家BOSS信息
		 */		
		playerWorldBossVo:PlayerWorldBossVo;
		
	}


	
	/**
	 * 世界BOSS排行榜信息
	 * @author GameCreator
	 */	
	class WorldBossRankingVo	{
		/**
		 * 当前名次
		 */		
		rank:number;
		
		/**
		 * 玩家当前排行唯一ID
		 */		
		id:number;
		
		/**
		 * 单次最高伤害
		 */		
		hurt:number;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<WorldBossRankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 世界BOSS挑战vo
	 * @author GameCreator
	 */	
	class WorldBossChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 挑战奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * boss配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 今日挑战次数
		 */		
		todayChallengeTimes:number;
		
		/**
		 * 本次挑战伤害
		 */		
		hurt:number;
		
		/**
		 * boss当前收到总伤害
		 */		
		bossTotalBeHurt:number;
		
		/**
		 * 当前排名,没有则为-1
		 */		
		rank:number;
		
	}


	
	/**
	 * 领取世界boss排名奖励信息
	 * @author GameCreator
	 */	
	class DrawWorldBossRankRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领奖的BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


	
	/**
	 * 世界BOSS玩家信息
	 * @author GameCreator
	 */	
	class PlayerWorldBossVo	{
		/**
		 * BOSS挑战次数
		 */		
		bossChallengeTimesMap:Object;
		
		/**
		 * 世界BOSS单次挑战最高伤害MAP,boss配置ID-伤害值
		 */		
		bossHurtMap:Object;
		
		/**
		 * 世界BOSS历史最高排名MAP,boss配置ID-排名
		 */		
		bossMaxRankMap:Object;
		
		/**
		 * BOSS排名奖励领取MAP, boss配置ID-是否已领奖
		 */		
		drawRankRewardMap:Object;
		
		/**
		 * BOSS服务器奖励领取MAP, WorldBossServerProgressConfig.id-是否已领奖
		 */		
		drawServerRewardMap:Object;
		
	}


	
	/**
	 * 世界BOSS被击杀信息Vo
	 * @author GameCreator
	 */	
	class WorldBossKilledVo	{
		/**
		 * 世界BOSS配置Id
		 */		
		bossConfigId:number;
		
		/**
		 * 击杀时间
		 */		
		killTime:number;
		
	}


	
	/**
	 * 世界BOSS简要信息vo
	 * @author GameCreator
	 */	
	class WorldBossBriefVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * boss配置id
		 */		
		bossConfigId:number;
		
		/**
		 * 击杀时间,没有则为0
		 */		
		killTime:number;
		
		/**
		 * boss总血量
		 */		
		bossTotalHp:number;
		
	}


}
