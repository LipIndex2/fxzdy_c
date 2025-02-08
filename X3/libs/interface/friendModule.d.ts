declare module Vo.friend{
	
	/**
	 * 获取推荐玩家
	 * @author GameCreator
	 */	
	class GetRecommendPlayersS2C	{
		content:Array<Vo.friend.FriendQueryVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 好友极简信息
	 * @author GameCreator
	 */	
	class FriendMinVo	{
		/**
		 * 好友Id
		 */		
		friendId:number;
		
		/**
		 * 好友名
		 */		
		friendName:string;
		
	}


	
	/**
	 * 单个好友信息
	 * @author GameCreator
	 */	
	class SingleFriendVo	{
		/**
		 * 玩家信息
		 */		
		playerVo:Vo.player.PlayerWithServerVo;
		
		/**
		 * 通关最高主线关卡Id，对应TrunkInstanceConfig的Id
		 */		
		trunkInstanceId:number;
		
		/**
		 * 赠送礼物状态：1-未赠送，2-已赠送
		 */		
		giveState:number;
		
		/**
		 * 领取礼物状态：1-对方未赠送，2-对方已赠送，3-已领取
		 */		
		drawState:number;
		
		/**
		 * 最后离线时间，<0代表在线
		 */		
		logoutTime:number;
		
	}


	
	/**
	 * 获取单个好友简要信息列表
	 * @author GameCreator
	 */	
	class GetSingleFriendSimpleVosS2C	{
		content:Array<Vo.friend.SingleFriendSimpleVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 根据Id查询玩家
	 * @author GameCreator
	 */	
	class QueryPlayerByIdC2S	{
		targetId:number;
		
	}


	
	/**
	 * 根据Id查询玩家
	 * @author GameCreator
	 */	
	class QueryPlayerByIdS2C	{
		content:Vo.friend.FriendQueryVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键赠送及领取好友礼物信息
	 * @author GameCreator
	 */	
	class GiveAndDrawAllGiftVo	{
		/**
		 * 本次赠送数量
		 */		
		currentGiveCount:number;
		
		/**
		 * 本次领取数量
		 */		
		currentDrawCount:number;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 移除黑名单
	 * @author GameCreator
	 */	
	class RemoveFromBlacklistC2S	{
		targetId:number;
		
	}


	
	/**
	 * 移除黑名单
	 * @author GameCreator
	 */	
	class RemoveFromBlacklistS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战好友
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 好友Id
		 */		
		targetId:number;
		
	}


	
	/**
	 * 挑战好友
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 根据昵称查询玩家
	 * @author GameCreator
	 */	
	class QueryPlayerByNameC2S	{
		name:string;
		
	}


	
	/**
	 * 根据昵称查询玩家
	 * @author GameCreator
	 */	
	class QueryPlayerByNameS2C	{
		content:Array<Vo.friend.FriendQueryVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 同意所有好友申请结果信息
	 * @author GameCreator
	 */	
	class AgreeAllApplyResultVo	{
		/**
		 * 新增的好友Id列表
		 */		
		newFriendIds:Array<number>;
		
		/**
		 * 额外需要被移除的申请(不包括新增加的好友，两者都应该被移除掉)
		 */		
		toRemoveAppliers:Array<number>;
		
		/**
		 * 失败的同意申请者Id-错误码
		 */		
		failedAgreeApplier2Code:Object;
		
		/**
		 * 好友是否已满
		 */		
		friendFull:boolean;
		
	}


	
	/**
	 * 获取黑名单信息
	 * @author GameCreator
	 */	
	class GetBlacklistS2C	{
		content:Array<Vo.friend.FriendQueryVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 删除好友
	 * @author GameCreator
	 */	
	class DeleteFriendC2S	{
		targetId:number;
		
	}


	
	/**
	 * 删除好友
	 * @author GameCreator
	 */	
	class DeleteFriendS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 赠予领取好友礼物信息
	 * @author GameCreator
	 */	
	class GiveDrawFriendGiftVo	{
		/**
		 * 好友信息
		 */		
		simpleVo:SingleFriendSimpleVo;
		
		/**
		 * 今日已赠送好友礼物次数
		 */		
		giftGiveCount:number;
		
		/**
		 * 今日已领取好友礼物次数
		 */		
		giftDrawCount:number;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 赠送并领取好友礼物
	 * @author GameCreator
	 */	
	class GiveAndDrawFriendGiftC2S	{
		/**
		 * 好友Id
		 */		
		friendId:number;
		
	}


	
	/**
	 * 赠送并领取好友礼物
	 * @author GameCreator
	 */	
	class GiveAndDrawFriendGiftS2C	{
		content:Vo.friend.GiveDrawFriendGiftVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 好友申请处理结果
	 * @author GameCreator
	 */	
	class AgreeApplyResultVo	{
		/**
		 * 真正的错误码
		 */		
		code:number;
		
		/**
		 * 是否需要移除申请信息
		 */		
		removeApply:boolean;
		
	}


	
	/**
	 * 申请好友处理结果
	 * @author GameCreator
	 */	
	class ApplyFriendResultVo	{
		/**
		 * 目标Id
		 */		
		playerId:number;
		
		/**
		 * 申请结果码
		 */		
		resultCode:number;
		
	}


	
	/**
	 * 获取好友信息
	 * @author GameCreator
	 */	
	class GetFriendsInfoS2C	{
		content:Vo.friend.FriendsVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 好友简要信息(好友中无玩家基础信息)
	 * @author GameCreator
	 */	
	class SimpleFriendsVo	{
		/**
		 * 今日已赠送好友礼物次数
		 */		
		giftGiveCount:number;
		
		/**
		 * 今日已领取好友礼物次数
		 */		
		giftDrawCount:number;
		
		/**
		 * 本次赠送数量
		 */		
		currentGiveCount:number;
		
		/**
		 * 本次领取数量
		 */		
		currentDrawCount:number;
		
		/**
		 * 好友简要信息列表
		 */		
		friendVos:Array<SingleFriendSimpleVo>;
		
		/**
		 * 奖励信息
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 拒绝所有申请
	 * @author GameCreator
	 */	
	class DisagreeAllApplyS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 好友查询信息
	 * @author GameCreator
	 */	
	class FriendQueryVo	{
		/**
		 * 玩家信息
		 */		
		playerVo:Vo.player.PlayerWithServerVo;
		
		/**
		 * 通关最高主线关卡Id，对应TrunkInstanceConfig的Id
		 */		
		trunkInstanceId:number;
		
	}


	
	/**
	 * 好友登录信息
	 * @author GameCreator
	 */	
	class FriendLoginVo	{
		/**
		 * 玩家发出申请好友Id列表
		 */		
		myApplies:Array<number>;
		
		/**
		 * 黑名单列表
		 */		
		blacklist:Array<number>;
		
		/**
		 * 好友Id列表
		 */		
		friendIds:Array<number>;
		
		/**
		 * 未处理好友被申请数
		 */		
		beAppliedCount:number;
		
		/**
		 * 今日已赠送的好友礼物次数
		 */		
		giftGiveCount:number;
		
		/**
		 * 今日已领取的好友礼物次数
		 */		
		giftDrawCount:number;
		
		/**
		 * 单个好友简要信息集合
		 */		
		simpleVos:Array<SingleFriendSimpleVo>;
		
	}


	
	/**
	 * 同意申请
	 * @author GameCreator
	 */	
	class AgreeApplyC2S	{
		targetId:number;
		
	}


	
	/**
	 * 同意申请
	 * @author GameCreator
	 */	
	class AgreeApplyS2C	{
		content:Vo.friend.AgreeApplyResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 好友申请信息
	 * @author GameCreator
	 */	
	class FriendApplyVo	{
		/**
		 * 玩家信息
		 */		
		simpleVo:Vo.player.PlayerWithServerVo;
		
		/**
		 * 通关最高主线关卡Id，对应TrunkInstanceConfig的Id
		 */		
		trunkInstanceId:number;
		
		/**
		 * 申请时间戳
		 */		
		applyTime:number;
		
	}


	
	/**
	 * 拒绝申请
	 * @author GameCreator
	 */	
	class DisagreeApplyS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 同意所有申请
	 * @author GameCreator
	 */	
	class AgreeAllApplyS2C	{
		content:Vo.friend.AgreeAllApplyResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 申请加好友
	 * @author GameCreator
	 */	
	class ApplyFriendsC2S	{
		/**
		 * 目标玩家Id列表
		 */		
		targetIds:Array<number>;
		
	}


	
	/**
	 * 申请加好友
	 * @author GameCreator
	 */	
	class ApplyFriendsS2C	{
		content:Array<Vo.friend.ApplyFriendResultVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 拒绝申请
	 * @author GameCreator
	 */	
	class DisagreeApplyC2S	{
		targetId:number;
		
	}


	
	/**
	 * 一键赠送并领取好友礼物(无好友当前信息)
	 * @author GameCreator
	 */	
	class GiveAndDrawAllGiftS2C	{
		content:Vo.friend.GiveAndDrawAllGiftVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 拉黑某人
	 * @author GameCreator
	 */	
	class BlacklistC2S	{
		targetId:number;
		
	}


	
	/**
	 * 拉黑某人
	 * @author GameCreator
	 */	
	class BlacklistS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键赠送并领取好友礼物
	 * @author GameCreator
	 */	
	class GiveAndDrawAllFriendGiftS2C	{
		content:Vo.friend.SimpleFriendsVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 单个好友简要信息
	 * @author GameCreator
	 */	
	class SingleFriendSimpleVo	{
		/**
		 * 玩家Id
		 */		
		playerId:number;
		
		/**
		 * 赠送礼物状态：1-未赠送，2-已赠送
		 */		
		giveState:number;
		
		/**
		 * 领取礼物状态：1-对方未赠送，2-对方已赠送，3-已领取
		 */		
		drawState:number;
		
	}


	
	/**
	 * 好友信息
	 * @author GameCreator
	 */	
	class FriendsVo	{
		/**
		 * 今日已赠送好友礼物次数
		 */		
		giftGiveCount:number;
		
		/**
		 * 今日已领取好友礼物次数
		 */		
		giftDrawCount:number;
		
		/**
		 * 好友信息列表
		 */		
		friendVos:Array<SingleFriendVo>;
		
	}


	
	/**
	 * 获取好友申请信息
	 * @author GameCreator
	 */	
	class GetApplyInfoS2C	{
		content:Array<Vo.friend.FriendApplyVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
