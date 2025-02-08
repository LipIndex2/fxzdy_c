declare module Vo.collectibles{
	
	/**
	 * 收藏品升级信息
	 * @author GameCreator
	 */	
	class CollectiblesUpLevelVo	{
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 收藏品信息
		 */		
		collectiblesVo:CollectiblesVo;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelC2S	{
		/**
		 * 收藏品配置Id
		 */		
		baseId:number;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelS2C	{
		content:Vo.collectibles.CollectiblesUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 收藏品激活信息
	 * @author GameCreator
	 */	
	class CollectiblesActiveVo	{
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 激活套装
	 * @author GameCreator
	 */	
	class ActiveSuitC2S	{
		/**
		 * 套装配置Id
		 */		
		suitId:number;
		
	}


	
	/**
	 * 激活套装
	 * @author GameCreator
	 */	
	class ActiveSuitS2C	{
		content:Vo.collectibles.CollectiblesSuitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 激活
	 * @author GameCreator
	 */	
	class ActiveC2S	{
		/**
		 * 收藏品配置Id
		 */		
		baseId:number;
		
	}


	
	/**
	 * 激活
	 * @author GameCreator
	 */	
	class ActiveS2C	{
		content:Vo.collectibles.CollectiblesActiveVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 收藏品升星信息
	 * @author GameCreator
	 */	
	class CollectiblesUpStarVo	{
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 收藏品信息
		 */		
		collectiblesVo:CollectiblesVo;
		
	}


	
	/**
	 * 收藏品信息
	 * @author GameCreator
	 */	
	class CollectiblesVo	{
		/**
		 * 唯一Id
		 */		
		id:number;
		
		/**
		 * 基础配置Id
		 */		
		baseId:number;
		
		/**
		 * 是否激活
		 */		
		active:boolean;
		
		/**
		 * 碎片数量
		 */		
		fragment:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 失效时间戳，>=0生效
		 */		
		expiredTime:number;
		
	}


	
	/**
	 * 收藏品套装信息
	 * @author GameCreator
	 */	
	class CollectiblesSuitVo	{
		/**
		 * 套装配置Id
		 */		
		suitId:number;
		
		/**
		 * 是否激活
		 */		
		activated:boolean;
		
		/**
		 * 当前激活星数
		 */		
		activateStarNum:number;
		
	}


	
	/**
	 * 收藏品奖励信息
	 * @author GameCreator
	 */	
	class CollectiblesRewardVo	{
		/**
		 * 收藏品配置Id
		 */		
		baseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 收藏品登录信息
	 * @author GameCreator
	 */	
	class CollectiblesLoginVo	{
		/**
		 * 收藏品信息列表
		 */		
		collectiblesVoList:Array<CollectiblesVo>;
		
		/**
		 * 收藏品Id-任务信息
		 */		
		collectiblesId2TaskVo:Object;
		
		/**
		 * 收藏品套装信息列表
		 */		
		suitVoList:Array<CollectiblesSuitVo>;
		
	}


	
	/**
	 * 升星
	 * @author GameCreator
	 */	
	class UpStarC2S	{
		/**
		 * 收藏品配置Id
		 */		
		baseId:number;
		
	}


	
	/**
	 * 升星
	 * @author GameCreator
	 */	
	class UpStarS2C	{
		content:Vo.collectibles.CollectiblesUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
