declare module Vo.secretinstance{
	
	/**
	 * 秘境副本扫荡
	 * @author GameCreator
	 */	
	class SweepC2S	{
		/**
		 * 扫荡层数
		 */		
		floor:number;
		
		/**
		 * 扫荡次数
		 */		
		count:number;
		
		advert:boolean;
		
	}


	
	/**
	 * 秘境副本扫荡
	 * @author GameCreator
	 */	
	class SweepS2C	{
		content:Vo.secretinstance.SecretInstanceSweepVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取排行榜列表
	 * @author GameCreator
	 */	
	class LoadRankListC2S	{
		/**
		 * 第几页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取排行榜列表
	 * @author GameCreator
	 */	
	class LoadRankListS2C	{
		content:Vo.secretinstance.SecretInstanceRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战秘境副本
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 挑战层数
		 */		
		floor:number;
		
	}


	
	/**
	 * 挑战秘境副本
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 秘境副本信息
	 * @author GameCreator
	 */	
	class SecretInstanceVo	{
		/**
		 * 已通关层数
		 */		
		passFloor:number;
		
		/**
		 * 秘境副本初始化自定义阵容,不为空则使用此阵容信息,为空则使用通用自定义阵容
		 */		
		customFormationVos:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 每层耗时最短时间MAP,层数-层数最短耗时(秒)
		 */		
		floorBattleSecondsMap:Object;
		
		/**
		 * 游戏服结算时间
		 */		
		serverSettleTime:number;
		
		/**
		 * 扫荡广告次数
		 */		
		todaySweepAdvertTimes:number;
		
	}


	
	/**
	 * 秘境副本玩法信息
	 * @author GameCreator
	 */	
	class SecretInstancePlayInfo	{
		/**
		 * 排名,没有则为-1
		 */		
		rank:number;
		
		/**
		 * 通关层数
		 */		
		passFloor:number;
		
		/**
		 * 结算时间
		 */		
		settleTime:number;
		
	}


	
	/**
	 * 秘境副本排行信息列表vo
	 * @author GameCreator
	 */	
	class SecretInstanceRankingVo	{
		/**
		 * 玩家当前名次,-1表示没排名
		 */		
		rank:number;
		
		/**
		 * 伤害值/进度,进度为万分比
		 */		
		value:number;
		
		/**
		 * 通关时间(秒)
		 */		
		passSeconds:number;
		
		/**
		 * 排行榜前X名
		 */		
		topList:Array<SecretInstanceRankItemVo>;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<SecretInstanceRankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 获取秘境副本信息
	 * @author GameCreator
	 */	
	class LoadSecretInstanceInfoS2C	{
		content:Vo.secretinstance.SecretInstanceVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 秘境副本扫荡vo
	 * @author GameCreator
	 */	
	class SecretInstanceSweepVo	{
		/**
		 * 奖励
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 消耗
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 扫荡广告次数
		 */		
		todaySweepAdvertTimes:number;
		
	}


	
	/**
	 * @author hong
	 * @author GameCreator
	 */	
	class SecretInstanceFloorVo	{
		/**
		 * 层数
		 */		
		floor:number;
		
		/**
		 * 房间id集合
		 */		
		roomIds:Array<number>;
		
	}


	
	/**
	 * @author hong
	 * @author GameCreator
	 */	
	class SecretInstanceRankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 通关层数
		 */		
		value:number;
		
		/**
		 * 通关时间(秒)
		 */		
		passSeconds:number;
		
		/**
		 * 服务器ID
		 */		
		serverId:string;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
	}


	
	/**
	 * 秘境副本战斗信息
	 * @author GameCreator
	 */	
	class SecretInstanceBattleInfo	{
		/**
		 * 当前所在层数,从1开始
		 */		
		currentFloor:number;
		
		/**
		 * SecretInstanceConfig的id
		 */		
		instanceConfigId:number;
		
		/**
		 * 秘境每层信息MAP,key为层数，value为秘境层信息
		 */		
		floorMap:Object;
		
	}


	
	/**
	 * 秘境副本挑战结果vo
	 * @author GameCreator
	 */	
	class SecretInstanceChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 当前已通关层数
		 */		
		passFloor:number;
		
		/**
		 * 当前排名,没有则为-1
		 */		
		rank:number;
		
		/**
		 * 挑战耗时(秒)
		 */		
		seconds:number;
		
		/**
		 * 挑战进度(万分比)
		 */		
		progress:number;
		
	}


}
