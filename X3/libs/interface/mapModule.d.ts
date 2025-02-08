declare module Vo.map{
	
	/**
	 * 领取地图任务奖励
	 * @author GameCreator
	 */	
	class DrawTrunkMapTaskRewardC2S	{
		/**
		 * 地图任务ID
		 */		
		trunkMapTaskId:number;
		
	}


	
	/**
	 * 领取地图任务奖励
	 * @author GameCreator
	 */	
	class DrawTrunkMapTaskRewardS2C	{
		content:Vo.task.TaskRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图资源领奖信息
	 * @author GameCreator
	 */	
	class MapResourceDrawVo	{
		/**
		 * 普通奖励内容
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 资源点刷新时间,资源点配置ID-最近的下次刷新时间
		 */		
		resourceNextRefreshTimeMap:Object;
		
		/**
		 * boss首杀奖励MAP,MapMonsterConfig#id-奖励内容
		 */		
		bossRewardResults:Object;
		
	}


	
	/**
	 * 复活队伍
	 * @author GameCreator
	 */	
	class RebirthTeamS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图BOSS广告奖励vo
	 * @author GameCreator
	 */	
	class MapBossAdvertRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 地图BOSS资源配置id
		 */		
		mapBossResourceConfigId:number;
		
	}


	
	/**
	 * 主线地图传送事件,目标传送点TeleportlistConfig.taskTeleport为true请求此接口
	 * @author GameCreator
	 */	
	class TeleportEventC2S	{
		/**
		 * 目标传送点ID,TeleportlistConfig.id
		 */		
		targetTeleportId:number;
		
	}


	
	/**
	 * 主线地图传送事件,目标传送点TeleportlistConfig.taskTeleport为true请求此接口
	 * @author GameCreator
	 */	
	class TeleportEventS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 资源点信息
	 * @author GameCreator
	 */	
	class MapResourceVo	{
		/**
		 * 地图资源点配置ID,对应MapResourceConfig的id
		 */		
		mapResourceConfigId:number;
		
		/**
		 * 资源点下次最近的刷新时间,小于当前服务器时间则不用刷新
		 */		
		nextRefreshTime:number;
		
		/**
		 * 资源点当前存活的资源索引列表
		 */		
		survivalResourceIdxs:Array<number>;
		
		/**
		 * 更新的存活资源索引列表
		 */		
		updateSurvivalResourceIdxs:Array<number>;
		
		/**
		 * 未击杀过的资源索引列表
		 */		
		notKilledResourceIdxs:Array<number>;
		
	}


	
	/**
	 * 地图资源点领取请求Vo
	 * @author GameCreator
	 */	
	class MapResourceDrawReqVo	{
		/**
		 * 资源点配置ID
		 */		
		mapResourceConfigId:number;
		
		/**
		 * 领取资源点下标列表,从0开始
		 */		
		resourceIndexes:Array<number>;
		
	}


	
	/**
	 * 更新章节资源上限提示
	 * @author GameCreator
	 */	
	class UpdateChapterResourceLimitTipS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 更新章节资源上限提示
	 * @author GameCreator
	 */	
	class UpdateChapterResourceLimitTipC2S	{
		/**
		 * 章节ID
		 */		
		chapterId:number;
		
	}


	
	/**
	 * 地图建筑解锁Vo
	 * @author GameCreator
	 */	
	class MapBuildingUnlockVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 解锁奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 解锁的建筑ID列表
		 */		
		unlockBuildingIds:Array<number>;
		
	}


	
	/**
	 * 解锁建筑
	 * @author GameCreator
	 */	
	class UnlockBuildingC2S	{
		/**
		 * 建筑ID
		 */		
		buildingId:number;
		
	}


	
	/**
	 * 解锁建筑
	 * @author GameCreator
	 */	
	class UnlockBuildingS2C	{
		content:Vo.map.MapBuildingUnlockVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取有存活资源的资源点
	 * @author GameCreator
	 */	
	class LoadSurvivalMapResourcesC2S	{
		/**
		 * 资源点配置ID列表
		 */		
		mapResourceConfigIds:Array<number>;
		
	}


	
	/**
	 * 获取有存活资源的资源点
	 * @author GameCreator
	 */	
	class LoadSurvivalMapResourcesS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图BOSS宝箱
	 * @author GameCreator
	 */	
	class MapBossBoxVo	{
		/**
		 * 掉落的宝箱配置ID
		 */		
		boxConfigId:number;
		
	}


	
	/**
	 * 采集/领取地图资源点
	 * @author GameCreator
	 */	
	class DrawMapResourcesC2S	{
		/**
		 * 地图资源点领取请求Vo
		 */		
		reqVos:Array<Vo.map.MapResourceDrawReqVo>;
		
	}


	
	/**
	 * 采集/领取地图资源点
	 * @author GameCreator
	 */	
	class DrawMapResourcesS2C	{
		content:Vo.map.MapResourceDrawVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 首次返回主城
	 * @author GameCreator
	 */	
	class FirstReturnMainCityS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图主城广告宝箱vo
	 * @author GameCreator
	 */	
	class MapMainCityAdvertBoxVo	{
		/**
		 * 宝箱刷新时间,刷新时间大于领取时间则表示宝箱未领取,反之则宝箱已领取
		 */		
		refreshTime:number;
		
		/**
		 * 宝箱最后领取时间
		 */		
		lastDrawTime:number;
		
		/**
		 * 宝箱今日次数
		 */		
		todayTimes:number;
		
	}


	
	/**
	 * 挑战地图副本
	 * @author GameCreator
	 */	
	class ChallengeMapInstanceC2S	{
		/**
		 * 地图副本ID
		 */		
		mapInstanceId:number;
		
	}


	
	/**
	 * 挑战地图副本
	 * @author GameCreator
	 */	
	class ChallengeMapInstanceS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 主线地图信息Vo
	 * @author GameCreator
	 */	
	class TrunkMapInfoVo	{
		/**
		 * 星球ID
		 */		
		starId:number;
		
		/**
		 * 已领取资源信息Map,资源物品ID-领取数量
		 */		
		drawResourceMap:Object;
		
	}


	
	/**
	 * 地图建筑广告奖励信息
	 * @author GameCreator
	 */	
	class MapBuildingAdvertRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领取广告奖励的建筑id
		 */		
		buildingId:number;
		
	}


	
	/**
	 * 领取地图BOSS奖励广告奖励
	 * @author GameCreator
	 */	
	class DrawMapBossAdvertRewardC2S	{
		/**
		 * 地图BOSS资源配置ID,MapResourceConfig.id
		 */		
		mapBossResourceConfigId:number;
		
	}


	
	/**
	 * 领取地图BOSS奖励广告奖励
	 * @author GameCreator
	 */	
	class DrawMapBossAdvertRewardS2C	{
		content:Vo.map.MapBossAdvertRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 首次探索地图
	 * @author GameCreator
	 */	
	class FirstExploreMapC2S	{
		/**
		 * 地图ID
		 */		
		mapId:number;
		
	}


	
	/**
	 * 首次探索地图
	 * @author GameCreator
	 */	
	class FirstExploreMapS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取地图宝箱奖励广告奖励
	 * @author GameCreator
	 */	
	class DrawBoxBuildingAdvertRewardC2S	{
		/**
		 * 地图宝箱建筑ID
		 */		
		boxBuildingId:number;
		
	}


	
	/**
	 * 领取地图宝箱奖励广告奖励
	 * @author GameCreator
	 */	
	class DrawBoxBuildingAdvertRewardS2C	{
		content:Vo.map.MapBuildingAdvertRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图登录信息
	 * @author GameCreator
	 */	
	class MapLoginVo	{
		/**
		 * 已解锁的建筑ID列表
		 */		
		unlockedBuildingIds:Array<number>;
		
		/**
		 * 已提示资源限制的章节ID列表
		 */		
		resourceLimitTipChapterIds:Array<number>;
		
		/**
		 * 地图宝箱已领取广告次数MAP,宝箱建筑ID-领取广告奖励次数
		 */		
		boxBuildingAdvertTimesMap:Object;
		
		/**
		 * 地图BOSS已领取广告次数MAP,MapResourceConfig的id-领取广告奖励次数
		 */		
		mapBossAdvertTimesMap:Object;
		
		/**
		 * 地图主城广告宝箱信息
		 */		
		mapMainCityAdvertBoxVo:MapMainCityAdvertBoxVo;
		
		/**
		 * 已通关的地图副本ID
		 */		
		passMapInstanceIds:Array<number>;
		
		/**
		 * 已探索的地图ID列表
		 */		
		exploreMapIds:Array<number>;
		
		/**
		 * 主线地图信息
		 */		
		trunkMapInfoVos:Array<TrunkMapInfoVo>;
		
		/**
		 * 地图任务信息
		 */		
		mapTaskInfo:Vo.task.TaskInfoVo;
		
		/**
		 * 建筑任务信息
		 */		
		buildingTaskInfo:Vo.task.TaskInfoVo;
		
	}


	
	/**
	 * 加载有变化的地图资源
	 * @author GameCreator
	 */	
	class LoadChangedMapResourcesC2S	{
		/**
		 * 资源点配置ID列表
		 */		
		mapResourceConfigIds:Array<number>;
		
	}


	
	/**
	 * 加载有变化的地图资源
	 * @author GameCreator
	 */	
	class LoadChangedMapResourcesS2C	{
		content:Array<Vo.map.MapResourceVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取地图主城广告宝箱信息
	 * @author GameCreator
	 */	
	class DrawMapMainCityAdvertBoxVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 地图主城广告宝箱信息
		 */		
		advertBoxVo:MapMainCityAdvertBoxVo;
		
	}


	
	/**
	 * 领取主城广告宝箱
	 * @author GameCreator
	 */	
	class DrawMainCityAdvertBoxS2C	{
		content:Vo.map.DrawMapMainCityAdvertBoxVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取地图资源点信息
	 * @author GameCreator
	 */	
	class LoadMapResourcesC2S	{
		/**
		 * 资源点配置ID列表
		 */		
		mapResourceConfigIds:Array<number>;
		
	}


	
	/**
	 * 获取地图资源点信息
	 * @author GameCreator
	 */	
	class LoadMapResourcesS2C	{
		content:Array<Vo.map.MapResourceVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 地图副本挑战结果vo
	 * @author GameCreator
	 */	
	class MapInstanceChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 挑战的地图副本ID
		 */		
		mapInstanceId:number;
		
	}


}
