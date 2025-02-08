declare module table.dailyboss{
	class DailyBossBuyChallengeTimesConfig {
		/**
		 *第几次
		 */
		public id:number;
		/**
		 *购买消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class DailyBossConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *BOSS类型
		 */
		public bossType:number;
		/**
		 *BOSS难度
		 */
		public difficulty:number;
		/**
		 *挑战次数
		 */
		public challengeTimes:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *战斗弹出的BOSS名字
		 */
		public bossNameForPopUp:string;
	}
	class DailyBossConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class DailyBossDifficultyConfig {
		/**
		 *难度
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *解锁新难度名字
		 */
		public unlockName:string;
		/**
		 *主界面背景图标
		 */
		public bgAssetPath:string;
		/**
		 *主界面的难度小logo图标+排行榜用
		 */
		public logoAssetPath:string;
	}
	class DailyBossHpColorConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *颜色
		 */
		public colorStr:string;
	}
	class DailyBossProgressConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *难度
		 */
		public hardId:number;
		/**
		 *进度类型
		 */
		public progressType:string;
		/**
		 *开始的进度值，前端渲染进度用
		 */
		public progressStart:number;
		/**
		 *需要达到的进度，万分比
		 */
		public progressEnd:number;
		/**
		 *进度奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class DailyBossRankConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *最高排名
		 */
		public minRank:number;
		/**
		 *最低排名
		 */
		public maxRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class DailyBossTabConfig {
		/**
		 *唯一标识
		 */
		public id:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标
		 */
		public iconPath:string;
		/**
		 *跳转id
		 */
		public jumpId:number;
	}
	class DailyBossThemeConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *轮换的每日BOSS类型
		 */
		public bossType:number;
		/**
		 *模型id
		 */
		public spineModelId:number;
		/**
		 *Boss名称
		 */
		public name:string;
		/**
		 *英雄阵容标签描述
		 */
		public heroTagDesc:string;
		/**
		 *热门英雄
		 */
		public hotHeroIds:Array<any>;
		/**
		 *基础阵容
		 */
		public baseHeros:Array<any>;
		/**
		 *推荐阵容
		 */
		public advancedHeros:Array<any>;
	}
}
