declare module table.battle{
	class AttributeConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *前端显示文字
		 */
		public attrName:string;
		/**
		 *描述
		 */
		public attrDesc:string;
		/**
		 *枚举类型
		 */
		public tid:number;
		/**
		 *类型
		 */
		public type:number;
		/**
		 *上限
		 */
		public max:number;
		/**
		 *下限
		 */
		public min:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *是否万分比
		 */
		public isPermyriad:number;
		/**
		 *战力系数
		 */
		public cpWorth:number;
		/**
		 *战力修正
		 */
		public cpMod:number;
		/**
		 *装备评分
		 */
		public equipScore:number;
	}
	class BattleConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *战斗类型
		 */
		public fightType:string;
		/**
		 *结算头像
		 */
		public icon:string;
		/**
		 *战斗最长时长：秒
		 */
		public fightMaxSecond:number;
		/**
		 *是否允许中途退出战斗
		 */
		public quitFight:boolean;
		/**
		 *怪物资源ID列表,对应MonsterResourceConfig的id,格式:[1,2,3]
		 */
		public monsterResourceIds:Array<any>;
		/**
		 *战斗的地图ID,配空则玩法自定义地图
		 */
		public mapId:number;
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
		 *属性加值
		 */
		public secondAttrAddition:any;
		/**
		 *推荐战力
		 */
		public power:number;
		/**
		 *战力碾压
		 */
		public cpDamageMod:string;
		/**
		 *最低战力（用于战斗校验）
		 */
		public pveMinWarnFight:number;
	}
	class BattleConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class BattleSettingClientConfig {
		/**
		 *战斗类型
		 */
		public fightType:string;
		/**
		 *战斗类型布阵所有阵位是否需要上满英雄
		 */
		public forceFullPosition:boolean;
		/**
		 *跳过战斗的时间
		 */
		public skipBattle:number;
		/**
		 *是否不缓存地图A星数据
		 */
		public notCacheAStar:boolean;
		/**
		 *脱离队伍距离多少马上归位
		 */
		public flashDis:number;
		/**
		 *寻路超过多少格马上归队
		 */
		public flashTile:number;
		/**
		 *是否自动战斗
		 */
		public isAutoFight:boolean;
		/**
		 *是否锁定镜头不动
		 */
		public lockCamera:boolean;
		/**
		 *是否无限仇恨
		 */
		public infiniteHate:boolean;
		/**
		 *是否1个竞技玩法
		 */
		public isPvpModel:boolean;
		/**
		 *是否忽略单位碰撞
		 */
		public isNotEnv:boolean;
		/**
		 *是否隐藏摇杆
		 */
		public hideCtrlRocker:boolean;
		/**
		 *是否显示战斗开始
		 */
		public showBattleStart:boolean;
		/**
		 *是否需要传送动画
		 */
		public showTransferAnim:boolean;
		/**
		 *TRUE-战斗初始化所有战斗单位,FALSE-通过请求战斗配置的资源点刷新单位
		 */
		public isStaticCreate:boolean;
		/**
		 *需要处理的客户端战斗信息类型列表
		 */
		public handledClientBattleContentTypes:Array<any>;
		/**
		 *是否显示攻方血条
		 */
		public attackerHpShowType:string;
		/**
		 *是否显示攻方血条
		 */
		public defenderHpShowType:string;
		/**
		 *是否可以主动复活（仅前端）
		 */
		public isCanActiveRebirth:boolean;
		/**
		 *各单位数据统计类型
		 */
		public isUnitStatistics:number;
		/**
		 *是否需要统计召唤物的数据
		 */
		public isSummonStatistics:boolean;
		/**
		 *胜利多少秒后弹结算框
		 */
		public resultWinDelay:number;
		/**
		 *失败多少秒后弹结算框
		 */
		public resultFailDelay:number;
		/**
		 *是否需要在结算时对某个怪进行掉落控制
		 */
		public isCtrlMonsterDrop:boolean;
		/**
		 *结算触发点
		 */
		public resultTrigger:Array<any>;
		/**
		 *隐藏的地图ID
		 */
		public hideMapId:number;
		/**
		 *是否保存攻击方血量
		 */
		public saveHp:boolean;
		/**
		 *是否通知攻击方死亡
		 */
		public isEventAttackerDead:boolean;
		/**
		 *是否通知防守方死亡
		 */
		public isEventDefenderDead:boolean;
		/**
		 *胜利时是否清空防守方血量
		 */
		public winToClearDefHp:boolean;
		/**
		 *出怪模式(结构参考IBattleUnitCreateMode 默认全部出完)
		 */
		public monsterCreateMode:any;
		/**
		 *地图类型(NORMAL普通地图 BATTLE战斗地图)
		 */
		public mapType:string;
	}
	class BattleSettingConfig {
		/**
		 *战斗类型
		 */
		public fightType:string;
		/**
		 *战斗类型布阵所有阵位是否需要上满英雄
		 */
		public forceFullPosition:boolean;
		/**
		 *跳过战斗的时间
		 */
		public skipBattle:number;
		/**
		 *是否不缓存地图A星数据
		 */
		public notCacheAStar:boolean;
		/**
		 *脱离队伍距离多少马上归位
		 */
		public flashDis:number;
		/**
		 *寻路超过多少格马上归队
		 */
		public flashTile:number;
		/**
		 *是否自动战斗
		 */
		public isAutoFight:boolean;
		/**
		 *是否锁定镜头不动
		 */
		public lockCamera:boolean;
		/**
		 *是否无限仇恨
		 */
		public infiniteHate:boolean;
		/**
		 *是否1个竞技玩法
		 */
		public isPvpModel:boolean;
		/**
		 *是否忽略单位碰撞
		 */
		public isNotEnv:boolean;
		/**
		 *是否隐藏摇杆
		 */
		public hideCtrlRocker:boolean;
		/**
		 *是否显示战斗开始
		 */
		public showBattleStart:boolean;
		/**
		 *是否需要传送动画
		 */
		public showTransferAnim:boolean;
		/**
		 *TRUE-战斗初始化所有战斗单位,FALSE-通过请求战斗配置的资源点刷新单位
		 */
		public isStaticCreate:boolean;
		/**
		 *需要处理的客户端战斗信息类型列表
		 */
		public handledClientBattleContentTypes:Array<any>;
		/**
		 *是否显示攻方血条
		 */
		public attackerHpShowType:string;
		/**
		 *是否显示攻方血条
		 */
		public defenderHpShowType:string;
		/**
		 *是否可以主动复活（仅前端）
		 */
		public isCanActiveRebirth:boolean;
		/**
		 *各单位数据统计类型
		 */
		public isUnitStatistics:number;
		/**
		 *是否需要统计召唤物的数据
		 */
		public isSummonStatistics:boolean;
		/**
		 *胜利多少秒后弹结算框
		 */
		public resultWinDelay:number;
		/**
		 *失败多少秒后弹结算框
		 */
		public resultFailDelay:number;
		/**
		 *是否需要在结算时对某个怪进行掉落控制
		 */
		public isCtrlMonsterDrop:boolean;
		/**
		 *结算触发点
		 */
		public resultTrigger:Array<any>;
		/**
		 *隐藏的地图ID
		 */
		public hideMapId:number;
		/**
		 *是否保存攻击方血量
		 */
		public saveHp:boolean;
		/**
		 *是否通知攻击方死亡
		 */
		public isEventAttackerDead:boolean;
		/**
		 *是否通知防守方死亡
		 */
		public isEventDefenderDead:boolean;
		/**
		 *胜利时是否清空防守方血量
		 */
		public winToClearDefHp:boolean;
		/**
		 *出怪模式(结构参考IBattleUnitCreateMode 默认全部出完)
		 */
		public monsterCreateMode:any;
		/**
		 *地图类型(NORMAL普通地图 BATTLE战斗地图)
		 */
		public mapType:string;
	}
	class BehaviorConfig {
		/**
		 *ID
		 */
		public id:string;
		/**
		 *范围类型
		 */
		public rangeType:number;
		/**
		 *范围参数
		 */
		public rangeParam:any;
		/**
		 *忽略自己
		 */
		public notSelf:number;
		/**
		 *作用的数量
		 */
		public num:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *目标筛选类型
		 */
		public targetType:number;
		/**
		 *目标筛选参数
		 */
		public targetParam:any;
		/**
		 *震动参数
		 */
		public shake:any;
		/**
		 *特效模型位置
		 */
		public animPosType:number;
		/**
		 *行为模型效果
		 */
		public modelId:any;
		/**
		 *参数
		 */
		public param:any;
		/**
		 *触发行为
		 */
		public behavior:Array<any>;
		/**
		 *触发额外行为的延迟
		 */
		public behaviorDelay:Array<any>;
		/**
		 *效果类型
		 */
		public effectType:string;
		/**
		 *效果参数
		 */
		public effectParam:any;
	}
	class BuffConfig {
		/**
		 *Buff id
		 */
		public id:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *分组(同组替换)
		 */
		public group:string;
		/**
		 *效果类型
		 */
		public effectType:string;
		/**
		 *效果参数1
		 */
		public effectParam:any;
		/**
		 *效果参数2
		 */
		public effectParam2:any;
		/**
		 *重复添加是是否继承时间
		 */
		public inheritTime:number;
		/**
		 *buff结束后的处理
		 */
		public endParam:any;
		/**
		 *最大叠加层数（相同BUFFID，时间刷新）
		 */
		public layer:number;
		/**
		 *Buff生效次数
		 */
		public countLimit:number;
		/**
		 *触发间隔
		 */
		public interval:number;
		/**
		 *Buff生效条件
		 */
		public conditionType:number;
		/**
		 *增益或减益
		 */
		public stateType:number;
		/**
		 *是否控制类BUFF
		 */
		public isCtrlBuff:number;
		/**
		 *异常标签用于驱散
		 */
		public abnormalType:number;
		/**
		 *脱战不重置BUFF
		 */
		public notExitBattleOutBuff:number;
		/**
		 *释放范围（释放者距离）
		 */
		public range:number;
		/**
		 *作用数量
		 */
		public num:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *忽略自己
		 */
		public notSelf:number;
		/**
		 *目标筛选类型(同行为表)
		 */
		public targetType:number;
		/**
		 *目标筛选参数
		 */
		public targetParam:any;
		/**
		 *每次触发当作多少发子弹
		 */
		public missileNum:number;
	}
	class BuffGroupConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *标签
		 */
		public flag:number;
		/**
		 *标签参数
		 */
		public flagParm:any;
		/**
		 *该BUFF组是否能被打断
		 */
		public isBreak:number;
		/**
		 *特效模型位置
		 */
		public animPosType:number;
		/**
		 *buff特效
		 */
		public modelId:Array<any>;
		/**
		 *buff特效上下层
		 */
		public upLow1:Array<any>;
		/**
		 *特效模型位置2
		 */
		public animPosType2:number;
		/**
		 *buff特效组2
		 */
		public modelId2:Array<any>;
		/**
		 *buff特效上下层
		 */
		public upLow2:Array<any>;
		/**
		 *参数
		 */
		public param:any;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *Buff持续时间
		 */
		public timeLimit:number;
		/**
		 *buff触发效果
		 */
		public buff:Array<any>;
	}
	class ClientDropConfig {
		/**
		 *id
		 */
		public id:number;
		/**
		 *品质
		 */
		public quality:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图标
		 */
		public iconPath:string;
	}
	class CollectionSkillConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *效果描述富文本
		 */
		public desc:string;
		/**
		 *模型
		 */
		public modelId:number;
		/**
		 *所属技能分类
		 */
		public belongType:string;
		/**
		 *触发条件
		 */
		public triggerType:number;
		/**
		 *触发条件参数
		 */
		public triggerParam:any;
		/**
		 *是否进战只触发1次
		 */
		public once:number;
		/**
		 *前置冷却
		 */
		public precd:number;
		/**
		 *技能冷却
		 */
		public cd:number;
		/**
		 *持续时间
		 */
		public castTime:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *参数
		 */
		public param:any;
		/**
		 *行为序列
		 */
		public behavior_0:any;
		/**
		 *战力
		 */
		public cpWorth:number;
		/**
		 *战力修正
		 */
		public cpMod:number;
		/**
		 *技能图标
		 */
		public icon:string;
	}
	class FormationSkillConfig {
		/**
		 *id
		 */
		public id:number;
		/**
		 *被动技能ID
		 */
		public skillId:Array<any>;
		/**
		 *要求的英雄
		 */
		public heros:Array<any>;
		/**
		 *对应英雄位置增加的被动技能
		 */
		public heroPosSkillId:Array<any>;
		/**
		 *要求最低数量
		 */
		public minNum:number;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *扩展属性
		 */
		public exData:any;
	}
	class GunConfig {
		/**
		 *主键
		 */
		public id:number;
		/**
		 *X轴坐标(百分比)
		 */
		public posX:number;
		/**
		 *Y轴坐标(百分比)
		 */
		public posY:number;
		/**
		 *是否是静态子弹
		 */
		public isStop:number;
		/**
		 *发射角度
		 */
		public rotation:number;
		/**
		 *子弹类型
		 */
		public missileId:string;
		/**
		 *预冷却（毫秒）
		 */
		public preCooldown:number;
		/**
		 *冷却（毫秒）
		 */
		public cooldown:number;
		/**
		 *弹匣数量
		 */
		public clip:number;
	}
	class GunGroupConfig {
		/**
		 *主键
		 */
		public id:string;
		/**
		 *发射器序列
		 */
		public gunArray:Array<any>;
		/**
		 *子弹类型
		 */
		public missileId:string;
		/**
		 *起始点类型（0是目标的攻击点;移动不会打断）
		 */
		public atkPosType:number;
		/**
		 *起始点参数
		 */
		public atkPosParm:any;
	}
	class HaloConfig {
		/**
		 *光环ID
		 */
		public id:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *分组(同组替换)
		 */
		public group:string;
		/**
		 *特效模型上
		 */
		public modelUp:any;
		/**
		 *特效模型下
		 */
		public modelDown:any;
		/**
		 *是否目标跟随移动
		 */
		public canMove:boolean;
		/**
		 *生效条件
		 */
		public conditionType:number;
		/**
		 *效果类型
		 */
		public effectType:string;
		/**
		 *效果参数1
		 */
		public effectParam:any;
		/**
		 *效果参数2
		 */
		public effectParam2:any;
		/**
		 *触发次数
		 */
		public countLimit:number;
		/**
		 *触发间隔
		 */
		public interval:number;
		/**
		 *持续时间
		 */
		public timeLimit:number;
		/**
		 *施法者死亡是否移除
		 */
		public dieRemove:boolean;
		/**
		 *释放范围（释放者距离）
		 */
		public range:number;
		/**
		 *作用数量
		 */
		public num:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *忽略自己
		 */
		public notSelf:number;
		/**
		 *目标筛选类型(同行为表)
		 */
		public targetType:number;
		/**
		 *目标筛选类型参数
		 */
		public targetParam:any;
		/**
		 *每次触发当作多少发子弹
		 */
		public missileNum:number;
		/**
		 *区域显示,1是增益，2是减益
		 */
		public areaType:number;
	}
	class MissileConfig {
		/**
		 *子弹id
		 */
		public id:string;
		/**
		 *速度/像素每秒
		 */
		public speed:number;
		/**
		 *时间
		 */
		public timeLimit:number;
		/**
		 *射程
		 */
		public distance:number;
		/**
		 *类型
		 */
		public type:number;
		/**
		 *参数
		 */
		public parameter:any;
		/**
		 *层级
		 */
		public layer:number;
		/**
		 *特效模型位置
		 */
		public animPosType:number;
		/**
		 *行为模型效果
		 */
		public effectModelId:any;
		/**
		 *子弹模型
		 */
		public modelId:Array<any>;
		/**
		 *循环类型（0循环，1不循环，2不循环定在最后一帧）
		 */
		public notLoop:number;
		/**
		 *行为1
		 */
		public behaviors:Array<any>;
		/**
		 *落点提示type:1;w:100;h:100;r:100
		 */
		public hitTips:any;
		/**
		 *默认偏移{"x":1,"y":1}
		 */
		public pos:any;
		/**
		 *发射音效
		 */
		public shootSound:string;
		/**
		 *命中音效
		 */
		public hitSound:string;
	}
	class MonsterResourceConfig {
		public id:number;
		/**
		 *资源点怪物ID,对应MonsterAttrConfig表
		 */
		public monsterId:number;
		/**
		 *资源点资源数量(>0),例如配置数量为2且为怪物资源类型,则该资源点有2个配置monsterId的怪物
		 */
		public count:number;
		/**
		 *资源点Id
		 */
		public resourceId:number;
		/**
		 *是否手动刷怪Id
		 */
		public isManual:boolean;
		/**
		 *仇恨分组
		 */
		public hatredGroup:number;
	}
	class PassivitySkillConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *技能名字
		 */
		public name:string;
		/**
		 *技能描述
		 */
		public desc:string;
		/**
		 *分组（同组被动会被后添加的替换）
		 */
		public group:string;
		/**
		 *所属技能分类
		 */
		public belongType:string;
		/**
		 *子类型
		 */
		public subType:number;
		/**
		 *脱战清空CD
		 */
		public exitClearCd:number;
		/**
		 *不产生仇恨
		 */
		public notHatred:number;
		/**
		 *前置冷却
		 */
		public precd:number;
		/**
		 *间隔时间
		 */
		public interval:number;
		/**
		 *技能冷却
		 */
		public cd:number;
		/**
		 *条件类型
		 */
		public condition:number;
		/**
		 *条件值
		 */
		public conditionValue:Array<any>;
		/**
		 *条件值2
		 */
		public conditionValue2:Array<any>;
		/**
		 *是否添加技能时马上生效
		 */
		public conditionNow:number;
		/**
		 *状态组合
		 */
		public statusGroup:Array<any>;
		/**
		 *行为序列_0
		 */
		public behavior_0:any;
		/**
		 *触发技能
		 */
		public skills:Array<any>;
		/**
		 *触发技能参数
		 */
		public skillParm:Array<any>;
	}
	class SkillChargedShowConfig {
		/**
		 *主键
		 */
		public id:number;
		/**
		 *类型(0:自定义范围,1:子弹组范围)
		 */
		public type:number;
		/**
		 *参数
		 */
		public parm:any;
	}
	class SkillConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *技能组别
		 */
		public group:string;
		/**
		 *所属技能分类
		 */
		public belongType:string;
		/**
		 *等级
		 */
		public level:number;
		/**
		 *技能名字
		 */
		public name:string;
		/**
		 *职业羁绊数量
		 */
		public careerCount:number;
		/**
		 *技能类型
		 */
		public type:number;
		/**
		 *子类型
		 */
		public subType:number;
		/**
		 *子类型参数
		 */
		public subTypeParm:any;
		/**
		 *前置冷却
		 */
		public precd:number;
		/**
		 *技能冷却
		 */
		public cd:number;
		/**
		 *显示用的CD
		 */
		public showCd:Array<any>;
		/**
		 *施法持续时间
		 */
		public castTime:number;
		/**
		 *被动技能
		 */
		public skills:Array<any>;
		/**
		 *施法距离
		 */
		public castingRange:number;
		/**
		 *目标阵营
		 */
		public targetFaction:number;
		/**
		 *是否释放后清除主目标
		 */
		public clearTarget:number;
		/**
		 *主目标类型
		 */
		public targetType:number;
		/**
		 *目标筛选参数
		 */
		public targetParam:any;
		/**
		 *不产生仇恨
		 */
		public notHatred:number;
		/**
		 *是否受攻速加成
		 */
		public isByAtkSpeed:number;
		/**
		 *技能攻击速度
		 */
		public atkSpeed:number;
		/**
		 *行为序列_0
		 */
		public behavior_0:any;
		/**
		 *行为序列_1
		 */
		public behavior_1:any;
		/**
		 *行为序列_2
		 */
		public behavior_2:any;
		/**
		 *行为序列_3
		 */
		public behavior_3:any;
		/**
		 *行为序列_4
		 */
		public behavior_4:any;
		/**
		 *技能图标
		 */
		public icon:string;
		/**
		 *技能描述
		 */
		public desc:string;
		/**
		 *技能范围（只做展示用）
		 */
		public rangeDescType:string;
		/**
		 *动作
		 */
		public anim:string;
		/**
		 *随机的动作
		 */
		public animList:Array<any>;
		/**
		 *背面动作
		 */
		public anim2:string;
		/**
		 *哪个骨骼需要根据目标旋转
		 */
		public rotateBoneName:any;
		/**
		 *攻击点坐标
		 */
		public atkPoint:any;
		/**
		 *主动技能
		 */
		public activeSkill:Array<any>;
		/**
		 *子技能是否不刷新主技能CD
		 */
		public activeSkillNoRefreshCD:number;
		/**
		 *骑乘技能
		 */
		public horseSkill:string;
		/**
		 *对话内容
		 */
		public talk:any;
		/**
		 *对话触发概率
		 */
		public talkProbability:number;
		/**
		 *技能直接增加的属性值
		 */
		public skillAttrs:any;
		/**
		 *震动参数
		 */
		public shake:any;
		/**
		 *战力
		 */
		public cpWorth:number;
		/**
		 *战力修正
		 */
		public cpMod:number;
	}
	class SkillEffectConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *动作
		 */
		public anim:string;
		/**
		 *骑乘动作
		 */
		public animHorse:string;
		/**
		 *全屏特效
		 */
		public sceneEffect:number;
		/**
		 *上层特效时的层级
		 */
		public layer:number;
		/**
		 *特效模型位置
		 */
		public animPosType:number;
		/**
		 *特效模型正面
		 */
		public modelId:Array<any>;
		/**
		 *特效模型背面
		 */
		public modelUpId:Array<any>;
		/**
		 *背景特效正面
		 */
		public bgModelId:Array<any>;
		/**
		 *背景特效背面
		 */
		public bgModelUpId:Array<any>;
		/**
		 *参数
		 */
		public param:any;
	}
	class SummonConfig {
		/**
		 *召唤物ID
		 */
		public id:number;
		/**
		 *是否可被锁定
		 */
		public type:number;
		/**
		 *召唤时间
		 */
		public timeLimit:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *战斗模型
		 */
		public model:string;
		/**
		 *索敌距离
		 */
		public searchRange:number;
		/**
		 *攻击
		 */
		public atk:number;
		/**
		 *血量
		 */
		public hp:number;
		/**
		 *普攻技能
		 */
		public skill0:number;
		/**
		 *技能1
		 */
		public skill1:number;
		/**
		 *技能2
		 */
		public skill2:number;
	}
}
