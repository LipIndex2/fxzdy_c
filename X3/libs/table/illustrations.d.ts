declare module table.illustrations{
	class IllustrationsConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class IllustrationsLevelConfig {
		/**
		 *图鉴等级
		 */
		public id:number;
		/**
		 *达到此等级所需总积分
		 */
		public needScore:number;
		/**
		 *图鉴等级奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class IllustrationsScoreConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *获得积分类型
		 */
		public type:string;
		/**
		 *类型参数,根据类型配置
		 */
		public param:string;
		/**
		 *每次可获得的积分
		 */
		public score:number;
	}
}
