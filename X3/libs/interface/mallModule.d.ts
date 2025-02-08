declare module Vo.mall{
	
	/**
	 * 商城信息
	 * @author GameCreator
	 */	
	class MallVo	{
		/**
		 * 唯一Id
		 */		
		id:number;
		
		/**
		 * 商品Id-购买数量
		 */		
		goodsId2BuyNum:Object;
		
		/**
		 * 商品ID-广告购买数量
		 */		
		goodsId2AdvertBuyNum:Object;
		
		/**
		 * 类型-刷新时间戳
		 */		
		limitType2RefreshTime:Object;
		
	}


	
	/**
	 * 获取商城信息
	 * @author GameCreator
	 */	
	class GetMallInfoC2S	{
		/**
		 * 商品类型
		 */		
		type:number;
		
	}


	
	/**
	 * 获取商城信息
	 * @author GameCreator
	 */	
	class GetMallInfoS2C	{
		content:Vo.mall.MallVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 购买商品
	 * @author GameCreator
	 */	
	class BuyC2S	{
		/**
		 * 商品Id
		 */		
		goodsId:number;
		
		/**
		 * 是否广告购买
		 */		
		advert:boolean;
		
	}


	
	/**
	 * 购买商品
	 * @author GameCreator
	 */	
	class BuyS2C	{
		content:Vo.mall.MallBuyVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 商城登录下发信息
	 * @author GameCreator
	 */	
	class MallLoginVo	{
		/**
		 * 推送礼包Id-过期时间戳
		 */		
		popupId2ExpiredTime:Object;
		
		/**
		 * 商城信息列表
		 */		
		mallVos:Array<MallVo>;
		
	}


	
	/**
	 * 商城购买商品信息
	 * @author GameCreator
	 */	
	class MallBuyVo	{
		/**
		 * 商品Id
		 */		
		goodsId:number;
		
		/**
		 * 消耗信息
		 */		
		costResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


}
