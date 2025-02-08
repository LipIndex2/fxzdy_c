declare module Vo.currency{
	
	/**
	 * 玩家钱包数据的VO
	 * @author GameCreator
	 */	
	class WalletVo	{
		/**
		 * 常规钻石
		 */		
		diamond:number;
		
		/**
		 * 宝券，充值券
		 */		
		chargeCoupon:number;
		
		/**
		 * 金币
		 */		
		gold:number;
		
	}


	
	/**
	 * 扣费/收益(铜币/金币/礼券/內币/玉石)信息返回
	 * @author GameCreator
	 */	
	class Currency	{
		/**
		 * 货币物品码
		 */		
		code:number;
		
		/**
		 * 变更值(增加正数，扣减负数)
		 */		
		alter:number;
		
		/**
		 * 当前值(变更之后的值)
		 */		
		current:number;
		
	}


}
