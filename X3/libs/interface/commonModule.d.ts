declare module Vo.common{
	
	/**
	 * 玩家位置信息
	 * @author GameCreator
	 */	
	class PlayerPositionVo	{
		playerId:number;
		
		/**
		 * 玩家的x坐标
		 */		
		x:number;
		
		/**
		 * 玩家的Y坐标
		 */		
		y:number;
		
	}


	
	/**
	 * 物品条目信息Vo
	 * @author GameCreator
	 */	
	class ItemTermVo	{
		/**
		 * 物品ID
		 */		
		itemId:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 玩法状态信息
	 * @author GameCreator
	 */	
	class SchedulePlayInfoVo	{
		/**
		 * 玩法类型id,SchedulePlayType
		 */		
		type:number;
		
		/**
		 * 玩法信息,根据玩法类型处理
		 */		
		playInfo:Object;
		
	}


	
	/**
	 * 前端显示条目内容Vo,字段使用包装类型防止序列化/反序列化时生成默认值
	 * @author GameCreator
	 */	
	class TermVo	{
		/**
		 * 唯一ID
		 */		
		id:number;
		
		/**
		 * 玩家名称
		 */		
		playerName:string;
		
		/**
		 * 显示文本内容
		 */		
		content:string;
		
		/**
		 * 物品ID
		 */		
		itemId:number;
		
		/**
		 * 物品列表信息
		 */		
		itemList:Array<ItemTermVo>;
		
		/**
		 * 活动ID
		 */		
		activityId:number;
		
		/**
		 * 赛季子活动Id
		 */		
		subSeasonActivityId:number;
		
		/**
		 * 排名
		 */		
		rank:number;
		
		/**
		 * 竞技场段位配置ID
		 */		
		arenaRankConfigId:number;
		
		/**
		 * 联盟BOSS配置ID
		 */		
		leagueBossConfigId:number;
		
		/**
		 * 基金配置Id
		 */		
		fundId:number;
		
		/**
		 * 设置展示配置Id
		 */		
		setShowId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 数量
		 */		
		amount:number;
		
		/**
		 * 月卡配置Id
		 */		
		monthCardId:number;
		
		/**
		 * 称号ID,对应SetShowConfig的id
		 */		
		titleId:number;
		
		/**
		 * 商店商品配置ID,对应ShopGoodsConfig的id
		 */		
		shopGoodsConfigId:number;
		
		/**
		 * 充值商品配置ID,对应ChargeGoodsConfig的id
		 */		
		chargeGoodsConfigId:string;
		
		/**
		 * 系统类型,SystemType
		 */		
		systemType:number;
		
		/**
		 * 组队副本队伍邀请信息,TeamBriefVo
		 */		
		teamBriefVo:Vo.teaminstance.TeamBriefVo;
		
		/**
		 * 组队副本配置ID,对应TeamInstanceConfig的id
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 资源勘探建筑分享信息,LeagueExploreBuildingShareVo
		 */		
		buildingShareVo:Vo.leagueexplore.LeagueExploreBuildingShareVo;
		
		/**
		 * 活动道具转换配置Id
		 */		
		activityItemConvertConfigId:number;
		
		/**
		 * 收藏品配置Id
		 */		
		collectiblesBaseId:number;
		
		/**
		 * 资源勘探建筑配置ID
		 */		
		leagueExploreBuildingConfigId:number;
		
	}


	
	/**
	 * 玩法当前状态详细信息
	 * @author GameCreator
	 */	
	class SchedulePlayDetailVo	{
		/**
		 * 玩法类型id
		 */		
		type:number;
		
		/**
		 * 当前所处阶段
		 */		
		stage:number;
		
		/**
		 * 当前状态描述
		 */		
		stageDes:string;
		
		/**
		 * 本阶段结束事件
		 */		
		endTime:number;
		
		/**
		 * 玩法描述
		 */		
		playDes:string;
		
	}


	
	/**
	 * 错误玩家信息
	 * @author GameCreator
	 */	
	class ErrorPlayerVo	{
		name:string;
		
		level:number;
		
	}


	
	/**
	 * 坐标点
	 * @author GameCreator
	 */	
	class Point	{
		x:number;
		
		y:number;
		
	}


	
	/**
	 * 玩家移动信息
	 * @author GameCreator
	 */	
	class PlayerMoveVo	{
		id:number;
		
		/**
		 * 当前x坐标
		 */		
		nowX:number;
		
		/**
		 * 当前y坐标
		 */		
		nowY:number;
		
		/**
		 * 移动目标x坐标
		 */		
		targetX:number;
		
		/**
		 * 移动目标y坐标
		 */		
		targetY:number;
		
	}


	
	/**
	 * 
	 * @author GameCreator
	 */	
	class PageRes	{
		/**
		 * 当前页信息列表
		 */		
		data:Array<any>;
		
		/**
		 * 当前页,从1开始
		 */		
		curPage:number;
		
		/**
		 * 总条数
		 */		
		total:number;
		
		/**
		 * 每页数量
		 */		
		pageSize:number;
		
		/**
		 * 总页数
		 */		
		totalPage:number;
		
	}


}
