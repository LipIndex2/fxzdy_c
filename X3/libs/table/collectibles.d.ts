declare module table.collectibles{
	class CollectiblesConfig {
		/**
		 *收藏品物品Id
		 */
		public id:number;
		/**
		 *收藏品碎片物品ID，限时收藏品无碎片Id
		 */
		public fragmentItemId:number;
		/**
		 *激活消耗碎片数量/整卡转换碎片数量
		 */
		public activeCostFragment:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *生效职业/近战远程范围
		 */
		public effectType:string;
		/**
		 *基础属性
		 */
		public baseAttrs:Array<{k:any,v:any}>;
		/**
		 *升级成长属性
		 */
		public growAttrs:Array<{k:any,v:any}>;
		/**
		 *生效职业/近战远程范围
		 */
		public extraEffectType:string;
		/**
		 *额外属性
		 */
		public extraAttrs:Array<{k:any,v:any}>;
		/**
		 *星级属性
		 */
		public starAttrs:Array<{k:any,v:any}>;
		/**
		 *任务特性生效范围
		 */
		public taskEffectType:string;
		/**
		 *任务特性Id，即CollectionTaskAttrConfig的Id，限时类型无累积属性Id
		 */
		public taskAttrId:number;
		/**
		 *技能
		 */
		public skillInfo:string;
		/**
		 *有效小时数，大于0表示为限时类型
		 */
		public validHours:number;
		/**
		 *套装Id，即CollectionSuitConfig的Id，限时类型无套装Id
		 */
		public suitId:number;
	}
	class CollectiblesConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class CollectiblesLevelConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *品质，即CollectionConfig的quality
		 */
		public quality:number;
		/**
		 *等级，从1开始
		 */
		public level:number;
		/**
		 *升到当前等级所需消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class CollectiblesSkillEffectConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *是否上阵生效
		 */
		public inBattle:boolean;
		/**
		 *生效的目标类型,COLLECTIBLES-收藏品,HERO-英雄
		 */
		public targetType:string;
		/**
		 *目标为HERO时,英雄的生效类型
		 */
		public effectType:string;
		/**
		 *技能ID
		 */
		public skillId:string;
	}
	class CollectiblesStarConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *品质，即CollectionConfig的quality
		 */
		public quality:number;
		/**
		 *星级，从1到最高级
		 */
		public star:number;
		/**
		 *升到当前星级所需碎片数量
		 */
		public fragmentCostAmount:number;
	}
	class CollectiblesSuitConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *基础属性
		 */
		public baseAttrs:Array<{k:any,v:any}>;
		/**
		 *激活星数1
		 */
		public activeStar1:number;
		/**
		 *星级属性1
		 */
		public starAttrs1:Array<{k:any,v:any}>;
		/**
		 *激活星数2
		 */
		public activeStar2:number;
		/**
		 *星级属性2
		 */
		public starAttrs2:Array<{k:any,v:any}>;
		/**
		 *激活星数3
		 */
		public activeStar3:number;
		/**
		 *星级属性3
		 */
		public starAttrs3:Array<{k:any,v:any}>;
		/**
		 *技能
		 */
		public skillInfo:string;
		/**
		 *套装名称
		 */
		public name:string;
	}
	class CollectiblesTaskAttrConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *事件类型
		 */
		public eventType:string;
		/**
		 *任务内容
		 */
		public content:string;
		/**
		 *基础属性
		 */
		public baseAttrs:Array<{k:any,v:any}>;
		/**
		 *升星成长属性
		 */
		public growAttrs:Array<{k:any,v:any}>;
		/**
		 *进度
		 */
		public progress:number;
		/**
		 *生效次数上限
		 */
		public validLimit:number;
		/**
		 *任务目标文本
		 */
		public desc:string;
	}
}
