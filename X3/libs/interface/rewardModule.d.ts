declare module Vo.reward{
	
	/**
	 * 奖励
	 * @author GameCreator
	 */	
	class Reward	{
		/**
		 * 奖励标识(例如:道具基础ID)
		 */		
		code:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 奖励扣费值
	 * @author GameCreator
	 */	
	class RewardCostValue	{
	}


	/**
	 * 奖励加成定义
	 * @author GameCreator
	 */	
	enum AdditionType
	{
		/**
		 * 防沉迷奖励加成
		 */		
		FATIGUE = 0
	}


	
	/**
	 * 奖励结果
	 * @author GameCreator
	 */	
	class RewardResult	{
		/**
		 * 物品id
		 */		
		baseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
		/**
		 * 更新信息体,不同物品类型返回结构可能不一样,具体类型询问对应功能的服务端
		 */		
		contents:Object;
		
		/**
		 * 前端提示该奖励是否通过邮件发送,默认false
		 */		
		mail:boolean;
		
	}


}
