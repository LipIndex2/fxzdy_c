declare module Vo.stimulation{
	
	/**
	 * 获取设备信息列表
	 * @author GameCreator
	 */	
	class LoadDeviceListS2C	{
		content:Array<Vo.stimulation.StimulationDeviceVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 模拟经营设备升级信息
	 * @author GameCreator
	 */	
	class StimulationDeviceUpLevelVo	{
		/**
		 * 设备信息
		 */		
		deviceVo:StimulationDeviceVo;
		
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
	}


	
	/**
	 * 派遣
	 * @author GameCreator
	 */	
	class DispatchC2S	{
		/**
		 * 设备配置Id
		 */		
		deviceId:number;
		
		/**
		 * 派遣下标-英雄配置Id
		 */		
		dispatchIndex2HeroBaseId:Object;
		
	}


	
	/**
	 * 派遣
	 * @author GameCreator
	 */	
	class DispatchS2C	{
		content:Vo.stimulation.StimulationDeviceVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 回收
	 * @author GameCreator
	 */	
	class RecycleS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 模拟经营设备信息
	 * @author GameCreator
	 */	
	class StimulationDeviceVo	{
		/**
		 * 设备配置Id
		 */		
		id:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 下一等级
		 */		
		nextLevel:number;
		
		/**
		 * 下一等级时间戳
		 */		
		nextLevelTime:number;
		
		/**
		 * 下一等级观看广告次数
		 */		
		nextLevelAdTimes:number;
		
		/**
		 * 已储藏数量
		 */		
		storeNum:number;
		
		/**
		 * 开始累计时间戳
		 */		
		startTime:number;
		
		/**
		 * 每X毫秒生产一个资源
		 */		
		intervalMillis:number;
		
		/**
		 * 储藏上限
		 */		
		capacity:number;
		
		/**
		 * 派遣下标-英雄Id
		 */		
		dispatchIndex2HeroBaseId:Object;
		
	}


	
	/**
	 * 回收
	 * @author GameCreator
	 */	
	class RecycleC2S	{
		/**
		 * 回收配置Id
		 */		
		recycleId:number;
		
		/**
		 * 回收数量
		 */		
		recycleNum:number;
		
	}


	
	/**
	 * 跳过设备升级等待
	 * @author GameCreator
	 */	
	class SkipUpLevelWaitS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 跳过设备升级等待
	 * @author GameCreator
	 */	
	class SkipUpLevelWaitC2S	{
		deviceId:number;
		
	}


	
	/**
	 * 模拟经营设备奖励信息
	 * @author GameCreator
	 */	
	class StimulationDeviceRewardVo	{
		/**
		 * 设备信息
		 */		
		deviceVo:StimulationDeviceVo;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 领取设备奖励
	 * @author GameCreator
	 */	
	class DrawDeviceRewardsC2S	{
		/**
		 * 设备配置Id
		 */		
		deviceId:number;
		
	}


	
	/**
	 * 领取设备奖励
	 * @author GameCreator
	 */	
	class DrawDeviceRewardsS2C	{
		content:Vo.stimulation.StimulationDeviceRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 解锁
	 * @author GameCreator
	 */	
	class ActivateC2S	{
		deviceId:number;
		
	}


	
	/**
	 * 解锁
	 * @author GameCreator
	 */	
	class ActivateS2C	{
		content:Vo.stimulation.StimulationDeviceUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelC2S	{
		deviceId:number;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelS2C	{
		content:Vo.stimulation.StimulationDeviceUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 观看广告缩短设备升级等待时间
	 * @author GameCreator
	 */	
	class AdShortenUpLevelWaitC2S	{
		deviceId:number;
		
	}


	
	/**
	 * 观看广告缩短设备升级等待时间
	 * @author GameCreator
	 */	
	class AdShortenUpLevelWaitS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
