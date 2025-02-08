declare module Vo.captain{
	
	/**
	 * 科技重置
	 * @author GameCreator
	 */	
	class CaptainResetS2C	{
		content:Vo.captain.CaptainResetVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 战队科技登录下发
	 * @author GameCreator
	 */	
	class CaptainLoginVo	{
		/**
		 * 科技核心等级
		 */		
		captainCoreLevel:number;
		
		/**
		 * 战队科技信息MAP,战队科技ID-等级
		 */		
		captainMap:Object;
		
		/**
		 * 重置次数
		 */		
		resetTimes:number;
		
	}


	
	/**
	 * 战队科技升级vo
	 * @author GameCreator
	 */	
	class CaptainUpLevelVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 战队科技ID
		 */		
		captainId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
	}


	
	/**
	 * 科技核心升级
	 * @author GameCreator
	 */	
	class CaptainCoreUpLevelS2C	{
		content:Vo.captain.CaptainCoreUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 战队科技重置vo
	 * @author GameCreator
	 */	
	class CaptainResetVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 重置后的科技信息MAP
		 */		
		captainMap:Object;
		
		/**
		 * 重置次数
		 */		
		resetTimes:number;
		
	}


	
	/**
	 * 职业核心升级vo
	 * @author GameCreator
	 */	
	class CaptainCoreUpLevelVo	{
		/**
		 * 升级消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 升级后职业核心等级
		 */		
		captainCoreLevel:number;
		
	}


	
	/**
	 * 战队科技升级
	 * @author GameCreator
	 */	
	class CaptainUpLevelC2S	{
		/**
		 * 战队科技ID
		 */		
		captainId:number;
		
	}


	
	/**
	 * 战队科技升级
	 * @author GameCreator
	 */	
	class CaptainUpLevelS2C	{
		content:Vo.captain.CaptainUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
