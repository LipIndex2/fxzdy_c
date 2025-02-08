declare module table.mall{
	class MallCostRewardConfig {
		/**
		 *唯一Id，即MallGoodsConfig的Id
		 */
		public id:number;
		/**
		 *消耗，不填表示免费
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class MallGoodsConfig {
		/**
		 *商品Id
		 */
		public id:number;
		/**
		 *类型，参考"类型说明.md"文件的"MallGoodsType"
		 */
		public type:string;
		/**
		 *商品名称
		 */
		public name:string;
		/**
		 *商品图片
		 */
		public icon:string;
		/**
		 *商品充值Id，不填表示免费
		 */
		public chargeGoodsId:string;
		/**
		 *商品购买条件(推送礼包可不填)
		 */
		public buyConditions:Array<any>;
		/**
		 *商品限购类型(推送礼包可不填)，参考"类型说明.md"文件的"MallGoodsLimitBuyType"
		 */
		public limitBuyType:string;
		/**
		 *限购次数(推送礼包可不填)
		 */
		public buyLimit:number;
		/**
		 *折扣百分比(仅前端展示用)
		 */
		public discountShow:number;
		/**
		 *角标提示
		 */
		public markTip:string;
	}
	class MallPopupConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *组Id，同一组Id的礼包仅推送一个，不填不受影响
		 */
		public groupId:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *礼包类型 1升阶 2限购 3装备
		 */
		public type:number;
		/**
		 *礼包Id列表，即MallGoodsConfig的Id，注：条目不可重复
		 */
		public goodsIds:Array<any>;
		/**
		 *有效时长，单位：分钟
		 */
		public validMinutes:number;
		/**
		 *重置间隔天数(指礼包失效X天后可再次推送)，不填表示不重置
		 */
		public resetDays:number;
		/**
		 *调用英雄形象
		 */
		public iconPath:string;
		/**
		 *礼包说明文本
		 */
		public tips:string;
		/**
		 *广告语(装备描述)
		 */
		public adTip:string;
		/**
		 *广告语2(提升战力)
		 */
		public adTip2:string;
		/**
		 *标题图片
		 */
		public titlePath:string;
	}
}
