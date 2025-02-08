declare module Vo.player{
	
	/**
	 * 试炼挑战结果
	 * @author GameCreator
	 */	
	class TrialChallengeVo	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 试炼的配置ID
		 */		
		trialId:number;
		
	}


	
	/**
	 * 体力信息
	 * @author GameCreator
	 */	
	class VitalityVo	{
		/**
		 * 当前体力
		 */		
		vitality:number;
		
		/**
		 * 最后恢复时间
		 */		
		lastRecoveryTime:number;
		
	}


	/**
	 * 性别
	 * @author GameCreator
	 */	
	enum Sex
	{
		/**
		 * 男性
		 */		
		MALE = 0,
		/**
		 * 女性
		 */		
		FEMALE = 1
	}


	
	/**
	 * 玩家简易信息
	 * @author GameCreator
	 */	
	class PlayerWithServerVo	{
		/**
		 * 基础信息
		 */		
		baseVo:Vo.player.PlayerBaseVo;
		
		/**
		 * 离线时间，<=0说明当前在线
		 */		
		logoutTime:number;
		
		/**
		 * 所在服务器名称
		 */		
		serverName:string;
		
	}


	
	/**
	 * 请求玩家服务端信息
	 * @author GameCreator
	 */	
	class LoadPlayerServerInfoS2C	{
		content:Vo.player.PlayerServerInfo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家在线信息
	 * @author GameCreator
	 */	
	class PlayerOnlineVo	{
		/**
		 * 玩家ID
		 */		
		playerId:number;
		
		/**
		 * 登录时间
		 */		
		loginTime:number;
		
		/**
		 * 下线时间
		 */		
		logoutTime:number;
		
	}


	
	/**
	 * 获取玩法当前状态信息
	 * @author GameCreator
	 */	
	class GetSchedulePlayStageInfoS2C	{
		content:Array<Vo.common.SchedulePlayInfoVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 更新玩家新手引导信息
	 * @author GameCreator
	 */	
	class UpdateGuideC2S	{
		/**
		 * 引导组ID
		 */		
		group:number;
		
		/**
		 * 引导组步骤信息
		 */		
		step:number;
		
	}


	
	/**
	 * 更新玩家新手引导信息
	 * @author GameCreator
	 */	
	class UpdateGuideS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 广告记录
	 * @author GameCreator
	 */	
	class AdvertRecordS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 广告记录
	 * @author GameCreator
	 */	
	class AdvertRecordC2S	{
		/**
		 * 广告类型
		 */		
		advertType:number;
		
		/**
		 * 广告行为,1-开始,2-关闭,3-完成
		 */		
		action:number;
		
	}


	
	/**
	 * 更新玩家系统开放信息
	 * @author GameCreator
	 */	
	class UpdateSysOpenC2S	{
		/**
		 * 系统类型
		 */		
		sysType:number;
		
		/**
		 * 系统信息
		 */		
		sysValue:number;
		
	}


	
	/**
	 * 更新玩家系统开放信息
	 * @author GameCreator
	 */	
	class UpdateSysOpenS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 开始试炼
	 * @author GameCreator
	 */	
	class ChallengeTrialC2S	{
		trialId:number;
		
	}


	
	/**
	 * 玩家头像信息
	 * @author GameCreator
	 */	
	class PlayerHeadVo	{
		playerId:number;
		
		headIcon:number;
		
		headFrame:number;
		
		name:string;
		
		title:number;
		
	}


	
	/**
	 * 玩家服务端信息
	 * @author GameCreator
	 */	
	class PlayerServerInfo	{
		/**
		 * 服务端玩家战力
		 */		
		playerFight:number;
		
	}


	
	/**
	 * 
	 * @author GameCreator
	 */	
	class PlayerVo	{
		/**
		 * 主键
		 */		
		id:number;
		
		/**
		 * 玩家姓名
		 */		
		name:string;
		
		/**
		 * 共鸣等級
		 */		
		level:number;
		
		/**
		 * 战力
		 */		
		fight:number;
		
		/**
		 * 是否禁言true：禁言，false：正常
		 */		
		block:boolean;
		
		/**
		 * 创建时间
		 */		
		createDate:number;
		
		/**
		 * 新手引导信息
		 */		
		guideMap:Object;
		
		/**
		 * 系统开放信息
		 */		
		sysOpenMap:Object;
		
		/**
		 * 玩家渠道
		 */		
		channel:number;
		
	}


	
	/**
	 * 查看玩家个人信息
	 * @author GameCreator
	 */	
	class VisitPlayerPersonInfoC2S	{
		targetId:number;
		
	}


	
	/**
	 * 查看玩家个人信息
	 * @author GameCreator
	 */	
	class VisitPlayerPersonInfoS2C	{
		content:Vo.player.PlayerPersonInfoVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩家体力、新手引导信息
	 * @author GameCreator
	 */	
	class PlayerVitalityGuideVo	{
		/**
		 * 体力信息
		 */		
		vitalityVo:VitalityVo;
		
		/**
		 * 新手引导信息
		 */		
		guideMap:Object;
		
	}


	
	/**
	 * 玩家个人信息Vo
	 * @author GameCreator
	 */	
	class PlayerPersonInfoVo	{
		/**
		 * 玩家基础信息
		 */		
		playerBaseVo:PlayerBaseVo;
		
		/**
		 * 通关最高主线关卡ID,对应TrunkInstanceConfig的id
		 */		
		trunkInstanceId:number;
		
		/**
		 * 阵容预览信息
		 */		
		formationVisitVo:Vo.formation.FormationVisitVo;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
		/**
		 * 服务器ID
		 */		
		serverId:string;
		
	}


	
	/**
	 * 查询玩家是否在线
	 * @author GameCreator
	 */	
	class SelectOnlineC2S	{
		playerIds:Array<number>;
		
	}


	
	/**
	 * 查询玩家是否在线
	 * @author GameCreator
	 */	
	class SelectOnlineS2C	{
		content:Array<Vo.player.PlayerOnlineVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	/**
	 * 品质<br/> 黑>白>绿>蓝>紫>橙>红>金>黄
	 * @author GameCreator
	 */	
	enum Quality
	{
		/**
		 * 黑
		 */		
		BLACK = 0,
		/**
		 * 白
		 */		
		WHITE = 1,
		/**
		 * 绿
		 */		
		GREEN = 2,
		/**
		 * 蓝
		 */		
		BLUE = 3,
		/**
		 * 紫
		 */		
		PURPLE = 4,
		/**
		 * 橙
		 */		
		ORANGE = 5,
		/**
		 * 红
		 */		
		RED = 6,
		/**
		 * 金
		 */		
		GOLD = 7,
		/**
		 * 黄
		 */		
		YELLOW = 8
	}


	
	/**
	 * 当前信息
	 * @author GameCreator
	 */	
	class CurrentInfo	{
		/**
		 * 当前经验
		 */		
		exp:number;
		
		/**
		 * 旧等级
		 */		
		oldLevel:number;
		
		/**
		 * 当前等级
		 */		
		level:number;
		
	}


	
	/**
	 * 玩家基础信息
	 * @author GameCreator
	 */	
	class PlayerBaseVo	{
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
		 * 联盟ID
		 */		
		leagueId:number;
		
		/**
		 * 联盟名称
		 */		
		leagueName:string;
		
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
		
	}


	
	/**
	 * 查看玩家事件进度
	 * @author GameCreator
	 */	
	class PlayerEventProgressVisitVo	{
		/**
		 * 主线进度
		 */		
		trunkId:number;
		
		/**
		 * 累计登录天数
		 */		
		totalLoginDay:number;
		
		/**
		 * 无尽黑渊普通关卡通关,小于等于0则没有通关过
		 */		
		heiYuanNormalMaxPass:number;
		
		/**
		 * 万域斗法段位配置ID,没有段位则为-1,未解锁为-2
		 */		
		zoneArenaRankConfigId:number;
		
		/**
		 * 竞技场排名,没有则为-1
		 */		
		arenaRank:number;
		
	}


	
	/**
	 * 开始试炼
	 * @author GameCreator
	 */	
	class ChallengeTrialS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
