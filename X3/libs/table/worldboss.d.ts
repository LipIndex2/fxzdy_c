declare module table.worldboss{
	class WorldBossConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *开服第N填开启,从1开始
		 */
		public openDay:number;
		/**
		 *战斗配置ID,BattleConfig.id
		 */
		public battleConfigId:number;
		/**
		 *每日挑战次数
		 */
		public dailyChallengeTimes:number;
		/**
		 *建筑入口
		 */
		public buildId:number;
		/**
		 *传送阵id
		 */
		public portalID:number;
		/**
		 *阵容属性
		 */
		public Lineup_name:string;
		/**
		 *推荐英雄组
		 */
		public RecommendHero:Array<any>;
		/**
		 *神选名单怪物展示路径
		 */
		public liveShow:string;
		/**
		 *神选名单怪物死亡展示路径
		 */
		public deathShow:string;
	}
	class WorldBossConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class WorldBossProgressRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *BOSS配置ID
		 */
		public bossConfigId:number;
		/**
		 *血条序号
		 */
		public lifeBarNo:number;
		/**
		 *血条血量
		 */
		public lifeBarHp:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class WorldBossRankRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *boss配置ID
		 */
		public bossConfigId:number;
		/**
		 *最高排名
		 */
		public minRank:number;
		/**
		 *最低排名,配空表示没有最低排名限制
		 */
		public maxRank:number;
		/**
		 *结算奖励
		 */
		public settleRewards:Array<{k:any,v:any}>;
	}
	class WorldBossServerProgressConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *boss配置ID
		 */
		public bossConfigId:number;
		/**
		 *BOSS刷新第x天,从1开始
		 */
		public day:number;
		/**
		 *是否有击杀奖励
		 */
		public hasKillReward:boolean;
		/**
		 *击杀奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
}
