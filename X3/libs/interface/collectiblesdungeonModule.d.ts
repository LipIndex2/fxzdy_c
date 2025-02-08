declare module Vo.collectiblesdungeon{
	
	/**
	 * 收藏品领取奖励vo
	 * @author GameCreator
	 */	
	class CollectiblesDungeonStarVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 玩家收藏品玩法信息
		 */		
		collectiblesDungeonVo:CollectiblesDungeonVo;
		
	}


	
	/**
	 * @author lrs
	 * @author GameCreator
	 */	
	class CollectiblesDungeonChallengeResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 玩家宠物副本信息
		 */		
		playerInfoVo:CollectiblesDungeonVo;
		
		/**
		 * 条件1是否获得星星
		 */		
		star1:number;
		
		/**
		 * 条件2是否获得星星
		 */		
		star2:number;
		
		/**
		 * 条件3是否获得星星
		 */		
		star3:number;
		
	}


	
	/**
	 * 
	 * @author GameCreator
	 */	
	class ItemRewardC2S	{
		id:number;
		
		star:number;
		
	}


	
	/**
	 * 
	 * @author GameCreator
	 */	
	class ItemRewardS2C	{
		content:Vo.collectiblesdungeon.CollectiblesDungeonStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取收藏品玩法信息
	 * @author GameCreator
	 */	
	class CollectiblesDungeonInfoS2C	{
		content:Vo.collectiblesdungeon.CollectiblesDungeonVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 看广告增加次数
	 * @author GameCreator
	 */	
	class AddAdvertCountS2C	{
		content:Vo.collectiblesdungeon.CollectiblesDungeonAdvertVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * @author lrs
	 * @author GameCreator
	 */	
	class CollectiblesDungeonVo	{
		/**
		 * 玩家ID
		 */		
		id:number;
		
		/**
		 * 关卡数据
		 */		
		barrierInfoVo:Object;
		
		/**
		 * 章节奖励数据
		 */		
		chapterStarVo:Object;
		
		/**
		 * 可挑战次数
		 */		
		challengeCount:number;
		
		/**
		 * 下次每日重置时间
		 */		
		nextDailyResetTime:number;
		
		/**
		 * 每日可扫荡次数
		 */		
		sweepCount:number;
		
		/**
		 * 每日看广告次数
		 */		
		dailyAdvertChallengeCount:number;
		
	}


	
	/**
	 * 收藏品扫荡vo
	 * @author GameCreator
	 */	
	class CollectiblesDungeonSweepVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 玩家收藏品玩法信息
		 */		
		collectiblesDungeonVo:CollectiblesDungeonVo;
		
	}


	
	/**
	 * 挑战收藏品玩法
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 收藏品玩法关卡ID
		 */		
		collectiblesDungeonConfigId:number;
		
	}


	
	/**
	 * 挑战收藏品玩法
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 收藏品玩法扫荡
	 * @author GameCreator
	 */	
	class SweepS2C	{
		content:Vo.collectiblesdungeon.CollectiblesDungeonSweepVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * @author lrs
	 * @author GameCreator
	 */	
	class CollectiblesDungeonChapterStarInfo	{
		/**
		 * 章节id
		 */		
		id:number;
		
		/**
		 * 是否领取10星奖励
		 */		
		rewardsOne:boolean;
		
		/**
		 * 是否领取20星奖励
		 */		
		rewardsTwo:boolean;
		
		/**
		 * 是否领取30星奖励
		 */		
		rewardsThree:boolean;
		
	}


	
	/**
	 * @author lrs
	 * @author GameCreator
	 */	
	class CollectiblesDungeonBarrierVo	{
		/**
		 * 唯一Id,对应配置表的id
		 */		
		id:number;
		
		/**
		 * 获得的星级
		 */		
		star:number;
		
	}


	
	/**
	 * 收藏品扫荡vo
	 * @author GameCreator
	 */	
	class CollectiblesDungeonAdvertVo	{
		/**
		 * 可挑战次数
		 */		
		challengeCount:number;
		
		/**
		 * 每日看广告次数
		 */		
		dailyAdvertChallengeCount:number;
		
	}


}
