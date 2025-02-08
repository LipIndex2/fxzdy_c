declare module Vo.magiccube{
	
	/**
	 * 玩家魔方信息
	 * @author GameCreator
	 */	
	class MagicCubeVo	{
		/**
		 * 唯一Id，即英雄配置Id
		 */		
		id:number;
		
		/**
		 * 当前魔方Id
		 */		
		cubeId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 转换魔方Id
		 */		
		convertCubeId:number;
		
	}


	
	/**
	 * 升级魔方
	 * @author GameCreator
	 */	
	class UpLevelC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
		/**
		 * 是否锁定
		 */		
		locked:boolean;
		
	}


	
	/**
	 * 升级魔方
	 * @author GameCreator
	 */	
	class UpLevelS2C	{
		content:Vo.magiccube.MagicCubeCostVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 激活魔方
	 * @author GameCreator
	 */	
	class ActivateC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 激活魔方
	 * @author GameCreator
	 */	
	class ActivateS2C	{
		content:Vo.magiccube.MagicCubeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 魔方消耗相关信息
	 * @author GameCreator
	 */	
	class MagicCubeCostVo	{
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 魔方信息
		 */		
		magicCubeVo:MagicCubeVo;
		
	}


	
	/**
	 * 保存魔方转换
	 * @author GameCreator
	 */	
	class SaveConvertC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 保存魔方转换
	 * @author GameCreator
	 */	
	class SaveConvertS2C	{
		content:Vo.magiccube.MagicCubeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 转换魔方
	 * @author GameCreator
	 */	
	class ConvertC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 转换魔方
	 * @author GameCreator
	 */	
	class ConvertS2C	{
		content:Vo.magiccube.MagicCubeCostVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
