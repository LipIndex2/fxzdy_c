declare module Vo.monthcard{
	
	/**
	 * 激活特权卡
	 * @author GameCreator
	 */	
	class ActiveC2S	{
		/**
		 * 特权卡配置Id
		 */		
		cardId:number;
		
	}


	
	/**
	 * 激活特权卡
	 * @author GameCreator
	 */	
	class ActiveS2C	{
		content:Vo.monthcard.MonthCardItemVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取特权卡信息
	 * @author GameCreator
	 */	
	class GetCardVoS2C	{
		content:Vo.monthcard.MonthCardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 特权卡条目信息
	 * @author GameCreator
	 */	
	class MonthCardItemVo	{
		/**
		 * 特权卡Id
		 */		
		cardId:number;
		
		/**
		 * 生效时间戳
		 */		
		startTime:number;
		
		/**
		 * 已领取天数
		 */		
		receivedDays:number;
		
		/**
		 * 延长次数
		 */		
		extendNum:number;
		
		/**
		 * 累充金额，仅失效时累计
		 */		
		chargeMoney:number;
		
		/**
		 * 结束时间戳
		 */		
		endTime:number;
		
	}


	
	/**
	 * 特权卡奖励信息
	 * @author GameCreator
	 */	
	class MonthCardRewardVo	{
		/**
		 * 特权卡信息
		 */		
		cardVo:MonthCardVo;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 特权卡登录下发信息
	 * @author GameCreator
	 */	
	class MonthCardVo	{
		/**
		 * 是否已领取
		 */		
		gainDailyFreeReward:boolean;
		
		/**
		 * 特权卡条目信息列表
		 */		
		cardItemVos:Array<MonthCardItemVo>;
		
	}


	
	/**
	 * 特权卡领取每日奖励信息
	 * @author GameCreator
	 */	
	class MonthCardDailyRewardVo	{
		/**
		 * 特权卡条目信息
		 */		
		cardItemVo:MonthCardItemVo;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 一键领取所有奖励
	 * @author GameCreator
	 */	
	class ReceiveAllRewardsS2C	{
		content:Vo.monthcard.MonthCardRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取每日奖励
	 * @author GameCreator
	 */	
	class ReceiveDailyRewardsC2S	{
		/**
		 * 特权卡配置Id
		 */		
		cardId:number;
		
	}


	
	/**
	 * 领取每日奖励
	 * @author GameCreator
	 */	
	class ReceiveDailyRewardsS2C	{
		content:Vo.monthcard.MonthCardDailyRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取免费奖励
	 * @author GameCreator
	 */	
	class ReceiveDailyFreeRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 特权卡购买信息
	 * @author GameCreator
	 */	
	class MonthCardBuyVo	{
		/**
		 * 特权卡条目信息
		 */		
		cardItemVo:MonthCardItemVo;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


}
