declare module table.jump{
	class JumpConfig {
		/**
		 *唯一ID
问客户端，不允许删减
		 */
		public id:number;
		/**
		 *处理方式(小写)
		 */
		public type:string;
		/**
		 *处理关键字（uiKey）
		 */
		public keyName:string;
		/**
		 *需要已解锁模块 | 用来限制模块开启
		 */
		public needModuleName:string;
		/**
		 *图标路径
		 */
		public mainPage:string;
		/**
		 *图标名称
		 */
		public pageName:string;
		/**
		 *打开参数
		 */
		public args:any;
		/**
		 *打开的配置id
		 */
		public openConfigId:number;
	}
}
