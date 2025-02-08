declare module table.ladder{
	class LadderConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *职业枚举
		 */
		public type:string;
		/**
		 *层数
		 */
		public layerNum:number;
		/**
		 *限制职业的数量
		 */
		public limitJobCount:number;
		/**
		 *敌方队伍战斗力
		 */
		public fight:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *通关奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *对外显示的怪物等级
		 */
		public monsterLv:number;
	}
	class LadderConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class LadderTypeConfig {
		/**
		 *职业 | 对应 HeroClassConfig.id
		 */
		public id:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 * 特殊开放天数范围,格式:[1,5]
		 */
		public specialOpenDayRange:Array<any>;
		/**
		 *星级几开启,1-7表示周一到周日,格式: [1,2,3,4,5,6,7]
		 */
		public openDayOfWeek:Array<any>;
		/**
		 *限制上阵描述
		 */
		public limitHeroTips:string;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *DNA背景
		 */
		public bg:string;
		/**
		 *DNA前景
		 */
		public fg:string;
	}
}
