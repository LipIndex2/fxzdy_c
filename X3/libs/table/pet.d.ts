declare module table.pet{
	class PetConfig {
		/**
		 *英雄id
		 */
		public id:number;
		/**
		 *星灵碎片物品ID
		 */
		public fragmentItemId:number;
		/**
		 *激活消耗碎片数量/整卡转换碎片数量
		 */
		public activeCostFragment:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *初始星级
		 */
		public initStar:number;
		/**
		 *攻击转化比例,万分比
		 */
		public atkMod:number;
		/**
		 *防御转化比例,万分比
		 */
		public defMod:number;
		/**
		 *血量转换比例,万分比
		 */
		public hpMod:number;
		/**
		 *技能ID列表
		 */
		public skillIds:Array<any>;
		/**
		 *战力修正
		 */
		public cpMod:number;
		/**
		 *是否飞行单位
		 */
		public isFly:boolean;
		/**
		 *头像路径
		 */
		public headPath:string;
		/**
		 *战斗头像路径
		 */
		public battleHeadIconPath:string;
		/**
		 *模型ID
		 */
		public modelId:number;
		/**
		 *模型ID
		 */
		public showModelId:number;
		/**
		 *体型（默认50）
		 */
		public size:number;
		/**
		 *前置冷却
		 */
		public precd:number;
		/**
		 *技能冷却
		 */
		public cd:number;
		/**
		 *施法持续时间
		 */
		public castTime:number;
		/**
		 *索敌距离
		 */
		public searchRange:number;
		/**
		 *初始二级属性,没有配空
		 */
		public secondAttrs:Array<{k:any,v:any}>;
		/**
		 *攻速系数
		 */
		public atkSpeed:number;
		/**
		 *英雄介绍
		 */
		public desc:string;
		/**
		 *0星属性
		 */
		public baseAttrs:Array<{k:any,v:any}>;
		/**
		 *升星提升属性
		 */
		public starAttrs:Array<{k:any,v:any}>;
	}
	class PetConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class PetGroupConfig {
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
		 *激活星数4
		 */
		public activeStar4:number;
		/**
		 *星级属性4
		 */
		public starAttrs4:Array<{k:any,v:any}>;
		/**
		 *星灵配置Id列表
		 */
		public petBaseIds:Array<any>;
		/**
		 *星灵羁绊名称
		 */
		public groupName:string;
	}
	class PetLevelConfig {
		/**
		 *星灵等级
		 */
		public id:number;
		/**
		 *升到当前等级所需等阶
		 */
		public stageCondition:number;
		/**
		 *升到当前等级所需消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *上阵英雄属性加成
		 */
		public heroAttrAdditions:Array<{k:any,v:any}>;
	}
	class PetStageConfig {
		/**
		 *等阶
		 */
		public id:number;
		/**
		 *升到当前等阶所需等级
		 */
		public levelCondition:number;
		/**
		 *升到当前等阶所需消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *上阵英雄属性加成
		 */
		public heroAttrAdditions:Array<{k:any,v:any}>;
	}
	class PetStarConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *星级
		 */
		public star:number;
		/**
		 *解锁的技能槽位
		 */
		public skillPosLevelContent:any;
		/**
		 *解锁的技能槽位,配置的槽位需要达到该星级才解锁
		 */
		public skillPos:number;
		/**
		 *技能等级
		 */
		public skillLevel:number;
		/**
		 *升到当前星级所需的碎片数量
		 */
		public fragmentCostAmount:number;
	}
}
