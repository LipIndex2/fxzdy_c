declare module Vo.pet{
	
	/**
	 * 星灵信息vo
	 * @author GameCreator
	 */	
	class PetVo	{
		/**
		 * 唯一ID
		 */		
		id:number;
		
		/**
		 * 星灵配置ID
		 */		
		petBaseId:number;
		
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
		
	}


	
	/**
	 * 激活羁绊
	 * @author GameCreator
	 */	
	class ActiveGroupC2S	{
		/**
		 * 羁绊配置ID
		 */		
		groupId:number;
		
	}


	
	/**
	 * 激活羁绊
	 * @author GameCreator
	 */	
	class ActiveGroupS2C	{
		content:Vo.pet.PetGroupVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星灵升星
	 * @author GameCreator
	 */	
	class UpStarS2C	{
		content:Vo.pet.PetUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星灵升星
	 * @author GameCreator
	 */	
	class UpStarC2S	{
		/**
		 * 星灵配置ID
		 */		
		petBaseId:number;
		
	}


	
	/**
	 * 星灵宠物奖励信息vo
	 * @author GameCreator
	 */	
	class PetRewardVo	{
		/**
		 * 星灵宠物配置id
		 */		
		petBaseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 星灵升星vo
	 * @author GameCreator
	 */	
	class PetUpStarVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 星灵信息
		 */		
		petVo:PetVo;
		
	}


	
	/**
	 * 星灵升阶vo
	 * @author GameCreator
	 */	
	class PetUpStageVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 共享等级
		 */		
		shareLevel:number;
		
		/**
		 * 共享等阶
		 */		
		shareStage:number;
		
	}


	
	/**
	 * 星灵升级
	 * @author GameCreator
	 */	
	class UpLevelS2C	{
		content:Vo.pet.PetUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星灵羁绊信息
	 * @author GameCreator
	 */	
	class PetGroupVo	{
		/**
		 * 羁绊配置Id
		 */		
		groupId:number;
		
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
	 * 激活星灵
	 * @author GameCreator
	 */	
	class ActiveC2S	{
		/**
		 * 星灵配置ID
		 */		
		petBaseId:number;
		
	}


	
	/**
	 * 激活星灵
	 * @author GameCreator
	 */	
	class ActiveS2C	{
		content:Vo.pet.PetActiveVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星灵登录下发vo
	 * @author GameCreator
	 */	
	class PetLoginVo	{
		/**
		 * 共享等级
		 */		
		shareLevel:number;
		
		/**
		 * 共享等阶
		 */		
		shareStage:number;
		
		/**
		 * 星灵羁绊信息列表
		 */		
		petGroupVos:Array<PetGroupVo>;
		
		/**
		 * 星灵信息列表
		 */		
		petVos:Array<PetVo>;
		
	}


	
	/**
	 * 星灵激活vo
	 * @author GameCreator
	 */	
	class PetActiveVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 星灵升阶
	 * @author GameCreator
	 */	
	class UpStageS2C	{
		content:Vo.pet.PetUpStageVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星灵升级vo
	 * @author GameCreator
	 */	
	class PetUpLevelVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 共享等级
		 */		
		shareLevel:number;
		
	}


}
