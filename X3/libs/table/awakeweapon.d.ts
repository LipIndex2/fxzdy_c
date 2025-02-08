declare module table.awakeweapon{
	class AwakeWeaponConfig {
		/**
		 *道具Id，即ItemConfig的Id
		 */
		public id:number;
		/**
		 *类型
		 */
		public type:string;
		/**
		 *专属英雄Id，即HeroConfig的Id，没有则配空
		 */
		public heroBaseId:number;
		/**
		 *基础属性（0星）
		 */
		public baseAttrs:any;
		/**
		 *1星属性
		 */
		public star1Attrs:any;
		/**
		 *2星属性
		 */
		public star2Attrs:any;
		/**
		 *3星属性
		 */
		public star3Attrs:any;
		/**
		 *4星属性
		 */
		public star4Attrs:any;
		/**
		 *5星属性
		 */
		public star5Attrs:any;
		/**
		 *专属技能描述
		 */
		public skillInfo:Array<{k:any,v:any}>;
	}
	class AwakeWeaponConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class AwakeWeaponStarConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *类型
		 */
		public type:string;
		/**
		 *品质，即ItemConfig的quality
		 */
		public quality:number;
		/**
		 *星级，从0到最高级
		 */
		public star:number;
		/**
		 *升到当前星级消耗同武器数量
		 */
		public consumeSameCount:number;
		/**
		 *升到当前星级所需消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
}
