declare module table.accounttpl{
	class AccountTplConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *备注
		 */
		public notes:string;
		/**
		 *激活并上阵的英雄配置ID
		 */
		public heroConfigIds:Array<any>;
		/**
		 *激活英雄对应星级
		 */
		public heroStars:Array<any>;
		/**
		 *激活英雄对应等级
		 */
		public heroLevels:Array<any>;
		/**
		 *使用的装备ID列表
		 */
		public equipConfigIds:Array<any>;
		/**
		 *解锁的普通天赋
		 */
		public normalTalentLevel:number;
		/**
		 *解锁的高级天赋
		 */
		public specialTalentLevel:number;
		/**
		 *战队科技核心等级
		 */
		public captainCoreLevel:number;
		/**
		 *战队科技等级列表
		 */
		public captainLevels:Array<any>;
		/**
		 *指定当前通关的主线关卡ID
		 */
		public assignTrunkInstanceId:number;
		/**
		 *指定当前完成的主线任务ID
		 */
		public assignTrunkTaskId:number;
		/**
		 *探索进度
		 */
		public assignBuildingSortId:number;
		/**
		 *每日BOSS难度
		 */
		public assignDailyBossDifficulty:number;
		/**
		 *秘境层数
		 */
		public assignSecretInstanceFloor:number;
		/**
		 *阵营塔层数
		 */
		public assignLadderFloor:number;
		/**
		 *队伍英雄对应魔方ID列表
		 */
		public magicCubeIds:Array<any>;
		/**
		 *队伍英雄对应魔方等级列表
		 */
		public magicCubeLevels:Array<any>;
		/**
		 *上阵宠物ID
		 */
		public usePetConfigId:number;
		/**
		 *激活宠物ID列表
		 */
		public activePetConfigIds:Array<any>;
		/**
		 *宠物等级
		 */
		public petLevel:number;
		/**
		 *宠物阶段
		 */
		public petStage:number;
		/**
		 *激活的星灵宠物对应的星级列表
		 */
		public activePetStars:Array<any>;
		/**
		 *上阵收藏品ID
		 */
		public useCollectiblesId:number;
		/**
		 *激活收藏品ID列表
		 */
		public activeCollectiblesIds:Array<any>;
		/**
		 *激活的收藏品对应的等级列表
		 */
		public activeCollectiblesLevels:Array<any>;
		/**
		 *激活的收藏品对应的星级列表
		 */
		public activeCollectiblesStars:Array<any>;
	}
}
