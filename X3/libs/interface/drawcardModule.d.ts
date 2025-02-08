declare module Vo.drawcard{
	
	/**
	 * 宠物抽卡返回
	 * @author GameCreator
	 */	
	class PetDrawCardVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 随机的全部物品
		 */		
		itemAllList:Array<DrawCardRewardVo>;
		
		/**
		 * 宠物总的抽卡次数
		 */		
		totalPetDrawCardTimes:number;
		
		/**
		 * 宠物的抽卡轮次id
		 */		
		drawCardPetRoundId:number;
		
		/**
		 * 宠物抽卡奖励倍数
		 */		
		petTimesRate:number;
		
	}


	
	/**
	 * 登录获取抽卡数据
	 * @author GameCreator
	 */	
	class DrawCardInfoS2C	{
		content:Vo.drawcard.DrawCardLoginVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 抽卡返回的物品信息
	 * @author GameCreator
	 */	
	class DrawCardRewardVo	{
		/**
		 * 奖励标识(例如:道具基础ID)
		 */		
		code:number;
		
		/**
		 * 对应真实奖励的基础ID
		 */		
		baseId:number;
		
		/**
		 * 出现的数量
		 */		
		amount:number;
		
		/**
		 * 真实获得数量
		 */		
		realAmount:number;
		
	}


	
	/**
	 * 招募登录下发数据
	 * @author GameCreator
	 */	
	class DrawCardLoginVo	{
		/**
		 * 宠物总的抽卡次数
		 */		
		totalPetDrawCardTimes:number;
		
		/**
		 * 宠物的抽卡轮次id
		 */		
		drawCardPetRoundId:number;
		
		/**
		 * 宠物抽卡奖励倍数
		 */		
		petTimesRate:number;
		
	}


	
	/**
	 * 宠物抽卡
	 * @author GameCreator
	 */	
	class PetDrawCardC2S	{
		/**
		 * 奖励倍数
		 */		
		times:number;
		
	}


	
	/**
	 * 宠物抽卡
	 * @author GameCreator
	 */	
	class PetDrawCardS2C	{
		content:Vo.drawcard.PetDrawCardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
