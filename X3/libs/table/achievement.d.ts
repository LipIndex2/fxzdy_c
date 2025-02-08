declare module table.achievement{
	class AchievementTaskConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *前置任务id
如果前置任务未完成，则不显示
		 */
		public parentTaskId:number;
		/**
		 *任务总进度
		 */
		public totalProgress:number;
		/**
		 *任务奖励
		 */
		public rewardText:string;
		/**
		 *任务描述
		 */
		public desc:string;
		/**
		 *跳转id
@JumpConfig
		 */
		public jumpId:number;
	}
}
