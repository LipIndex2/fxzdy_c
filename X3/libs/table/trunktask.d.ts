declare module table.trunktask{
	class TrunkTaskConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *前一个任务ID
		 */
		public preTaskId:number;
		/**
		 *任务目标文本
		 */
		public desc:string;
		/**
		 *任务进度
		 */
		public totalProgress:number;
		/**
		 *任务奖励
		 */
		public rewards:string;
		/**
		 *主线任务目标图标(打怪就是怪物图标)
		 */
		public targetSmallIcon:string;
		/**
		 *引导成功类型
---
resourcePoint 资源点
building 建筑物
		 */
		public guideType:string;
		/**
		 *引导配置id | 不同类型对应不同配置的id
---
resourcePoint = 资源点id @MapResourceConfig.id
building = 建筑id @MapBuildingConfig.id
		 */
		public guideConfigId:number;
		/**
		 *指引提示文本
		 */
		public guideDesc:string;
		/**
		 *跨地图传送的建筑id
		 */
		public jumpBuildingId:number;
		/**
		 *查看经验来源
		 */
		public experienceSource:number;
	}
	class TrunkTaskKvConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
}
