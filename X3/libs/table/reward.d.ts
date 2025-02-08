declare module table.reward{
	class RewardDropConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *奖励类型
		 */
		public type:string;
		/**
		 *奖励产出规则文本
		 */
		public rewards:Array<{k:any,v:any}>;
	}
}
