declare module table.drawCard{
	class DrawCardConfig {
		/**
		 *唯一ID（抽卡id）
		 */
		public id:number;
		/**
		 *抽卡类型，枚举DrawCardType
		 */
		public drawCardType:string;
		/**
		 *出现的奖励数量
		 */
		public rewardNum:number;
		/**
		 *单次招募消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class DrawCardConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class DrawCardPoolConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *所属卡池ID
		 */
		public poolId:number;
		/**
		 *物品ID
		 */
		public itemId:number;
		/**
		 *数量
		 */
		public amount:number;
		/**
		 *出现权重,<=0时不参与抽取
		 */
		public outWeight:number;
		/**
		 *获得概率（万分比）
		 */
		public gainWeight:number;
		/**
		 *显示概率
		 */
		public showWeight:number;
	}
	class DrawCardRoundConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *下次ID
		 */
		public nextId:number;
		/**
		 *所属卡池ID
		 */
		public poolId:number;
		/**
		 *进入下一轮所需获得奖励
		 */
		public nextNeedRewardNum:number;
	}
}
