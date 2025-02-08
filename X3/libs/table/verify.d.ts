declare module table.verify{
	class AutoTriggerConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *自动触发条件
		 */
		public verifyModels:Array<any>;
		/**
		 *达成后触发的行为
		 */
		public action:number;
		/**
		 *行为参数
		 */
		public actionParamStr:string;
	}
	class ModuleEntranceConfig {
		/**
		 *系统类型,SystemType或者活动类型ActivityType
		 */
		public id:string;
		/**
		 *类型1功能 2活动
		 */
		public type:number;
		/**
		 *入口UI名称
		 */
		public uiName:string;
		/**
		 *入口组件路径
		 */
		public itemPath:string;
	}
	class PlayerSystemOpenConfig {
		/**
		 *系统类型,SystemType
		 */
		public id:string;
		/**
		 *解锁条件
		 */
		public conditions:Array<any>;
		/**
		 *未解锁的公开文本
		 */
		public lockDesc:string;
		/**
		 *开服天数
		 */
		public serverOpenDays:number;
		/**
		 *可见条件文本
		 */
		public seeVerify:string;
		/**
		 *iOS审核是否隐藏
		 */
		public iosExamineHide:number;
		/**
		 *审核是否隐藏
		 */
		public examineHide:number;
		/**
		 *跳转功能id
@JumpConfig.id
		 */
		public jumpId:number;
		/**
		 *是否显示新功能开放
		 */
		public showOpen:boolean;
		/**
		 *显示名字
		 */
		public showName:string;
		/**
		 *图标资源路径
		 */
		public icon_path:string;
	}
}
