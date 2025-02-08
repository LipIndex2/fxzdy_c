declare module table.leaguewar{
	class LeagueWarConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class LeagueWarDanConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *段位名
		 */
		public name:string;
		/**
		 *段位最低积分(包含)
		 */
		public minScore:number;
		/**
		 *段位要求得最低排名，>0生效
		 */
		public minRank:number;
		/**
		 *赛季结算后积分
		 */
		public settleScore:number;
		/**
		 *失败是否扣除积分
		 */
		public decreaseScoreAfterFail:boolean;
		/**
		 *当前段位基础得分，积分公式参数
		 */
		public baseScore:number;
		/**
		 *当前段位是否能进赛季排行榜
		 */
		public enableRank:boolean;
		/**
		 *该段位是否发送排名奖励，否则发送段位奖励
		 */
		public sendRankRewards:boolean;
		/**
		 *当sendRankRewards为true时，发送排名奖励要求的最低排名
		 */
		public minRankOfSendRankRewards:number;
	}
	class LeagueWarDanRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *赛季段最小值
		 */
		public minSeason:number;
		/**
		 *段位
		 */
		public dan:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class LeagueWarLadderConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *联盟等级，同一联盟等级，按Id从小到大分配
		 */
		public level:number;
		/**
		 *所属层级
		 */
		public layerNum:number;
		/**
		 *人数
		 */
		public capacity:number;
		/**
		 *扣除星数
		 */
		public star:number;
	}
	class LeagueWarRobotConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *最低战力(包含)
		 */
		public minFight:number;
		/**
		 *最高战力(不包含)，配空则表示无上限
		 */
		public maxFight:number;
		/**
		 *机器人阵容池列表
		 */
		public formationPoolIds:Array<any>;
		/**
		 *机器人英雄等级列表
		 */
		public robotHeroLevels:Array<any>;
		/**
		 *机器人英雄星级列表
		 */
		public robotHeroStars:Array<any>;
		/**
		 *机器人普通天赋等级，解锁全部【天赋解锁等级】小于等于该等级的天赋
		 */
		public robotNormalTalentLevel:number;
		/**
		 *机器人高级天赋等级，解锁全部【天赋解锁等级】小于等于该等级的天赋
		 */
		public robotSpecialTalentLevel:number;
		/**
		 *机器人装备Id列表
		 */
		public robotEquipIds:Array<any>;
		/**
		 *机器人战队科技Id
		 */
		public robotCaptainId:number;
		/**
		 *机器人战队科技等级列表，-1表示未解锁
		 */
		public robotCaptainLevels:Array<any>;
		/**
		 *机器人星灵宠物配置ID

		 */
		public robotPetBaseId:number;
		/**
		 *机器人星灵宠物等级
		 */
		public robotPetLevel:number;
		/**
		 *机器人星灵宠物阶段
		 */
		public robotPetStage:number;
		/**
		 *机器人星灵宠物星级
		 */
		public robotPetStar:number;
	}
	class LeagueWarRobotFormationConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *英雄Id列表
		 */
		public heroIds:Array<any>;
	}
	class LeagueWarSeasonRankRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *赛季段最小值
		 */
		public minSeason:number;
		/**
		 *最大排名(数值最小)
		 */
		public maxRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
}
