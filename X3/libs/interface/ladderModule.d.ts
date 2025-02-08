declare module Vo.ladder{
	
	/**
	 * 序列校验登录下发
	 * @author GameCreator
	 */	
	class LadderLoginVo	{
		/**
		 * 所有序列校验进度MAP,序列类型-通关层数
		 */		
		ladderMap:Object;
		
	}


	
	/**
	 * 序列校验首通信息
	 * @author GameCreator
	 */	
	class LadderFirstPassVo	{
		/**
		 * 序列校验配置Id
		 */		
		ladderId:number;
		
		/**
		 * 玩家信息
		 */		
		playerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 首通时间戳
		 */		
		firstPassTime:number;
		
	}


	
	/**
	 * 序列挑战结果Vo
	 * @author GameCreator
	 */	
	class LadderChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 通关奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 序列配置ID
		 */		
		ladderConfigId:number;
		
	}


	
	/**
	 * 获取序列排行前几名
	 * @author GameCreator
	 */	
	class LoadTopLadderC2S	{
		/**
		 * 序列类型
		 */		
		ladderType:number;
		
	}


	
	/**
	 * 获取序列排行前几名
	 * @author GameCreator
	 */	
	class LoadTopLadderS2C	{
		content:Array<Vo.ranking.RankItemVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战
	 * @author GameCreator
	 */	
	class ChallengeLadderC2S	{
		/**
		 * 序列校验配置ID
		 */		
		ladderConfigId:number;
		
	}


	
	/**
	 * 挑战
	 * @author GameCreator
	 */	
	class ChallengeLadderS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
