declare module Vo.shop{
	
	/**
	 * 购买商品
	 * @author GameCreator
	 */	
	class BuyC2S	{
		/**
		 * 商品ID,对应ShopGoodsConfig#id
		 */		
		goodsId:number;
		
		/**
		 * 购买数量
		 */		
		count:number;
		
		/**
		 * 是否为广告购买
		 */		
		advert:boolean;
		
	}


	
	/**
	 * 购买商品
	 * @author GameCreator
	 */	
	class BuyS2C	{
		content:Vo.shop.ShopBuyVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 手动刷新商品
	 * @author GameCreator
	 */	
	class ManualRefreshGoodsC2S	{
		/**
		 * 商店ID,对应ShopConfig#id
		 */		
		shopId:number;
		
	}


	
	/**
	 * 手动刷新商品
	 * @author GameCreator
	 */	
	class ManualRefreshGoodsS2C	{
		content:Vo.shop.ShopRefreshVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取商店列表
	 * @author GameCreator
	 */	
	class LoadShopListS2C	{
		content:Array<Vo.shop.ShopVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 商店刷新信息
	 * @author GameCreator
	 */	
	class ShopRefreshVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 商店信息
		 */		
		shopVo:ShopVo;
		
	}


	
	/**
	 * 获取商店信息
	 * @author GameCreator
	 */	
	class LoadShopInfoC2S	{
		/**
		 * 商店ID,对应ShopConfig#id
		 */		
		shopId:number;
		
	}


	
	/**
	 * 获取商店信息
	 * @author GameCreator
	 */	
	class LoadShopInfoS2C	{
		content:Vo.shop.ShopVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 商店信息
	 * @author GameCreator
	 */	
	class ShopVo	{
		/**
		 * 商店ID
		 */		
		shopId:number;
		
		/**
		 * 刷新的商品列表,如果商店配置为不需要刷新商品则前端直接读商品配置表即可,如配置商店为永不刷新则商品直接读商品配置表即可
		 */		
		goodsList:Array<number>;
		
		/**
		 * 商品购买次数,商品ID-商品购买次数
		 */		
		goodsBuyTimesMap:Object;
		
		/**
		 * 商品广告购买次数,商品ID-广告购买次数
		 */		
		advertBuyTimesMap:Object;
		
		/**
		 * 下次刷新时间,没有则为0
		 */		
		nextRefreshTime:number;
		
		/**
		 * 手动刷新次数
		 */		
		manualRefreshTimes:number;
		
	}


	
	/**
	 * 商店登录下发内容
	 * @author GameCreator
	 */	
	class ShopLoginVo	{
		/**
		 * 商店信息列表
		 */		
		shopVos:Array<ShopVo>;
		
	}


	
	/**
	 * 商店购买信息
	 * @author GameCreator
	 */	
	class ShopBuyVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


}
