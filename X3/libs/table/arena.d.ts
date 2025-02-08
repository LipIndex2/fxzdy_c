declare module table.arena{
	class ArenaConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class ArenaRankConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *段位名称
		 */
		public name:string;
		/**
		 *小段位星数
		 */
		public starCount:number;
		/**
		 *小段位总星星数
		 */
		public starMaxCount:number;
		/**
		 *段位大图标
		 */
		public logoBigAssetPath:string;
		/**
		 *段位小图标
		 */
		public logoSmallAssetPath:string;
		/**
		 *最低分数(包含)
		 */
		public minScore:number;
		/**
		 *最高分数(不包含),配空则表示无上限
		 */
		public maxScore:number;
		/**
		 *最低排名要求
		 */
		public minRank:number;
		/**
		 *特殊的段位描述
优先使用这个
		 */
		public specialRankDesc:string;
		/**
		 *段位首次奖励
		 */
		public firstReachRankRewards:Array<{k:any,v:any}>;
		/**
		 *每日结算奖励
		 */
		public dailySettleRewards:Array<{k:any,v:any}>;
		/**
		 *每周结算奖励
		 */
		public weeklySettleRewards:Array<{k:any,v:any}>;
		/**
		 *true-失败不扣除积分,false-失败扣除积分
		 */
		public isMinusScoreWhenFail:boolean;
		/**
		 *机器人阵容池列表
		 */
		public robotSchemaIdArray:Array<any>;
		/**
		 *机器人英雄等级列表
		 */
		public robotHeroLvArray:Array<any>;
		/**
		 *机器人英雄星级列表
		 */
		public robotHeroStarArray:Array<any>;
		/**
		 *机器人装备ID列表
		 */
		public robotEquipIdArray:Array<any>;
		/**
		 *机器人使用的战队科技ID
		 */
		public robotCaptainId:number;
		/**
		 *机器人战队科技等级列表
		 */
		public robotCaptainLv:Array<any>;
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
	class ArenaRobotConfig {
		/**
		 *机器人id
		 */
		public id:number;
		/**
		 *英雄ID列表
		 */
		public heroIdArray:Array<any>;
	}
	class ArenaRobotShowConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *头像ID
		 */
		public headIconId:number;
		/**
		 *头像框id
		 */
		public headFrameId:number;
		/**
		 *称号id
		 */
		public titleId:number;
		/**
		 *形象id
		 */
		public showRoleId:number;
	}
	class ArenaScoreSettleConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *最小积分差值,配空表示无下限值
		 */
		public minScoreDiff:number;
		/**
		 *最大积分差值,配空表示无上限值
		 */
		public maxScoreDiff:number;
		/**
		 *胜利增加积分值
		 */
		public addScoreForWin:number;
		/**
		 *失败扣减积分值
		 */
		public addScoreForFail:number;
	}
	class ArenaTabConfig {
		/**
		 *唯一标识
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标
		 */
		public iconPath:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
	}
	class ArenaWeeklyRewardConfig {
		/**
		 *挑战次数
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *标题
		 */
		public title:string;
	}
}
