declare module Vo.guardship{
	
	/**
	 * 守卫母舰排行榜信息
	 * @author GameCreator
	 */	
	class GuardShipRankingVo	{
		/**
		 * 玩家当前名次，-1表示没排名
		 */		
		rank:number;
		
		/**
		 * 关卡Id
		 */		
		value:number;
		
		/**
		 * 波次
		 */		
		addition:number;
		
		/**
		 * 积分
		 */		
		score:number;
		
		/**
		 * 排行榜条目列表
		 */		
		list:Array<GuardShipRankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 获取排行榜列表
	 * @author GameCreator
	 */	
	class LoadRankListC2S	{
		/**
		 * 第X页，从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取排行榜列表
	 * @author GameCreator
	 */	
	class LoadRankListS2C	{
		content:Vo.guardship.GuardShipRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取守卫母舰信息
	 * @author GameCreator
	 */	
	class LoadGuardShipInfoS2C	{
		content:Vo.guardship.GuardShipVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 守卫母舰排行榜条目信息
	 * @author GameCreator
	 */	
	class GuardShipRankItemVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 关卡Id
		 */		
		value:number;
		
		/**
		 * 波次
		 */		
		addition:number;
		
		/**
		 * 积分
		 */		
		score:number;
		
		/**
		 * 服务器Id
		 */		
		serverId:string;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
	}


	
	/**
	 * 守卫母舰Buff选择信息
	 * @author GameCreator
	 */	
	class GuardShipBuffSelectVo	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 备选数量
		 */		
		optionalCount:number;
		
		/**
		 * 可选数量
		 */		
		selectGroupCount:number;
		
	}


	
	/**
	 * 守卫母舰刷新Buff信息
	 * @author GameCreator
	 */	
	class GuardShipRefreshBuffVo	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 组下标，从0开始
		 */		
		groupIndex:number;
		
		/**
		 * 玩家刷新后的BufId列表
		 */		
		buffIds:Array<number>;
		
		/**
		 * 消耗信息
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 累计刷新次数
		 */		
		refreshCount:number;
		
	}


	
	/**
	 * 挑战
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
	 * 挑战
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 是否购买挑战次数
		 */		
		buyChallengeTimes:boolean;
		
	}


	
	/**
	 * 扫荡
	 * @author GameCreator
	 */	
	class SweepC2S	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 是否购买扫荡次数
		 */		
		buySweepTimes:boolean;
		
	}


	
	/**
	 * 扫荡
	 * @author GameCreator
	 */	
	class SweepS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 守卫母舰挑战信息
	 * @author GameCreator
	 */	
	class GuardShipChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 剩余免费挑战次数
		 */		
		freeChallengeTimes:number;
		
		/**
		 * 关卡配置Id
		 */		
		instanceId:number;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 守卫母舰业务效果相关信息
	 * @author GameCreator
	 */	
	class GuardShipStuffEffectVo	{
		/**
		 * 当前经验
		 */		
		exp:number;
		
		/**
		 * 当前经验增加比率，万分比
		 */		
		expRatio:number;
		
		/**
		 * 多选一个Buff概率，万分比
		 */		
		extraBuffRate:number;
		
		/**
		 * Buff额外备选数量
		 */		
		extraBuffOptionalCount:number;
		
		/**
		 * 道具额外掉落概率
		 */		
		extraItemDropRate:number;
		
	}


	
	/**
	 * 守卫母舰波次信息
	 * @author GameCreator
	 */	
	class GuardShipRoundVo	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 波次
		 */		
		round:number;
		
	}


	
	/**
	 * 玩家守卫母舰信息
	 * @author GameCreator
	 */	
	class GuardShipVo	{
		/**
		 * 剩余免费挑战次数
		 */		
		freeChallengeTimes:number;
		
		/**
		 * 守卫母舰初始化自定义阵容，不为空则使用此阵容信息，为空则使用通用自定义阵容
		 */		
		customFormationVos:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 已通过关卡Id集合
		 */		
		passInstanceIds:Array<number>;
		
	}


	
	/**
	 * 守卫母舰Buff信息
	 * @author GameCreator
	 */	
	class GuardShipBuffVo	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 组下标
		 */		
		groupIndex:number;
		
		/**
		 * 玩家所选BufId
		 */		
		buffId:number;
		
	}


}
