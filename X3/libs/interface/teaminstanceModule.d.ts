declare module Vo.teaminstance{
	
	/**
	 * 队伍申请信息Vo
	 * @author GameCreator
	 */	
	class TeamApplyVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 申请时间
		 */		
		applyTime:number;
		
	}


	
	/**
	 * 组队副本登录下发vo
	 * @author GameCreator
	 */	
	class TeamInstanceLoginVo	{
		/**
		 * 已通关副本配置ID
		 */		
		passInstanceConfigId:number;
		
		/**
		 * 已领取奖励的章节ID列表
		 */		
		drawChapterIds:Array<number>;
		
		/**
		 * 私聊频道最后一次分享时间
		 */		
		privateChannelLastShareTime:number;
		
		/**
		 * 加入的队伍ID,没有则为null
		 */		
		teamId:string;
		
		/**
		 * 已申请加入的队伍ID列表
		 */		
		applyTeamIds:Array<string>;
		
		/**
		 * 今日助战奖励次数
		 */		
		todayHelpRewardCount:number;
		
		/**
		 * 邀请镜像助战次数
		 */		
		friendImageCount:number;
		
		/**
		 * 帮助好友镜像助战次数
		 */		
		helpFriendImageCount:number;
		
	}


	
	/**
	 * 快速加入队伍
	 * @author GameCreator
	 */	
	class QuicklyJoinTeamS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 组队副本玩家信息vo
	 * @author GameCreator
	 */	
	class TeamInstancePlayerVo	{
		/**
		 * 玩家信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 是否已分享
		 */		
		shared:boolean;
		
		/**
		 * 最后离线时间,<=0表示在线
		 */		
		offlineTime:number;
		
		/**
		 * 帮助好友镜像助战次数
		 */		
		helpFriendImageCount:number;
		
	}


	
	/**
	 * 转让队长
	 * @author GameCreator
	 */	
	class TransferLeaderC2S	{
		/**
		 * 目标玩家ID
		 */		
		targetId:number;
		
	}


	
	/**
	 * 组队副本章节奖励vo
	 * @author GameCreator
	 */	
	class TeamInstanceChapterRewardVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 章节ID,TeamInstanceChapterConfig.id
		 */		
		chapterId:number;
		
	}


	
	/**
	 * 获取队伍信息
	 * @author GameCreator
	 */	
	class LoadTeamInfoS2C	{
		content:Vo.teaminstance.TeamVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 队员信息
	 * @author GameCreator
	 */	
	class TeamMemberVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 成员上阵英雄信息
		 */		
		positionVisitVo:Array<Vo.formation.PositionVisitVo>;
		
		/**
		 * 成员入队时间
		 */		
		joinTime:number;
		
		/**
		 * 机器人信息
		 */		
		teamRobot:TeamRobotVo;
		
	}


	
	/**
	 * 转让队长
	 * @author GameCreator
	 */	
	class TransferLeaderS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改战力限制
	 * @author GameCreator
	 */	
	class ChangeFightLimitC2S	{
		/**
		 * 战力限制
		 */		
		fightLimit:number;
		
	}


	
	/**
	 * 修改战力限制
	 * @author GameCreator
	 */	
	class ChangeFightLimitS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取好友列表
	 * @author GameCreator
	 */	
	class LoadFriendListS2C	{
		content:Array<Vo.teaminstance.TeamInstancePlayerVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取最近组队玩家列表
	 * @author GameCreator
	 */	
	class LoadRecentPlayerListS2C	{
		content:Array<Vo.teaminstance.TeamInstancePlayerVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 机器人简要信息
	 * @author GameCreator
	 */	
	class TeamRobotBriefVo	{
		/**
		 * 机器人ID
		 */		
		id:number;
		
		/**
		 * 机器人名称
		 */		
		name:string;
		
		/**
		 * 机器人等级
		 */		
		level:number;
		
	}


	
	/**
	 * 机器人信息
	 * @author GameCreator
	 */	
	class TeamRobotVo	{
		/**
		 * 机器人类型 1: 普通机器人,2: 玩家镜像
		 */		
		type:number;
		
		/**
		 * 根据类型判断，机器人配置表id 或者 玩家id
		 */		
		id:number;
		
		/**
		 * 名字，机器人的名字
		 */		
		name:string;
		
		/**
		 * 英雄id列表，机器人拥有的英雄id
		 */		
		heroIds:Array<number>;
		
		/**
		 * 等级列表，机器人拥有的英雄的等级
		 */		
		levels:Array<number>;
		
		/**
		 * 星级列表，机器人拥有的英雄的星级
		 */		
		stars:Array<number>;
		
		/**
		 * 装备列表，机器人拥有的英雄的装备id
		 */		
		equipments:Array<number>;
		
		/**
		 * 玩家镜像
		 */		
		fighterMirror:Vo.battle.FighterMirror;
		
	}


	
	/**
	 * 队伍成员简要信息
	 * @author GameCreator
	 */	
	class TeamMemberBriefVo	{
		/**
		 * 玩家基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 成员入队时间
		 */		
		joinTime:number;
		
		/**
		 * 机器人简要信息
		 */		
		robotBrief:TeamRobotBriefVo;
		
	}


	
	/**
	 * 获取队伍列表,TeamBriefVo
	 * @author GameCreator
	 */	
	class LoadTeamListC2S	{
		/**
		 * 组队副本ID
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 分页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取队伍列表,TeamBriefVo
	 * @author GameCreator
	 */	
	class LoadTeamListS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 申请入队,true-加入成功,false-等待审批
	 * @author GameCreator
	 */	
	class ApplyJoinTeamC2S	{
		teamId:string;
		
	}


	
	/**
	 * 申请入队,true-加入成功,false-等待审批
	 * @author GameCreator
	 */	
	class ApplyJoinTeamS2C	{
		content:boolean;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 队伍信息更新vo
	 * @author GameCreator
	 */	
	class TeamInfoUpdateVo	{
		/**
		 * 队伍名称
		 */		
		name:string;
		
		/**
		 * 是否自动审批
		 */		
		autoApproval:boolean;
		
		/**
		 * 队伍战力限制,0表示无限制
		 */		
		fightLimit:number;
		
		/**
		 * 队员是否开启战斗 false-表示否 true-表示可以
		 */		
		teamMemberCanStart:boolean;
		
	}


	
	/**
	 * 队伍挑战
	 * @author GameCreator
	 */	
	class TeamChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取队伍申请列表
	 * @author GameCreator
	 */	
	class LoadTeamApplyListS2C	{
		content:Array<Vo.teaminstance.TeamApplyVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 组队战斗状态
	 * @author GameCreator
	 */	
	class TeamBattleStatusVo	{
		/**
		 * 队伍是否战斗中 false-表示否 true-表示在战斗中
		 */		
		teamBattle:boolean;
		
		/**
		 * 队伍id
		 */		
		teamId:string;
		
	}


	
	/**
	 * 单人挑战
	 * @author GameCreator
	 */	
	class SingleChallengeC2S	{
		/**
		 * 组队副本ID
		 */		
		teamInstanceConfigId:number;
		
	}


	
	/**
	 * 单人挑战
	 * @author GameCreator
	 */	
	class SingleChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 聊天分享队伍,返回私聊最后一次分享时间
	 * @author GameCreator
	 */	
	class OneKeyShareTeamS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改队伍权限设置 成员是否可以开启队伍副本
	 * @author GameCreator
	 */	
	class ModifyTeamPermissionC2S	{
		/**
		 * 成员是否可以发起战斗 true-可以发起战斗,false-不可以
		 */		
		memberCanStart:boolean;
		
	}


	
	/**
	 * 修改队伍权限设置 成员是否可以开启队伍副本
	 * @author GameCreator
	 */	
	class ModifyTeamPermissionS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改队伍审批
	 * @author GameCreator
	 */	
	class ChangeApprovalC2S	{
		/**
		 * 是否自动审批
		 */		
		autoApproval:boolean;
		
	}


	
	/**
	 * 修改队伍审批
	 * @author GameCreator
	 */	
	class ChangeApprovalS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 踢出队员
	 * @author GameCreator
	 */	
	class KickMemberC2S	{
		/**
		 * 目标玩家ID
		 */		
		targetId:number;
		
	}


	
	/**
	 * 踢出队员
	 * @author GameCreator
	 */	
	class KickMemberS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 队伍信息
	 * @author GameCreator
	 */	
	class TeamVo	{
		/**
		 * 队伍唯一ID
		 */		
		id:string;
		
		/**
		 * 队伍名称
		 */		
		name:string;
		
		/**
		 * 队长ID
		 */		
		leaderId:number;
		
		/**
		 * 队伍成员列表
		 */		
		memberVos:Array<TeamMemberVo>;
		
		/**
		 * 申请入队的玩家ID列表,详细信息请求申请列表接口
		 */		
		applyPlayerIds:Array<number>;
		
		/**
		 * 队伍挑战的队伍副本配置ID
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 是否自动审批
		 */		
		autoApproval:boolean;
		
		/**
		 * 队伍战力限制,0表示无限制
		 */		
		fightLimit:number;
		
		/**
		 * 频道最后分享时间Map,key为频道类型, value为最后分享时间
		 */		
		lastShareTimeMap:Object;
		
		/**
		 * 是否已通关组队副本
		 */		
		passTeamInstance:boolean;
		
		/**
		 * 队员是否开启战斗 false-表示否 true-表示可以
		 */		
		teamMemberCanStart:boolean;
		
		/**
		 * 队伍是否战斗中 false-表示否 true-表示在战斗中
		 */		
		teamBattle:boolean;
		
	}


	
	/**
	 * 聊天分享队伍,返回最后一次分享的时间
	 * @author GameCreator
	 */	
	class ShareTeamC2S	{
		/**
		 * 频道类型
		 */		
		channelType:number;
		
		/**
		 * 目标玩家,私聊频道使用
		 */		
		targetId:number;
		
	}


	
	/**
	 * 聊天分享队伍,返回最后一次分享的时间
	 * @author GameCreator
	 */	
	class ShareTeamS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 组队副本挑战结果vo
	 * @author GameCreator
	 */	
	class TeamInstanceChallengeResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 是否组队挑战
		 */		
		team:boolean;
		
		/**
		 * 是否助战,组队挑战时有效
		 */		
		help:boolean;
		
		/**
		 * 当前已通关的组队副本配置ID
		 */		
		passInstanceConfigId:number;
		
		/**
		 * 是否已通关组队副本
		 */		
		passTeamInstance:boolean;
		
		/**
		 * 更新的队伍副本ID,组队挑战时有效
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 奖励内容
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 今日助战次数
		 */		
		todayHelpRewardCount:number;
		
		/**
		 * 队伍是否战斗中 false-表示否 true-表示在战斗中
		 */		
		teamBattle:boolean;
		
	}


	
	/**
	 * 队伍简要信息vo
	 * @author GameCreator
	 */	
	class TeamBriefVo	{
		/**
		 * 队伍唯一ID
		 */		
		id:string;
		
		/**
		 * 队伍名称
		 */		
		name:string;
		
		/**
		 * 队长ID
		 */		
		leaderId:number;
		
		/**
		 * 队伍成员列表
		 */		
		memberVos:Array<TeamMemberBriefVo>;
		
		/**
		 * 队伍挑战的队伍副本配置ID
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 是否自动审批
		 */		
		autoApproval:boolean;
		
		/**
		 * 队伍战力限制,0表示无限制
		 */		
		fightLimit:number;
		
	}


	
	/**
	 * 添加好友机器人玩家到组队副本队伍中
	 * @author GameCreator
	 */	
	class AddFriendRobotToTeamC2S	{
		/**
		 * friendId 好友ID
		 */		
		friendId:number;
		
	}


	
	/**
	 * 添加好友机器人玩家到组队副本队伍中
	 * @author GameCreator
	 */	
	class AddFriendRobotToTeamS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 离开队伍
	 * @author GameCreator
	 */	
	class LeaveTeamS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取好友镜像列表
	 * @author GameCreator
	 */	
	class LoadFriendImageListS2C	{
		content:Array<Vo.teaminstance.TeamInstancePlayerVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 添加机器人玩家到组队副本队伍中
	 * @author GameCreator
	 */	
	class AddRobotToTeamS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 创建队伍
	 * @author GameCreator
	 */	
	class CreateTeamC2S	{
		/**
		 * 队伍名称
		 */		
		teamName:string;
		
		/**
		 * 组队副本ID
		 */		
		teamInstanceConfigId:number;
		
		/**
		 * 是否自动审批
		 */		
		autoApproval:boolean;
		
		/**
		 * 战力限制
		 */		
		fightLimit:number;
		
	}


	
	/**
	 * 创建队伍
	 * @author GameCreator
	 */	
	class CreateTeamS2C	{
		content:Vo.teaminstance.TeamVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改队伍名称
	 * @author GameCreator
	 */	
	class ChangeTeamNameC2S	{
		/**
		 * 队伍名称
		 */		
		teamName:string;
		
	}


	
	/**
	 * 修改队伍名称
	 * @author GameCreator
	 */	
	class ChangeTeamNameS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取章节奖励
	 * @author GameCreator
	 */	
	class DrawChapterRewardS2C	{
		content:Vo.teaminstance.TeamInstanceChapterRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取章节奖励
	 * @author GameCreator
	 */	
	class DrawChapterRewardC2S	{
		/**
		 * 章节ID,TeamInstanceChapterConfig.id
		 */		
		chapterId:number;
		
	}


	
	/**
	 * 组队副本分享更新vo
	 * @author GameCreator
	 */	
	class TeamInstanceShareUpdateVo	{
		/**
		 * 聊天频道最后分享时间MAP，key为频道类型，value为最后分享时间
		 */		
		channelLastShareTimeMap:Object;
		
	}


	
	/**
	 * 审批入队申请,true-审批成功移除申请列表,false-
	 * @author GameCreator
	 */	
	class ApprovalC2S	{
		/**
		 * 目标玩家ID
		 */		
		targetId:number;
		
		isAgree:boolean;
		
	}


	
	/**
	 * 审批入队申请,true-审批成功移除申请列表,false-
	 * @author GameCreator
	 */	
	class ApprovalS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
