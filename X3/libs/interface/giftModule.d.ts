declare module Vo.gift{
	
	/**
	 * 领取福利码
	 * @author GameCreator
	 */	
	class DrawS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取福利码
	 * @author GameCreator
	 */	
	class DrawC2S	{
		code:string;
		
	}


}
