declare module Vo.battle{
	
	/**
	 * 战斗方镜像
	 * @author GameCreator
	 */	
	class FighterMirror	{
		/**
		 * 玩家ID,没有则为怪物
		 */		
		playerId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 头像ID,没有则默认0
		 */		
		headIcon:number;
		
		/**
		 * 队伍单位列表
		 */		
		teamMirrors:Array<FightUnitMirror>;
		
		/**
		 * 星灵宠物单位
		 */		
		petMirror:FightUnitMirror;
		
		/**
		 * 战斗单位列表
		 */		
		mirrors:Array<FightUnitMirror>;
		
	}


	
	/**
	 * 处理客户端战斗信息
	 * @author GameCreator
	 */	
	class HandleBattleContentC2S	{
		/**
		 * 战斗信息请求vo
		 */		
		reportReqVo:Vo.battle.BattleContentReqVo;
		
	}


	
	/**
	 * 处理客户端战斗信息
	 * @author GameCreator
	 */	
	class HandleBattleContentS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 刷新Buff战斗内容
	 * @author GameCreator
	 */	
	class BuffRefreshBattleContent	{
		/**
		 * 类型
		 */		
		type:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 组下标，从0开始
		 */		
		groupIndex:number;
		
		/**
		 * 刷新BuffId列表
		 */		
		buffIds:Array<number>;
		
		/**
		 * 是否初始刷新
		 */		
		initRefresh:boolean;
		
	}


	
	/**
	 * 战斗结束
	 * @author GameCreator
	 */	
	class BattleEndC2S	{
		/**
		 * 战斗结束请求vo
		 */		
		reqVo:Vo.battle.BattleEndReqVo;
		
	}


	
	/**
	 * 战斗结束
	 * @author GameCreator
	 */	
	class BattleEndS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 战斗方
	 * @author GameCreator
	 */	
	class FighterVo	{
		/**
		 * 队伍单位列表
		 */		
		teamUnitVos:Array<FightUnitVo>;
		
		/**
		 * 星灵宠物单位
		 */		
		petUnitVo:FightUnitVo;
		
		/**
		 * 战斗单位列表
		 */		
		unitVos:Array<FightUnitVo>;
		
		/**
		 * 玩家ID,没有则为怪物
		 */		
		playerId:number;
		
		/**
		 * 名称
		 */		
		name:string;
		
		/**
		 * 头像ID,没有则默认0
		 */		
		headIcon:number;
		
	}


	
	/**
	 * 传送至下一层
	 * @author GameCreator
	 */	
	class TransferNextFloorBattleContent	{
		/**
		 * 战报类型,ClientBattleContentType
		 */		
		type:number;
		
	}


	
	/**
	 * 单位验证数据vo
	 * @author GameCreator
	 */	
	class FightUnitVerifyVo	{
		/**
		 * 单位唯一ID,带数量下标
		 */		
		unitId:number;
		
		/**
		 * 验证属性值
		 */		
		checkSum:number;
		
	}


	
	/**
	 * 战斗单位模型信息
	 * @author GameCreator
	 */	
	class UnitModel	{
		/**
		 * 模型配置Id
		 */		
		modelConfigId:number;
		
		/**
		 * 英雄皮肤Id，默认为0
		 */		
		heroSkinId:number;
		
	}


	
	/**
	 * 客户端战斗信息接口
	 * @author GameCreator
	 */	
	class IClientBattleContent	{
	}


	
	/**
	 * 单位异常伤害验证vo
	 * @author GameCreator
	 */	
	class FightUnitAbnormalHurtVo	{
		/**
		 * 单位唯一ID
		 */		
		unitId:number;
		
		/**
		 * 异常伤害值
		 */		
		abnormalHurt:number;
		
	}


	
	/**
	 * 战斗单位
	 * @author GameCreator
	 */	
	class FightUnitVo	{
		/**
		 * 单位ID,本场战斗唯一ID,id最后1000数量预留给 {@count}字段
		 */		
		id:number;
		
		/**
		 * 配置ID
		 */		
		configId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 等阶
		 */		
		stage:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
		/**
		 * 单位类型,UnitType
		 */		
		type:number;
		
		/**
		 * 数量,默认为1
		 */		
		count:number;
		
		/**
		 * 资源点ID
		 */		
		resourceId:number;
		
		/**
		 * 怪物资源ID对应MonsterResourceConfig.id,0表示非怪物
		 */		
		monsterResourceId:number;
		
