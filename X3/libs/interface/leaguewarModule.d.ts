declare module Vo.leaguewar{
	
	/**
	 * 挑战敌人
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		targetId:number;
		
		/**
		 * 挑战队伍编号，从0开始
		 */		
		teamIndex:number;
		
	}


	
	/**
	 * 挑战敌人
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决队伍信息
	 * @author GameCreator
	 */	
	class LeagueWarTeamVo	{
		/**
		 * 队伍下标
		 */		
		teamIndex:number;
		
		/**
		 * 玩家阵容查看信息
		 */		
		formationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 机器人阵容信息
		 */		
		robotVo:LeagueWarRobotVo;
		
		/**
		 * 剩余血量
		 */		
		leftHp:number;
		
		/**
		 * 战斗次数
		 */		
		fightCount:number;
		
	}


	
	/**
	 * 联盟对决机器人信息
	 * @author GameCreator
	 */	
	class LeagueWarRobotVo	{
		/**
		 * 机器人配置Id
		 */		
		robotConfigId:number;
		
		/**
		 * 机器人阵容配置Id
		 */		
		robotFormationId:number;
		
		/**
		 * 战力
		 */		
		fight:number;
		
	}


	
	/**
	 * 获取对决信息
	 * @author GameCreator
	 */	
	class GetLeagueWarInfoS2C	{
		content:Vo.leaguewar.LeagueWarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 进入联盟对决界面
	 * @author GameCreator
	 */	
	class EnterLeagueWarS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取敌人防守信息
	 * @author GameCreator
	 */	
	class GetEnemyDefenceInfoC2S	{
		targetId:number;
		
	}


	
	/**
	 * 获取敌人防守信息
	 * @author GameCreator
	 */	
	class GetEnemyDefenceInfoS2C	{
		content:Vo.leaguewar.LeagueWarDefenceVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取我方防守信息
	 * @author GameCreator
	 */	
	class GetSelfDefenceInfoC2S	{
		targetId:number;
		
	}


	
	/**
	 * 获取我方防守信息
	 * @author GameCreator
	 */	
	class GetSelfDefenceInfoS2C	{
		content:Vo.leaguewar.LeagueWarDefenceVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决联盟防守者信息
	 * @author GameCreator
	 */	
	class LeagueWarStarChangeVo	{
		/**
		 * 我方联盟星数
		 */		
		star:number;
		
		/**
		 * 对方联盟星数
		 */		
		opponentStar:number;
		
		/**
		 * 对方防守者信息
		 */		
		defenderVo:LeagueWarDefenderVo;
		
	}


	
	/**
	 * 联盟对决防守者信息
	 * @author GameCreator
	 */	
	class LeagueWarDefenderVo	{
		/**
		 * 玩家Id，<0为机器人
		 */		
		playerId:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
		/**
		 * 层级Id
		 */		
		ladderId:number;
		
		/**
		 * 防守阵容战力
		 */		
		fight:number;
		
		/**
		 * 形象Id
		 */		
		imageId:number;
		
		/**
		 * 血量列表
		 */		
		hps:Array<number>;
		
	}


	
	/**
	 * 获取对手联盟贡献度排行榜
	 * @author GameCreator
	 */	
	class GetOpponentScoreRanksS2C	{
		content:Array<Vo.leaguewar.LeagueWarPlayerScoreRankItemVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟对决排行
	 * @author GameCreator
	 */	
	class GetLeagueRanksC2S	{
		page:number;
		
	}


	
	/**
	 * 获取联盟对决排行
	 * @author GameCreator
	 */	
	class GetLeagueRanksS2C	{
		content:Vo.leaguewar.LeagueWarRankVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决防守信息
	 * @author GameCreator
	 */	
	class LeagueWarDefenceVo	{
		/**
		 * 玩家Id，<0为机器人
		 */		
		playerId:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
		/**
		 * 头像
		 */		
		headIcon:number;
		
		/**
		 * 头像框
		 */		
		headFrame:number;
		
		/**
		 * 层级Id
		 */		
		ladderId:number;
		
		/**
		 * 防御次数
		 */		
		defendCount:number;
		
		/**
		 * 防守队伍信息列表
		 */		
		teamVos:Array<LeagueWarTeamVo>;
		
	}


	
	/**
	 * 联盟对决排行榜条目信息
	 * @author GameCreator
	 */	
	class LeagueWarRankItemVo	{
		/**
		 * 排名
		 */		
		rank:number;
		
		/**
		 * 联盟Id
		 */		
		leagueId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 图标
		 */		
		icon:number;
		
		/**
		 * 战力
		 */		
		fight:number;
		
		/**
		 * 盟主名称
		 */		
		leaderName:string;
		
		/**
		 * 积分
		 */		
		score:number;
		
		/**
		 * 服务器
		 */		
		server:string;
		
	}


	
	/**
	 * 联盟对决信息
	 * @author GameCreator
	 */	
	class LeagueWarVo	{
		/**
		 * 第X赛季
		 */		
		season:number;
		
		/**
		 * 当前或者上一赛季结算时间
		 */		
		seasonSettleTime:number;
		
		/**
		 * 当前阶段
		 */		
		status:number;
		
		/**
		 * 本次对决开始时间，即开始匹配时间
		 */		
		warStartTime:number;
		
		/**
		 * 布阵阶段开始时间
		 */		
		setFormationTime:number;
		
		/**
		 * 对战阶段开始时间
		 */		
		battleTime:number;
		
		/**
		 * 结算阶段开始时间
		 */		
		settleTime:number;
		
		/**
		 * 本次对决结束时间
		 */		
		warEndTime:number;
		
		/**
		 * 下次对决开始时间
		 */		
		nextWarStartTime:number;
		
		/**
		 * 是否参与
		 */		
		join:boolean;
		
		/**
		 * 当前玩法是否在本服进行，否则为跨服
		 */		
		local:boolean;
		
		/**
		 * 当前是否为第一次对决
		 */		
		firstWar:boolean;
		
		/**
		 * 本联盟参与对决次数
		 */		
		joinTimes:number;
		
		/**
		 * 我方联盟信息
		 */		
		selfLeagueVo:Vo.leaguewar.LeagueWarLeagueVo;
		
		/**
		 * 我方参与玩家列表
		 */		
		selfDefenderVos:Array<Vo.leaguewar.LeagueWarDefenderVo>;
		
		/**
		 * 对手联盟信息
		 */		
		opponentLeagueVo:Vo.leaguewar.LeagueWarLeagueVo;
		
		/**
		 * 对手参与玩家列表
		 */		
		opponentDefenderVos:Array<Vo.leaguewar.LeagueWarDefenderVo>;
		
		/**
		 * 本玩家自定义阵容信息列表
		 */		
		formationVos:Array<Vo.formation.FormationVo>;
		
		/**
		 * 玩家剩余挑战次数
		 */		
		challengeTimes:number;
		
		/**
		 * 玩家贡献星数
		 */		
		gainStar:number;
		
		/**
		 * 本方联盟是否胜利
		 */		
		win:boolean;
		
		/**
		 * 当前段位积分
		 */		
		danScore:number;
		
	}


	
	/**
	 * 联盟对决战斗记录信息
	 * @author GameCreator
	 */	
	class LeagueWarFightReportVo	{
		/**
		 * 进攻方Id
		 */		
		attackId:number;
		
		/**
		 * 进攻方联盟Id
		 */		
		attackLeagueId:number;
		
		/**
		 * 防守方Id
		 */		
		defendId:number;
		
		/**
		 * 防守方联盟Id
		 */		
		defendLeagueId:number;
		
		/**
		 * 进攻方是否胜利
		 */		
		attackWin:boolean;
		
		/**
		 * 进攻方联盟名称
		 */		
		attackLeagueName:string;
		
		/**
		 * 进攻方名称
		 */		
		attackName:string;
		
		/**
		 * 防守方联盟名称
		 */		
		defenceLeagueName:string;
		
		/**
		 * 防守方名称
		 */		
		defenceName:string;
		
		/**
		 * 防守方层级Id
		 */		
		defenceLadderId:number;
		
		/**
		 * 血量变化
		 */		
		changeHp:number;
		
		/**
		 * 星数变化
		 */		
		changeStar:number;
		
	}


	
	/**
	 * 联盟对决个人贡献排行榜条目信息
	 * @author GameCreator
	 */	
	class LeagueWarPlayerScoreRankItemVo	{
		/**
		 * 玩家Id
		 */		
		playerId:number;
		
		/**
		 * 玩家名
		 */		
		name:string;
		
		/**
		 * 头像
		 */		
		headIcon:number;
		
		/**
		 * 头像框
		 */		
		headFrame:number;
		
		/**
		 * 称号
		 */		
		title:number;
		
		/**
		 * 贡献值
		 */		
		score:number;
		
		/**
		 * 挑战次数
		 */		
		challengeCount:number;
		
	}


	
	/**
	 * 获取联盟内贡献度排行信息列表
	 * @author GameCreator
	 */	
	class GetPlayerScoreRanksS2C	{
		content:Array<Vo.leaguewar.LeagueWarPlayerScoreRankItemVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决联盟信息
	 * @author GameCreator
	 */	
	class LeagueWarLeagueVo	{
		/**
		 * 联盟Id
		 */		
		leagueId:number;
		
		/**
		 * 联盟等级
		 */		
		level:number;
		
		/**
		 * 联盟名称
		 */		
		name:string;
		
		/**
		 * 段位Id
		 */		
		danId:number;
		
		/**
		 * 当前星级
		 */		
		star:number;
		
		/**
		 * 联盟图标
		 */		
		icon:number;
		
		/**
		 * 联盟旗帜
		 */		
		banner:number;
		
		/**
		 * 战力
		 */		
		fight:number;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
	}


	
	/**
	 * 获取战报记录
	 * @author GameCreator
	 */	
	class GetFightReportsC2S	{
		/**
		 * 是否只查看自己
		 */		
		onlyMe:boolean;
		
	}


	
	/**
	 * 获取战报记录
	 * @author GameCreator
	 */	
	class GetFightReportsS2C	{
		content:Array<Vo.leaguewar.LeagueWarFightReportVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决排行榜信息
	 * @author GameCreator
	 */	
	class LeagueWarRankVo	{
		/**
		 * 排行榜条目列表
		 */		
		itemVos:Array<LeagueWarRankItemVo>;
		
		/**
		 * 本联盟排行条目信息
		 */		
		selfItemVo:LeagueWarRankItemVo;
		
		/**
		 * 当前是第X页，从1开始
		 */		
		pageIndex:number;
		
		/**
		 * 页数
		 */		
		pageCount:number;
		
	}


	
	/**
	 * 保存防守阵容
	 * @author GameCreator
	 */	
	class UpdateFormationS2C	{
		content:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟对决战斗结果信息
	 * @author GameCreator
	 */	
	class LeagueWarFightResultVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 本次获得的星数
		 */		
		gainStar:number;
		
		/**
		 * 联盟当前总星数
		 */		
		star:number;
		
		/**
		 * 被挑战队伍剩余星数
		 */		
		opponentStar:number;
		
		/**
		 * 对手减少的血量
		 */		
		decreaseHp:number;
		
		/**
		 * 对手剩余血量
		 */		
		leftHp:number;
		
		/**
		 * 奖励信息列表
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 保存防守阵容
	 * @author GameCreator
	 */	
	class UpdateFormationC2S	{
		/**
		 * 防守阵容信息列表
		 */		
		reqVos:Array<Vo.formation.SetupCustomFormationReqVo>;
		
	}


}
