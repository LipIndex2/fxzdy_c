declare module Vo.task{
	
	/**
	 * 增加模拟任务进度
	 * @author GameCreator
	 */	
	class AddFakeTaskProgressC2S	{
		/**
		 * 任务类型
		 */		
		taskType:number;
		
		/**
		 * 任务id
		 */		
		taskId:number;
		
		/**
		 * 增加的进度
		 */		
		addProgress:number;
		
	}


	
	/**
	 * 增加模拟任务进度
	 * @author GameCreator
	 */	
	class AddFakeTaskProgressS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 任务奖励vo，包括接受任务奖励、任务完成奖励
	 * @author GameCreator
	 */	
	class TaskRewardVo	{
		/**
		 * 任务配置id
		 */		
		taskId:number;
		
		/**
		 * 完成任务得到的奖励
		 */		
		rewardsResult:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 单个任务类型信息
	 * @author GameCreator
	 */	
	class SingleTaskTypeInfoVo	{
		/**
		 * 进行中/已经领取的任务
		 */		
		currentTaskVos:Array<TaskVo>;
		
		/**
		 * 完成的任务
		 */		
		finishedTaskIds:Array<number>;
		
	}


	
	/**
	 * 当前的任务信息
	 * @author GameCreator
	 */	
	class TaskInfoVo	{
		/**
		 * 进行中/已完成的任务列表
		 */		
		currentTasks:Array<TaskVo>;
		
		/**
		 * 已完结的任务Id列表(即已领取奖励)
		 */		
		finishedTaskIds:Array<number>;
		
	}


	
	/**
	 * 任务的VO对象
	 * @author GameCreator
	 */	
	class TaskVo	{
		/**
		 * 任务信息类型
		 */		
		taskVoType:number;
		
		/**
		 * 任务类型, {@link TaskType}
		 */		
		type:number;
		
		/**
		 * 任务标识(任务的唯一标识)
		 */		
		taskId:number;
		
		/**
		 * 任务的完成情况
		 */		
		progress:number;
		
		/**
		 * 任务状态: 2 进行中；3已完成未领奖, {@link TaskState}
		 */		
		state:number;
		
	}


	
	/**
	 * 移除任务信息
	 * @author GameCreator
	 */	
	class TaskRemovedVo	{
		/**
		 * 进行中被移除的任务id
		 */		
		currentTaskIds:Array<number>;
		
		/**
		 * 已完成被移除的任务id
		 */		
		finishedTaskIds:Array<number>;
		
	}


}