		/**
		 * 阵位
		 */		
		position:number;
		
		/**
		 * 战斗属性,AttributeType-属性值
		 */		
		attributeIdMap:Object;
		
		/**
		 * 单位剩余血量,覆盖战斗属性血量值,<=0则不生效
		 */		
		surplusHp:number;
		
		/**
		 * 技能ID列表
		 */		
		skillIds:Array<string>;
		
		/**
		 * 模型信息
		 */		
		model:UnitModel;
		
	}


	
	/**
	 * 战斗结束请求vo
	 * @author GameCreator
	 */	
	class BattleEndReqVo	{
		/**
		 * 战斗配置ID
		 */		
		battleConfigId:number;
		
		/**
		 * 战斗统计vo
		 */		
		statisticsVo:BattleStatisticsVo;
		
	}


	
	/**
	 * 刷新怪物战报
	 * @author GameCreator
	 */	
	class RefreshMonsterBattleContent	{
		/**
		 * 类型,ServerBattleContentType
		 */		
		type:number;
		
		/**
		 * 刷新的怪物单位列表
		 */		
		refreshMonsterUnitVo:Array<FightUnitVo>;
		
		/**
		 * BattleConfig.id
		 */		
		battleConfigId:number;
		
	}


	
	/**
	 * 单位死亡战报
	 * @author GameCreator
	 */	
	class UnitDeadBattleContent	{
		/**
		 * 战报类型,ClientBattleContentType
		 */		
		type:number;
		
		/**
		 * 死亡的单位唯一ID
		 */		
		deadUnitIds:Array<number>;
		
	}


	
	/**
	 * 战斗验证参数
	 * @author GameCreator
	 */	
	class BattleVerifyParam	{
		/**
		 * 玩法修正系数(万分比)
		 */		
		playReviseRate:number;
		
		/**
		 * 极限值额外系数(万分比)
		 */		
		extremeRate:number;
		
	}


	
	/**
	 * 战斗单位统计信息vo
	 * @author GameCreator
	 */	
	class FightUnitStatisticsVo	{
		/**
		 * 战斗单位唯一ID
		 */		
		unitId:number;
		
		/**
		 * 伤害
		 */		
		hurt:number;
		
		/**
		 * 治疗
		 */		
		cure:number;
		
		/**
		 * 承伤
		 */		
		beHurt:number;
		
		/**
		 * 剩余血量
		 */		
		surplusHp:number;
		
	}


	
	/**
	 * 战斗单位属性Vo
	 * @author GameCreator
	 */	
	class FightUnitAttributeVo	{
		/**
		 * 最终属性，key值为 {@link AttributeConfig#getId()}
		 */		
		finalAttributeMap:Object;
		
		/**
		 * 基础属性+二级属性，key值为 {@link AttributeConfig#getId()}
		 */		
		beforeConvertAttributeMap:Object;
		
		/**
		 * 基础属性和各个模块的属性
		 */		
		moduleAttributeMap:Object;
		
		/**
		 * 模块技能ID列表
		 */		
		moduleSkillIdMap:Object;
		
		/**
		 * 英雄基础战力,∑ ( 面板属性值 * 面板属性战力系数 ）
		 */		
		heroBaseFight:number;
		
		/**
		 * 英雄二级属性战力修正,∑（ 二级属性值 * 二级属性战力修正）
		 */		
		heroSecondCpModFight:number;
		
		/**
		 * 英雄二级属性战力,∑（ 二级属性值 * 二级属性战力系数）
		 */		
		heroSecondCpWorthFight:number;
		
		/**
		 * 英雄技能战力,不包含额外的技能战力
		 */		
		heroSkillCpWorth:number;
		
		/**
		 * 英雄技能战力修正,不包含额外的技能战力修正
		 */		
		heroSkillCpMod:number;
		
		/**
		 * 额外的技能战力MAP,模块-技能战力值
		 */		
		extraSkillCpWorthMap:Object;
		
		/**
		 * 额外的技能战力修正MAP,模块-技能战力修正值
		 */		
		extraSkillCpModMap:Object;
		
		/**
		 * 英雄战力计算额外的技能列表MAP,模块-战力计算技能列表
		 */		
		heroExtraCpSkillMap:Object;
		
	}


	
	/**
	 * 战斗信息
	 * @author GameCreator
	 */	
	class BattleVo	{
		/**
		 * 开始时间,作为本次战斗的随机种子
		 */		
		startTime:number;
		
