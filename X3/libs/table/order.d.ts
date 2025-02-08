declare module table.order{
	class ChargeAgeLimitConfig {
		/**
		 *年龄
		 */
		public id:number;
		/**
		 *单次最大金额
		 */
		public maxOnce:number;
		/**
		 *每月累计最大金额
		 */
		public maxOneMonth:number;
	}
	class ChargeConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class ChargeGoodsConfig {
		/**
		 *唯一Id,游戏内使用
		 */
		public id:string;
		/**
		 *唯一商品ID,对接平台方使用
		 */
		public goodsId:string;
		/**
		 *商品展示名称(平台方也使用)
		 */
		public goodsName:string;
		/**
		 *商品类型，用来区分充值类型，以判断充值商品当前能否充值
		 */
		public goodsType:string;
		/**
		 *币种 
		 */
		public currencyCode:string;
		/**
		 *价格，分
		 */
		public price:number;
		/**
		 *如果使用充值券充值需要消耗的数量
		 */
		public couponAmount:number;
		/**
		 *充值奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *特效
		 */
		public effects:any;
		/**
		 *首冲额外奖励
		 */
		public firstExtraRewards:Array<{k:any,v:any}>;
		/**
		 *附赠奖励
		 */
		public extraRewards:Array<{k:any,v:any}>;
		/**
		 *充值获得的VIP经验
		 */
		public vipExp:number;
		/**
		 *后台描述
		 */
		public describe:string;
		/**
		 *商品图片
		 */
		public goodsUrl:string;
	}
}
