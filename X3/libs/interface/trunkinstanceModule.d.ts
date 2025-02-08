declare module Vo.trunkinstance{
	
	/**
	 * 领取挂机奖励信息Vo
	 * @author GameCreator
	 */	
	class DrawHangUpRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 主线关卡信息
		 */		
		trunkInstanceVo:TrunkInstanceVo;
		
	}


	
	/**
	 * 领取关卡奖励
	 * @author GameCreator
	 */	
	class DrawInstanceRewardC2S	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
	}


	
	/**
	 * 领取关卡奖励
	 * @author GameCreator
	 */	
	class DrawInstanceRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挂机奖励信息vo
	 * @author GameCreator
	 */	
	class TrunkInstanceHangUpRewardVo	{
		/**
		 * 固定奖励内容
		 */		
		rewards:Array<Vo.reward.Reward>;
		
		/**
		 * 掉落奖励ID列表
		 */		
		dropRewardIds:Array<number>;
		
	}


	
	/**
	 * 挂机节点信息
	 * @author GameCreator
	 */	
	class HangUpNodeVo	{
		/**
		 * 节点开始时间
		 */		
		hangUpStartTime:number;
		
		/**
		 * 节点结束时间
		 */		
		hangUpEndTime:number;
		
		/**
		 * 节点的关卡ID
		 */		
		hangUpInstanceId:number;
		
	}


	
	/**
	 * 领取挂机奖励
	 * @author GameCreator
	 */	
	class DrawHangUpRewardS2C	{
		content:Vo.trunkinstance.DrawHangUpRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战主线关卡
	 * @author GameCreator
	 */	
	class ChallengeTrunkInstanceC2S	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
	}


	
	/**
	 * 挑战主线关卡
	 * @author GameCreator
	 */	
	class ChallengeTrunkInstanceS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 主线关卡通关信息Vo
	 * @author GameCreator
	 */	
	class TrunkInstanceChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 当前关卡信息
		 */		
		trunkInstanceVo:TrunkInstanceVo;
		
	}


	
	/**
	 * 关闭挂机托管,设置成功则挂机状态变为HangUpState.NO_HANG_UP
	 * @author GameCreator
	 */	
	class CloseHangUpS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取额外快速挂机奖励
	 * @author GameCreator
	 */	
	class DrawExtraFastHangUpRewardS2C	{
		content:Vo.trunkinstance.DrawFastHangUpRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 开始挂机托管,设置成功则挂机状态变为HangUpState.HANG_UP_ING并更新挂机开始时间
	 * @author GameCreator
	 */	
	class StartHangUpS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取快速挂机奖励信息Vo
	 * @author GameCreator
	 */	
	class DrawFastHangUpRewardVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 完成挂机战斗,设置成功则挂机状态变为HangUpState.HANG_UP_FINISH
	 * @author GameCreator
	 */	
	class FinishHangUpS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取快速挂机奖励
	 * @author GameCreator
	 */	
	class DrawFastHangUpRewardS2C	{
		content:Vo.trunkinstance.DrawFastHangUpRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取快速挂机广告奖励
	 * @author GameCreator
	 */	
	class DrawFastHangUpAdvertRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 今日广告获得免费快速挂机次数
		 */		
		todayAdvertGetFastHangUpFreeTimes:number;
		
	}


	
	/**
	 * 主线关卡信息Vo
	 * @author GameCreator
	 */	
	class TrunkInstanceVo	{
		/**
		 * 已通关关卡ID
		 */		
		instanceId:number;
		
		/**
		 * 当前挂机状态,HangUpState
		 */		
		hangUpState:number;
		
		/**
		 * 开始挂机时的通关关卡ID
		 */		
		startHangUpInstanceId:number;
		
		/**
		 * 最后一次挂机战斗开始时间
		 */		
		lastHangUpBattleStartTime:number;
		
		/**
		 * 已领奖的关卡ID
		 */		
		drawRewardInstanceId:number;
		
		/**
		 * 当前挂机关卡ID
		 */		
		hangUpInstanceId:number;
		
		/**
		 * 每小时奖励当前挂机开始时间,当前挂机最大时长=挂机最大时长-hourHangUpNodes的累计时长
		 */		
		hourHangUpStartTime:number;
		
		/**
		 * 已累计的每小时挂机节点集合
		 */		
		hourHangUpNodes:Array<HangUpNodeVo>;
		
		/**
		 * 固定秒数奖励当前挂机开始时间,当前挂机最大时长=挂机最大时长-fixedHangUpNodes的累计时长
		 */		
		fixedHangUpStartTime:number;
		
		/**
		 * 已累计的固定秒数挂机节点集合
		 */		
		fixedHangUpNodes:Array<HangUpNodeVo>;
		
		/**
		 * 装备当前挂机开始时间,当前挂机最大时长=挂机最大时长-equipHangUpNodes的累计时长
		 */		
		equipHangUpStartTime:number;
		
		/**
		 * 已累计的装备挂机节点集合
		 */		
		equipHangUpNodes:Array<HangUpNodeVo>;
		
		/**
		 * 已领取快速挂机奖励次数
		 */		
		fastHangUpTimes:number;
		
		/**
		 * 今日广告获得免费快速挂机次数
		 */		
		todayAdvertGetFastHangUpFreeTimes:number;
		
	}


	
	/**
	 * 主线关卡首通信息
	 * @author GameCreator
	 */	
	class TrunkInstanceFirstPassVo	{
		/**
		 * 关卡Id
		 */		
		instanceId:number;
		
		/**
		 * 玩家信息
		 */		
		playerBaseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 首通时间戳
		 */		
		firstPassTime:number;
		
	}


	
	/**
	 * 领取快速挂机广告奖励
	 * @author GameCreator
	 */	
	class DrawHangUpAdvertRewardS2C	{
		content:Vo.trunkinstance.DrawFastHangUpAdvertRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取挂机信息
	 * @author GameCreator
	 */	
	class LoadHangUpInfoS2C	{
		content:Vo.trunkinstance.TrunkInstanceVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取当前挂机奖励内容
	 * @author GameCreator
	 */	
	class LoadHangUpRewardInfoS2C	{
		content:Vo.trunkinstance.TrunkInstanceHangUpRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 主线关卡登录下发信息
	 * @author GameCreator
	 */	
	class TrunkInstanceLoginVo	{
		trunkInstanceVo:TrunkInstanceVo;
		
	}


}