		/**
		 * 关卡配置ID
		 */		
		battleConfigId:number;
		
		/**
		 * 是否为后台托管战斗
		 */		
		background:boolean;
		
		/**
		 * 进攻方
		 */		
		attackerVo:FighterVo;
		
		/**
		 * 防守方
		 */		
		defenderVo:FighterVo;
		
		/**
		 * 战斗验证参数
		 */		
		verifyParam:BattleVerifyParam;
		
		/**
		 * 模块玩法信息,不同战斗类型处理不一样,具体类型询问对应功能的服务端
		 */		
		modulePlayInfo:Object;
		
	}


	
	/**
	 * 战斗统计vo
	 * @author GameCreator
	 */	
	class BattleStatisticsVo	{
		/**
		 * 战斗结果类型,BattleResult
		 */		
		battleResult:number;
		
		/**
		 * 攻击方累计伤害
		 */		
		attackerTotalHurt:number;
		
		/**
		 * 防守方累计伤害
		 */		
		defenderTotalHurt:number;
		
		/**
		 * 攻击方剩余总血量
		 */		
		attackerSurplusHp:number;
		
		/**
		 * 攻击方剩余血量百分比
		 */		
		attackerHpPercent:number;
		
		/**
		 * 防守方剩余血量百分比
		 */		
		defenderHpPercent:number;
		
		/**
		 * 防守方剩余总血量
		 */		
		defenderSurplusHp:number;
		
		/**
		 * 死亡次数
		 */		
		deadTimes:number;
		
		/**
		 * 进攻方单位统计信息
		 */		
		attackerUnitStatisticsVos:Array<FightUnitStatisticsVo>;
		
		/**
		 * 防守方单位统计信息
		 */		
		defenderUnitStatisticsVos:Array<FightUnitStatisticsVo>;
		
		/**
		 * 单位异常伤害信息列表
		 */		
		abnormalHurtVos:Array<FightUnitAbnormalHurtVo>;
		
	}


	
	/**
	 * 单位统计基础信息
	 * @author GameCreator
	 */	
	class UnitStatisticsBaseVo	{
		/**
		 * 配置ID
		 */		
		configId:number;
		
		/**
		 * 单位类型,UnitType
		 */		
		unitType:number;
		
		/**
		 * 伤害
		 */		
		hurt:number;
		
		/**
		 * 治疗
		 */		
		cure:number;
		
		/**
		 * 承伤
		 */		
		beHurt:number;
		
		/**
		 * 单位模型
		 */		
		unitModel:UnitModel;
		
	}


	
	/**
	 * 战斗单位验证
	 * @author GameCreator
	 */	
	class FightUnitVerifyBattleContent	{
		/**
		 * 类型
		 */		
		type:number;
		
		/**
		 * 单位验证ID
		 */		
		fightUnitVerifyVos:Array<FightUnitVerifyVo>;
		
	}


	
	/**
	 * 服务端战斗信息接口
	 * @author GameCreator
	 */	
	class IServerBattleContent	{
	}


	
	/**
	 * 波次战斗内容
	 * @author GameCreator
	 */	
	class RoundBattleContent	{
		/**
		 * 类型
		 */		
		type:number;
		
		/**
		 * 波次
		 */		
		round:number;
		
	}


	
	/**
	 * 战斗战报请求vo
	 * @author GameCreator
	 */	
	class BattleContentReqVo	{
		/**
		 * 战斗配置id
		 */		
		battleConfigId:number;
		
		/**
		 * 客户端战斗信息列表,继承IClientBattleContent接口
		 */		
		battleContents:Array<Object>;
		
	}


	
	/**
	 * 战前阵法设置信息
	 * @author GameCreator
	 */	
	class FightBuildFormationVo	{
		/**
		 * 收藏品ID
		 */		
		collectiblesId:number;
		
		/**
		 * 星灵宠物ID
		 */		
		petBaseId:number;
		
		/**
		 * 英雄上阵信息
		 */		
		positionVos:Array<Vo.formation.PositionVo>;
		
	}


	
	/**
	 * 战斗单位镜像
	 * @author GameCreator
	 */	
	class FightUnitMirror	{
		/**
		 * 配置ID
		 */		
		configId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 等阶
		 */		
		stage:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
		/**
		 * 单位类型
		 */		
		type:number;
		
