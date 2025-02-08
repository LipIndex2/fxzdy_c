declare module table.systemsetting{
	class SystemSettingRemindConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *客户端提醒类型 | 前端 enum
		 */
		public type:string;
		/**
		 *标题名
		 */
		public name:string;
		/**
		 *提醒内容
		 */
		public content:string;
	}
}
