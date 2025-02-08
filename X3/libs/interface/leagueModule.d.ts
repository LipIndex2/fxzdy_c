declare module Vo.league{
	
	/**
	 * 领取联盟赠礼
	 * @author GameCreator
	 */	
	class DrawLeagueGiftS2C	{
		content:Vo.league.DrawLeagueGiftVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟升级科技信息vo
	 * @author GameCreator
	 */	
	class LeagueUpgradeTechVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 联盟科技信息
		 */		
		techVo:LeagueTechVo;
		
	}


	
	/**
	 * 领取联盟赠礼
	 * @author GameCreator
	 */	
	class DrawLeagueGiftC2S	{
		/**
		 * 联盟赠礼唯一ID,LeagueGiftVo.id
		 */		
		leagueGiftId:number;
		
	}


	
	/**
	 * 联盟简要信息
	 * @author GameCreator
	 */	
	class LeagueBriefVo	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 图标
		 */		
		icon:number;
		
		/**
		 * 旗帜
		 */		
		banner:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 活跃度
		 */		
		active:number;
		
		/**
		 * 成员数量
		 */		
		memberCount:number;
		
		/**
		 * 是否自动审批
		 */		
		autoAccept:boolean;
		
	}


	
	/**
	 * 根据名称查找联盟
	 * @author GameCreator
	 */	
	class SearchLeagueByNameC2S	{
		/**
		 * 联盟名称
		 */		
		name:string;
		
		page:number;
		
	}


	
	/**
	 * 根据名称查找联盟
	 * @author GameCreator
	 */	
	class SearchLeagueByNameS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取联盟周常任务信息vo
	 * @author GameCreator
	 */	
	class DrawLeagueWeeklyTaskVo	{
		/**
		 * 任务奖励信息
		 */		
		taskRewardVo:Vo.task.TaskRewardVo;
		
		/**
		 * 周常任务领取的联盟币数量
		 */		
		weeklyDrawLeagueGoldAmount:number;
		
	}


	
	/**
	 * 领取联盟周常任务奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyTaskRewardC2S	{
		/**
		 * 联盟周常任务ID
		 */		
		taskConfigId:number;
		
	}


	
	/**
	 * 领取联盟周常任务奖励
	 * @author GameCreator
	 */	
	class DrawWeeklyTaskRewardS2C	{
		content:Vo.league.DrawLeagueWeeklyTaskVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟成员列表
	 * @author GameCreator
	 */	
	class LoadLeagueMemberListS2C	{
		content:Array<Vo.league.LeagueMemberVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 发送联盟邮件
	 * @author GameCreator
	 */	
	class SendLeagueEmailC2S	{
		/**
		 * 邮件内容
		 */		
		content:string;
		
	}


	
	/**
	 * 发送联盟邮件
	 * @author GameCreator
	 */	
	class SendLeagueEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟BOSS排行榜信息
	 * @author GameCreator
	 */	
	class LeagueBossRankingVo	{
		/**
		 * 玩家当前名次,-1表示没排名
		 */		
		rank:number;
		
		/**
		 * 排行值
		 */		
		value:number;
		
		/**
		 * 排行榜列表
		 */		
		list:Array<Vo.ranking.RankItemVo>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
		
	}


	
	/**
	 * 联盟公告变更信息Vo
	 * @author GameCreator
	 */	
	class LeagueNoticeChangeVo	{
		/**
		 * 公告内容
		 */		
		notice:string;
		
		/**
		 * 公告最后更新时间
		 */		
		noticeLastUpdateTime:number;
		
	}


	
	/**
	 * 创建联盟信息
	 * @author GameCreator
	 */	
	class LeagueCreateVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 联盟信息
		 */		
		leagueVo:LeagueVo;
		
	}


	
	/**
	 * 申请加入联盟,true-加入成功,false-等待审核
	 * @author GameCreator
	 */	
	class ApplyJoinLeagueC2S	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
	}


	
	/**
	 * 申请加入联盟,true-加入成功,false-等待审核
	 * @author GameCreator
	 */	
	class ApplyJoinLeagueS2C	{
		content:boolean;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟申请列表
	 * @author GameCreator
	 */	
	class LoadLeagueApplyS2C	{
		content:Array<Vo.league.LeagueApplyVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟砍价开启信息vo
	 * @author GameCreator
	 */	
	class LeagueBargainStartVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 砍价礼包分组ID
		 */		
		bargainGiftId:number;
		
		/**
		 * 折扣(万分比),折扣为负则购买不消化且奖励Math.abs(初始价格*折扣)数量的钻石,实际价格=初始价格*折扣
		 */		
		discount:number;
		
	}


	
	/**
	 * 发放联盟赠礼
	 * @author GameCreator
	 */	
	class SendLeagueGiftC2S	{
		/**
		 * 联盟赠礼唯一ID,LeagueGiftItemVo.id
		 */		
		giftItemId:number;
		
	}


	
	/**
	 * 发放联盟赠礼
	 * @author GameCreator
	 */	
	class SendLeagueGiftS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟战力排名信息vo
	 * @author GameCreator
	 */	
	class LeagueFightRankItemVo	{
		/**
		 * 名次
		 */		
		rank:number;
		
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 联盟名称
		 */		
		name:string;
		
		/**
		 * 图案
		 */		
		icon:number;
		
		/**
		 * 旗帜
		 */		
		banner:number;
		
		/**
		 * 盟主ID
		 */		
		leaderId:number;
		
		/**
		 * 盟主昵称
		 */		
		leaderName:string;
		
		/**
		 * 联盟战力
		 */		
		fight:number;
		
	}


	
	/**
	 * 联盟职位变更信息Vo
	 * @author GameCreator
	 */	
	class LeagueJobChangeVo	{
		/**
		 * 成员ID
		 */		
		memberId:number;
		
		/**
		 * 职位类型,LeagueJobType
		 */		
		jobType:number;
		
	}


	
	/**
	 * 联盟科技信息vo
	 * @author GameCreator
	 */	
	class LeagueTechVo	{
		/**
		 * 英雄职业,Career
		 */		
		career:number;
		
		/**
		 * 卡槽ID
		 */		
		slotId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
	}


	
	/**
	 * 购买砍价礼包
	 * @author GameCreator
	 */	
	class BuyBargainGiftS2C	{
		content:Vo.league.LeagueBargainGiftBuyVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟挑战信息vo
	 * @author GameCreator
	 */	
	class LeagueChallengeTaskVo	{
		/**
		 * 挑战任务ID
		 */		
		taskId:number;
		
		/**
		 * 进度,完成任务的成员数量
		 */		
		progress:number;
		
		/**
		 * 是否完成
		 */		
		finished:boolean;
		
	}


	
	/**
	 * 购买砍价礼包
	 * @author GameCreator
	 */	
	class BuyBargainGiftC2S	{
		/**
		 * 砍价礼包ID
		 */		
		bargainGiftId:number;
		
	}


	
	/**
	 * 联盟宝箱更新信息vo
	 * @author GameCreator
	 */	
	class LeagueBoxUpdateVo	{
		/**
		 * 上周联盟宝箱等级
		 */		
		lastWeekBoxLevel:number;
		
		/**
		 * 当前联盟宝箱进度
		 */		
		leagueBoxProgress:number;
		
	}


	
	/**
	 * 获取联盟BOSS信息
	 * @author GameCreator
	 */	
	class LoadLeagueBossInfoC2S	{
		/**
		 * 联盟BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


	
	/**
	 * 获取联盟BOSS信息
	 * @author GameCreator
	 */	
	class LoadLeagueBossInfoS2C	{
		content:Vo.league.LeagueBossVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟修改名称Vo
	 * @author GameCreator
	 */	
	class LeagueChangeNameVo	{
		/**
		 * 新的联盟名称
		 */		
		name:string;
		
		/**
		 * 最后修改联盟名称的时间
		 */		
		lastChangeNameTime:number;
		
	}


	
	/**
	 * 获取联盟分页列表
	 * @author GameCreator
	 */	
	class LoadLeagueListC2S	{
		/**
		 * 分页
		 */		
		page:number;
		
	}


	
	/**
	 * 获取联盟分页列表
	 * @author GameCreator
	 */	
	class LoadLeagueListS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟砍价礼包购买信息Vo
	 * @author GameCreator
	 */	
	class LeagueBargainGiftBuyVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 最后一次购买砍价礼包时间,用于判断是否可以购买砍价礼包
		 */		
		lastBuyBargainGiftTime:number;
		
	}


	
	/**
	 * 
	 * @author GameCreator
	 */	
	class AddAdvertBossCountS2C	{
		content:Vo.league.LeagueBossAdvertVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟成员简要信息
	 * @author GameCreator
	 */	
	class LeagueMemberBriefVo	{
		/**
		 * 玩家ID
		 */		
		id:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 头像
		 */		
		headIcon:number;
		
		/**
		 * 头像框
		 */		
		headFrame:number;
		
		/**
		 * 形象ID
		 */		
		imageId:number;
		
		/**
		 * 称号
		 */		
		title:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 战斗力
		 */		
		fight:number;
		
		/**
		 * 联盟职位,LeagueJobType
		 */		
		jobType:number;
		
	}


	
	/**
	 * 审批联盟申请
	 * @author GameCreator
	 */	
	class ApprovalLeagueApplyC2S	{
		/**
		 * 申请玩家ID
		 */		
		applyId:number;
		
		/**
		 * 是否同意
		 */		
		agree:boolean;
		
	}


	
	/**
	 * 审批联盟申请
	 * @author GameCreator
	 */	
	class ApprovalLeagueApplyS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟BOSS排行榜
	 * @author GameCreator
	 */	
	class LoadLeagueBossRankC2S	{
		/**
		 * 联盟BOSS配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 第几页,从1开始
		 */		
		page:number;
		
	}


	
	/**
	 * 获取联盟BOSS排行榜
	 * @author GameCreator
	 */	
	class LoadLeagueBossRankS2C	{
		content:Vo.league.LeagueBossRankingVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟砍价信息vo
	 * @author GameCreator
	 */	
	class LeagueBargainVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 砍价礼包分组ID,实际价格= 初始价格 - Math.floor(联盟成员折扣*该礼包价格)之和
		 */		
		bargainGiftId:number;
		
		/**
		 * 联盟成员信息
		 */		
		memberVos:Array<LeagueBargainMemberVo>;
		
	}


	
	/**
	 * 领取上周联盟宝箱
	 * @author GameCreator
	 */	
	class DrawLastWeekLeagueBoxS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟信息
	 * @author GameCreator
	 */	
	class LoadLeagueInfoS2C	{
		content:Vo.league.LeagueVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改联盟申请自动审批
	 * @author GameCreator
	 */	
	class ChangeAutoAcceptC2S	{
		/**
		 * 是否自动审批,为true时一键同意申请,前端清空申请列表
		 */		
		autoAccept:boolean;
		
	}


	
	/**
	 * 修改联盟申请自动审批
	 * @author GameCreator
	 */	
	class ChangeAutoAcceptS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟阶段BOSS信息
	 * @author GameCreator
	 */	
	class LeagueStageBossVo	{
		/**
		 * 今日BOSS已挑战次数
		 */		
		bossChallengeTimes:number;
		
		/**
		 * 当前BOSS阶段
		 */		
		bossStage:number;
		
		/**
		 * 阶段boss信息列表
		 */		
		bossVos:Array<LeagueBossVo>;
		
	}


	
	/**
	 * 联盟信息
	 * @author GameCreator
	 */	
	class LeagueVo	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 盟主昵称
		 */		
		leaderName:string;
		
		/**
		 * 图标
		 */		
		icon:number;
		
		/**
		 * 旗帜
		 */		
		banner:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 经验
		 */		
		exp:number;
		
		/**
		 * 活跃度
		 */		
		active:number;
		
		/**
		 * 本周发送联盟邮件次数
		 */		
		weekEmailTimes:number;
		
		/**
		 * 成员数量
		 */		
		memberCount:number;
		
		/**
		 * 公告
		 */		
		notice:string;
		
		/**
		 * 公告最后修改时间
		 */		
		noticeLastUpdateTime:number;
		
		/**
		 * 是否自动审批
		 */		
		autoAccept:boolean;
		
		/**
		 * 联盟挑战任务信息
		 */		
		challengeTaskVos:Array<LeagueChallengeTaskVo>;
		
		/**
		 * 最后修改联盟名称时间
		 */		
		lastChangeNameTime:number;
		
		/**
		 * 最后修改联盟图标时间
		 */		
		lastChangeIconTime:number;
		
		/**
		 * 联盟赠礼信息MAP,LeagueGiftVo.id-LeagueGiftVo
		 */		
		leagueGiftVoMap:Object;
		
		/**
		 * 上一周宝箱等级,没有则为0
		 */		
		lastWeekBoxLevel:number;
		
		/**
		 * 联盟宝箱进度
		 */		
		leagueBoxProgress:number;
		
		/**
		 * 今日邀请次数
		 */		
		todayInviteTimes:number;
		
	}


	
	/**
	 * 领取挑战任务奖励
	 * @author GameCreator
	 */	
	class DrawChallengeTaskC2S	{
		/**
		 * 任务ID
		 */		
		taskId:number;
		
	}


	
	/**
	 * 领取挑战任务奖励
	 * @author GameCreator
	 */	
	class DrawChallengeTaskS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 聊天招募
	 * @author GameCreator
	 */	
	class ChatInviteC2S	{
		/**
		 * 招募内容
		 */		
		content:string;
		
	}


	
	/**
	 * 聊天招募
	 * @author GameCreator
	 */	
	class ChatInviteS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 退出联盟
	 * @author GameCreator
	 */	
	class QuitLeagueS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 看广告增加次数
	 * @author GameCreator
	 */	
	class LeagueBossAdvertVo	{
		/**
		 * 今日BOSS看广告获得挑战次数
		 */		
		bossAdvertChallengeTimes:number;
		
	}


	
	/**
	 * 一键同意申请
	 * @author GameCreator
	 */	
	class OneKeyAgreeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟赠礼信息vo
	 * @author GameCreator
	 */	
	class LeagueGiftVo	{
		/**
		 * 唯一ID
		 */		
		id:number;
		
		/**
		 * 发送玩家ID
		 */		
		sendPlayerId:number;
		
		/**
		 * 发送玩家昵称
		 */		
		sendPlayerName:string;
		
		/**
		 * 联盟赠礼配置ID
		 */		
		leagueGiftConfigId:number;
		
		/**
		 * 发放的赠礼道具是从XX商品ID获得的,没有则为null
		 */		
		chargeGoodsId:string;
		
		/**
		 * 已领取的玩家ID集合
		 */		
		drawPlayerIds:Array<number>;
		
		/**
		 * 过期时间
		 */		
		expireTime:number;
		
	}


	
	/**
	 * 获取当前阶段BOSS信息
	 * @author GameCreator
	 */	
	class LoadStageLeagueBossS2C	{
		content:Vo.league.LeagueStageBossVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟砍价信息
	 * @author GameCreator
	 */	
	class LoadLeagueBargainInfoS2C	{
		content:Vo.league.LeagueBargainVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟boss信息vo
	 * @author GameCreator
	 */	
	class LeagueBossVo	{
		/**
		 * 联盟BOSS配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 击杀时间,没有则为0
		 */		
		killTime:number;
		
		/**
		 * boss受到总伤害
		 */		
		bossTotalBeHurt:number;
		
		/**
		 * boss总血量
		 */		
		bossTotalHp:number;
		
		/**
		 * 排名前3玩家
		 */		
		topRankItemVos:Array<Vo.ranking.RankItemVo>;
		
	}


	
	/**
	 * 查看联盟信息vo
	 * @author GameCreator
	 */	
	class LeagueViewVo	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 联盟图标
		 */		
		icon:number;
		
		/**
		 * 联盟旗帜
		 */		
		banner:number;
		
		/**
		 * 联盟名称
		 */		
		name:string;
		
		/**
		 * 联盟公告
		 */		
		notice:string;
		
		/**
		 * 联盟等级
		 */		
		level:number;
		
		/**
		 * 联盟成员
		 */		
		memberBriefVos:Array<LeagueMemberVo>;
		
	}


	
	/**
	 * 修改联盟公告
	 * @author GameCreator
	 */	
	class ChangeLeagueNoticeC2S	{
		/**
		 * 公告内容
		 */		
		content:string;
		
	}


	
	/**
	 * 修改联盟公告
	 * @author GameCreator
	 */	
	class ChangeLeagueNoticeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取联盟赠礼信息vo
	 * @author GameCreator
	 */	
	class DrawLeagueGiftVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 联盟赠礼已领取钻石数量
		 */		
		leagueGiftDrawDiamondAmount:number;
		
	}


	
	/**
	 * 升级联盟科技
	 * @author GameCreator
	 */	
	class UpgradeLeagueTechC2S	{
		/**
		 * 职业类型ID
		 */		
		career:number;
		
		/**
		 * 科技槽位ID
		 */		
		slotId:number;
		
	}


	
	/**
	 * 升级联盟科技
	 * @author GameCreator
	 */	
	class UpgradeLeagueTechS2C	{
		content:Vo.league.LeagueUpgradeTechVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 创建联盟
	 * @author GameCreator
	 */	
	class CreateLeagueC2S	{
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 图案
		 */		
		icon:number;
		
		/**
		 * 旗帜
		 */		
		banner:number;
		
	}


	
	/**
	 * 创建联盟
	 * @author GameCreator
	 */	
	class CreateLeagueS2C	{
		content:Vo.league.LeagueCreateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 成员任命
	 * @author GameCreator
	 */	
	class MemberAppointC2S	{
		/**
		 * 成员ID
		 */		
		memberId:number;
		
		/**
		 * 职位
		 */		
		jobType:number;
		
	}


	
	/**
	 * 成员任命
	 * @author GameCreator
	 */	
	class MemberAppointS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟周常任务重置信息vo
	 * @author GameCreator
	 */	
	class LeagueWeeklyTaskResetVo	{
		/**
		 * 移除的联盟信息
		 */		
		taskRemovedVo:Vo.task.TaskRemovedVo;
		
		/**
		 * 周常任务领取的联盟币数量
		 */		
		weeklyDrawLeagueGoldAmount:number;
		
	}


	
	/**
	 * 修改联盟名称
	 * @author GameCreator
	 */	
	class ChangeLeagueNameC2S	{
		/**
		 * 新名称
		 */		
		name:string;
		
	}


	
	/**
	 * 修改联盟名称
	 * @author GameCreator
	 */	
	class ChangeLeagueNameS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟挑战结果vo
	 * @author GameCreator
	 */	
	class LeagueBossChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * boss配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 今日挑战次数
		 */		
		todayChallengeTimes:number;
		
		/**
		 * 本次挑战伤害
		 */		
		hurt:number;
		
		/**
		 * boss当前收到总伤害
		 */		
		bossTotalBeHurt:number;
		
		/**
		 * BOSS是否本次战斗被击杀,如果BOSS已被击杀且killedNow为false则提示BOSS状态更新且本次伤害不进入排行榜
		 */		
		killedNow:boolean;
		
	}


	
	/**
	 * 联盟等级信息变更vo
	 * @author GameCreator
	 */	
	class LeagueLevelInfoChangeVo	{
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 经验
		 */		
		exp:number;
		
		/**
		 * 活跃度
		 */		
		active:number;
		
	}


	
	/**
	 * 查看完成挑战任务的玩家
	 * @author GameCreator
	 */	
	class ViewChallengeTaskMemberC2S	{
		/**
		 * 挑战任务ID
		 */		
		taskId:number;
		
	}


	
	/**
	 * 查看完成挑战任务的玩家
	 * @author GameCreator
	 */	
	class ViewChallengeTaskMemberS2C	{
		content:Array<Vo.league.LeagueMemberBriefVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * BOSS死亡信息
	 * @author GameCreator
	 */	
	class LeagueBossDeadVo	{
		/**
		 * 联盟BOSS配置ID
		 */		
		bossConfigId:number;
		
		/**
		 * 击杀时间,没有则为0
		 */		
		killTime:number;
		
		/**
		 * boss受到总伤害
		 */		
		bossTotalBeHurt:number;
		
		/**
		 * boss总血量
		 */		
		bossTotalHp:number;
		
	}


	
	/**
	 * 联盟砍价成员信息vo
	 * @author GameCreator
	 */	
	class LeagueBargainMemberVo	{
		/**
		 * 玩家ID
		 */		
		id:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 玩家砍价折扣(万分比)
		 */		
		bargainDiscount:number;
		
		/**
		 * 玩家是否已购买
		 */		
		buy:boolean;
		
		/**
		 * 最后离线时间,<=0则表示在线
		 */		
		offlineTime:number;
		
	}


	
	/**
	 * 赠礼物品信息Vo
	 * @author GameCreator
	 */	
	class LeagueGiftItemVo	{
		/**
		 * 赠礼物品唯一ID
		 */		
		id:number;
		
		/**
		 * 赠礼配置ID
		 */		
		leagueGiftConfigId:number;
		
	}


	
	/**
	 * 礼包砍价,返回最后一次砍价时间
	 * @author GameCreator
	 */	
	class BargainGiftS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家联盟登录下发vo
	 * @author GameCreator
	 */	
	class PlayerLeagueLoginVo	{
		/**
		 * 加入的联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 联盟等级，如果没加入联盟则为0
		 */		
		leagueLevel:number;
		
		/**
		 * 联盟职位,LeagueJobType
		 */		
		jobType:number;
		
		/**
		 * 加入时间
		 */		
		joinTime:number;
		
		/**
		 * 最后一次退出联盟时间
		 */		
		exitTime:number;
		
		/**
		 * 首次创建的联盟ID
		 */		
		firstCreateLeagueId:number;
		
		/**
		 * 今日BOSS已挑战次数
		 */		
		bossChallengeTimes:number;
		
		/**
		 * 今日BOSS看广告获得挑战次数
		 */		
		bossAdvertChallengeTimes:number;
		
		/**
		 * 七日活跃
		 */		
		active:number;
		
		/**
		 * 已申请的联盟ID列表,加入联盟后清空
		 */		
		applyLeagueIds:Array<number>;
		
		/**
		 * 已领取奖励的挑战任务ID列表
		 */		
		drawChallengeTaskIds:Array<number>;
		
		/**
		 * 玩家完成的挑战任务ID列表
		 */		
		finishTaskIds:Array<number>;
		
		/**
		 * 联盟科技信息列表
		 */		
		leagueTechVos:Array<LeagueTechVo>;
		
		/**
		 * 联盟BOSS历史最高伤害,退出联盟后清空
		 */		
		bossMaxHurtMap:Object;
		
		/**
		 * 联盟周常任务信息
		 */		
		weeklyTaskInfo:Vo.task.TaskInfoVo;
		
		/**
		 * 联盟赠礼MAP,LeagueGiftItemVo.id-LeagueGiftItemVo
		 */		
		giftMap:Object;
		
		/**
		 * 本周周常任务已领取联盟币
		 */		
		weeklyDrawLeagueGoldAmount:number;
		
		/**
		 * 今日联盟赠礼领取的钻石数量
		 */		
		todayGiftDrawDiamondAmount:number;
		
		/**
		 * 是否已领取上周宝箱
		 */		
		drawLastWeekLeagueBox:boolean;
		
		/**
		 * 最后一次砍价时间
		 */		
		lastBargainTime:number;
		
		/**
		 * 最后一次购买砍价礼包时间,用于判断是否可以购买砍价礼包
		 */		
		lastBuyBargainGiftTime:number;
		
		/**
		 * 砍价CD时间限制,当前时间小于此时间则无法参与砍价
		 */		
		bargainLimitTime:number;
		
	}


	
	/**
	 * 加载砍价玩家信息
	 * @author GameCreator
	 */	
	class LoadBargainMemberInfoS2C	{
		content:Array<Vo.league.LeagueBargainMemberVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟成员信息Vo
	 * @author GameCreator
	 */	
	class LeagueMemberVo	{
		/**
		 * 玩家ID
		 */		
		id:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 头像
		 */		
		headIcon:number;
		
		/**
		 * 头像框
		 */		
		headFrame:number;
		
		/**
		 * 形象ID
		 */		
		imageId:number;
		
		/**
		 * 称号
		 */		
		title:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 战斗力
		 */		
		fight:number;
		
		/**
		 * 联盟职位,LeagueJobType
		 */		
		jobType:number;
		
		/**
		 * 活跃度
		 */		
		active:number;
		
		/**
		 * 最后离线时间,<=0则表示在线
		 */		
		offlineTime:number;
		
	}


	
	/**
	 * 移除成员
	 * @author GameCreator
	 */	
	class RemoveMemberC2S	{
		/**
		 * 移除的成员ID
		 */		
		memberId:number;
		
	}


	
	/**
	 * 移除成员
	 * @author GameCreator
	 */	
	class RemoveMemberS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 根据id查找联盟
	 * @author GameCreator
	 */	
	class SearchLeagueByIdC2S	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
	}


	
	/**
	 * 根据id查找联盟
	 * @author GameCreator
	 */	
	class SearchLeagueByIdS2C	{
		content:Vo.league.LeagueBriefVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 修改联盟旗帜
	 * @author GameCreator
	 */	
	class ChangeLeagueBannerC2S	{
		/**
		 * 新图案ID
		 */		
		icon:number;
		
		/**
		 * 新旗帜ID
		 */		
		banner:number;
		
	}


	
	/**
	 * 修改联盟旗帜
	 * @author GameCreator
	 */	
	class ChangeLeagueBannerS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟旗帜变更信息vo
	 * @author GameCreator
	 */	
	class LeagueBannerChangeVo	{
		/**
		 * 图案ID
		 */		
		icon:number;
		
		/**
		 * 旗帜ID
		 */		
		banner:number;
		
		/**
		 * 最后修改联盟旗帜的时间
		 */		
		lastChangeIconTime:number;
		
	}


	
	/**
	 * 查看联盟信息
	 * @author GameCreator
	 */	
	class ViewLeagueInfoC2S	{
		/**
		 * 联盟ID
		 */		
		leagueId:number;
		
	}


	
	/**
	 * 查看联盟信息
	 * @author GameCreator
	 */	
	class ViewLeagueInfoS2C	{
		content:Vo.league.LeagueViewVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 挑战联盟BOSS
	 * @author GameCreator
	 */	
	class ChallengeLeagueBossS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 联盟申请信息vo
	 * @author GameCreator
	 */	
	class LeagueApplyVo	{
		/**
		 * 玩家ID
		 */		
		id:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 头像
		 */		
		headIcon:number;
		
		/**
		 * 头像框
		 */		
		headFrame:number;
		
		/**
		 * 形象ID
		 */		
		imageId:number;
		
		/**
		 * 称号
		 */		
		title:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 战斗力
		 */		
		fight:number;
		
		/**
		 * 最后离线时间,<=0则表示在线
		 */		
		offlineTime:number;
		
	}


	
	/**
	 * 联盟砍价礼包更新信息vo
	 * @author GameCreator
	 */	
	class LeagueBargainGiftUpdateVo	{
		/**
		 * 成员ID
		 */		
		memberId:number;
		
		/**
		 * 成员砍价折扣(万分比)
		 */		
		bargainDiscount:number;
		
	}


	
	/**
	 * 挑战联盟BOSS
	 * @author GameCreator
	 */	
	class ChallengeLeagueBossC2S	{
		/**
		 * 联盟BOSS配置ID
		 */		
		bossConfigId:number;
		
	}


}
