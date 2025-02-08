declare module Vo.talent{
	
	/**
	 * 天赋激活Vo
	 * @author GameCreator
	 */	
	class TalentActiveVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 激活的天赋ID
		 */		
		activeTalentId:number;
		
	}


	
	/**
	 * 一键激活天赋
	 * @author GameCreator
	 */	
	class OneKeyActiveTalentsS2C	{
		content:Vo.talent.TalentOneKeyActiveVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键激活天赋
	 * @author GameCreator
	 */	
	class OneKeyActiveTalentsC2S	{
		/**
		 * 升级数量
		 */		
		activeAmount:number;
		
	}


	
	/**
	 * 天赋登录下发数据
	 * @author GameCreator
	 */	
	class TalentLoginVo	{
		/**
		 * 已激活的天赋ID列表
		 */		
		activeTalentIds:Array<number>;
		
	}


	
	/**
	 * 天赋一键激活信息
	 * @author GameCreator
	 */	
	class TalentOneKeyActiveVo	{
		/**
		 * 激活的天赋Id
		 */		
		activeTalentIds:Array<number>;
		
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
	}


	
	/**
	 * 激活天赋
	 * @author GameCreator
	 */	
	class ActiveTalentC2S	{
		/**
		 * 激活的天赋ID
		 */		
		talentId:number;
		
	}


	
	/**
	 * 激活天赋
	 * @author GameCreator
	 */	
	class ActiveTalentS2C	{
		content:Vo.talent.TalentActiveVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
