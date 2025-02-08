declare module table.condition{
	class ConditionConfig {
		/**
		 *条件枚举，见服务端的 
enum PlayerVerifyType
		 */
		public id:string;
		/**
		 *建筑锁上的显示文本  ${key0}  ${key1}
		 */
		public title:string;
		/**
		 *解锁详情消息 ${key0}
		 */
		public unlockTxt:string;
		/**
		 *未达成的提示消息  ${key0}  ${key1} 最大key表示显示模块名
		 */
		public message:string;
		/**
		 *跳转
		 */
		public jumpId:number;
	}
}
