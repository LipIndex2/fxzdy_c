declare module table.teaminstance{
	class TeamInstanceChapterConfig {
		/**
		 *章节ID
		 */
		public id:number;
		/**
		 *章节解锁条件
		 */
		public unlockVerifies:Array<any>;
		/**
		 *组队副本关卡配置ID
		 */
		public teamInstanceConfigIds:Array<any>;
		/**
		 *章节奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *图标资源路径
		 */
		public iconPath:string;
		/**
		 *章节名
		 */
		public chapterName:string;
	}
	class TeamInstanceConfig {
		/**
		 *副本ID
		 */
		public id:number;
		/**
		 *上一个副本ID
		 */
		public preInstanceId:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *首次通关奖励
		 */
		public firstRewards:Array<{k:any,v:any}>;
		/**
		 *创建队伍时默认战力
		 */
		public power:number;
		/**
		 *战力选择列表
		 */
		public powerList:Array<any>;
		/**
		 *等待5s后队伍没有满员时，是否使用机器人填充
		 */
		public haveRobot:boolean;
		/**
		 *过关动画展示模型
		 */
		public showModelId:number;
	}
	class TeamInstanceConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class TeamInstanceRobotConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *英雄ID列表
		 */
		public heroIdArray:Array<any>;
		/**
		 *机器人英雄等级列表
		 */
		public robotHeroLevels:Array<any>;
		/**
		 *机器人英雄星级列表
		 */
		public robotHeroStars:Array<any>;
		/**
		 *机器人普通天赋等级，解锁全部【天赋解锁等级】小于等于该等级的天赋
		 */
		public robotNormalTalentLevel:number;
		/**
		 *机器人高级天赋等级，解锁全部【天赋解锁等级】小于等于该等级的天赋
		 */
		public robotSpecialTalentLevel:number;
		/**
		 *机器人装备Id列表
		 */
		public robotEquipIds:Array<any>;
		/**
		 *机器人战队科技Id
		 */
		public robotCaptainId:number;
		/**
		 *机器人战队科技等级列表，-1表示未解锁
		 */
		public robotCaptainLevels:Array<any>;
	}
}
