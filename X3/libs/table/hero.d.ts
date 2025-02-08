declare module table.hero{
	class HeroClassConfig {
		/**
		 *职业id | 对应 HeroConfig.career
		 */
		public id:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标路径
		 */
		public assetPath:string;
		/**
		 *职业大图标
		 */
		public bigAssetPath:string;
		/**
		 *【抽卡】大背景图标
		 */
		public drawCardShowBigLogo:string;
		/**
		 *职业简述
		 */
		public desc:string;
		/**
		 *职业背景故事
		 */
		public story:string;
	}
	class HeroConfig {
		/**
		 *英雄id
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *位置
		 */
		public type:number;
		/**
		 *英雄对应的碎片物品ID
		 */
		public fragmentItemId:number;
		/**
		 *激活英雄消耗碎片数量
		 */
		public activeCostFragment:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *初始星级
		 */
		public initStar:number;
		/**
		 *性别
		 */
		public gender:string;
		/**
		 *阵营类型
		 */
		public camp:number;
		/**
		 *职业类型
		 */
		public career:string;
		/**
		 *布阵属性
		 */
		public discountShow:string;
		/**
		 *是否飞行单位
		 */
		public isFly:boolean;
		/**
		 *攻击距离,AttackRange
		 */
		public attackRange:string;
		/**
		 *阵位排序
		 */
		public sort:number;
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
		 *索敌距离
		 */
		public searchRange:number;
		/**
		 *攻击
		 */
		public atk:number;
		/**
		 *防御
		 */
		public def:number;
		/**
		 *血量
		 */
		public hp:number;
		/**
		 *攻击成长
		 */
		public atkGrowth:number;
		/**
		 *防御成长
		 */
		public defGrowth:number;
		/**
		 *生命成长
		 */
		public hpGrowth:number;
		/**
		 *普攻技能
		 */
		public skill0:string;
		/**
		 *技能1
		 */
		public skill1:string;
		/**
		 *技能2
		 */
		public skill2:string;
		/**
		 *被动技能1
		 */
		public skill3:string;
		/**
		 *被动技能2
		 */
		public skill4:string;
		/**
		 *技能5
		 */
		public skill5:string;
		/**
		 *战力修正
		 */
		public cpMod:number;
		/**
		 *初始二级属性,没有配空
		 */
		public baseSecondAttrs:Array<{k:any,v:any}>;
		/**
		 *攻速系数
		 */
		public atkSpeed:number;
		/**
		 *模拟经营加成道具Id
		 */
		public stimulationAdditionItemId:number;
		/**
		 *模拟经营加成类型，参考"类型说明.md"文件的StimulationAdditionType
		 */
		public stimulationAdditionType:string;
		/**
		 *模拟经营加成值
		 */
		public stimulationAdditionValue:number;
		/**
		 *模拟经营加成升星增量
		 */
		public stimulationAdditionUpStarIncrement:number;
		/**
		 *英雄介绍
		 */
		public desc:string;
		/**
		 *对话内容
		 */
		public talk:any;
		/**
		 *对话触发概率
		 */
		public talkProbability:number;
		/**
		 *英雄界面表现动作
		 */
		public heroAnimName:Array<any>;
		/**
		 *英雄最大技能伤害系数
		 */
		public skillMaxHurtRate:number;
	}
	class HeroConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class HeroDnaAwakenConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *潜能觉醒阶段
		 */
		public stage:number;
		/**
		 *潜能池id
		 */
		public poolId:number;
		/**
		 *生效英雄id
		 */
		public heroId:number;
		/**
		 *潜能觉醒消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *刷新觉醒消耗
		 */
		public refreshCostItems:Array<{k:any,v:any}>;
		/**
		 *属性随机围值
		 */
		public rangeValue:string;
		/**
		 *属性随机围值上限
		 */
		public maxAttrValue:number;
		/**
		 *属性值换算
		 */
		public attrConversion:string;
	}
	class HeroDnaAwakenPoolConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *潜能池id
		 */
		public poolId:number;
		/**
		 *属性类型
		 */
		public attrType:string;
		/**
		 *权重
		 */
		public weight:number;
	}
	class HeroDnaConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *潜能阶段
		 */
		public stage:number;
		/**
		 *潜能等级
		 */
		public level:number;
		/**
		 *职业
		 */
		public career:string;
		/**
		 *下一个潜能配置id
		 */
		public nextId:number;
		/**
		 *潜能升级消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *升级属性（替换）
		 */
		public baseUpAttrs:Array<{k:any,v:any}>;
	}
	class HeroLevelConfig {
		/**
		 *等级
		 */
		public id:number;
		/**
		 *升到当前等级所需等阶
		 */
		public stageCondition:number;
		/**
		 *升到当前等级所需消耗
		 */
		public costItems:Array<any>;
	}
	class HeroLevelResourceLimitConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *道具id
即ItemConfig的Id
		 */
		public itemId:number;
		/**
		 *共鸣等级
		 */
		public commonLv:number;
		/**
		 *最大上限数量（覆盖）
		 */
		public maxItemCount:number;
	}
	class HeroRaceConfig {
		/**
		 *种族id | 对应 HeroConfig.camp
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标路径
		 */
		public assetPath:string;
		/**
		 *【抽卡】大背景图标
		 */
		public drawCardShowBigLogo:string;
		/**
		 *种族简述
		 */
		public desc:string;
		/**
		 *种族背景故事
		 */
		public story:string;
	}
	class HeroSkinConfig {
		/**
		 *唯一Id，即ItemConfig的Id
		 */
		public id:number;
		/**
		 *英雄Id，即HeroConfig的Id
		 */
		public heroBaseId:number;
		/**
		 *加成属性列表
		 */
		public attrs:Array<{k:any,v:any}>;
		/**
		 *优先级
		 */
		public priority:number;
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
		 *特效模型转换
		 */
		public changeModelData:any;
		/**
		 *技能动作更换
		 */
		public changeActionData:any;
		/**
		 *召唤无模型更换
		 */
		public changeSummonModelData:any;
	}
	class HeroStageConfig {
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
		public costItems:Array<any>;
		/**
		 *解锁的槽位
		 */
		public skillPos:number;
		/**
		 *增加的属性份额
		 */
		public attrBonus:number;
		/**
		 *属性修正
		 */
		public attrModifier:number;
		/**
		 *当前等阶属性加成,替换为当前等阶配置的属性
		 */
		public attributeValues:Array<any>;
	}
	class HeroStarConfig {
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
		 *升星消耗碎片数量
		 */
		public cost:number;
		/**
		 *增加的属性份额
		 */
		public attrBonus:number;
		/**
		 *解锁的技能槽位
		 */
		public skillPosLevelContent:Array<{k:any,v:any}>;
		/**
		 *解锁的技能槽位
		 */
		public skillPos:number;
		/**
		 *解锁的技能等级
		 */
		public skillLevel:number;
		/**
		 *属性修正
		 */
		public attrModifier:number;
	}
}
