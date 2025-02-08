declare module table.player{
	class NameConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *性别
		 */
		public sex:number;
		/**
		 *名字段1
		 */
		public name_first:string;
		/**
		 *名字段2
		 */
		public name_second:string;
		/**
		 *名字段3
		 */
		public name_third:string;
	}
	class PlayerBasicConfig {
		/**
		 *标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class TrialConfig {
		/**
		 *唯一标识
		 */
		public id:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *怪物死亡数量
		 */
		public dieNum:number;
	}
}
