declare module table.league{
	class LeagueBannerConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *旗帜路径
		 */
		public path:string;
	}
	class LeagueBargainGiftConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *组ID
		 */
		public groupId:number;
		/**
		 *初始价格(星钻)
		 */
		public initPrice:number;
		/**
		 *礼包奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class LeagueBargainMessageConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *开始比例
		 */
		public startRate:number;
		/**
		 *结束比例
		 */
		public endRate:number;
		/**
		 *文本
		 */
		public message:string;
	}
	class LeagueBargainOpenConfig {
		/**
		 *分组ID
		 */
		public id:number;
		/**
		 *开启时间Cron表达式
		 */
		public openCron:string;
		/**
		 *持续时间(分钟)
		 */
		public continueMinutes:number;
	}
	class LeagueBargainRangeConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *折扣区间(万分比),格式: [10000,9000]
		 */
		public discountRangeArray:Array<any>;
		/**
		 *砍价折扣区间(万分比),新价格=当前价格-初始价格*砍价万分比,格式:[0,1000]
		 */
		public bargainRangeArray:Array<any>;
	}
	class LeagueBossConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *BOSS阶段
		 */
		public stage:number;
		/**
		 *英雄职业
		 */
		public career:string;
		/**
		 *技能ID
		 */
		public skillId:string;
		/**
		 *挑战奖励
		 */
		public challengeRewards:Array<{k:any,v:any}>;
		/**
		 *战斗时血条数量
		 */
		public hpBarCount:number;
	}
	class LeagueBossRankRewardConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *BOSS配置ID
		 */
		public bossConfigId:number;
		/**
		 *最低排名
		 */
		public minRank:number;
		/**
		 *最高排名
		 */
		public maxRank:number;
		/**
		 *排名奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class LeagueBoxLevelConfig {
		/**
		 *等级
		 */
		public id:number;
		/**
		 *累计宝箱进度
		 */
		public progress:number;
		/**
		 *宝箱奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *图标路径
		 */
		public iconPath:string;
		/**
		 *礼物名字
		 */
		public boxName:string;
	}
	class LeagueChallengeTaskConfig {
		/**
		 *任务ID
		 */
		public id:number;
		/**
		 *任务事件类型
		 */
		public eventType:string;
		/**
		 *接取条件
		 */
		public conditions:Array<any>;
		/**
		 *进度
		 */
		public totalProgress:number;
		/**
		 *要求完成的成员数量
		 */
		public needMemberCount:number;
		/**
		 *联盟成员任务奖励
		 */
		public memberRewards:Array<any>;
		/**
		 *【前端】任务内容描述
		 */
		public taskContent:string;
	}
	class LeagueConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class LeagueGameModeConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *归属模块id
@PlayerSystemOpenConfig.id
		 */
		public moduleId:string;
		/**
		 *标题
		 */
		public title:string;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *背景图资源路径
		 */
		public iconPath:string;
	}
	class LeagueGiftConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *钻石奖励数量
		 */
		public diamondAmount:number;
		/**
		 *增加联盟宝箱进度
		 */
		public addLeagueBoxProgress:number;
		/**
		 *图标路径
		 */
		public iconPath:string;
		/**
		 *礼物名字
		 */
		public giftName:string;
	}
	class LeagueIconConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *图标路径
		 */
		public path:string;
	}
	class LeagueInviteTimesConfig {
		/**
		 *唯一Id，第X次，从1开始
		 */
		public id:number;
		/**
		 *邀请消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class LeagueLevelConfig {
		/**
		 *联盟等级
		 */
		public id:number;
		/**
		 *升到当前等级所需经验
		 */
		public exp:number;
		/**
		 *成员数量上限
		 */
		public memberCount:number;
		/**
		 *每日活跃上限
		 */
		public dailyActiveLimit:number;
	}
	class LeaguePermissionConfig {
		/**
		 *权限类型
		 */
		public id:string;
		/**
		 *持有该权限的职位类型,格式:["权限枚举类型","权限枚举类型","权限枚举类型"]
		 */
		public jobTypes:Array<any>;
	}
	class LeagueTechConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *英雄职业
		 */
		public career:string;
		/**
		 *槽位ID
		 */
		public slotId:number;
		/**
		 *等级
		 */
		public level:number;
		/**
		 *属性加成
		 */
		public attrs:Array<{k:any,v:any}>;
		/**
		 *升级消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *技能名字
		 */
		public skillName:string;
	}
	class LeagueWeeklyTaskConfig {
		/**
		 *任务ID
		 */
		public id:number;
		/**
		 *玩家接取条件
		 */
		public verifyModels:string;
		/**
		 *任务事件类型
		 */
		public eventType:string;
		/**
		 *任务事件类型参数
		 */
		public content:string;
		/**
		 *任务进度
		 */
		public totalProgress:number;
		/**
		 *任务奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *增加联盟宝箱进度
		 */
		public addLeagueBoxProgress:number;
		/**
		 *前端展示
		 */
		public dec:string;
		/**
		 *任务挑战跳转功能id
		 */
		public jumpId:number;
		/**
		 *任务分组
		 */
		public groupId:number;
		/**
		 *每组任务排序(值越小 展示优先级越高)
		 */
		public groupSort:number;
	}
}
