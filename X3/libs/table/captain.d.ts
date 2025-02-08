declare module table.captain{
	class CaptainConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *小图标
		 */
		public iconPathForSmall:string;
		/**
		 *大图标
		 */
		public iconPathForBig:string;
	}
	class CaptainConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class CaptainCoreLevelConfig {
		/**
		 *等级
		 */
		public id:number;
		/**
		 *消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *属性加成
		 */
		public attrs:Array<{k:any,v:any}>;
	}
	class CaptainLevelConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *职业科技ID,对应CaptainConfig.id
		 */
		public captainSkillId:number;
		/**
		 *等级
		 */
		public lv:number;
		/**
		 *升到当前等级所需消耗
List<CostItem>
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *解锁条件
List<PlayerVerifyModel>
		 */
		public unlockConditionText:Array<any>;
		/**
		 *默认全职业属性加成

		 */
		public addAttrArray1:Array<{k:any,v:any}>;
		/**
		 *职业生效类型
		 */
		public effectType2:string;
		/**
		 *生效类型属性加成
		 */
		public addAttrArray2:Array<{k:any,v:any}>;
		/**
		 *羁绊id（读羁绊表）
		 */
		public activeFetterIds:Array<any>;
		/**
		 *升到当前等级所需职业核心等级
		 */
		public needCaptainCoreLevel:number;
		/**
		 *战力
		 */
		public cpWorth:number;
		/**
		 *战力修正
		 */
		public cpMod:number;
	}
	class CaptainSkillConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *所属技能分类
		 */
		public belongType:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *对应职业科技ID
		 */
		public captainId:number;
		/**
		 *对应职业科技等级
		 */
		public level:number;
		/**
		 *效果描述富文本
		 */
		public desc:string;
		/**
		 *模型
		 */
		public modelId:any;
		/**
		 *触发条件
		 */
		public triggerType:number;
		/**
		 *触发条件参数
		 */
		public triggerParam:any;
		/**
		 *是否进战只触发1次
		 */
		public once:number;
		/**
		 *前置冷却
		 */
		public precd:number;
		/**
		 *技能冷却
		 */
		public cd:number;
		/**
		 *持续时间
		 */
		public castTime:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *参数
		 */
		public param:any;
		/**
		 *行为序列
		 */
		public behavior_0:any;
		/**
		 *战力
		 */
		public cpWorth:number;
		/**
		 *战力修正
		 */
		public cpMod:number;
	}
}
