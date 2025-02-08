declare module table.talent{
	class TalentConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *前置天赋ID
		 */
		public parentTalentId:number;
		/**
		 *行id | 1=第一行
		 */
		public rowId:number;
		/**
		 *天赋组类型
		 */
		public talentType:string;
		/**
		 *天赋解锁等级
		 */
		public unlockLv:number;
		/**
		 *生效类型1,TalentEffectType
		 */
		public effectType1:string;
		/**
		 *天赋属性加成1
用于对外显示
		 */
		public addAttrArray1:Array<{k:any,v:any}>;
		/**
		 *生效类型2,TalentEffectType
		 */
		public effectType2:string;
		/**
		 *天赋属性加成2
		 */
		public addAttrArray2:Array<{k:any,v:any}>;
		/**
		 *解锁消耗
		 */
		public costItemArray:Array<{k:any,v:any}>;
		/**
		 *升级标题
		 */
		public title:string;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *羁绊id
		 */
		public fetterIds:Array<any>;
		/**
		 *羁绊开启描述
		 */
		public fetterDec:string;
		/**
		 *小天赋图标
		 */
		public iconPathForSmallTalent:string;
		/**
		 *大天赋图标
		 */
		public iconPathForBigTalent:string;
	}
	class TalentConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class TalentEffectTypeConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *名称
		 */
		public name:string;
	}
	class TalentKeyValueConfig {
		/**
		 *名字
		 */
		public id:string;
		/**
		 *值
		 */
		public content:string;
	}
}
