declare module Vo.set{
	
	/**
	 * 设置头像框
	 * @author GameCreator
	 */	
	class SetUpHeadFrameC2S	{
		/**
		 * 头像框ID
		 */		
		headFrameId:number;
		
	}


	
	/**
	 * 设置头像框
	 * @author GameCreator
	 */	
	class SetUpHeadFrameS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置聊天框
	 * @author GameCreator
	 */	
	class SetUpChatBoxC2S	{
		/**
		 * 聊天框Id，发0表示卸下
		 */		
		boxId:number;
		
	}


	
	/**
	 * 设置聊天框
	 * @author GameCreator
	 */	
	class SetUpChatBoxS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家设置相关信息
	 * @author GameCreator
	 */	
	class PlayerSetVo	{
		/**
		 * 永久的展示信息ID集合(仅记录通过物品发放的)
		 */		
		permanentShowIds:Array<number>;
		
		/**
		 * 限时的展示信息MAP(仅记录通过物品发放的),key为SetShowConfig.id,value为过期时间
		 */		
		showIdExpireTimeMap:Object;
		
		/**
		 * 改名次数
		 */		
		changeNameTimes:number;
		
		/**
		 * 正在使用的称号Id
		 */		
		usingTitleId:number;
		
		/**
		 * 正在使用的头像Id
		 */		
		usingHeadIcon:number;
		
		/**
		 * 正在使用的头像框Id
		 */		
		usingHeadFrame:number;
		
		/**
		 * 正在使用的形象Id
		 */		
		usingImageId:number;
		
		/**
		 * 正在使用的聊天框Id
		 */		
		usingChatBoxId:number;
		
		/**
		 * 正在使用的聊天文字颜色Id
		 */		
		usingChatWordColorId:number;
		
	}


	
	/**
	 * 设置称号
	 * @author GameCreator
	 */	
	class SetUpTitleC2S	{
		/**
		 * 称号Id，发0表示卸下
		 */		
		titleId:number;
		
	}


	
	/**
	 * 设置称号
	 * @author GameCreator
	 */	
	class SetUpTitleS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置聊天文字颜色
	 * @author GameCreator
	 */	
	class SetUpChatWordColorC2S	{
		/**
		 * 颜色Id，发0表示卸下
		 */		
		colorId:number;
		
	}


	
	/**
	 * 设置聊天文字颜色
	 * @author GameCreator
	 */	
	class SetUpChatWordColorS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 改名
	 * @author GameCreator
	 */	
	class ChangeNameC2S	{
		/**
		 * 新昵称
		 */		
		name:string;
		
	}


	
	/**
	 * 改名
	 * @author GameCreator
	 */	
	class ChangeNameS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置头像
	 * @author GameCreator
	 */	
	class SetUpHeadIconS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置头像
	 * @author GameCreator
	 */	
	class SetUpHeadIconC2S	{
		/**
		 * 头像ID
		 */		
		headIconId:number;
		
	}


	
	/**
	 * 设置头像
	 * @author GameCreator
	 */	
	class SetUpImageC2S	{
		/**
		 * 形象ID
		 */		
		imageId:number;
		
	}


	
	/**
	 * 设置头像
	 * @author GameCreator
	 */	
	class SetUpImageS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 荣耀墙道具信息
	 * @author GameCreator
	 */	
	class HonorItemVo	{
		/**
		 * 徽章
		 */		
		id:number;
		
		/**
		 * x坐标
		 */		
		x:number;
		
		/**
		 * y坐标
		 */		
		y:number;
		
		/**
		 * 缩放万分比
		 */		
		scale:number;
		
	}


	
	/**
	 * 设置展示奖励信息
	 * @author GameCreator
	 */	
	class SetShowRewardVo	{
		/**
		 * SetShowConfig的id
		 */		
		showConfigId:number;
		
		/**
		 * 过期时间,没有则为0
		 */		
		expireTime:number;
		
	}


}
