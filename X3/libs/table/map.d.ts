declare module table.map{
	class BuildingActionConfig {
		public id:number;
		/**
		 *未解锁常驻
		 */
		public lock:string;
		/**
		 *未解锁常驻播放速度
		 */
		public lock_speed:number;
		/**
		 *解锁过渡
		 */
		public unlocking:string;
		/**
		 *解锁过渡播放速度
		 */
		public unlocking_speed:number;
		/**
		 *已解锁常驻
		 */
		public unlocked:string;
		/**
		 *已解锁常驻播放速度
		 */
		public unlocked_speed:number;
		/**
		 *使用中
		 */
		public using:string;
		/**
		 *使用中播放速度
		 */
		public using_speed:number;
		/**
		 *激活过渡（靠近）
		 */
		public activing:string;
		/**
		 *激活过渡（靠近）播放速度
		 */
		public activing_speed:number;
		/**
		 *激活
		 */
		public actived:string;
		/**
		 *激活播放速度
		 */
		public actived_speed:number;
		/**
		 *不激活过渡
		 */
		public unactiving:string;
		/**
		 *不激活过渡播放速度
		 */
		public unactiving_speed:number;
	}
	class BuildingGateConfig {
		/**
		 *门的id
		 */
		public id:number;
		/**
		 *建筑Spine
		 */
		public building_spine:string;
		/**
		 *解锁时镜头聚焦时间毫秒（不填或0不聚焦）
		 */
		public unlockingFocusTime:number;
		/**
		 *是否是平面（永远在角色下层）
		 */
		public isPlane:boolean;
		/**
		 *未解锁常驻
		 */
		public lock:string;
		/**
		 *解锁过渡
		 */
		public unlocking:string;
		/**
		 *已解锁常驻
		 */
		public unlocked:string;
		/**
		 *解锁音效
		 */
		public sound:any;
		/**
		 *建筑模型
		 */
		public building_model:number;
	}
	class ChapterConfig {
		/**
		 *章节ID
		 */
		public id:number;
		/**
		 *名称
		 */
		public chapter_name:string;
		/**
		 *判断章节是否解锁的建筑ID
		 */
		public building_id:number;
		/**
		 *所属星球ID
		 */
		public starId:number;
		/**
		 *区域id
		 */
		public area_id:Array<any>;
		/**
		 *完成地图章节任务增加的星球资源上限
		 */
		public resourceLimitAdditionRewards:Array<{k:any,v:any}>;
	}
	class demo_monsterConfig {
		public id:number;
		/**
		 *地图id
		 */
		public mapid:number;
		/**
		 *坐标
		 */
		public coordinate:Array<any>;
		/**
		 *怪物
		 */
		public monster:Array<any>;
	}
	class InstanceHelpConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *英雄配置ID
		 */
		public heroBaseId:number;
		/**
		 *模型id
		 */
		public modelId:number;
	}
	class MapBuildingConfig {
		/**
		 *建筑ID
		 */
		public id:number;
		/**
		 *地图ID
		 */
		public map_id:number;
		/**
		 *地图区域
		 */
		public area_id:number;
		/**
		 *区域名称
		 */
		public maparea_name:string;
		/**
		 *显示建筑条件（默认显示）
		 */
		public showVerify:Array<any>;
		/**
		 *开启条件
		 */
		public openVerify:Array<any>;
		/**
		 *默认开放,检查开启条件且不解锁关联建筑,不记录进玩家解锁建筑数据
		 */
		public autoOpen:boolean;
		/**
		 *交互按钮显示条件
		 */
		public btnOpenVerify:Array<any>;
		/**
		 *交互按钮隐藏条件
		 */
		public btnCloseVerify:Array<any>;
		/**
		 *解锁条件框显示条件
		 */
		public unlockOpenVerify:Array<any>;
		/**
		 *解锁条件框隐藏条件
		 */
		public unlockCloseVerify:Array<any>;
		/**
		 *建筑类型
		 */
		public building_type:string;
		/**
		 *传送点落脚点位置
		 */
		public transferPos:Array<any>;
		/**
		 *解锁框偏移
		 */
		public uiPos:Array<any>;
		/**
		 *建筑名称偏移
		 */
		public namePos:Array<any>;
		/**
		 *引导↓箭头的偏移位置
[x,y]
		 */
		public guideOffsetPos:Array<any>;
		/**
		 *迷雾区域
		 */
		public area_name:string;
		/**
		 *小地图显示条件
		 */
		public showInMapVerify:number;
		/**
		 *解锁后是否消失
		 */
		public disappear:boolean;
		/**
		 *消耗的材料
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *建筑名称
		 */
		public name:string;
		/**
		 *未解锁功能名称
		 */
		public unlockName:string;
		/**
		 *功能名称
		 */
		public funcName:string;
		/**
		 *解锁飘字文本
		 */
		public unlockTips:string;
		/**
		 *解锁时镜头聚焦时间毫秒（不填或0不聚焦）
		 */
		public unlockingFocusTime:number;
		/**
		 *未解锁功能图标
		 */
		public unlockIcon:string;
		/**
		 *功能图标
		 */
		public funcIcon:string;
		/**
		 *跳转Id table.jump.JumpConfig.id
		 */
		public funcJumpId:number;
		/**
		 *跳转Id table.jump.JumpConfig.id
		 */
		public unlockJumpId:number;
		/**
		 *激活半径
		 */
		public radius:number;
		/**
		 *建筑Spine
		 */
		public building_spine:string;
		/**
		 *建筑偏移
		 */
		public building_spinePos:Array<any>;
		/**
		 *建筑立绘
		 */
		public building_collection:string;
		/**
		 *归属模块enum
关联 PlayerSystemOpenConfig
		 */
		public moduleName:string;
		/**
		 *红点偏移位置
默认 [0,0]
		 */
		public redDotOffsetPos:Array<any>;
		/**
		 *建筑模型
		 */
		public building_model:number;
		/**
		 *建筑等级(有等级需要在小地图显示)
		 */
		public lv:number;
		/**
		 *建筑辐射范围大小(前两个为地图宽高 后两位为小地图宽高)
		 */
		public rangeSize:Array<any>;
	}
	class MapBuildingTaskConfig {
		/**
		 *任务Id
		 */
		public id:number;
		/**
		 *任务事件
		 */
		public eventType:string;
		/**
		 *任务目标文本
		 */
		public desc:string;
		/**
		 *任务参数内容
		 */
		public content:string;
		/**
		 *任务进度
		 */
		public totalProgress:number;
	}
	class MapConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class MapGhostConfig {
		/**
		 *后台地图id
		 */
		public id:number;
		/**
		 *地图id
		 */
		public mapId:number;
		/**
		 *地图类型
		 */
		public type:number;
		/**
		 *格子数量
		 */
		public tileNum:Array<any>;
		/**
		 *格子大小
		 */
		public tileSize:Array<any>;
		/**
		 *地图大小
		 */
		public mapSize:Array<any>;
		/**
		 *单位位置信息
		 */
		public unitPos:any;
	}
	class MapidConfig {
		/**
		 *地图id
		 */
		public id:number;
		/**
		 *星球id
		 */
		public starId:number;
		/**
		 *文件名
		 */
		public name:string;
		/**
		 *小地图上是否展示建筑
		 */
		public showBuildingInMini:boolean;
		/**
		 *小地图偏移值
		 */
		public offset:Array<any>;
		/**
		 *小地图与大地图的缩放比例
		 */
		public scale:Array<any>;
		/**
		 *小地图默认缩放
		 */
		public default_scale:number;
		/**
		 *小地图缩放上下限
		 */
		public default_limit:Array<any>;
		/**
		 *小地图路径
		 */
		public mapPath:string;
		/**
		 *小地图背景
		 */
		public mapBGPath:string;
		/**
		 *镜头锁定的坐标
		 */
		public cameraPos:Array<any>;
		/**
		 *地图缩放比例（百分比(按照现在的地图比例再乘)）
		 */
		public mapScale:number;
		/**
		 *地图类型（正：1；45度：2）
		 */
		public angle:number;
		/**
		 *传送点落脚点位置
		 */
		public transferPos:Array<any>;
		/**
		 *敌方传送点位置
		 */
		public enemyPos:Array<any>;
		/**
		 *不动背景图路径
		 */
		public static_background:string;
		/**
		 *移动背景图路径
		 */
		public move_background:string;
		/**
		 *移动速率比例
		 */
		public speed:number;
		/**
		 *采用的阵型
		 */
		public formation:number;
		/**
		 *英雄索敌范围
		 */
		public heroSearchRange:number;
		/**
		 *怪物索敌范围
		 */
		public monsterSearchRange:number;
		/**
		 *怪物是否无限仇恨范围
		 */
		public infiniteHate:number;
		/**
		 *是否只能普攻
		 */
		public notSkill:number;
		/**
		 *背景音乐
		 */
		public bgm:string;
		/**
		 *拼接地图的入口出口拼接点
		 */
		public inOutPos:Array<any>;
	}
	class MapInstanceConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *副本名称
		 */
		public name:string;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *助战配置ID,没有配空
		 */
		public helpConfigId:number;
		/**
		 *副本奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *召唤BOSS所需击杀怪物数量
		 */
		public summonBossNeedKillMonsterCount:number;
	}
	class MapMineralConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *掉落奖励
		 */
		public dropRewards:Array<{k:any,v:any}>;
		/**
		 *生命值
		 */
		public hp:number;
		/**
		 *模型资源
		 */
		public modelId:number;
		/**
		 *采集动作
		 */
		public collectAction:string;
		/**
		 *掉落动画
		 */
		public dropModelId:number;
		/**
		 *飘字高度
		 */
		public wordHigh:number;
	}
	class MapMonsterConfig {
		/**
		 *地图怪物ID
		 */
		public id:number;
		/**
		 *怪物类型,1-普通小怪,2-BOSS
		 */
		public monsterType:string;
		/**
		 *怪物表ID,对应MonsterAttributeConfig表id
		 */
		public monsterId:number;
		/**
		 *BOSS首杀奖励
		 */
		public bossRewards:string;
		/**
		 *BOSS首杀额外广告奖励
		 */
		public advertRewards:Array<{k:any,v:any}>;
		/**
		 *小地图图标满足条件显示
		 */
		public smallmap_icon:Array<any>;
		/**
		 *怪物名字
		 */
		public name:string;
		/**
		 *朝向(不填或0是左，1是右)
		 */
		public dir:number;
	}
	class MapNpcConfig {
		public id:number;
	}
	class MapResourceConfig {
		/**
		 *资源点id，唯一ID
		 */
		public id:number;
		/**
		 *刷新条件
		 */
		public refreshVerify:Array<any>;
		/**
		 *地图资源类型,1-怪物，2-矿产(木材、矿石),3-宝箱
		 */
		public type:string;
		/**
		 *资源点怪物ID,对应MapMonsterConfig表
		 */
		public mapMonsterId:number;
		/**
		 *资源点矿产ID,对应MapMineralConfig表
		 */
		public mapMineralId:number;
		/**
		 *是否是引导怪物
		 */
		public isGuide:boolean;
	}
	class MonsterBuildingConfig {
		public id:number;
	}
	class TeleportlistConfig {
		/**
		 *列表ID
		 */
		public id:number;
		/**
		 *地图ID
		 */
		public map_id:number;
		/**
		 *建筑ID
		 */
		public building_id:number;
		/**
		 *是否任务传送点
		 */
		public taskTeleport:number;
		/**
		 *地名
		 */
		public place_name:string;
		/**
		 *地图立绘
		 */
		public place_portrait:string;
		/**
		 *BOSS立绘
		 */
		public BOSS_portrait:string;
		/**
		 *推荐战力
		 */
		public atk:number;
		/**
		 *星名
		 */
		public star_name:string;
		/**
		 *星球立绘
		 */
		public star_portrait:string;
	}
	class TriggerConfig {
		/**
		 *地图建筑IDor触发器ID
		 */
		public id:number;
		/**
		 *是否只可以触发一次（进入 或 离开 一共触发一次）
		 */
		public once:boolean;
		/**
		 *进入触发事件
		 */
		public inEvent:string;
		/**
		 *事件参数
		 */
		public inParam:Array<any>;
		/**
		 *离开触发事件
		 */
		public outEvent:string;
		/**
		 *事件参数
		 */
		public outParam:Array<any>;
	}
	class TrunkMapBuildingConfig {
		/**
		 *id
		 */
		public id:number;
		/**
		 *建筑类型
		 */
		public building_type:string;
		/**
		 *是否是资源点
		 */
		public isResource:boolean;
		/**
		 *显示条件
		 */
		public showVerify:string;
		/**
		 *未激活显示图标
		 */
		public notActiveIconPath:string;
		/**
		 *已激活显示图标
		 */
		public activeIconPath:string;
		/**
		 *我方占领时图标
		 */
		public myOccupyIconPath:string;
		/**
		 *地方占领时图标
		 */
		public otherOccupyIconPath:string;
		/**
		 *是否需要动画
		 */
		public isAnim:boolean;
		/**
		 *动画类型
		 */
		public animType:number;
	}
	class TrunkMapProgressConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *星球ID
		 */
		public starId:number;
		/**
		 *探索进度(万分比,向下取整),已完成地图任务数量/地图任务总数
		 */
		public progress:number;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *进度奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class TrunkMapStarConfig {
		/**
		 *星球ID
		 */
		public id:number;
		/**
		 *星球名字
		 */
		public name:string;
		/**
		 *星球初始资源奖励限制
		 */
		public resourceLimitRewards:Array<{k:any,v:any}>;
		/**
		 *是否显示奖励界面
		 */
		public isShowAwardWin:boolean;
	}
	class TrunkMapTaskConfig {
		/**
		 *任务ID
		 */
		public id:number;
		/**
		 *任务事件
		 */
		public eventType:string;
		/**
		 *图标路径
		 */
		public icon:string;
		/**
		 *任务参数内容
		 */
		public string:string;
		/**
		 *任务进度
		 */
		public totalProgress:number;
		/**
		 *星球ID
		 */
		public starId:number;
		/**
		 *奖励
		 */
		public reward:Array<{k:any,v:any}>;
		/**
		 *任务提示
		 */
		public tips:string;
	}
}
