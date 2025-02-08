declare module Vo.leagueexplore{
	
	/**
	 * 资源勘探星球信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreStarVo	{
		/**
		 * 星球建筑简要信息列表
		 */		
		buildingBriefVos:Array<LeagueExploreBuildingBriefVo>;
		
	}


	
	/**
	 * 资源勘探
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingShareVo	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 建筑坐标
		 */		
		point:Vo.common.Point;
		
		/**
		 * 占领玩家ID,没有则为null
		 */		
		occupyPlayerId:number;
		
		/**
		 * 占领的玩家昵称,没有则为null
		 */		
		occupyPlayerName:string;
		
		/**
		 * 占领联盟ID,没有则为null
		 */		
		occupyLeagueId:number;
		
	}


	
	/**
	 * 资源勘探活动开启vo
	 * @author GameCreator
	 */	
	class LeagueExploreActivityStartVo	{
		/**
		 * 活动开启时间
		 */		
		startTime:number;
		
		/**
		 * 活动结束时间
		 */		
		endTime:number;
		
		/**
		 * 下次活动开启时间
		 */		
		nextStartTime:number;
		
	}


	
	/**
	 * 进入星球
	 * @author GameCreator
	 */	
	class EnterStarC2S	{
		/**
		 * 星球配置ID
		 */		
		starConfigId:number;
		
	}


	
	/**
	 * 进入星球
	 * @author GameCreator
	 */	
	class EnterStarS2C	{
		content:Array<Vo.leagueexplore.LeagueExploreBuildingBriefVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探建筑被攻击结果vo
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingBeAttackResult	{
		/**
		 * 玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 攻击建筑
	 * @author GameCreator
	 */	
	class AttackBuildingC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
	}


	
	/**
	 * 攻击建筑
	 * @author GameCreator
	 */	
	class AttackBuildingS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 建筑置顶占领位置,返回当前占领位置
	 * @author GameCreator
	 */	
	class TopBuildingOccupyS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探活动信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreActivityInfoVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 下次开启时间
		 */		
		nextStartTime:number;
		
		/**
		 * 资源勘探玩家信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 获取星球列表
	 * @author GameCreator
	 */	
	class LoadStarListS2C	{
		content:Array<Vo.leagueexplore.LeagueExploreStarBriefVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取挂机奖励
	 * @author GameCreator
	 */	
	class DrawHangUpRewardS2C	{
		content:Vo.leagueexplore.LeagueExploreHangUpRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探建筑驻守位置更新vo
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingSeatUpdateVo	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 占领玩家信息列表
		 */		
		memberVos:Array<LeagueExploreMemberVo>;
		
	}


	
	/**
	 * 互换建筑
	 * @author GameCreator
	 */	
	class ExchangeBuildingC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 互换位置
		 */		
		seatIndex:number;
		
	}


	
	/**
	 * 互换建筑
	 * @author GameCreator
	 */	
	class ExchangeBuildingS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取星球建筑列表
	 * @author GameCreator
	 */	
	class LoadStarBuildingListC2S	{
		/**
		 * 星球配置ID
		 */		
		starConfigId:number;
		
	}


	
	/**
	 * 获取星球建筑列表
	 * @author GameCreator
	 */	
	class LoadStarBuildingListS2C	{
		content:Array<Vo.leagueexplore.LeagueExploreBuildingBriefVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探快速挂机vo
	 * @author GameCreator
	 */	
	class LeagueExploreFastHangUpVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 占领建筑
	 * @author GameCreator
	 */	
	class OccupyBuildingC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
	}


	
	/**
	 * 占领建筑
	 * @author GameCreator
	 */	
	class OccupyBuildingS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探人员信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreMemberVo	{
		/**
		 * 占领位置,从1开始
		 */		
		occupyIndex:number;
		
		/**
		 * 玩家信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 连胜/连败,>0为连胜次数,<0为连败次数
		 */		
		continueWinOrFail:number;
		
		/**
		 * 连胜/连败BUFF结束时间
		 */		
		buffEndTime:number;
		
		/**
		 * 占领挂机开始时间,领取奖励后会更新
		 */		
		hangUpStartTime:number;
		
		/**
		 * 挂机时间上限额外加成(毫秒)
		 */		
		hangUpAdditionMillis:number;
		
		/**
		 * 挂机奖励额外加成(万分比)
		 */		
		hangUpRewardAddition:number;
		
	}


	
	/**
	 * 资源勘探玩家信息vo
	 * @author GameCreator
	 */	
	class LeagueExplorePlayerInfoVo	{
		/**
		 * 今日进攻奖励次数
		 */		
		todayAttackRewardCount:number;
		
		/**
		 * 占领的建筑ID
		 */		
		occupyBuildingConfigId:number;
		
		/**
		 * 连胜/连败,>0为连胜次数,<0为连败次数
		 */		
		continueWinOrFail:number;
		
		/**
		 * 连胜/连败BUFF结束时间
		 */		
		buffEndTime:number;
		
		/**
		 * 占领挂机开始时间,领取奖励后会更新
		 */		
		hangUpStartTime:number;
		
		/**
		 * 当前攻打的建筑配置ID
		 */		
		attackBuildingConfigId:number;
		
		/**
		 * 进攻限制时间
		 */		
		attackLimitTime:number;
		
		/**
		 * 进攻冷却重置次数
		 */		
		attackLimitResetTimes:number;
		
		/**
		 * 已击败的攻打的建筑驻守玩家ID列表,攻打不同的建筑会重置
		 */		
		defeatPlayerIds:Array<number>;
		
		/**
		 * 是否击败攻打建筑的机器人
		 */		
		defeatRobot:boolean;
		
		/**
		 * 频道分享时间MAP
		 */		
		channelShareTimeMap:Object;
		
	}


	
	/**
	 * 资源勘探被互换建筑结果
	 * @author GameCreator
	 */	
	class LeagueExploreBeExchangeBuildingResult	{
		/**
		 * 被挑战玩家互换前的建筑配置ID
		 */		
		exchangeSourceBuildingConfigId:number;
		
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 资源探索联盟排名信息
	 * @author GameCreator
	 */	
	class LeagueExploreRankItemVo	{
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 联盟名称
		 */		
		name:string;
		
		/**
		 * 图案
		 */		
		icon:number;
		
		/**
		 * 旗帜
		 */		
		banner:number;
		
		/**
		 * 盟主ID
		 */		
		leaderId:number;
		
		/**
		 * 盟主昵称
		 */		
		leaderName:string;
		
		/**
		 * 盟主形象
		 */		
		imageId:number;
		
		/**
		 * 联盟积分
		 */		
		score:number;
		
	}


	
	/**
	 * 资源勘探星球简要信息VO
	 * @author GameCreator
	 */	
	class LeagueExploreStarBriefVo	{
		/**
		 * 星球配置ID
		 */		
		starConfigId:number;
		
		/**
		 * 建筑总数
		 */		
		buildingCount:number;
		
		/**
		 * 已占领建筑数量
		 */		
		occupiedBuildingCount:number;
		
		/**
		 * 本盟占领建筑数量
		 */		
		selfLeagueOccupyCount:number;
		
	}


	
	/**
	 * 驻守建筑
	 * @author GameCreator
	 */	
	class DefendBuildingC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
	}


	
	/**
	 * 驻守建筑
	 * @author GameCreator
	 */	
	class DefendBuildingS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探互换建筑结果
	 * @author GameCreator
	 */	
	class LeagueExploreExchangeBuildingResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 挑战玩家互换的目标建筑配置ID
		 */		
		exchangeTargetBuildingConfigId:number;
		
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 联盟资源勘探日志
	 * @author GameCreator
	 */	
	class LeagueExploreRecord	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 日志类型,LeagueExploreLogType
		 */		
		logType:number;
		
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 时间
		 */		
		time:number;
		
	}


	
	/**
	 * 资源勘探自动占领建筑vo
	 * @author GameCreator
	 */	
	class LeagueExploreAutoOccupyBuildingVo	{
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 资源勘探建筑简要信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingBriefVo	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 占领玩家信息
		 */		
		occupyPlayerBaseVos:Array<Vo.player.PlayerBaseVo>;
		
		/**
		 * 是否自己联盟占领
		 */		
		selfLeagueOccupy:boolean;
		
		/**
		 * 建筑首个驻守位置玩家是否正在发起进攻
		 */		
		attacking:boolean;
		
		/**
		 * 当前驻守的联盟ID
		 */		
		defendLeagueId:number;
		
		/**
		 * 当前驻守的联盟名称
		 */		
		defendLeagueName:string;
		
		/**
		 * 是否被其他联盟进攻
		 */		
		beAttacking:boolean;
		
		/**
		 * 当前进攻此建筑的联盟ID,没有则为0
		 */		
		beAttackLeagueId:number;
		
		/**
		 * 当前进攻此建筑的玩家ID,没有则为0
		 */		
		beAttackPlayerId:number;
		
		/**
		 * 当前进攻此建筑的开始时间,没有则为0
		 */		
		beAttackStartTime:number;
		
		/**
		 * 建筑状态,LeagueExploreBuildingState
		 */		
		buildingState:number;
		
		/**
		 * 状态开始时间
		 */		
		stateStartTime:number;
		
		/**
		 * 状态结束时间
		 */		
		stateEndTime:number;
		
		/**
		 * 建筑沦陷开始时间
		 */		
		captureStartTime:number;
		
		/**
		 * 沦陷玩家信息MAP,key:玩家ID,value:玩家沦陷时间
		 */		
		capturePlayerMap:Object;
		
	}


	
	/**
	 * 资源勘探机器人信息VO
	 * @author GameCreator
	 */	
	class LeagueExploreRobotVo	{
		/**
		 * 重生时间,大于当前时间表示机器人死亡等待重生
		 */		
		rebirthTime:number;
		
	}


	
	/**
	 * 资源勘探驻守位置信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreSeatVo	{
		/**
		 * 建筑位置,从1开始
		 */		
		seatIndex:number;
		
		/**
		 * 沦陷状态开始时间
		 */		
		captureStartTime:number;
		
		/**
		 * 沦陷的玩家ID MAP, key:玩家ID,value:玩家在该位置上的沦陷时间
		 */		
		capturePlayerMap:Object;
		
	}


	
	/**
	 * 资源勘探自己取消占领vo
	 * @author GameCreator
	 */	
	class LeagueExploreSelfCancelOccupyVo	{
		/**
		 * 更新玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 玩家资源勘探日志记录
	 * @author GameCreator
	 */	
	class PlayerLeagueExploreRecord	{
		/**
		 * 攻击方基础信息
		 */		
		attackerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 攻击方单位统计列表
		 */		
		attackerStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 防守方基础信息
		 */		
		defenderBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 防守方单位统计列表
		 */		
		defenderStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 攻击方是否胜利
		 */		
		attackerWin:boolean;
		
		/**
		 * 日志类型,LeagueExploreLogType
		 */		
		logType:number;
		
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 时间
		 */		
		time:number;
		
	}


	
	/**
	 * 资源勘探建筑状态变更vo
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingStateChangeVo	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 占领人员信息列表
		 */		
		occupyMemberVos:Array<LeagueExploreMemberVo>;
		
		/**
		 * 建筑机器人守卫信息,没有则为null
		 */		
		robotVo:LeagueExploreRobotVo;
		
		/**
		 * 建筑对应的工厂驻守玩家信息列表
		 */		
		parentMemberVos:Array<LeagueExploreMemberBriefVo>;
		
		/**
		 * 建筑对应的工厂驻守机器人信息,没有则为null
		 */		
		parentRobotVo:LeagueExploreRobotVo;
		
		/**
		 * 建筑首个驻守位置玩家是否正在发起进攻
		 */		
		attacking:boolean;
		
		/**
		 * 当前驻守的联盟ID
		 */		
		defendLeagueId:number;
		
		/**
		 * 当前驻守的联盟名称
		 */		
		defendLeagueName:string;
		
		/**
		 * 当前是否正在被攻击
		 */		
		beAttacking:boolean;
		
		/**
		 * 当前进攻此建筑的联盟ID,没有则为0
		 */		
		beAttackLeagueId:number;
		
		/**
		 * 当前进攻此建筑的玩家ID,没有则为0
		 */		
		beAttackPlayerId:number;
		
		/**
		 * 当前进攻此建筑的开始时间,没有则为0
		 */		
		beAttackStartTime:number;
		
		/**
		 * 建筑状态,LeagueExploreBuildingState
		 */		
		state:number;
		
		/**
		 * 状态开始时间
		 */		
		stateStartTime:number;
		
		/**
		 * 状态结束时间
		 */		
		stateEndTime:number;
		
		/**
		 * 建筑沦陷开始时间
		 */		
		captureStartTime:number;
		
		/**
		 * 沦陷玩家信息MAP,key:玩家ID,value:玩家沦陷时间
		 */		
		capturePlayerMap:Object;
		
	}


	
	/**
	 * 资源勘探驻守建筑结果
	 * @author GameCreator
	 */	
	class LeagueExploreDefendBuildingResult	{
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 获取资源勘探个人日志记录
	 * @author GameCreator
	 */	
	class LoadPlayerExploreRecordS2C	{
		content:Array<Vo.leagueexplore.PlayerLeagueExploreRecord>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 重置进攻冷却
	 * @author GameCreator
	 */	
	class ResetAttackLimitS2C	{
		content:Vo.leagueexplore.LeagueExploreResetAttackLimitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探建筑信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingVo	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 占领玩家信息列表
		 */		
		memberVos:Array<LeagueExploreMemberVo>;
		
		/**
		 * 建筑机器人守卫信息,没有则为null
		 */		
		robotVo:LeagueExploreRobotVo;
		
		/**
		 * 建筑对应的工厂驻守玩家信息列表
		 */		
		parentMemberVos:Array<LeagueExploreMemberBriefVo>;
		
		/**
		 * 建筑对应的工厂驻守机器人信息,没有则为null
		 */		
		parentRobotVo:LeagueExploreRobotVo;
		
		/**
		 * 建筑首个驻守位置玩家是否正在发起进攻
		 */		
		attacking:boolean;
		
		/**
		 * 当前驻守的联盟ID
		 */		
		defendLeagueId:number;
		
		/**
		 * 当前驻守的联盟名称
		 */		
		defendLeagueName:string;
		
		/**
		 * 当前是否正在被攻击
		 */		
		beAttacking:boolean;
		
		/**
		 * 当前进攻此建筑的联盟ID,没有则为0
		 */		
		beAttackLeagueId:number;
		
		/**
		 * 当前进攻此建筑的玩家ID,没有则为0
		 */		
		beAttackPlayerId:number;
		
		/**
		 * 当前进攻此建筑的开始时间,没有则为0
		 */		
		beAttackStartTime:number;
		
		/**
		 * 建筑状态
		 */		
		buildingState:number;
		
		/**
		 * 状态开始时间
		 */		
		stateStartTime:number;
		
		/**
		 * 状态结束时间
		 */		
		stateEndTime:number;
		
		/**
		 * 建筑沦陷开始时间
		 */		
		captureStartTime:number;
		
		/**
		 * 沦陷玩家信息MAP,key:玩家ID,value:玩家沦陷时间
		 */		
		capturePlayerMap:Object;
		
	}


	
	/**
	 * 资源勘探建筑攻击结果
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingAttackResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 攻打的建筑配置ID
		 */		
		attackBuildingConfigId:number;
		
		/**
		 * 奖励结果
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


	
	/**
	 * 资源勘探挂机奖励vo
	 * @author GameCreator
	 */	
	class LeagueExploreHangUpRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领取奖励后的挂机开始时间
		 */		
		hangUpStartTime:number;
		
	}


	
	/**
	 * 获取星球建筑详情
	 * @author GameCreator
	 */	
	class LoadBuildingInfoC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
	}


	
	/**
	 * 获取星球建筑详情
	 * @author GameCreator
	 */	
	class LoadBuildingInfoS2C	{
		content:Vo.leagueexplore.LeagueExploreBuildingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探玩法信息
	 * @author GameCreator
	 */	
	class LeagueExplorePlayInfo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间,0或者小于当前时间表示未开启
		 */		
		endTime:number;
		
	}


	
	/**
	 * 取消占领
	 * @author GameCreator
	 */	
	class CancelOccupyS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取资源勘探联盟日志记录
	 * @author GameCreator
	 */	
	class LoadLeagueExploreRecordS2C	{
		content:Array<Vo.leagueexplore.LeagueExploreRecord>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取资源勘探活动信息
	 * @author GameCreator
	 */	
	class LoadLeagueExploreInfoS2C	{
		content:Vo.leagueexplore.LeagueExploreActivityInfoVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 快速采矿
	 * @author GameCreator
	 */	
	class FastExploreC2S	{
		/**
		 * 是否高级采矿
		 */		
		advanced:boolean;
		
		/**
		 * 数量
		 */		
		count:number;
		
	}


	
	/**
	 * 快速采矿
	 * @author GameCreator
	 */	
	class FastExploreS2C	{
		content:Vo.leagueexplore.LeagueExploreFastHangUpVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探人员简要信息vo
	 * @author GameCreator
	 */	
	class LeagueExploreMemberBriefVo	{
		/**
		 * 占领位置,从1开始
		 */		
		occupyIndex:number;
		
		/**
		 * 玩家ID
		 */		
		playerId:number;
		
		/**
		 * 玩家昵称
		 */		
		playerName:string;
		
	}


	
	/**
	 * 分享建筑,返回频道分享时间MAP,key为频道类型,value为最后分享时间
	 * @author GameCreator
	 */	
	class ShareBuildingC2S	{
		/**
		 * 建筑配置ID
		 */		
		buildingConfigId:number;
		
		/**
		 * 建筑坐标
		 */		
		point:Vo.common.Point;
		
		/**
		 * 分享的频道ID
		 */		
		channelIds:Array<number>;
		
		/**
		 * 分享的私聊玩家ID
		 */		
		targetId:number;
		
	}


	
	/**
	 * 分享建筑,返回频道分享时间MAP,key为频道类型,value为最后分享时间
	 * @author GameCreator
	 */	
	class ShareBuildingS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 退出星球
	 * @author GameCreator
	 */	
	class ExitStarC2S	{
		/**
		 * 星球配置ID
		 */		
		starConfigId:number;
		
	}


	
	/**
	 * 退出星球
	 * @author GameCreator
	 */	
	class ExitStarS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源勘探重置进攻冷却vo
	 * @author GameCreator
	 */	
	class LeagueExploreResetAttackLimitVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 进攻冷却时间
		 */		
		attackLimitTime:number;
		
	}


	
	/**
	 * 资源勘探建筑占领结果
	 * @author GameCreator
	 */	
	class LeagueExploreBuildingOccupyResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 更新的玩家占领信息
		 */		
		playerInfoVo:LeagueExplorePlayerInfoVo;
		
	}


}
