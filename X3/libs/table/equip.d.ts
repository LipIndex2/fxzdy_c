declare module table.equip{
	class EquipAttrPoolConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *属性类型,为空则可以随机不出此词条
		 */
		public attributeType:string;
	}
	class EquipAttrRandomConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
	}
	class EquipConfig {
		/**
		 *物品ID
		 */
		public id:number;
		/**
		 *一级属性,攻防血额外属性
		 */
		public baseAttrs:string;
		/**
		 *装备等级
		 */
		public equipLevel:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *部位ID
		 */
		public position:number;
		/**
		 *套装ID
		 */
		public suitId:number;
		/**
		 *分解奖励
		 */
		public decomposeRewards:Array<{k:any,v:any}>;
		/**
		 *二级属性随机条数,与固定二级属性互斥,格式: 条数:权重;条数:权重;条数:权重;
		 */
		public secondAttrCountWeights:Array<{k:any,v:any}>;
		/**
		 *固有二级属性
		 */
		public fixedSecondAttrs:string;
		/**
		 *固定二级属性品质
		 */
		public fixedSecondQuality:Array<any>;
	}
	class EquipPositionConfig {
		/**
		 *部位ID
		 */
		public id:number;
		/**
		 *解锁条件
		 */
		public unlockConditions:Array<any>;
		/**
		 *提前解锁条件，如果为空，则以unlockConditions为准
		 */
		public earlyUnlockConditions:Array<any>;
		/**
		 *槽位名称
		 */
		public posName:string;
	}
	class EquipQuality {
		/**
		 *品质id
		 */
		public id:number;
		/**
		 *包装名
		 */
		public name:string;
		/**
		 *样式
		 */
		public iconPath:string;
	}
	class EquipSuitConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *套装ID
		 */
		public suitId:number;
		/**
		 *激活套装属性/技能所需套装装备数量
		 */
		public activeCount:number;
		/**
		 *套装属性
		 */
		public suitAttrs:string;
		/**
		 *套装名字
		 */
		public suitName:string;
		/**
		 *套装描述
		 */
		public suitDesc:string;
		/**
		 *套装技能ID
		 */
		public skillId:string;
	}
}
