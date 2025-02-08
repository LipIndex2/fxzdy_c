declare module Vo.order{
	
	/**
	 * 充值推送vo
	 * @author GameCreator
	 */	
	class ChargePushVo	{
		/**
		 * 奖励结果，可能会为空（无充值奖励）
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 充值额外奖励加成
		 */		
		additionalRewards:Array<Vo.reward.RewardResult>;
		
		/**
		 * 商品充值记录
		 */		
		chargeIds:Array<string>;
		
		/**
		 * 商品id
		 */		
		chargeGoodsId:string;
		
		/**
		 * 充值金额
		 */		
		money:number;
		
		/**
		 * 年
		 */		
		year:number;
		
		/**
		 * 月
		 */		
		month:number;
		
		/**
		 * 当月充值总额
		 */		
		monthTotalMoney:number;
		
	}


	
	/**
	 * 充值记录登录下发
	 * @author GameCreator
	 */	
	class ChargeRecordVo	{
		/**
		 * 商品充值记录
		 */		
		charges:Array<string>;
		
		/**
		 * 商品Id-充值数量
		 */		
		chargeMap:Object;
		
		/**
		 * 商品Id-充值数量，不包含优惠券购买
		 */		
		realChargeMap:Object;
		
		/**
		 * 年
		 */		
		year:number;
		
		/**
		 * 月
		 */		
		month:number;
		
		/**
		 * 当月充值总额
		 */		
		monthTotalMoney:number;
		
	}


	
	/**
	 * 创建订单
	 * @author GameCreator
	 */	
	class CreateOrderC2S	{
		/**
		 * 商品id,ChargeGoodsConfig.id
		 */		
		goodsId:string;
		
	}


	
	/**
	 * 创建订单
	 * @author GameCreator
	 */	
	class CreateOrderS2C	{
		content:Vo.order.OrderVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取充值信息
	 * @author GameCreator
	 */	
	class ChargeRecordS2C	{
		content:Vo.order.ChargeRecordVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 使用宝券充值结构
	 * @author GameCreator
	 */	
	class CouponChargeVo	{
		/**
		 * 商品id
		 */		
		chargeGoodsId:string;
		
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励结果
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 充值额外奖励加成
		 */		
		additionalRewards:Array<Vo.reward.RewardResult>;
		
		/**
		 * 商品充值记录
		 */		
		chargeIds:Array<string>;
		
	}


	
	/**
	 * 使用宝券充值
	 * @author GameCreator
	 */	
	class ChargeUseCouponC2S	{
		/**
		 * 商品id,ChargeGoodsConfig.id
		 */		
		goodsId:string;
		
	}


	
	/**
	 * 使用宝券充值
	 * @author GameCreator
	 */	
	class ChargeUseCouponS2C	{
		content:Vo.order.CouponChargeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 充值订单vo
	 * @author GameCreator
	 */	
	class OrderVo	{
		/**
		 * 订单序列号
		 */		
		serial:number;
		
		/**
		 * 充值金额
		 */		
		money:number;
		
		/**
		 * 商品id,ChargeGoodsConfig.goodsId
		 */		
		goods:string;
		
		/**
		 * 充值透传信息，透传给sdk
		 */		
		addition:string;
		
	}


}
