declare module table.trunkinstance{
	class TrunkInstanceConfig {
		/**
		 *关卡id
		 */
		public id:number;
		/**
		 *前置关卡ID
		 */
		public parentLevelId:number;
		/**
		 *对外显示的关卡id
		 */
		public showLevelId:number;
		/**
		 *打完后是否不显示下一关
		 */
		public isNotShowNextLevel:boolean;
		/**
		 *关卡所需战斗力
		 */
		public power:number;
		/**
		 *战斗配置id
@BattleConfig.id
		 */
		public battleConfigId:number;
		/**
		 *战斗时长(秒)
		 */
		public fightMaxSecond:number;
		/**
		 *关卡奖励
有就需要显示【对话框】
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *每小时金币物品奖励数量
		 */
		public goldCountPerHour:number;
		/**
		 *每小时经验物品奖励数量
		 */
		public expPerHour:number;
		/**
		 *多少秒获得一个升级材料，特殊的计时
		 */
		public secondPerLvUpItem:number;
		/**
		 *魔方奖励间隔时间(秒),奖励物品读常量表-挂机关卡X秒间隔魔方奖励物品ID
		 */
		public magicIntervalSecond:number;
		/**
		 *掉落装备等级
		 */
		public dropEquipLv:number;
		/**
		 *掉落装备的品质
		 */
		public dropEquipQualtiy:number;
		/**
		 *装备掉落ID
		 */
		public equipDropId:number;
		/**
		 *装备掉落间隔(秒)
		 */
		public dropEquipIntervalSecond:number;
		/**
		 *假战斗ID
		 */
		public smallBattleId:number;
		/**
		 *关卡标题
		 */
		public title:string;
	}
	class TrunkInstanceConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class TrunkInstanceFastHangUpConfig {
		/**
		 *快速挂机第X次
		 */
		public id:number;
		/**
		 *快速挂机时间(秒)
		 */
		public speedUpTimeSecond:number;
		/**
		 *快速挂机消耗
		 */
		public costItems:Array<{k:any,v:any}>;
	}
	class TrunkInstanceSmallBattleConfig {
		public id:number;
		/**
		 *英雄1
		 */
		public heros1:any;
		/**
		 *英雄2
		 */
		public heros2:any;
		/**
		 *英雄3
		 */
		public heros3:any;
		/**
		 *英雄坐标
		 */
		public heroPos:any;
		/**
		 *怪物1
		 */
		public monster1:Array<any>;
		/**
		 *怪物2
		 */
		public monster2:Array<any>;
		/**
		 *怪物3
		 */
		public monster3:Array<any>;
		/**
		 *怪物坐标
		 */
		public monsterPos:any;
	}
}
