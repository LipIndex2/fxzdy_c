declare module Vo.ranking{
	
	/**
	 * 排行榜vo
	 * @author GameCreator
	 */	
	class RankingVo	{
		/**
		 * 当前名次
		 */		
		rank:number;
		
		/**
		 * 玩家当前排行唯一ID
		 */		
		id:number;
		
		/**
		 * 当前值
		 */		
		value:number;
		
		/**
		 * 附加值
		 */		
		addition:number;
		
		/**
		 * 排行榜类型,RankingType
		 */		
		type:number;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<Object>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
		/**
		 * 第一名入榜开始时间
		 */		
		firstOnListStartTime:number;
		
	}


	
	/**
	 * 获取排行榜
	 * @author GameCreator
	 */	
	class RankListS2C	{
		content:Vo.ranking.RankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取排行榜
	 * @author GameCreator
	 */	
	class RankListC2S	{
		/**
		 * 排行榜类型,RankingType
		 */		
		type:number;
		
		/**
		 * 排行榜子榜参数,不需要传null
		 */		
		subRankParam:string;
		
		/**
		 * 页码
		 */		
		page:number;
		
	}


	
	/**
	 * 排行榜vo
	 * @author GameCreator
	 */	
	class RankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 排行榜值
		 */		
		value:number;
		
		/**
		 * 附加值
		 */		
		addition:number;
		
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
	 * 获取排行榜第一名信息
	 * @author GameCreator
	 */	
	class LoadFirstRankC2S	{
		/**
		 * 需要获取的排行榜名称,RankingType
		 */		
		rankTypes:Array<number>;
		
	}


	
	/**
	 * 获取排行榜第一名信息
	 * @author GameCreator
	 */	
	class LoadFirstRankS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
