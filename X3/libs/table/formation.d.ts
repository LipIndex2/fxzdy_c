declare module table.formation{
	class FormationConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class FormationDiscountConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *阵容名称
		 */
		public groupName:string;
		/**
		 *阵容构成
		 */
		public heroList:string;
		/**
		 *核心英雄
		 */
		public coreHero:string;
		/**
		 *页签
		 */
		public tapIdx:number;
		/**
		 *提示
		 */
		public tips:string;
	}
	class FormationDiscountTabConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *页签中文名
		 */
		public tapName:string;
	}
	class FormationGroupConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *羁绊类型
		 */
		public groupType:string;
		/**
		 *上阵羁绊触发范围类型
		 */
		public triggerType:string;
		/**
		 *类型参数(阵营类型/职业类型)
		 */
		public typeParam:number;
		/**
		 *触发所需上阵英雄数量
		 */
		public triggerCount:number;
		/**
		 *触发的被动技能ID
		 */
		public passiveId:number;
		/**
		 *主动技能id（读职业科技主动技能配置表）
		 */
		public captainSkillId:number;
	}
	class FormationPositionConfig {
		/**
		 *阵位ID
		 */
		public id:number;
		/**
		 *阵位开启条件
		 */
		public openVerify:string;
	}
}
