declare module Vo.preview{
	
	/**
	 * 功能预告信息
	 * @author GameCreator
	 */	
	class PreviewVo	{
		/**
		 * 已领取奖励的预告配置Id列表
		 */		
		receivedPreviewIds:Array<number>;
		
	}


	
	/**
	 * 领取预告奖励
	 * @author GameCreator
	 */	
	class ReceivePreviewRewardC2S	{
		/**
		 * 预告配置Id
		 */		
		previewId:number;
		
	}


	
	/**
	 * 领取预告奖励
	 * @author GameCreator
	 */	
	class ReceivePreviewRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取预告信息
	 * @author GameCreator
	 */	
	class GetPreviewInfoS2C	{
		content:Vo.preview.PreviewVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
