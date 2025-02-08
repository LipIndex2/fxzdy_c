declare module Vo.trunktask{
	
	/**
	 * 主线任务登录下发数据
	 * @author GameCreator
	 */	
	class TrunkTaskLoginVo	{
		/**
		 * 当前进行的任务,可能为null
		 */		
		currentTaskVo:Vo.task.TaskVo;
		
		/**
		 * 最后一个完成的主线任务ID,没有则为0
		 */		
		lastFinishTaskId:number;
		
	}


	
	/**
	 * 领取任务奖励
	 * @author GameCreator
	 */	
	class DrawTaskRewardC2S	{
		/**
		 * 任务配置ID
		 */		
		taskConfigId:number;
		
	}


	
	/**
	 * 领取任务奖励
	 * @author GameCreator
	 */	
	class DrawTaskRewardS2C	{
		content:Vo.task.TaskRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
