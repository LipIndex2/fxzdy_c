declare module table.chargerebate{
	class ChargeRebateConfig {
		/**
		 *最低登录天数
		 */
		public minLoginDays:number;
		/**
		 *天元宝券返利比例，百分比，即*100
		 */
		public chargeCouponPercent:number;
		/**
		 *源晶返利比例，百分比，即*100
		 */
		public bindDiamondPercent:number;
		/**
		 *天元圣纹积分返利比例(充值货币)，百分比，即*100
		 */
		public shengWenPercent:number;
	}
	class ChargeRebateConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class ChargeRebateRewardConfig {
		/**
		 *充值区间最小值，单位：分
		 */
		public minMoney:number;
		/**
		 *大奖
		 */
		public prize:Array<{k:any,v:any}>;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class ChargeRebateRuleConfig {
		public id:number;
		/**
		 *显示阶段
		 */
		public type:number;
		/**
		 *规则文本（支持富文本）
		 */
		public desc:string;
	}
	class OperationConfig {
		/**
		 *运营商id
		 */
		public id:number;
		/**
		 *运营商名称
		 */
		public name:string;
		/**
		 *时间段
		 */
		public timeStr:string;
	}
}
