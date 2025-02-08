declare module Vo.recruit{
	
	/**
	 * 高级招募信息Vo
	 * @author GameCreator
	 */	
	class SpecialRecruitVo	{
		/**
		 * 招募消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 招募奖励
		 */		
		rewardResults:Array<Array<Vo.reward.RewardResult>>;
		
		/**
		 * 累计高级招募次数
		 */		
		totalSpecialRecruitTimes:number;
		
		/**
		 * 高级招募心愿保底累计次数,达到配置次数则必定触发心愿英雄
		 */		
		specialTotalGuaranteeTimes:number;
		
	}


	
	/**
	 * 领取普通招募进度奖励
	 * @author GameCreator
	 */	
	class DrawNormalRecruitProgressRewardC2S	{
		/**
		 * 领取的轮次,从1开始
		 */		
		drawNormalRound:number;
		
		/**
		 * 领取轮次的进度ID,对应NormalRecruitProgressConfig的id
		 */		
		drawNormalProgressId:number;
		
	}


	
	/**
	 * 领取普通招募进度奖励
	 * @author GameCreator
	 */	
	class DrawNormalRecruitProgressRewardS2C	{
		content:Vo.recruit.NormalRecruitProgressRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 购买专属武器招募消耗道具
	 * @author GameCreator
	 */	
	class BuyAwakeWeaponRecruitCostItemsC2S	{
		/**
		 * 招募配置Id
		 */		
		recruitId:number;
		
		/**
		 * 购买数量
		 */		
		buyAmount:number;
		
	}


	
	/**
	 * 购买专属武器招募消耗道具
	 * @author GameCreator
	 */	
	class BuyAwakeWeaponRecruitCostItemsS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取招募信息
	 * @author GameCreator
	 */	
	class GetRecruitInfoS2C	{
		content:Vo.recruit.RecruitLoginVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 专属武器普通招募信息
	 * @author GameCreator
	 */	
	class AwakeWeaponNormalRecruitVo	{
		/**
		 * 招募消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 招募奖励
		 */		
		rewardResults:Array<Array<Vo.reward.RewardResult>>;
		
		/**
		 * 专属武器普通招募累计次数
		 */		
		totalAwakeWeaponNormalRecruitTimes:number;
		
		/**
		 * 专属武器普通招募剩余免费次数
		 */		
		awakeWeaponNormalRecruitFreeTimes:number;
		
		/**
		 * 最新专属武器招募积分
		 */		
		awakeWeaponRecruitScore:number;
		
	}


	
	/**
	 * 专属武器高级招募
	 * @author GameCreator
	 */	
	class AwakeWeaponSpecialRecruitC2S	{
		/**
		 * 招募次数
		 */		
		times:number;
		
	}


	
	/**
	 * 专属武器高级招募
	 * @author GameCreator
	 */	
	class AwakeWeaponSpecialRecruitS2C	{
		content:Vo.recruit.AwakeWeaponSpecialRecruitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 普通招募
	 * @author GameCreator
	 */	
	class NormalRecruitC2S	{
		/**
		 * 是否一键招募
		 */		
		oneKey:boolean;
		
		/**
		 * 是否广告招募
		 */		
		advert:boolean;
		
	}


	
	/**
	 * 普通招募
	 * @author GameCreator
	 */	
	class NormalRecruitS2C	{
		content:Vo.recruit.NormalRecruitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 高级招募设置心愿英雄
	 * @author GameCreator
	 */	
	class SpecialRecruitSetUpHeroC2S	{
		/**
		 * 心愿英雄Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 高级招募设置心愿英雄
	 * @author GameCreator
	 */	
	class SpecialRecruitSetUpHeroS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 普通招募进度奖励信息Vo
	 * @author GameCreator
	 */	
	class NormalRecruitProgressRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 普通招募进度奖励当前轮次
		 */		
		normalProgressCurrentRound:number;
		
		/**
		 * 普通招募进度奖励当前轮次领取的进度ID列表
		 */		
		normalCurrentRoundProgressIds:Array<number>;
		
	}


	
	/**
	 * 专属武器招募积分奖励信息
	 * @author GameCreator
	 */	
	class AwakeWeaponRecruitScoreRewardVo	{
		/**
		 * 积分奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 最新专属武器招募积分
		 */		
		awakeWeaponRecruitScore:number;
		
	}


	
	/**
	 * 领取专属武器招募积分奖励
	 * @author GameCreator
	 */	
	class DrawAwakeWeaponRecruitScoreRewardC2S	{
		/**
		 * 积分奖励配置Id
		 */		
		rewardId:number;
		
	}


	
	/**
	 * 领取专属武器招募积分奖励
	 * @author GameCreator
	 */	
	class DrawAwakeWeaponRecruitScoreRewardS2C	{
		content:Vo.recruit.AwakeWeaponRecruitScoreRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 普通招募信息Vo
	 * @author GameCreator
	 */	
	class NormalRecruitVo	{
		/**
		 * 招募消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 招募奖励
		 */		
		rewardResults:Array<Array<Vo.reward.RewardResult>>;
		
		/**
		 * 累计普通招募次数
		 */		
		totalNormalRecruitTimes:number;
		
		/**
		 * 普通招募广告次数
		 */		
		todayNormalAdvertTimes:number;
		
	}


	
	/**
	 * 高级招募
	 * @author GameCreator
	 */	
	class SpecialRecruitC2S	{
		/**
		 * 是否一键招募
		 */		
		oneKey:boolean;
		
	}


	
	/**
	 * 高级招募
	 * @author GameCreator
	 */	
	class SpecialRecruitS2C	{
		content:Vo.recruit.SpecialRecruitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 增加专属武器普通招募广告次数,返回成功则增加专武普通招募广告次数和免费次数各一次
	 * @author GameCreator
	 */	
	class AddAwakeWeaponNormalAdvertTimesS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 专属武器高级招募信息
	 * @author GameCreator
	 */	
	class AwakeWeaponSpecialRecruitVo	{
		/**
		 * 招募消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 招募奖励
		 */		
		rewardResults:Array<Array<Vo.reward.RewardResult>>;
		
		/**
		 * 专属武器高级招募累计次数
		 */		
		totalAwakeWeaponSpecialRecruitTimes:number;
		
		/**
		 * 最新专属武器招募积分
		 */		
		awakeWeaponRecruitScore:number;
		
	}


	
	/**
	 * 专属武器普通招募
	 * @author GameCreator
	 */	
	class AwakeWeaponNormalRecruitC2S	{
		/**
		 * 招募次数
		 */		
		times:number;
		
	}


	
	/**
	 * 专属武器普通招募
	 * @author GameCreator
	 */	
	class AwakeWeaponNormalRecruitS2C	{
		content:Vo.recruit.AwakeWeaponNormalRecruitVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 招募登录下发数据
	 * @author GameCreator
	 */	
	class RecruitLoginVo	{
		/**
		 * 普通招募累计次数
		 */		
		totalNormalRecruitTimes:number;
		
		/**
		 * 普通招募进度奖励当前轮次,初始为0
		 */		
		normalProgressCurrentRound:number;
		
		/**
		 * 普通招募进度奖励当前轮次领取的进度ID列表
		 */		
		normalCurrentRoundProgressIds:Array<number>;
		
		/**
		 * 高级招募累计心愿保底次数
		 */		
		specialTotalGuaranteeTimes:number;
		
		/**
		 * 高级招募心愿保底英雄配置ID
		 */		
		specialGuaranteeHeroBaseId:number;
		
		/**
		 * 专属武器普通招募剩余免费次数
		 */		
		awakeWeaponNormalRecruitFreeTimes:number;
		
		/**
		 * 专属武器普通招募今日获得广告次数
		 */		
		todayGetAwakeWeaponNormalAdvertTimes:number;
		
		/**
		 * 专属武器招募积分
		 */		
		awakeWeaponRecruitScore:number;
		
		/**
		 * 普通招募广告次数
		 */		
		todayNormalAdvertTimes:number;
		
	}


}
