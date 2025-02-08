declare module table.task{
	class TaskConfig {
		/**
		 *任务id
		 */
		public id:number;
		/**
		 *任务类型
		 */
		public type:number;
		/**
		 *前置任务标识
		 */
		public preTaskId:number;
		/**
		 *任务事件类型
		 */
		public eventType:number;
		/**
		 *接取任务限制
		 */
		public verifyModels:any;
		/**
		 *初始化任务体内容(参数)
		 */
		public content:string;
		/**
		 *总进度(值)
		 */
		public totalProgress:number;
		/**
		 *是否自动发放奖励
		 */
		public autoReward:boolean;
		/**
		 *完成任务固定奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *任务标题
		 */
		public title:string;
		/**
		 *任务描述
		 */
		public desc:string;
	}
}
