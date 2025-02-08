declare module Vo.item{
	
	/**
	 * 自选宝箱选项信息
	 * @author GameCreator
	 */	
	class OptionBoxVo	{
		/**
		 * 选择箱子里奖励的索引，从0开始
		 */		
		index:number;
		
		/**
		 * 数量
		 */		
		count:number;
		
	}


	
	/**
	 * 选择宝箱中的奖励
	 * @author GameCreator
	 */	
	class SelectBoxRewardC2S	{
		/**
		 * 道具唯一id
		 */		
		baseId:number;
		
		/**
		 * 选择的箱子id
		 */		
		boxId:number;
		
		/**
		 * 选择箱子里奖励的索引，从0开始
		 */		
		index:number;
		
		/**
		 * 使用次数
		 */		
		count:number;
		
	}


	
	/**
	 * 选择宝箱中的奖励
	 * @author GameCreator
	 */	
	class SelectBoxRewardS2C	{
		content:Vo.item.UseItemResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 选择宝箱多个奖励
	 * @author GameCreator
	 */	
	class SelectMultipleBoxRewardS2C	{
		content:Vo.item.UseItemResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 道具登陆下发信息
	 * @author GameCreator
	 */	
	class ItemLoginInfoVo	{
		/**
		 * 道具信息
		 */		
		items:Array<ItemVo>;
		
		/**
		 * 大数据道具
		 */		
		longItems:Array<LongItemVo>;
		
	}


	/**
	 * 道具过期时间类型
	 * @author GameCreator
	 */	
	enum ItemExpireType
	{
		/**
		 * 指定时间
		 */		
		MANUAL = 0,
		/**
		 * 相对时间(秒)
		 */		
		RELATIVE = 3,
		/**
		 * X天后的X点过期
		 */		
		DAY_TIME = 6,
	}


	
	/**
	 * 使用指定道具的扣费和奖励结果
	 * @author GameCreator
	 */	
	class UseItemResultVo	{
		/**
		 * 奖励结果
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 扣费结果
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
	}


	
	/**
	 * 道具vo
	 * @author GameCreator
	 */	
	class CommonItemVo	{
		id:number;
		
		/**
		 * 拥有者
		 */		
		owner:number;
		
		/**
		 * 当前数量
		 */		
		amount:number;
		
		/**
		 * 基础道具标识
		 */		
		baseId:number;
		
	}


	
	/**
	 * 大数据道具
	 * @author GameCreator
	 */	
	class LongItemVo	{
		/**
		 * baseId
		 */		
		baseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 道具信息
	 * @author GameCreator
	 */	
	class ItemVo	{
		/**
		 * baseId
		 */		
		baseId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 道具碎片合成
	 * @author GameCreator
	 */	
	class CompoundS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 道具碎片合成
	 * @author GameCreator
	 */	
	class CompoundC2S	{
		/**
		 * 道具碎片合成奖励Id
		 */		
		rewardId:number;
		
		/**
		 * 合成数量
		 */		
		num:number;
		
	}


	
	/**
	 * 选择宝箱多个奖励
	 * @author GameCreator
	 */	
	class SelectMultipleBoxRewardC2S	{
		/**
		 * 道具配置ID
		 */		
		baseId:number;
		
		/**
		 * 宝箱配置ID
		 */		
		boxId:number;
		
		/**
		 * 自选宝箱选项信息列表
		 */		
		optionBoxVos:Array<Vo.item.OptionBoxVo>;
		
	}


	
	/**
	 * 选择限制开放宝箱中的奖励
	 * @author GameCreator
	 */	
	class SelectLimitedBoxRewardC2S	{
		/**
		 * 道具唯一id
		 */		
		baseId:number;
		
		/**
		 * 选择的箱子id
		 */		
		boxId:number;
		
		/**
		 * 选择箱子里奖励的索引，从0开始
		 */		
		index:number;
		
		/**
		 * 使用次数
		 */		
		count:number;
		
	}


	
	/**
	 * 选择限制开放宝箱中的奖励
	 * @author GameCreator
	 */	
	class SelectLimitedBoxRewardS2C	{
		content:Vo.item.UseItemResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 根据配置使用道具
	 * @author GameCreator
	 */	
	class UseItemByBaseIdC2S	{
		/**
		 * 道具baseId
		 */		
		itemBaseId:number;
		
		/**
		 * 使用次数
		 */		
		count:number;
		
	}


	
	/**
	 * 根据配置使用道具
	 * @author GameCreator
	 */	
	class UseItemByBaseIdS2C	{
		content:Vo.item.UseItemResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
