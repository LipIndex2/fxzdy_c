declare module Vo.email{
	
	/**
	 * 阅读无附件系统邮件
	 * @author GameCreator
	 */	
	class ReadSystemEmailC2S	{
		/**
		 * 邮件ID
		 */		
		emailId:number;
		
	}


	
	/**
	 * 系统邮件Vo
	 * @author GameCreator
	 */	
	class SystemEmailVo	{
		/**
		 * 发送人昵称,没有则为NULL
		 */		
		senderName:string;
		
		/**
		 * 邮件发送时间
		 */		
		sendTime:number;
		
		/**
		 * 模板ID 小于0表示无模板
		 */		
		template:number;
		
		/**
		 * 邮件唯一ID
		 */		
		emailId:number;
		
		/**
		 * 是否已读
		 */		
		read:boolean;
		
		/**
		 * 是否已领取奖励
		 */		
		drew:boolean;
		
		/**
		 * 邮件标题 null时读配置
		 */		
		emailTitle:string;
		
		/**
		 * 邮件内容 null时读配置
		 */		
		emailContent:string;
		
		/**
		 * 模板参数列表JSON
		 */		
		paramsContent:string;
		
		/**
		 * 字符串格式的奖励
		 */		
		rewards:string;
		
		/**
		 * 过期时间
		 */		
		expireTime:number;
		
	}


	
	/**
	 * 一键阅读系统邮件,不会领取奖励
	 * @author GameCreator
	 */	
	class ReadSystemEmailsS2C	{
		content:Array<number>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键移除已读或者已领取奖励的系统邮件
	 * @author GameCreator
	 */	
	class RemoveEmailsS2C	{
		content:Array<number>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 删除系统邮件
	 * @author GameCreator
	 */	
	class RemoveSystemEmailC2S	{
		/**
		 * 邮件ID
		 */		
		emailId:number;
		
	}


	
	/**
	 * 删除系统邮件
	 * @author GameCreator
	 */	
	class RemoveSystemEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取邮件vo
	 * @author GameCreator
	 */	
	class DrawEmailVo	{
		/**
		 * 已读邮件id
		 */		
		readIds:Array<number>;
		
		/**
		 * 领取了奖励的邮件id
		 */		
		drawIds:Array<number>;
		
		/**
		 * 邮件奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 领取邮件附件奖励，领取成功后邮件变为已读状态和已领取状态
	 * @author GameCreator
	 */	
	class DrawSystemEmailC2S	{
		/**
		 * 邮件ID
		 */		
		emailId:number;
		
	}


	
	/**
	 * 领取邮件附件奖励，领取成功后邮件变为已读状态和已领取状态
	 * @author GameCreator
	 */	
	class DrawSystemEmailS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键领取系统邮件奖励,领取成功的邮件变为已读状态和已领取状态,未领取成功的则变为已读状态
	 * @author GameCreator
	 */	
	class DrawEmailRewardsS2C	{
		content:Vo.email.DrawEmailVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 阅读无附件系统邮件
	 * @author GameCreator
	 */	
	class ReadSystemEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 邮件登录下发vo
	 * @author GameCreator
	 */	
	class EmailInfoVo	{
		/**
		 * 系统邮件
		 */		
		mailVos:Array<SystemEmailVo>;
		
	}


}
