declare module table.seasonactivity.Constant{
	class SeasonActivityConfig {
		/**
		 *赛季活动Id
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *开放条件
		 */
		public openConditions:Array<any>;
	}
	class SeasonActivityConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class SeasonClientEnterConfig {
		/**
		 *赛季赛程入口id
		 */
		public id:string;
		/**
		 *赛季赛程名称
		 */
		public name:string;
		/**
		 *赛季赛程相关描述
		 */
		public des:string;
		/**
		 *奖励展示
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *背景图
		 */
		public bgIcon:string;
	}
	class SubSeasonActivityConfig {
		/**
		 *赛季子活动Id
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *赛季子活动类型，参考"类型说明.md"的SubSeasonActivityType
		 */
		public type:string;
		/**
		 *开放条件
		 */
		public openConditions:Array<any>;
		/**
		 *所属赛季活动Id，即SeasonActivityConfig的Id
		 */
		public activityId:number;
		/**
		 *入口类型
		 */
		public enterType:string;
		/**
		 *对应排行榜活动id
		 */
		public rankId:number;
		/**
		 *主界面入口图标
		 */
		public pathIcon:string;
		/**
		 *页签图标
		 */
		public pageIcon:string;
		/**
		 *页签选中图标
		 */
		public pageIconSel:string;
		/**
		 *对应排行榜页签图标
		 */
		public pageRankIcon:string;
		/**
		 *对应排行榜页签选中图标
		 */
		public pageRankIconSel:string;
	}
}
declare module table.seasonactivity.SeasonBoss{
	class SeasonBossConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		public name:string;
		/**
		 *战斗配置Id，即BattleConfig的Id
		 */
		public battleConfigId:number;
		/**
		 *每日挑战次数
		 */
		public dailyChallengeTimes:number;
		/**
		 *挑战奖励
		 */
		public challengeRewards:Array<{k:any,v:any}>;
		/**
		 *赛季子活动Id，即SubSeasonActivityConfig的Id
		 */
		public subActivityId:number;
		/**
		 *模型id
		 */
		public spineModelId:number;
	}
	class SeasonBossProgressRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *血条序号
		 */
		public lifeBarNo:number;
		/**
		 *血条血量
		 */
		public lifeBarHp:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *Boss配置Id，即SeasonBossConfig的Id
		 */
		public bossConfigId:number;
	}
}
declare module table.seasonactivity.SeasonRushRank{
	class SeasonRushRankConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *赛季冲榜类型，参考"类型说明.md"文件的SeasonRushRankType
		 */
		public type:string;
		/**
		 *上榜条件限制列表
		 */
		public limits:Array<any>;
		/**
		 *结算时间列表，距子活动开始后X小时结算
		 */
		public roundSettleHours:number;
		/**
		 *积分道具Id
		 */
		public scoreItemId:number;
		/**
		 *子活动Id，即SubSeasonActivityConfig的Id
		 */
		public subActivityId:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *描述
		 */
		public des:string;
	}
	class SeasonRushRankRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *最高排名
		 */
		public maxRank:number;
		/**
		 *最低排名
		 */
		public minRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *积分奖励，结算时直接发给玩家，不通过邮件
		 */
		public scoreRewards:Array<{k:any,v:any}>;
		/**
		 *所属冲榜Id，即SeasonRushRankConfig的Id
		 */
		public rushRankId:number;
	}
}
declare module table.seasonactivity.SeasonSecret{
	class SeasonSecretConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *层数，从1开始
		 */
		public floor:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *共鸣等级要求
		 */
		public level:number;
		/**
		 *地图随机池，即SeasonSecretFloorConfig的Id
		 */
		public floorConfigIds:Array<any>;
		/**
		 *召唤BOSS所需积分
		 */
		public summonBossNeedScore:number;
		/**
		 *随机房间数量(每一层房间的数量)，格式：[3,4,5]
		 */
		public randomRoomCounts:Array<any>;
		/**
		 *战斗配置ID,对应BattleConfig的id,仅配置BOSS怪物
		 */
		public battleConfigId:number;
		/**
		 *首通奖励
		 */
		public firstRewards:Array<{k:any,v:any}>;
		/**
		 *积分Id，需为积分类型
		 */
		public scoreItemId:number;
		/**
		 *赛季子活动Id，即SubSeasonActivityConfig的Id
		 */
		public subActivityId:number;
	}
	class SeasonSecretFloorConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *房间Id列表，即SeasonSecretRoomConfig的Id
		 */
		public roomIds:Array<any>;
		/**
		 *楼层初始/结束房间Id，，即SeasonSecretRoomConfig的Id，格式：[1001,1010]
		 */
		public startEndRoomConfigIds:Array<any>;
	}
	class SeasonSecretRoomConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *地图id(MapidConfig.id)
		 */
		public mapId:number;
		/**
		 *房间怪物配置Id列表，即MonsterResourceConfig的Id
		 */
		public monsterResourceIds:Array<any>;
	}
}
declare module table.seasonactivity.SignUp{
	class SignUpConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *子活动第X天开放
		 */
		public openDay:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *子活动Id，即SubSeasonActivityConfig的Id
		 */
		public subActivityId:number;
	}
}
declare module table.seasonactivity.Task{
	class SeasonActivityTaskConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *任务类型
		 */
		public type:string;
		/**
		 *接取任务限制
		 */
		public verifyModels:Array<{k:any,v:any}>;
		/**
		 *初始化任务体内容
		 */
		public content:Array<any>;
		/**
		 *总进度
		 */
		public totalProgress:number;
		/**
		 *任务目标文本
		 */
		public desc:string;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *赛季子活动Id，即SubSeasonActivityConfig的Id
		 */
		public subActivityId:number;
		/**
		 *前端任务分类
		 */
		public taskType:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
	}
}
