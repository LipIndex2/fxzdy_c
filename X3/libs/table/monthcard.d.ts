declare module table.monthcard{
	class MonthCardAdditionConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *加成类型，参考"类型说明.md"文件的"MonthCardAdditionType"
		 */
		public type:string;
		/**
		 *参数
		 */
		public param:string;
		/**
		 *加成值
		 */
		public value:string;
	}
	class MonthCardAdditionDescConfig {
		/**
		 *加成类型，参考"类型说明.md"文件的"MonthCardAdditionType"
		 */
		public type:string;
		/**
		 *参数
		 */
		public desc:string;
		/**
		 *加成值
		 */
		public descRich:string;
	}
	class MonthCardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *类型，参考"类型说明.md"文件的"MonthCardType"
		 */
		public type:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *充值Id，即ChargeGoodsConfig的Id
		 */
		public chargeGoodsId:string;
		/**
		 *激活所需累充金额，>0生效，与chargeGoodsId互斥
		 */
		public activeChargeMoney:number;
		/**
		 *充值奖励，对应ChargeGoodsConfig不需要配置
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *每日奖励
		 */
		public dailyRewards:Array<{k:any,v:any}>;
		/**
		 *有效天数，终身卡不需要填
		 */
		public validDays:number;
		/**
		 *最高天数限制，终身卡不需要填
		 */
		public maxDaysLimit:number;
		/**
		 *特权加成列表，对应MonthCardAdditionConfig的Id，没有则配空
		 */
		public additionIds:Array<any>;
		/**
		 *折扣百分比(仅前端展示用)
		 */
		public discountShow:number;
		/**
		 *显示条件
		 */
		public displayVerify:Array<any>;
	}
	class MonthCardConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
}
