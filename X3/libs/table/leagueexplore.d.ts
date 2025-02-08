declare module table.leagueexplore{
	class LeagueExploreBuffConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *连胜/连败次数,>0表示连胜次数,<0表示连败次数
		 */
		public continueWinOrFail:number;
		/**
		 *技能配置ID
		 */
		public skillId:string;
	}
	class LeagueExploreBuildingConfig {
		/**
		 *建筑ID
		 */
		public id:number;
		/**
		 *建筑等级
		 */
		public level:number;
		/**
		 *建筑类型,LeagueExploreBuildingType
		 */
		public buildingType:string;
		/**
		 *所属星球配置ID
		 */
		public starConfigId:number;
		/**
		 *所属建筑ID,矿场对应巨型工厂,没有配空
		 */
		public parentBuildingId:number;
		/**
		 *驻守位置数量
		 */
		public defenderSeatCount:number;
		/**
		 *机器人配置ID,没有配空
		 */
		public robotConfigId:number;
		/**
		 *产出道具1ID
		 */
		public item1Id:number;
		/**
		 *道具1每小时产出数量
		 */
		public item1HourOutputCount:number;
		/**
		 *驻守位置相对建筑坐标
		 */
		public defenderSeatPos:Array<{k:any,v:any}>;
		/**
		 *占领建筑每小时获得积分数量
		 */
		public scorePerHour:number;
	}
	class LeagueExploreConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class LeagueExploreHeaderItemConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *道具id
		 */
		public itemId:number;
		/**
		 *是否有购买+按钮
		 */
		public canBuyFlag:boolean;
	}
	class LeagueExplorePersonalRankRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *排名上限(包含),minRank<=maxRank
		 */
		public minRank:number;
		/**
		 *排名下限(包含),minRank<=maxRank
		 */
		public maxRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class LeagueExploreRankRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *排名上限(包含),minRank<=maxRank
		 */
		public minRank:number;
		/**
		 *排名下限(包含),minRank<=maxRank
		 */
		public maxRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class LeagueExploreResetAttackLimitConfig {
		/**
		 *次数
		 */
		public id:number;
		/**
		 *消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class LeagueExploreRobotConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *机器人名字
		 */
		public name:string;
	}
	class LeagueExploreStarConfig {
		/**
		 *星球ID(对应MapidConfig)
		 */
		public id:number;
		/**
		 *星球等级(对应LeagueExploreStarLevelConfig)
		 */
		public level:number;
		/**
		 *解锁条件
		 */
		public unlockConditions:Array<any>;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *星球组配置ID,没有则默认开放
		 */
		public starGroupConfigId:number;
		/**
		 *是否初始星球
		 */
		public initStar:boolean;
	}
	class LeagueExploreStarLevelConfig {
		/**
		 *星球等级
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *描述图标
		 */
		public descAtlas:string;
	}
}
