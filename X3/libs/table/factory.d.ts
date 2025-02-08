declare module table.factory{
	class FactoryConstantConfig {
		public id:string;
		public content:string;
	}
	class FactoryOccupyLimitsConfig {
		/**
		 *玩家等级
		 */
		public id:number;
		/**
		 *同时占领数量限制
		 */
		public sameTimeOccupyCount:number;
	}
	class FactoryProductLineConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *掉落宝箱物品ID
		 */
		public dropItemId:number;
		/**
		 *生产线名称
		 */
		public name:string;
		/**
		 *奖励预览
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class FactoryRecordBubbleTipConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *类型(1文字 2表情)
		 */
		public type:number;
		/**
		 *内容 描述文字或者表情路径
		 */
		public content:string;
		/**
		 *spine动画播放名称(表情专用)
		 */
		public spineAnis:Array<any>;
	}
	class FactoryRecordDescConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *标题
		 */
		public title:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class FactoryRewardTimeConfig {
		/**
		 *次数
		 */
		public id:number;
		/**
		 *品质-收获时间(分),格式:1:10;2:20;3:30
		 */
		public quality2RewardTime:Array<{k:any,v:any}>;
	}
}
