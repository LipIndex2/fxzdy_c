declare module Vo.cost{
	
	/**
	 * 其他人扣费不足信息
	 * @author GameCreator
	 */	
	class OtherCostLackVo	{
		name:string;
		
		level:number;
		
		baseId:number;
		
	}


	
	/**
	 * 消耗结果
	 * @author GameCreator
	 */	
	class CostItemResult	{
		/**
		 * 物品id
		 */		
		baseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
		/**
		 * 更新信息体
		 */		
		contents:Object;
		
	}


	
	/**
	 * 扣费不足信息
	 * @author GameCreator
	 */	
	class CostLackVo	{
		baseId:number;
		
	}


	
	/**
	 * 消费且获得奖励
	 * @author GameCreator
	 */	
	class CostAndRewardVo	{
		/**
		 * 消费
		 */		
		costs:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewards:Array<Vo.reward.RewardResult>;
		
		/**
		 * 附加对象
		 */		
		addition:Object;
		
	}


	
	/**
	 * 扣费信息
	 * @author GameCreator
	 */	
	class CostItemVo	{
		/**
		 * 道具id
		 */		
		itemId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


}
