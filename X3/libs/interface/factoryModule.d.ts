declare module Vo.factory{
	
	/**
	 * 取消生产线占领vo
	 * @author GameCreator
	 */	
	class CancelProductLineOccupyVo	{
		/**
		 * 取消占领的生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 当前占领使用的收藏品idMap, key:收藏品ID,value:生产线配置ID
		 */		
		occupyCollectiblesIdMap:Object;
		
		/**
		 * 当前占领使用的宠物idMap, key:宠物ID,value:生产线配置ID
		 */		
		occupyPetBaseIdMap:Object;
		
		/**
		 * 当前占领的使用英雄idMap, key:英雄ID,value:生产线配置ID
		 */		
		occupyHeroBaseIdMap:Object;
		
	}


	
	/**
	 * 生产线简要信息vo
	 * @author GameCreator
	 */	
	class ProductLineBriefVo	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 生产线配置ID
		 */		
		productLineConfigId:number;
		
		/**
		 * 生产线开始时间
		 */		
		startTime:number;
		
		/**
		 * 生产线结束时间
		 */		
		endTime:number;
		
		/**
		 * 生产线归属玩家ID
		 */		
		belongPlayerId:number;
		
		/**
		 * 占领的玩家ID
		 */		
		occupyPlayerId:number;
		
	}


	
	/**
	 * 加载星际工厂排行榜
	 * @author GameCreator
	 */	
	class LoadFactoryRankC2S	{
		/**
		 * 第几页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 加载星际工厂排行榜
	 * @author GameCreator
	 */	
	class LoadFactoryRankS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 删除战报
	 * @author GameCreator
	 */	
	class DelFactoryRecordC2S	{
		/**
		 * 战报ID列表
		 */		
		recordIds:Array<number>;
		
	}


	
	/**
	 * 删除战报
	 * @author GameCreator
	 */	
	class DelFactoryRecordS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家工厂信息
	 * @author GameCreator
	 */	
	class PlayerFactoryVo	{
		/**
		 * 体力信息
		 */		
		powerVo:FactoryPowerVo;
		
		/**
		 * 今日占领次数
		 */		
		todayOccupyTimes:number;
		
		/**
		 * 今日占领奖励次数
		 */		
		todayOccupyRewardTimes:number;
		
		/**
		 * 最后一次生产线结束时间,生产线为空时计算下个生产线刷新时间
		 */		
		lastProductLineEndTime:number;
		
		/**
		 * 当前占领使用的收藏品idMap, key:收藏品ID,value:生产线配置ID
		 */		
		occupyCollectiblesIdMap:Object;
		
		/**
		 * 当前占领使用的宠物idMap, key:宠物ID,value:生产线配置ID
		 */		
		occupyPetBaseIdMap:Object;
		
		/**
		 * 当前占领的使用英雄idMap, key:英雄ID,value:生产线配置ID
		 */		
		occupyHeroBaseIdMap:Object;
		
		/**
		 * 玩家自己的生产线信息
		 */		
		selfProductLineVo:ProductLineBriefVo;
		
		/**
		 * 玩家占领的生产线简要信息
		 */		
		occupyProductLineVos:Array<ProductLineBriefVo>;
		
	}


	
	/**
	 * 星际工厂排名信息
	 * @author GameCreator
	 */	
	class FactoryRankItemVo	{
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 工厂基础信息
		 */		
		baseVo:PlayerFactoryBaseVo;
		
	}


	
	/**
	 * 购买体力
	 * @author GameCreator
	 */	
	class BuyPowerC2S	{
		/**
		 * 购买数量
		 */		
		count:number;
		
	}


	
	/**
	 * 购买体力
	 * @author GameCreator
	 */	
	class BuyPowerS2C	{
		content:Vo.factory.FactoryBuyPowerVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 生产线查看信息vo
	 * @author GameCreator
	 */	
	class ProductLineVisitVo	{
		/**
		 * 查看的生产线唯一ID
		 */		
		produceLineId:number;
		
		/**
		 * 生产线信息,为null则生产线已经不存在
		 */		
		productLineVo:ProductLineVo;
		
	}


	
	/**
	 * 占领生产线
	 * @author GameCreator
	 */	
	class OccupyProductLineC2S	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 阵型信息
		 */		
		formationReqVo:Vo.formation.SetupFormationReqVo;
		
	}


	
	/**
	 * 占领生产线
	 * @author GameCreator
	 */	
	class OccupyProductLineS2C	{
		content:Vo.factory.OccupyProductLineResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取生产线奖励
	 * @author GameCreator
	 */	
	class DrawProductLineC2S	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 是否跳过倒计时
		 */		
		skip:boolean;
		
	}


	
	/**
	 * 领取生产线奖励
	 * @author GameCreator
	 */	
	class DrawProductLineS2C	{
		content:Vo.factory.DrawProductLineRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 查看生产线信息
	 * @author GameCreator
	 */	
	class VisitProductLineInfoS2C	{
		content:Vo.factory.ProductLineVisitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 取消占领
	 * @author GameCreator
	 */	
	class CancelOccupyC2S	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
	}


	
	/**
	 * 取消占领
	 * @author GameCreator
	 */	
	class CancelOccupyS2C	{
		content:Vo.factory.CancelProductLineOccupyVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 查看生产线信息
	 * @author GameCreator
	 */	
	class VisitProductLineInfoC2S	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
	}


	
	/**
	 * 查看其他玩家工厂信息
	 * @author GameCreator
	 */	
	class VisitFactoryInfoC2S	{
		/**
		 * 目标玩家ID
		 */		
		targetId:number;
		
	}


	
	/**
	 * 查看其他玩家工厂信息
	 * @author GameCreator
	 */	
	class VisitFactoryInfoS2C	{
		content:Vo.factory.PlayerFactoryVisitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家星际工厂查看信息vo
	 * @author GameCreator
	 */	
	class PlayerFactoryVisitVo	{
		/**
		 * 生产线归属玩家
		 */		
		playerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 最后一次生产线结束时间,生产线为空时计算下个生产线刷新时间
		 */		
		lastProductLineEndTime:number;
		
		/**
		 * 生产线信息
		 */		
		productLineVo:ProductLineVo;
		
	}


	
	/**
	 * 加载星际工厂战报
	 * @author GameCreator
	 */	
	class LoadFactoryRecordS2C	{
		content:Array<Vo.factory.FactoryRecord>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 阅读战报
	 * @author GameCreator
	 */	
	class ReadFactoryRecordC2S	{
		/**
		 * 战报ID列表
		 */		
		recordIds:Array<number>;
		
	}


	
	/**
	 * 阅读战报
	 * @author GameCreator
	 */	
	class ReadFactoryRecordS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 占领生产线结果vo
	 * @author GameCreator
	 */	
	class OccupyProductLineResultVo	{
		/**
		 * 是否进战,进战则占领结果走推送且接口返回仅处理此字段,否则直接更新数据
		 */		
		fight:boolean;
		
		/**
		 * 是否占领成功
		 */		
		occupy:boolean;
		
		/**
		 * 消耗体力值
		 */		
		powerVo:FactoryPowerVo;
		
		/**
		 * 当前占领使用的收藏品idMap, key:收藏品ID,value:生产线配置ID
		 */		
		occupyCollectiblesIdMap:Object;
		
		/**
		 * 当前占领使用的宠物idMap, key:宠物ID,value:生产线配置ID
		 */		
		occupyPetBaseIdMap:Object;
		
		/**
		 * 当前占领的使用英雄idMap, key:英雄ID,value:生产线配置ID
		 */		
		occupyHeroBaseIdMap:Object;
		
		/**
		 * 本次占领生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 占领的生产线信息,为null表示生产线已被领取后消失,否则更新生产线信息
		 */		
		productLineVo:ProductLineVo;
		
	}


	
	/**
	 * 工厂生产线被占领vo
	 * @author GameCreator
	 */	
	class FactoryProductLineBeOccupyVo	{
		/**
		 * 战报
		 */		
		record:FactoryRecord;
		
		/**
		 * 是否防守成功,防守失败则从已占领的生产线ID列表移除被占领的生产线唯一ID
		 */		
		defend:boolean;
		
		/**
		 * 被占领的生产线唯一id
		 */		
		productLineId:number;
		
		/**
		 * 今日占领次数
		 */		
		todayOccupyTimes:number;
		
		/**
		 * 当前占领使用的收藏品idMap, key:收藏品ID,value:生产线配置ID
		 */		
		occupyCollectiblesIdMap:Object;
		
		/**
		 * 当前占领使用的宠物idMap, key:宠物ID,value:生产线配置ID
		 */		
		occupyPetBaseIdMap:Object;
		
		/**
		 * 当前占领的使用英雄idMap, key:英雄ID,value:生产线配置ID
		 */		
		occupyHeroBaseIdMap:Object;
		
	}


	
	/**
	 * 领取生产线奖励vo
	 * @author GameCreator
	 */	
	class DrawProductLineRewardVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 今日占领奖励次数
		 */		
		todayOccupyRewardTimes:number;
		
		/**
		 * 当前占领使用的收藏品idMap, key:收藏品ID,value:生产线配置ID
		 */		
		occupyCollectiblesIdMap:Object;
		
		/**
		 * 当前占领使用的宠物idMap, key:宠物ID,value:生产线配置ID
		 */		
		occupyPetBaseIdMap:Object;
		
		/**
		 * 当前占领的使用英雄idMap, key:英雄ID,value:生产线配置ID
		 */		
		occupyHeroBaseIdMap:Object;
		
	}


	
	/**
	 * 抢夺生产线vo
	 * @author GameCreator
	 */	
	class PlunderProductLineVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 消耗体力
		 */		
		costPower:number;
		
		/**
		 * 生产线信息
		 */		
		productLineVo:ProductLineVo;
		
	}


	
	/**
	 * 加载好友星际工厂信息
	 * @author GameCreator
	 */	
	class LoadFriendFactoryInfoS2C	{
		content:Array<Vo.factory.PlayerFactoryBaseVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 工厂战报记录
	 * @author GameCreator
	 */	
	class FactoryRecord	{
		/**
		 * 战报ID
		 */		
		id:number;
		
		/**
		 * 防守结果,true-防守成功,false-防守失败
		 */		
		defend:boolean;
		
		/**
		 * 生产线配置ID
		 */		
		productLineConfigId:number;
		
		/**
		 * 抢夺的玩家基本信息
		 */		
		attackerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 抢夺的玩家阵容信息
		 */		
		attackFormationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 攻击方单位统计列表
		 */		
		attackerStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 防守方单位统计列表
		 */		
		defenderStatisticsVos:Array<Vo.battle.UnitStatisticsBaseVo>;
		
		/**
		 * 是否已读
		 */		
		read:boolean;
		
		/**
		 * 时间
		 */		
		time:number;
		
	}


	
	/**
	 * 星际工厂购买体力
	 * @author GameCreator
	 */	
	class FactoryBuyPowerVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 体力信息
		 */		
		powerVo:FactoryPowerVo;
		
	}


	
	/**
	 * 加载星际工厂信息
	 * @author GameCreator
	 */	
	class LoadFactoryInfoS2C	{
		content:Vo.factory.PlayerFactoryVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 星际工厂体力信息
	 * @author GameCreator
	 */	
	class FactoryPowerVo	{
		/**
		 * 体力值
		 */		
		power:number;
		
		/**
		 * 最后一次体力恢复时间
		 */		
		lastRecoverTime:number;
		
	}


	
	/**
	 * 生产线详细信息
	 * @author GameCreator
	 */	
	class ProductLineVo	{
		/**
		 * 生产线唯一ID
		 */		
		productLineId:number;
		
		/**
		 * 生产线配置ID
		 */		
		productLineConfigId:number;
		
		/**
		 * 生产线开始时间
		 */		
		startTime:number;
		
		/**
		 * 生产线结束时间
		 */		
		endTime:number;
		
		/**
		 * 生产线归属玩家
		 */		
		belongPlayerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 占领的玩家
		 */		
		occupyPlayerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 占领阵容信息
		 */		
		occupyFormationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 是否曾经占领过
		 */		
		occupied:boolean;
		
	}


	
	/**
	 * 玩家工厂基础信息
	 * @author GameCreator
	 */	
	class PlayerFactoryBaseVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 生产线配置ID,没有则为0
		 */		
		productLineConfigId:number;
		
		/**
		 * 占领结束时间,没有则为0
		 */		
		occupyEndTime:number;
		
	}


}
