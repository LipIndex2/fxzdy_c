declare module table.dailytask{
	class DailyActiveBoxConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewardText:string;
		/**
		 *领取奖励所需日活跃
		 */
		public needDailyScore:number;
	}
	class DailyTaskConfig {
		/**
		 *日常任务ID
		 */
		public id:number;
		/**
		 *接取条件
		 */
		public condition:Array<any>;
		/**
		 *任务进度
		 */
		public maxProgressValue:number;
		/**
		 *完成任务固定奖励
		 */
		public rewardText:string;
		/**
		 *提供的活跃积分
		 */
		public score:number;
		/**
		 *【前端】任务内容描述
		 */
		public desc:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
	}
	class WeeklyActiveBoxConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewardText:string;
		/**
		 *领取奖励所需周活跃积分
		 */
		public needWeekScore:number;
	}
}
