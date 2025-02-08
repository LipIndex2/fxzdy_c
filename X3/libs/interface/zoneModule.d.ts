declare module Vo.zone{
	
	/**
	 * 战区信息
	 * @author GameCreator
	 */	
	class ZoneVo	{
		/**
		 * 战区id
		 */		
		zoneId:number;
		
		/**
		 * 战区开始时间
		 */		
		startTime:number;
		
		/**
		 * 战区第一个服务器
		 */		
		firstServer:string;
		
		/**
		 * 服务器最晚开服时间
		 */		
		lastOpenTime:number;
		
		/**
		 * 战区内游戏服
		 */		
		serverIds:Array<string>;
		
	}


}
