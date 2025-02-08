declare module table.monster{
	class MonsterAttributeConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *战斗模型
		 */
		public modelId:number;
		/**
		 *展示模型
		 */
		public showModelId:number;
		/**
		 *所属类型(0是怪物，非0则是英雄ID)
		 */
		public belongType:number;
		/**
		 *所属类型Id
		 */
		public belongId:number;
		/**
		 *怪物类型,MonsterType
		 */
		public monsterType:string;
		/**
		 *种族
		 */
		public camp:number;
		/**
		 *是否飞行单位
		 */
		public isFly:boolean;
		/**
		 *战斗头像路径
		 */
		public headPath:string;
		/**
		 *关卡对外显示的半身像
		 */
		public halfBodyPath:string;
		/**
		 *攻击
		 */
		public atk:number;
		/**
		 *防御
		 */
		public def:number;
		/**
		 *血
		 */
		public hp:number;
		/**
		 *经验
		 */
		public exp:number;
		/**
		 *索敌半径
		 */
		public searchRange:number;
		/**
		 *体型（默认50）
		 */
		public size:number;
		/**
		 *血条
		 */
		public hp_show:string;
		/**
		 *主动技能ID列表
		 */
		public skillIds:Array<any>;
		/**
		 *被动技能
		 */
		public passivitySkils:Array<any>;
		/**
		 *技能释放顺序（非空的话技能不走CD而是走这边的顺序循环）
		 */
		public skillSortList:Array<any>;
		/**
		 *掉落动画
		 */
		public dropModelId:number;
		/**
		 *受击点偏移值
		 */
		public hurtPoint:any;
		/**
		 *是否不能移动
		 */
		public noMove:number;
		/**
		 *是否不能自由移动
		 */
		public noFreeMove:boolean;
		/**
		 *二级属性
		 */
		public secondAttrs:Array<{k:any,v:any}>;
		/**
		 *攻速系数
		 */
		public atkSpeed:number;
		/**
		 *标签(1是隐藏怪)
		 */
		public flag:number;
		/**
		 *血条显示模式1是永久不显示
		 */
		public hpBarMode:number;
	}
	class MonsterDropConfig {
		/**
		 *掉落ID
		 */
		public id:number;
		/**
		 *掉落类型
		 */
		public type:number;
		/**
		 *掉落参数
		 */
		public param:any;
	}
	class MonsterExConfig {
		/**
		 *怪物ID
		 */
		public id:number;
		/**
		 *逃跑时间
		 */
		public escapeTime:number;
		/**
		 *逃跑速度
		 */
		public escapeSpeed:number;
		/**
		 *受击多少次后逃跑
		 */
		public escapeHurtNum:number;
	}
}
