declare module table.guardship{
	class GuardShipConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class GuardShipInstanceConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *关卡名
		 */
		public name:string;
		/**
		 *前置关卡Id
		 */
		public preInstanceId:number;
		/**
		 *战斗配置Id
		 */
		public battleConfigId:number;
		/**
		 *波次Id列表，从小到大
		 */
		public roundIds:Array<any>;
		/**
		 *首通奖励
		 */
		public firstRewards:Array<{k:any,v:any}>;
		/**
		 *扫荡奖励
		 */
		public sweepRewards:Array<{k:any,v:any}>;
		/**
		 *开放条件
		 */
		public openConditions:Array<any>;
	}
	class GuardShipLevelConfig {
		/**
		 *唯一Id，等级，从1开始
		 */
		public id:number;
		/**
		 *需要经验
		 */
		public minExp:number;
		/**
		 *品质权重
		 */
		public qualityWeight:Array<{k:any,v:any}>;
	}
	class GuardShipRankConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *最低排名
		 */
		public minRank:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class GuardShipRefreshConfig {
		/**
		 *唯一Id，第X次，从1开始
		 */
		public id:number;
		/**
		 *刷新消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class GuardShipRoundConfig {
		/**
		 *波次id
		 */
		public id:number;
		/**
		 *类型，参考"类型说明.md"文件c
		 */
		public roundType:string;
		/**
		 *怪物资源ids
		 */
		public monsterResourceIds:Array<any>;
		/**
		 *攻击修正
		 */
		public atkMod:number;
		/**
		 *防御修正
		 */
		public defMod:number;
		/**
		 *生命修正
		 */
		public hpMod:number;
		/**
		 *出现延迟时间(秒)
		 */
		public delayTime:number;
	}
	class GuardShipSkillConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *效果类型
		 */
		public effect:any;
		/**
		 *效果触发参数
		 */
		public effectTrigger:any;
		/**
		 *生效对象
		 */
		public targetParam:Array<any>;
		/**
		 *最大可选次数(0代表不限制)
		 */
		public limit:number;
		/**
		 *所属随机池类型(职业)
		 */
		public poolType:string;
		/**
		 *所属随机池id(品质)
		 */
		public poolValue:number;
		/**
		 *出现权重
		 */
		public weight:number;
		/**
		 *品质(展示用)
		 */
		public quality:number;
		/**
		 *buff名
		 */
		public name:string;
		/**
		 *buff图标
		 */
		public icon:string;
		/**
		 *buff描述
		 */
		public desc:string;
	}
	class GuardShipUseItemConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *buff组
		 */
		public buffGroup:string;
		/**
		 *作用数量
		 */
		public num:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *目标筛选类型(同行为表)
		 */
		public targetType:number;
		/**
		 *目标筛选参数
		 */
		public targetParam:any;
		/**
		 *掉落概率(万分比)
		 */
		public dropRate:number;
	}
}
