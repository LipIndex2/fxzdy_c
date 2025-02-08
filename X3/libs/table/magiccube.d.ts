declare module table.magiccube{
	class MagicCubeConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *进阶魔方Id，进阶时若锁定则使用
		 */
		public advancedCubeId:number;
		/**
		 *图标路径
		 */
		public icon:string;
		/**
		 *魔方名称
		 */
		public name:string;
		/**
		 *初始属性
		 */
		public baseAttrs:Array<{k:any,v:any}>;
		/**
		 *成长属性
		 */
		public growUpAttrs:Array<{k:any,v:any}>;
	}
	class MagicCubeConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class MagicCubeLevelConfig {
		/**
		 *唯一Id，从1开始
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *品质内等级
		 */
		public level:number;
		/**
		 *升级消耗
		 */
		public upLevelCosts:Array<{k:any,v:any}>;
		/**
		 *锁定消耗
		 */
		public lockedCosts:Array<{k:any,v:any}>;
		/**
		 *转换消耗
		 */
		public convertCosts:Array<{k:any,v:any}>;
	}
	class MagicCubeQualityConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标路径
		 */
		public icon:string;
	}
}
