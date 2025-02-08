declare module Vo.dailysale{
	
	/**
	 * 每日特惠信息
	 * @author GameCreator
	 */	
	class DailySaleVo	{
		/**
		 * 组Id-已获得奖励的礼包集合
		 */		
		groupId2SaleIds:Object;
		
	}


	
	/**
	 * 每日特惠领取奖励信息
	 * @author GameCreator
	 */	
	class DailySaleRewardVo	{
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 本次获得奖励的特惠Id集合
		 */		
		saleIds:Array<number>;
		
	}


	
	/**
	 * 获取每日特惠信息
	 * @author GameCreator
	 */	
	class GetSaleInfoS2C	{
		content:Vo.dailysale.DailySaleVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取每日特惠奖励
	 * @author GameCreator
	 */	
	class ReceiveSaleRewardC2S	{
		/**
		 * 特惠配置Id
		 */		
		saleId:number;
		
	}


	
	/**
	 * 领取每日特惠奖励
	 * @author GameCreator
	 */	
	class ReceiveSaleRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