		/**
		 * 战斗属性
		 */		
		attributeMap:Object;
		
		/**
		 * 被动技能
		 */		
		skillIds:Array<string>;
		
		/**
		 * 模型信息
		 */		
		model:UnitModel;
		
		/**
		 * 阵位
		 */		
		position:number;
		
	}


	
	/**
	 * 战斗加载怪物请求vo
	 * @author GameCreator
	 */	
	class LoadBattleMonsterReqVo	{
		/**
		 * 战斗配置ID
		 */		
		battleConfigId:number;
		
		/**
		 * 战斗配置的资源点ID列表,对应MonsterResourceConfig.id
		 */		
		battleResourceIds:Array<number>;
		
	}


	
	/**
	 * 选择Buff战斗内容
	 * @author GameCreator
	 */	
	class BuffSelectBattleContent	{
		/**
		 * 类型
		 */		
		type:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 组下标，从0开始
		 */		
		groupIndex:number;
		
		/**
		 * 所选BuffId列表
		 */		
		buffId:number;
		
	}


	/**
	 * 属性类型
	 * @author GameCreator
	 */	
	enum AttributeType
	{
		/**
		 * 攻击
		 */		
		ATK = 0,
		/**
		 * 防御
		 */		
		DEF = 1,
		/**
		 * 生命
		 */		
		HP = 2,
		/**
		 * 攻击%
		 */		
		ATK_BONUS = 3,
		/**
		 * 防御%
		 */		
		DEF_BONUS = 4,
		/**
		 * 生命%
		 */		
		HP_BONUS = 5,
		/**
		 * 额外攻击
		 */		
		ATK_ADD = 6,
		/**
		 * 额外防御
		 */		
		DEF_ADD = 7,
		/**
		 * 额外生命
		 */		
		HP_ADD = 8,
		/**
		 * 闪避率
		 */		
		DOD_RATE = 9,
		/**
		 * 命中率
		 */		
		DOD_RES = 10,
		/**
		 * 暴击率
		 */		
		CRI_RATE = 11,
		/**
		 * 暴击伤害
		 */		
		CRI_DMG = 12,
		/**
		 * 暴击伤害减少
		 */		
		CRI_DMG_DEC = 13,
		/**
		 * 抗暴率
		 */		
		CRI_RES = 14,
		/**
		 * 格挡率
		 */		
		BLK_RATE = 15,
		/**
		 * 格挡伤害
		 */		
		BLK_DMG = 16,
		/**
		 * 格挡伤害减少
		 */		
		BLK_DMG_DEC = 17,
		/**
		 * 抗格挡率
		 */		
		BLK_RES = 18,
		/**
		 * 伤害增加
		 */		
		DMG_INC = 19,
		/**
		 * 伤害减免
		 */		
		DMG_RES = 20,
		/**
		 * 移动速度
		 */		
		MOVE_SPD = 21,
		/**
		 * 攻击速度
		 */		
		ATK_SPD = 22,
		/**
		 * 攻击范围
		 */		
		ATK_RNG = 23,
		/**
		 * 冷却缩减
		 */		
		CDR = 24,
		/**
		 * 攻击增加
		 */		
		ATK_INC = 25,
		/**
		 * 防御增加
		 */		
		DEF_INC = 26,
		/**
		 * 生命(上限)增加
		 */		
		HP_INC = 27,
		/**
		 * 攻击降低
		 */		
		ATK_DEC = 28,
		/**
		 * 防御降低(破甲)
		 */		
		DEF_DEC = 29,
		/**
		 * 生命上限降低
		 */		
		HP_DEC = 30,
		/**
		 * 效果命中
		 */		
		EFF_RATE = 31,
		/**
		 * 效果抗性(韧性)
		 */		
		EFF_RES = 32,
		/**
		 * 吸血
		 */		
		LIFE_STEAL = 33,
		/**
		 * 反伤
		 */		
		REFLECT_DMG = 34,
		/**
		 * 穿甲
		 */		
		ARP = 35,
		/**
		 * 治愈率
		 */		
		HL_INC = 36,
		/**
		 * 减疗
		 */		
		HR_DEC = 37,
		/**
		 * 受愈
		 */		
		HR_INC = 38,
		/**
		 * 普攻增伤
		 */		
		BAD_INC = 39,
		/**
		 * 技能增伤
		 */		
		SD_INC = 40,
		/**
		 * 破甲抵抗
		 */		
		ARP_RES = 41,
		/**
		 * 普攻减伤
		 */		
		BAD_RES = 42,
		/**
		 * 技能减伤
		 */		
		SD_RES = 43,
		/**
		 * 远程防御
		 */		
		RNG_DEF = 44,
		/**
		 * 近战防御
		 */		
		ML_DEF = 45,
		/**
		 * 异常强化
		 */		
		DOT_INC = 46,
		/**
		 * 异常抗性
		 */		
		DOT_RES = 47,
		/**
		 * 对人族伤害提升
		 */		
		T_DMG_INC = 48,
		/**
		 * 来自人族伤害降低
		 */		
		T_DMG_RES = 49,
		/**
		 * 对神裔伤害提升
		 */		
		P_DMG_INC = 50,
		/**
		 * 来自神裔伤害降低
		 */		
		P_DMG_RES = 51,
		/**
		 * 对智械伤害提升
		 */		
		M_DMG_INC = 52,
		/**
		 * 来自智械伤害降低
		 */		
		M_DMG_RES = 53,
		/**
		 * 对异魔伤害提升
		 */		
		S_DMG_INC = 54,
		/**
		 * 来自异魔伤害降低
		 */		
		S_DMG_RES = 55,
		/**
		 * 范围伤害减免
		 */		
		RANGE_DMG_RES = 56,
		/**
		 * 效果强化
		 */		
		EFF_INC = 57,
		/**
		 * PVP增伤
		 */		
		PVP_DMG_INC = 58,
		/**
		 * PVP减伤
		 */		
		PVP_DMG_RES = 59,
		/**
		 * 额外攻击修正
		 */		
		ATK_ADD_MOD = 60,
		/**
		 * 额外防御修正
		 */		
		DEF_ADD_MOD = 61,
		/**
		 * 额外血量修正
		 */		
		HP_ADD_MOD = 62,
		/**
		 * 星灵增伤
		 */		
		PET_DMG_INC = 63,
		/**
		 * 远程增伤
		 */		
		RNG_DMG_INC = 64,
		/**
		 * 近战增伤
		 */		
		ML_DMG_INC = 65,
		/**
		 * 远程减伤
		 */		
		RNG_DMG_RES = 66,
		/**
		 * 近战减伤
		 */		
		ML_DMG_RES = 67,
		/**
		 * 射击增伤
		 */		
		MM_DMG_INC = 68,
		/**
		 * 射击减伤
		 */		
		MM_DMG_RES = 69,
		/**
		 * 异能增伤
		 */		
		MG_DMG_INC = 70,
		/**
		 * 异能减伤
		 */		
		MG_DMG_RES = 71,
		/**
		 * 重骑增伤
		 */		
		RD_DMG_INC = 72,
		/**
		 * 重骑减伤
		 */		
		RD_DMG_RES = 73,
		/**
		 * 格斗增伤
		 */		
		FT_DMG_INC = 74,
		/**
		 * 格斗减伤
		 */		
		FT_DMG_RES = 75
	}


	
	/**
	 * 复活
	 * @author GameCreator
	 */	
	class ReviveC2S	{
		/**
		 * 战斗配置ID
		 */		
		battleConfigId:number;
		
		/**
		 * 是否自动免费复活
		 */		
		autoRevive:boolean;
		
	}


	
	/**
	 * 复活
	 * @author GameCreator
	 */	
	class ReviveS2C	{
		content:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 战斗战报信息
	 * @author GameCreator
	 */	
	class ServerBattleContentVo	{
		/**
		 * 战报内容列表
		 */		
		reports:Array<IServerBattleContent>;
		
	}


	
	/**
	 * 加载战斗怪物
	 * @author GameCreator
	 */	
	class LoadBattleMonsterS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 取消/退出战斗
	 * @author GameCreator
	 */	
	class CancelBattleC2S	{
		/**
		 * 战斗配置ID
		 */		
		battleConfigId:number;
		
	}


	
	/**
	 * 取消/退出战斗
	 * @author GameCreator
	 */	
	class CancelBattleS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 加载战斗怪物
	 * @author GameCreator
	 */	
	class LoadBattleMonsterC2S	{
		/**
		 * 战斗加载怪物请求vo
		 */		
		reqVo:Vo.battle.LoadBattleMonsterReqVo;
		
	}


}
