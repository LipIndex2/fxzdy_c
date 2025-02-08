declare module table.secretinstance{
	class SecretInstanceConfig {
		/**
		 *层数
		 */
		public id:number;
		/**
		 *副本类型,NORMAL-常规模式,DIFFICULT-地狱模式
		 */
		public type:string;
		/**
		 *层名字
		 */
		public name:string;
		/**
		 *共鸣等级要求
		 */
		public level:number;
		/**
		 *掉落ID
		 */
		public dropId:number;
		/**
		 *首通奖励
		 */
		public firstRewards:Array<{k:any,v:any}>;
		/**
		 *地图随机池,SecretInstancePoolConfig.poolId
		 */
		public poolId:number;
		/**
		 *地图楼层随机池,SecretInstanceFloorConfig.id
		 */
		public roomPoolId:Array<any>;
		/**
		 *展示奖励预览（道具：等级）
		 */
		public rewardStr:Array<{k:any,v:any}>;
		/**
		 *房间数量（每一层房间的数量）,格式：[3,4,5]
		 */
		public roomCount:Array<any>;
		/**
		 *战斗配置ID,对应BattleConfig的id,仅配置BOSS怪物
		 */
		public battleConfigId:number;
		/**
		 *召唤Boss所需积分
		 */
		public summonBossNeedScore:number;
	}
	class SecretInstanceConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class SecretInstancePoolConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *池ID
		 */
		public poolId:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *召唤BOSS所需积分
		 */
		public summonBossNeedScore:number;
		/**
		 *房间怪物配置ID（新建对应SecretInstanceRoom表）
		 */
		public roomId:Array<any>;
		/**
		 *开始房间/结束房间
		 */
		public startEndRoomCoinfigId:Array<any>;
	}
	class SecretInstanceRankRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *奖励类型,SERVER-本服,ZONE-战区
		 */
		public rewardType:string;
		/**
		 *最高排名(包含)
		 */
		public minRank:number;
		/**
		 *最低排名(包含)
		 */
		public maxRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class SecretInstanceReviveConfig {
		/**
		 *第几次付费复活
		 */
		public id:number;
		/**
		 *消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class SecretInstanceRoomConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *地图id(MapidConfig.id)
		 */
		public mapId:number;
		/**
		 *怪物资源ID列表,对应MonsterResourceConfig的id,格式:[1,2,3]
		 */
		public monsterResourceIds:Array<any>;
		/**
		 *随机技能的数量
		 */
		public randomNum:number;
		/**
		 *随机的技能组
		 */
		public skills:Array<any>;
	}
}
