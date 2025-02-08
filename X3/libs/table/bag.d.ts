declare module table.bag{
	class BagConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *背包中的道具类型 enum 数组
[] = 默认所有类型
		 */
		public typeNumberArray:Array<any>;
		/**
		 *容量
		 */
		public capacity:number;
		/**
		 *包裹名
		 */
		public name:string;
		/**
		 *是否对外显示
		 */
		public showFlag:boolean;
		/**
		 *解锁的等级限制
		 */
		public level:number;
		/**
		 *对应商店id
		 */
		public storeId:number;
		/**
		 *是否需要检查红点
		 */
		public radPoint:number;
	}
}
