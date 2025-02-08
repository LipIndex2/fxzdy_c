declare module table.shop{
	class ShopConfig {
		/**
		 *商店ID
		 */
		public id:number;
		/**
		 *商店刷新类型
		 */
		public refreshType:string;
		/**
		 *商店开放条件,针对玩家个人的开放条件
		 */
		public openVerify:Array<any>;
		/**
		 *客户端显示刷新
		 */
		public refreshStr:string;
		/**
		 *商店名字
		 */
		public shopName:string;
		/**
		 *客户端展示购买货币
		 */
		public currency:Array<any>;
		/**
		 *客户端图标
		 */
		public icon:string;
		/**
		 *客户端选中图标
		 */
		public iconSelect:string;
		/**
		 *整合到客户端页签，或由独立入口进入
		 */
		public isInShop:number;
	}
	class ShopGoodsConfig {
		/**
		 *商品ID
		 */
		public id:number;
		/**
		 *所属商店配置ID
		 */
		public shopId:number;
		/**
		 *商品内容
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *商品扣费,配空则为免费商品
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *商品购买条件
		 */
		public buyConditions:Array<any>;
		/**
		 *商品限购类型
		 */
		public limitBuyType:string;
		/**
		 *限购次数
		 */
		public buyTimesLimit:number;
		/**
		 *显示条件
		 */
		public displayVerify:Array<any>;
		/**
		 *折扣
		 */
		public discount:number;
		/**
		 *商品标签
		 */
		public label:number;
		/**
		 *商品名字
		 */
		public name:string;
		/**
		 *商品排序
		 */
		public sort:number;
	}
	class ShopGoodsLimitBuyConfig {
		/**
		 *限购类型
		 */
		public id:string;
		/**
		 *客户端显示限购用
		 */
		public refreshStr:string;
	}
	class ShopManualRefreshConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *商店ID
		 */
		public shopId:number;
		/**
		 *刷新次数
		 */
		public refreshTimes:number;
		/**
		 *消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
}
