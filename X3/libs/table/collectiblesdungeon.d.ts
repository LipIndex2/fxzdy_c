declare module table.collectiblesdungeon{
	class CollectiblesDungeonChapterConfig {
		/**
		 *唯一标识
		 */
		public id:number;
		/**
		 *10星奖励
		 */
		public rewardsOne:Array<{k:any,v:any}>;
		/**
		 *20星奖励
		 */
		public rewardsTwo:Array<{k:any,v:any}>;
		/**
		 *30星奖励
		 */
		public rewardsThree:Array<{k:any,v:any}>;
		/**
		 *名称
		 */
		public name:string;
	}
	class CollectiblesDungeonChapterStarConfig {
		/**
		 *章节星级
		 */
		public star:number;
		/**
		 *宝箱图片
		 */
		public boxPath:string;
		/**
		 *宝箱打开图片
		 */
		public boxOpenPath:string;
	}
	class CollectiblesDungeonConfig {
		/**
		 *唯一标识
		 */
		public id:number;
		/**
		 *章节id
		 */
		public chapterId:number;
		/**
		 *关卡名称
		 */
		public name:string;
		/**
		 *关卡id
		 */
		public barrierId:number;
		/**
		 *条件1
		 */
		public conditionOne:string;
		/**
		 *条件2
		 */
		public conditionTwo:string;
		/**
		 *条件3
		 */
		public conditionThree:string;
		/**
		 *1星首次通关奖励
		 */
		public firstRewardsOne:Array<{k:any,v:any}>;
		/**
		 *2星首次通关奖励
		 */
		public firstRewardsTwo:Array<{k:any,v:any}>;
		/**
		 *3星首次通关奖励
		 */
		public firstRewardsThree:Array<{k:any,v:any}>;
		/**
		 *扫荡奖励
		 */
		public sweepRewards:Array<{k:any,v:any}>;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *下一个关卡id
		 */
		public nextId:number;
	}
	class CollectiblesDungeonConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
}
