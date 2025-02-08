declare module Vo.achievement{
	
	/**
	 * 成就登录下发数据
	 * @author GameCreator
	 */	
	class AchievementLoginVo	{
		/**
		 * 任务信息
		 */		
		taskInfoVo:Vo.task.TaskInfoVo;
		
	}


	
	/**
	 * 领取成就奖励
	 * @author GameCreator
	 */	
	class DrawMultipleAchievementRewardC2S	{
		/**
		 * 成就任务配置ID列表
		 */		
		taskConfigIds:Array<number>;
		
	}


	
	/**
	 * 领取成就奖励
	 * @author GameCreator
	 */	
	class DrawMultipleAchievementRewardS2C	{
		content:Array<Vo.task.TaskRewardVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取成就奖励
	 * @author GameCreator
	 */	
	class DrawAchievementRewardC2S	{
		/**
		 * 成就任务配置ID
		 */		
		taskConfigId:number;
		
	}


	
	/**
	 * 领取成就奖励
	 * @author GameCreator
	 */	
	class DrawAchievementRewardS2C	{
		content:Vo.task.TaskRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
