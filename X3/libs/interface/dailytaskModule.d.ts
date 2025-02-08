declare module Vo.dailytask{
	
	/**
	 * 领取日活跃宝箱奖励
	 * @author GameCreator
	 */	
	class DrawDailyActiveBoxC2S	{
		/**
		 * 日活跃宝箱配置ID列表
		 */		
		dailyBoxConfigIds:Array<number>;
		
	}


	
	/**
	 * 领取日活跃宝箱奖励
	 * @author GameCreator
	 */	
	class DrawDailyActiveBoxS2C	{
		content:Vo.dailytask.DailyTaskBoxRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 日常任务登录下发数据
	 * @author GameCreator
	 */	
	class DailyTaskLoginVo	{
		/**
		 * 任务信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
		/**
		 * 日活跃
		 */		
		dailyActive:number;
		
		/**
		 * 周活跃
		 */		
		weeklyActive:number;
		
		/**
		 * 已领取的日活跃宝箱
		 */		
		drewDailyActiveBoxIds:Array<number>;
		
		/**
		 * 已领取的周活跃宝箱
		 */		
		drewWeeklyActiveBoxIds:Array<number>;
		
	}


	
	/**
	 * 领取周活跃宝箱奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyActiveBoxC2S	{
		/**
		 * 周活跃宝箱配置ID列表
		 */		
		weeklyBoxConfigIds:Array<number>;
		
	}


	
	/**
	 * 领取周活跃宝箱奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyActiveBoxS2C	{
		content:Vo.dailytask.DailyTaskBoxRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 日常任务宝箱奖励vo
	 * @author GameCreator
	 */	
	class DailyTaskBoxRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 领取的宝箱ID集合
		 */		
		drawBoxIds:Array<number>;
		
	}


	
	/**
	 * 日常任务奖励
	 * @author GameCreator
	 */	
	class DailyTaskRewardVo	{
		/**
		 * 任务奖励信息
		 */		
		rewardVos:Array<Vo.task.TaskRewardVo>;
		
		/**
		 * 任务增加的日活跃和周活跃
		 */		
		addActive:number;
		
	}


	
	/**
	 * 日常任务重置信息
	 * @author GameCreator
	 */	
	class DailyTaskResetVo	{
		/**
		 * 重置时移除的任务信息
		 */		
		taskRemovedVo:Vo.task.TaskRemovedVo;
		
		/**
		 * 日活跃
		 */		
		dailyActive:number;
		
		/**
		 * 周活跃
		 */		
		weeklyActive:number;
		
		/**
		 * 已领取的日活跃宝箱
		 */		
		drewDailyActiveBoxIds:Array<number>;
		
		/**
		 * 已领取的周活跃宝箱
		 */		
		drewWeeklyActiveBoxIds:Array<number>;
		
	}


	
	/**
	 * 领取任务奖励
	 * @author GameCreator
	 */	
	class DrawTaskRewardC2S	{
		/**
		 * 日常任务配置ID列表
		 */		
		taskConfigIds:Array<number>;
		
	}


	
	/**
	 * 领取任务奖励
	 * @author GameCreator
	 */	
	class DrawTaskRewardS2C	{
		content:Vo.dailytask.DailyTaskRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
