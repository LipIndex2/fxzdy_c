declare module table.vip{
	class VipAdditionConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *加成类型，详情查看"类型说明.md"文件中的"VipAdditionType"
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
		/**
		 *加成值展示(仅客户端展示用 没有就用value)
		 */
		public valueShow:string;
	}
	class VipAdditionDescConfig {
		/**
		 *加成类型，详情查看"类型说明.md"文件中的"VipAdditionType"
		 */
		public type:string;
		/**
		 *加成描述(纯文本)
		 */
		public desc:string;
		/**
		 *加成描述(富文本)
		 */
		public descRich:string;
	}
	class VipConfig {
		/**
		 *唯一Id，等级，从1开始
		 */
		public id:number;
		/**
		 *等级所需经验
		 */
		public minExp:number;
		/**
		 *特权Id列表，即VipAdditionConfig的Id
		 */
		public additionIds:Array<any>;
		/**
		 *达到多少VIP等级可查看
		 */
		public showNeedLv:number;
	}
}
