declare module table.dailysale{
	class DailySaleConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *每日特惠类型
		 */
		public type:string;
		/**
		 *充值Id
		 */
		public chargeGoodsId:string;
		/**
		 *组Id
		 */
		public groupId:number;
		/**
		 *第一行礼包描述
		 */
		public tip1:string;
	}
	class DailySaleFreeRewardConfig {
		/**
		 *唯一Id，即DailySaleConfig的Id
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
}
