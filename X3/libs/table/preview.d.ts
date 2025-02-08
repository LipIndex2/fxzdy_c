declare module table.preview{
	class PreviewConfig {
		/**
		 *功能预告
		 */
		public id:number;
		/**
		 *系统类型
		 */
		public systemType:string;
		/**
		 *功能名
		 */
		public name:string;
		/**
		 *解锁描述
		 */
		public desc:string;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *解锁条件
		 */
		public type:number;
		/**
		 *条件id
		 */
		public condition:number;
		/**
		 *排序
		 */
		public sort:number;
	}
}
