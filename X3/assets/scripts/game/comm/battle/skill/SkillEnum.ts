/***特效层级 */
export enum FormationType {
   /***前排 */
   Front = 1,
   /***中排 */
   Middle = 2,
   /***后排 */
   After = 3,
}

/**技能类型 */
export enum SkillType {
   /**普攻 */
   ATTACK = 1,
   /**主动技能 */
   ACTIVE_SKILL,
   /**被动技能 */
   PASSIVE_SKILL,
   /**面板属性，服务端处理 */
   ATTR_SKILL,
   /**引导技能 */
   Guiding_Skills,
}

/**技能子类型 */
export enum SkillSubType {
   /**普通 */
   Normal = 0,
   /**冲锋技能 */
   Collison = 1,
   /**持续施法 */
   Loop = 2,
   /**蓄力技能 */
   Charged = 4,
   /**复活技能 */
   Revive = 8,
   /**弹道技能 */
   Missile = 16,
   /**范围伤害 */
   Range = 32,
}

/***技能特效位置 */
export enum SkillEffectPos {
   /***跟随角色，角色被打断特效也打断 */
   From_Player_Block = 1,
   /***不会被打断，角色移动特效跟住移动 */
   Player_Move = 2,
   /***屏幕上方居中 */
   Screen_Top_Center = 3,
   /***受击点位置 */
   Hurt_Point = 4,
   /***攻击点位置 */
   Atk_Point = 5,
   /***根据攻击者方向在目标位置上跟随不打断 */
   Player_Move_Fight_Dir = 6,
   /***攻击点位置（跟随） */
   Atk_Point_Move = 7,
   /***正常动作结束不打断 */
   Normal_Not_Stop = 8,
   /***自身位置不跟随小范围随机 */
   Random_Pos = 9,
   /***施法者位置 */
   Fighter_Pos = 10,
   /***目标的受击点而且跟随攻击者的方向 */
   Hurt_Point_Fighter_Angle = 11,
   /***链接攻击者和目标 */
   Link_Fight_And_Target = 12,
   /***屏幕居中 */
   Screen_Center = 13,
   /***不会被打断，角色移动特效跟住移动,方向持续跟随角色 */
   Player_Move_Dir = 14,
}

/***BUFF特效位置 */
export enum BuffEffectPos {
   /***自身循环1次 */
   Once = 1,
   /***自身无限循环 */
   Loop = 2,
   /***自身循环1次不受BUFF结束影响 */
   OnceNotEnd = 3,
   /***里面的BUFF生效才播放的特效 */
   OnceForAct = 4,
   /***自身无限循环根据单位翻转 */
   LoopScaleX = 5,
   /***不跟随位置，一定时间重复播放1次 */
   NotPosLoop = 6,
   /***不跟随位置，播放1次 */
   NotPos = 7,
   /***按size放在头上跟随*/
   SizePos = 8,
   /***按size放在头上跟随,只播放1次*/
   SizePos_Once = 9,
   /***在自身受击点无限循环 */
   Loop_Hurt_Point = 10,
   /***链接攻击者和目标 */
   Link_Fight_And_Target = 11,
}

/***特效层级 */
export enum EffectLayer {
   /***背景层 */
   BgLayer = 0,
   /***角色层 */
   RoleLayer = 1,
   /***特效最高层 */
   EffectTopLayer = 2,
}


/**检索主目标 */
export enum SearchType {
   /**当前主目标 */
   MainTarget = 0,
   /**锁定范围内距离最近目标 */
   Nearset = 1,
   /**锁定范围内距离最远目标*/
   Farthest = 2,
   /**生命最高*/
   Hp_Most = 3,
   /**生命最低*/
   Hp_Lowest = 4,
   /**最密集的目标*/
   MOST_DENSE = 5,
   /**最密集的区域*/
   MOST_DENSE_AREA = 6,
   /**原地释放*/
   Now = 7,
   /**距离最近的1个目标的位置*/
   NearsetPoint = 8,
   /**防御最高*/
   Def_Most = 9,
   /**随机1个目标*/
   Random = 10,
   /**攻击最高*/
   Atk_Most = 11,
   /**最大生命最高*/
   HpMax_Most = 12,
   /**死亡目标*/
   Die = 13,
   /**初始攻击力最高*/
   Atk_Init_Most = 14,
   /**召唤物*/
   Summon = 15,
   /**最密集的扇形区域*/
   MOST_DENSE_AREA_ARC = 16,
   /**最密集的扇形目标*/
   MOST_DENSE_ARC = 17,
   /**最密集的矩形区域的坐标和方向*/
   MOST_DENSE_AREA_RECT_ANGLE = 18,
   /**最靠前的目标（英雄表阵位）*/
   Foremost = 19,
}

/**目标类型 SkillConfig targetType*/
export enum SkillTargetType {
   /**索敌目标 */
   SEARCH_TARGET = 1,
   /**范围内最近*/
   Nearset = 2,
   /**范围内最远 */
   Farthest = 3,
   /**HP最低的目标 */
   LOWEST_HP = 4,
   /**防御最高*/
   Def_Most = 5,
   /**自身*/
   SELF = 6,
   /**随机*/
   Random = 7,
   /**攻击最高*/
   Atk_Most = 8,
   /**召唤物*/
   Summon = 9,
   /**死亡单位*/
   Die = 10,
   /**HP最高的目标 */
   MOST_HP = 11,
}

/**行为目标类型 */
// export enum BehaviorTargetType {
//    /**当前范围内，所有单位 */
//    ALL_TARGET = 1,
//    /**当前范围内，HP百分比最低的目标 */
//    LOWEST_HP_PERCENTAGE,
//    /**当前范围内，HP低于一定百分比的目标 */
//    LESS_THEN_HP_PERCENTAGE,
// }

/**目标阵营 @see table.battle.BehaviorConfig.targetFaction*/
export enum TargetFaction {
   /**敌方 */
   EnemySide = 1,
   /**友方 */
   OurSide = 2,
   /**双方 （暂不支持，不了解什么情况下会用到） */
   Both = 3
}

/**范围类型 BehaviorConfig rangeType */
export enum BehaviorRangeType {
   /**施法者自身 */
   SELF = 1,
   /**技能原目标 @see TargetType*/
   SKILL_TARGET = 2,
   /**施法者中心圆形范围*/
   SELF_CIRCLE = 3,
   /**目标中心圆形范围*/
   TARGET_CIRCLE = 4,
   /**施法者起点，长方形范围*/
   SELF_RECTANGLE = 5,
   /**目标起点，长方形范围*/
   TRAGET_RECTANGLE = 6,
   /**施法者中心，扇形范围*/
   SELF_ARC = 7,
   /**目标起点，扇形范围*/
   TRAGET_ARC = 8,
   /**点对象*/
   TRAGET_POINT = 9,
   /**自身到目标点的矩形范围*/
   SELF_TRAGET_RECTANGLE_POINT = 10,
   /**施法者起点，长方形范围，按自身角度*/
   SELF_RECTANGLE_ANGEL = 11,
   /**按施法者的当前坐标的偏移坐标*/
   SELF_XY = 12,
   /**按施法者的当前坐标的偏移坐标*/
   SELF_RECTANGLE_And_RECTANGLE = 13,
   /**施法者起点，按点目标的角度的长方形范围*/
   SELF_RECTANGLE_ANGLE = 14,
   /**自身范围的1个随机点*/
   SELF_RANDOM_POINT = 15,
}


/**子弹类型*/
export enum MissileType {
   /**直线指定目标，碰撞后销毁 */
   STRAIGHT_SPECIFY = 1,
   /**直线型非指定目标，碰撞后销毁 */
   STRAIGHT_COLLISION,
   /**直线上的穿透所有的单位 */
   STRAIGHT_ALL,
   /**散射型，各自碰撞后各自销毁 */
   ARC_COLLISION,
   /**弧形，以子弹来源为中心，从起始角度旋转一定角度后销毁 */
}

/**buff目标 @see table.battle.BuffConfig.targetType */
export enum BuffTargetType {
   /**buff持有者 */
   Owner = 1,
   /**buff施法者 */
   Caster,
}

/**召唤物类型 */
export enum SummomType {
   /**不可以被检索 */
   NO_BE_SEARCH = 0,
   /**可以被检索 */
   BE_SEARCH,
}

/**Buff生效条件 */
export enum BuffConditionType {
   /**立即生效 */
   NOW = 1,
   /**每隔一段时间产生效果（条件参数配置生效间隔） */
   TIME_INTERVAL,
   /** Buff持有者处于移动状态 */
   MOVING,
   /**Buff持有者处于冲锋状态 */
   RUSH,
   /**Buff持续时间结束 */
   TIME_END,
   /**Buff持有者是指定召唤物（条件参数配置召唤物id） */
   SUMMON
}

export enum AbnormalType {
   /***无法行动和隐身 */
   disappear = -1,
   /**压制（强制位移，无法行动） */
   suppress = 1,
   /**眩晕（无法行动） */
   dizziness = 3,
   /**石化（无法行动） */
   petrifaction = 4,
   /**仇恨最低 */
   lowHatred = 5,
   /**不给选中 */
   notSelect = 6,
   /***无法移动 */
   NotMove = 8,
   /***无法攻击 */
   NotAttack = 9,
   /***无敌 */
   Invincible = 10,
   /***无法被强制位移 */
   StopForceMove = 11,
   /***霸体 */
   ImmuneControl = 12,
   /***沉默 */
   Silent = 14,
   /***时间静止 */
   TimeStop = 19,
   /***无法复活 */
   Perish = 20,
   /**冰冻（无法行动） */
   frost = 22,
}

/***扩展技能类型 */
export enum ExSkillType {
   /***队长技 */
   LeaderSkill = 1,
   /***收藏品 */
   Collect = 2,
}

/***队长技能触发枚举 */
export enum LeaderSkillTriggerType {
   /***时间触发 */
   Time = 0,
   /***子弹数达到触发 */
   Bullet = 1,
   /***伤害达到队伍攻击力触发 */
   Damage = 2,
   /***移动达到一定触发 */
   Move = 3,
   /***敌方近战人数 */
   EnemyNum = 4,
   /***单位受到致命伤 */
   FatalWound = 5,
   /***非召唤单位少于一定血量触发 */
   Hurt = 6,
   /***技能释放次数 */
   SkillNum = 7,
}

/***被动技能枚举 */
export enum PassivitySkillType {
   /**添加时触发 */
   ConType_1 = 1,
   /**技能释放前 */
   ConType_2 = 2,
   /**受到伤害后 */
   ConType_3 = 3,
   /**造成伤害后 */
   ConType_4 = 4,
   /**进入战斗后 */
   ConType_5 = 5,
   /**一定时间触发一次 */
   ConType_6 = 6,
   /**被动技能触发后 */
   ConType_7 = 7,
   /**对目标添加BUFF组后对释放BUFF者进行触发 */
   ConType_8 = 8,
   /**技能释放完毕 */
   ConType_9 = 9,
   /**采集一个物体后 */
   ConType_10 = 10,
   /**队友死亡前*/
   ConType_11 = 11,
   /**移动累计时长*/
   ConType_12 = 12,
   /**队友被添加异常后（主要是BUFF表的abnormalType字段不为空的BUFF被添加）*/
   ConType_13 = 13,
   /**受到致命伤害时*/
   ConType_14 = 14,
   /**敌方有人死亡时*/
   ConType_15 = 15,
   /**每射出N发子弹触发*/
   ConType_16 = 16,
   /**暴击时*/
   ConType_17 = 17,
   /**格挡*/
   ConType_18 = 18,
   /**受到累计伤害*/
   ConType_19 = 19,
   /**技能行为被触发时*/
   ConType_20 = 20,
   /**移动距离累计*/
   ConType_21 = 21,
   /**闪避时*/
   ConType_22 = 22,
   /**技能结束N次时触发(正常结束，打断不算)*/
   ConType_23 = 23,
   /**有目标被添加光环首次被触发后*/
   ConType_24 = 24,
   /**格挡N次后触发*/
   ConType_25 = 25,
   /**治疗目标后*/
   ConType_26 = 26,
   /**一定时间后触发，判断附近的敌人是否小于等于个数*/
   ConType_27 = 27,
   /**一定时间后触发，判断附近的敌人是否大于等于个数*/
   ConType_28 = 28,
   /**技能行为被触发前*/
   ConType_29 = 29,
   /**收到对方行为触发前*/
   ConType_30 = 30,
   /**击杀数量达到N时触发*/
   ConType_31 = 31,
   /**Hp变动*/
   ConType_32 = 32,
   /**受到致命伤害时免疫伤害*/
   ConType_33 = 33,
   /**每次攻击时（根据攻击的伤害行为，假若多个目标也只会触发1次，被动4是每个目标都触发1次）*/
   ConType_34 = 34,
   /**助攻数量达到N时触发*/
   ConType_35 = 35,
   /**双方HP有变动时*/
   ConType_36 = 36,
}

/***被动技能的状态枚举 */
export enum PassivitySkillStatusType {
   /***自身生命在X以下 */
   StatusType_1 = 1,
   /***目标生命在X以下 */
   StatusType_2 = 2,
   /***概率 */
   StatusType_3 = 3,
   /***队伍总血量在X以上 */
   StatusType_4 = 4,
}

/***BUFF枚举 */
export enum BuffType {
   /***属性增益 */
   Attr = "attr",
   /***抵抗属性增益 假如是负数的话，对应的属性+回对应的值，最大到0*/
   ResistAttr = "resistAttr",
   /***替换BUFF的效果参数 */
   ChangeBuff = "changeBuff",
   /***驱散Buff类型 */
   Dispel = "dispel",
   /***驱散BuffID */
   DispelId = "dispelId",
   /***驱散AbnormalType */
   DispelAbnormalType = "dispelAbnormalType",
   /***dispelAbnormalType2:和dispelAbnormalType一样，但不会移除当前身上的buff只会驱散添加的buff */
   DispelAbnormalType2 = "dispelAbnormalType2",
   /***添加BUFF */
   AddBuff = "addBuff",
   /***更新前置CD */
   PreCd = "preCd",
   /***对某个技能释放时增加属性 */
   SkillAttr = "skillAttr",
   /***更改某个BUFF的持续时间 */
   ChangeBuffTime = "changeBuffTime",
   /***更改某个BUFF的层数 */
   ChangeBuffLayer = "changeBuffLayer",
   /***更新普通CD的最大值 */
   UpdateCdMax = "updateCdMax",
   /***减少普通CD的当前值 */
   UpdateCd = "updateCd",
   /***对某技能位置必定暴击 */
   CritSkill = "critSkill",
   /***秒杀 */
   Kill = "kill",
   /***伤害 */
   Hurt = "hurt",
   /***真实伤害 */
   RealHurt = "realHurt",
   /***根据最大生命值恢复 */
   HealMax = "healMax",
   /***根据释放范围内的buffid的分组的数量，增加hurtBuff的伤害系数 */
   BuffNumSkill = "buffNumSkill",
   /***异常表 type:7 仇恨最低 */
   Abnormal = "abnormal",
   /***复活时间减少最大值的百分多少 */
   ReviveTime = "reviveTime",
   /***按达到层数爆炸 */
   BoomLayerBuff = "boomLayer",
   /***光环伤害 */
   HaloHurt = "haloHurt",
   /***光环伤害（按最大生命值扣血） */
   HaloMaxHurt = "haloMaxHurt",
   /***按攻击力百分比的护盾 */
   ShieldAtk = "shieldAtk",
   /***是否能受攻速影响 */
   SkillBeAtkSpeed = "skillBeAtkSpeed",
   /***异常伤害，type异常类型，伤害系数 */
   AbnormalHurt = "abnormalHurt",
   /***更改skillindex下的技能增伤,为amount */
   SkillAmount = "skillAmount",
   /***增加skillindex下的技能增伤,amount */
   AddSkillAmount = "addSkillAmount",
   /***为目标附近的目标持续添加BUFF */
   HaloBuff = "haloBuff",
   /***复制BUFF */
   CopyBuff = "copyBuff",
   /***标记型buff，type zhende鼓舞 */
   FlagBuff = "flagBuff",
   /***关羽的战意BUFF，按层数显示对应的特效 */
   ZhanYi = "zhanyi",
   /***按释放者最大生命值的护盾,结束按剩余护盾值造成范围伤害 */
   ShieldMaxHp = "shieldMaxHp",
   /***按目标最大生命值的护盾*/
   ShieldTargetMaxHpBuff = "shieldTargetMaxHp",
   /***增加攻击距离 */
   AtkDis = "atkDis",
   /***增加索敌范围 */
   SearchRange = "searchRange",
   /***减少总时间的百分比 */
   UpdateCdPercent = "updateCdPercent",
   /***减少前置CD的毫秒数 */
   PreCd2 = "preCd2",
   /***减少前置CD的毫秒数，会记录起来，处理被重置为0覆盖的问题 */
   PreCd3 = "preCd3",
   /***按攻击距离增伤，min:最小距离  实际距离-min的值*amount增伤值万分比 */
   AtkDisDamage = "atkDisDamage",
   /***反伤，受到对方攻击时，不处理防御反伤一定的amount万分比 */
   CounterAttack = "counterattack",
   /***猝死：额外吸收本次心脏称重50%的伤害值，在此之前单位受到的治疗需要先填充到此伤害中 */
   SuddenDeath = "suddenDeath",
   /***对指定伤害类型增伤 */
   AddHurtByType = "addHurtByType",
   /***子弹射程加成 */
   MissileDis = "missileDis",
   /***type:[1,8,9,13,14];amount:1000; */
   AddHurtByAbnormal = "addHurtByAbnormal",
   /***有一定概率(rand万分比)额外发射(num)发子弹，每个子弹相隔(interval)毫秒 */
   DoubleMissile = "doubleMissile",
   /***changeAttr:某个属性超过value的每1点转化为属性 */
   ChangeAttr = "changeAttr",
   /***移动速度按时间递减 */
   MoveSpeed = "moveSpeed",
   /***根据攻速频率造成伤害 */
   HaloHurtByAtkTime = "haloHurtByAtkTime",
   /***按移动速度增伤，  实际加成速度的值*amount增伤值万分比 */
   MoveSpeedDamage = "moveSpeedDamage",
   /***按移动速度增加伤害减免，  实际加成速度的值*amount增伤值万分比 */
   MoveSpeedDamageRes = "moveSpeedDamageRes",
   /***免疫暴击且成功后添加1个BUFF */
   ImmuneCritical = "immuneCritical",
   /***根据当前已损失生命值造成伤害 */
   HurtCutHp = "hurtCutHp",
   /***根据当前生命值造成伤害 */
   HurtNowHp = "hurtNowHp",
   /***根据飞行单位类型增伤 */
   FlyAddHurt = "flyAddHurt",
   /***根据单位类型增伤,amount,类型types:[1,2,3] */
   UnitTypeAddHurt = "unitTypeAddHurt",
   /***所有伤害改成真实伤害 */
   ChangeReal = "changeReal",
   /***添加被动 */
   PushPassivity = "pushPassivity",
   /***添加被动标签 */
   AddPassivityFlag = "addPassivityFlag",
   /***添加BUFF的时间 */
   AddBuffTime = "addBuffTime",
   /***嘲讽 */
   Ridicule = "ridicule",
   /***移动时会收到攻击 */
   MoveHurt = "moveHurt",
   /***束缚，不能行动，而且要被队友打破束缚的血量才行 */
   Tie = "tie",
   /***对远程或近战减伤 */
   RangedMeleeDamage = "rangedMeleeDamage",
   /***BUFF伤害增伤 */
   BuffAddDamage = "buffAddDamage",
   /***施法者治疗对方时，判断对方血量小于等于hp万分比则提升amount*/
   HealHpAmount = "healHpAmount",
   /***对指定治疗类型增伤 */
   AddHealByType = "addHealByType",
   /***守护BUFF，被攻击者的伤害的amount由施法者承受，假如有多个，则平均 */
   Guard = "guard",
   /***免疫某种技能的子类型 */
   NotHurtBySkillSubType = "notHurtBySkillSubType",
   /***特效 */
   Effect = "effect",
   /***普通护盾 */
   Shield = "shield",
   /***治疗溢出转护盾 */
   HealToShield = "healToShield",
   /***元素递归BUFF */
   ElementRecursion = "elementRecursion",
   /***添加光环 */
   Halo = "halo",
   /***复活 */
   Revive = "revive",
   /***获取额外增伤*/
   OtherAddHurt = "otherAddHurt",
   /**禁止某个类型的治疗 */
   CannotHeal = "cannotHeal",
   /**扣掉某属性的值，增加某属性的值 */
   AttrToAttr = "attrToAttr",
   /**增加施法者type对应的值属性的百分比amount*/
   AttrValue = "attrValue",
   /**目标往施法者身上拉扯的牵引BUFF，dis是他们之间的最大距离*/
   Tow = "tow",
   /**攻击的时候会受到伤害，type:1 施法者的最大生命值，的amount skillIndex:0 普攻，不填则所有攻击*/
   AtkByHurt = "atkByHurt",
   /**增加目标光环的Amount属性，halo是光环的分组ID，addAmount增加的值*/
   AddHaloAmount = "addHaloAmount",
   /**A拥有对B造成伤害时的增伤amount*/
   ToTargetAddHurt = "toTargetAddHurt",
   /**A用对B造成伤害时的减伤amount*/
   ToTargetSubHurt = "toTargetSubHurt",
   /**牵引BUFF*/
   Pull = "pull",
   /**为其他英雄承伤amount，并且在time秒后平均扣除，每次刷新秒数重置*/
   DelayGuard = "delayGuard",
   /**某个技能攻击时回血*/
   HurtToHeal = "hurtToHeal",
   /**toTargetSubHurtByBuff:存在某个BUFF(buff)攻击BUFF携带者时减伤amount*/
   ToTargetSubHurtByBuff = "toTargetSubHurtByBuff",
   /**魅惑只能使用某个技能打自己人*/
   Charm = "charm",
   /**某个技能无效，释放不出来*/
   InvalidSkill = "invalidSkill",
   /**随机在buffs里找1个buff添加*/
   RandomBuff = "randomBuff",
   /**增加护盾时，存在的话增加额外的护盾值*/
   AddShield = "addShield",
   /***触发1个行为 */
   Behavior = "behavior",
   /***amount,job对相同职业增伤 */
   JobAddDamage = "jobAddDamage",
   /***移动解除超时触发行为behavior，dis移动的像素 */
   MoveRemoveBuff = "moveRemoveBuff",
   /*** amount ;career:[3,4];attackRange:RANGED */
   ConditionAddDamage = "conditionAddDamage",
   /***受到技能栏位增伤skillIndex;amount:1000; */
   AddHurtBySkill = "addHurtBySkill",
   /***禁止使用某个技能槽位skillIndex（数组）的技能 */
   ProhibitSkills = "prohibitSkills",
}

/***BUFFGruop标签枚举 */
export enum BuffGroupFlagType {
   /***关羽的武圣形态 */
   GuanYu = 1,
   /***赫娅的变身形态 */
   HeYa = 2,
   /***恶灵的变身形态 */
   ELing = 3,
   /***马尔斯的防御形态 */
   MeRsI = 4,
   /***战争之影下1招范围攻击 */
   ZhanZhengZhiYing = 5,
   /***维拉大招形态 */
   WeiLa = 6,
   /***阿努比斯缩小 */
   ANuBiSi = 7,
   /***格鲁特大招形态 */
   GeLuTe = 8,
   /***关羽的战意 */
   GuanYuZhanYi = 9,
   /***星爵元素印记 */
   XingJue = 10,
   /***毒液附身 */
   DuYe = 11,
   /***无头骑士骷髅头状态 */
   WuTouQiShi = 12,
   /***荒熊变身形态 */
   HuangXiong = 13,
}

/***被动技能标记 */
export enum PassivitySkillFlag {
   /***跳跳骑手钩锁对过近的目标和不能位移的目标造成额外20%伤害 */
   P5240_p101 = "5240_p101",
   /***跳跳骑手钩锁对命中目标附加流血效果 */
   P5240_p104 = "5240_p104",
   /***火蝠获得护盾时，额外提升自身15%攻击力*/
   P2110_p101 = "2110_p101",
   /***吞噬万物每吸附一个目标则提升本次技能伤害3%*/
   P3240_p101 = "3240_p101",
   /***吞噬万物每吸附一个目标则降低吞噬万物0.5s冷却时间*/
   P3240_p104 = "3240_p104",
   /***贞德红旗下获得霸体*/
   P5210_p104 = "5210_p104",
   /***武圣形态下使用青龙斩时消耗当前所有战意每层战意使本次伤害提升10%，且本次攻击享受战意的暴击率加成*/
   P2310_p104 = "2310_p104",
   /***深海吟唱可以移动中进行释放和引导*/
   P6330_s203 = "6330_s203",
   /***夜莺弹幕时刻每秒子弹数量额外增加2颗*/
   P4230_p101 = "4230_p101",
   /***夜莺普攻攻概会额外多发射3颗子弹*/
   P4230_s203 = "4230_s203",
   /***路西法的左轮手枪有着已被固定的攻击速度，每超出上限1%攻速会转化为1%攻击力*/
   P4340_s201 = "4340_s201",
   /***重骑是否能移动攻击，且移动改冲锋动作*/
   PRider_Collision_s01 = "Rider_Collision_s01",
   /***移动时按移速增加BUFF*/
   PMoveSpeedDamage = "MoveSpeedDamage",
   /***其他英雄是否能移动攻击*/
   PMove_Attack_s01 = "Move_Attack_s01",
   /***全队英雄释放引导技能期间自身获得霸体效果*/
   PSkill_ImmuneControl = "Skill_ImmuneControl",
   /***释放猩红莲花后玛莲妮亚进入觉醒状态持续8秒，获得额外30%生命上限和10%吸血*/
   P1120_p104 = "1120_p104",
   /***释放猩红莲花后玛莲妮亚可进入觉醒状态*/
   P1120_s203 = "1120_s203",
   /***炼金瓶和元素瓶之间会发生相互反应【红+绿=禁疗3秒】【蓝+绿=禁锢2秒】*/
   P3210_s203 = "3210_s203",
   /***相邻的两个炼金瓶之间会相互反应【红+红=爆炸立即造成↙220%伤害】【蓝+蓝=玛丽居里增加自身20%攻速持续3秒】【红+蓝=召唤小软持续作战6秒，继承居里50%属性】*/
   P3210_p101 = "3210_p101",
   /***元素瓶30%概率变成紫瓶【紫瓶：对区域敌人附加附加镭元素造成持续的真实伤害累计↙100%】【红+紫=眩晕1.5秒】【蓝+紫=降低30%防御持续3秒】*/
   P3210_p104 = "3210_p104",
   /***玛丽居里专属，3技能可以移动攻击且能正常发动其他技能*/
   P3210_x101 = "3210_x101",
   /**收刀状态时的首次攻击会快速冲向敌人并拔刀攻击造成↙300%伤害**/
   P2230_p101 = "2230_p101",
   /**进入红剑状态后恶灵获得与自身闪避率相等的暴击率，且每次闪避可延长0.5秒红剑状态**/
   P2230_x101 = "2230_x101",
   /**战场中每个自己召唤的恶魔会为自己提供3%攻击力和最大生命值加成
    * 地狱之门有30%概率替换为召唤2只精英恶魔：继承莉莉丝60%基础属性，普攻替换为火球【远程指向型单体攻击，有子弹直线弹道；造成200%伤害】**/
   P3140_p101 = "3140_p101",
   /**地狱烈焰释放时每覆盖一个己方恶魔则降低地狱之门1秒冷却时间，每个恶魔阵亡都会降低地狱烈焰2秒冷却时间**/
   P3140_x101 = "3140_x101",
   /**石化射击石化敌人概率提升至30%**/
   P4240_p101 = "4240_p101",
   /**多头蛇射击增加20%概率造成石化效果**/
   P4240_p104 = "4240_p104",
   /**石化中的单位额外降低20%伤害减免**/
   P4240_x101 = "4240_x101",
   /**丘比特救赎获得额外1层充能**/
   P6220_x101 = "6220_x101",
   /**多重射击可以在复仇箭雨期间进行释放**/
   P4310_s203 = "4310_s203",
   /**复仇箭雨期间维拉每次参与击杀都会延长复仇箭雨的持续时间，怪物：0.5秒，精英/boss怪物：2秒，英雄：5秒**/
   P4310_x101 = "4310_x101",
   /**哮天犬变成觉醒形态获得霸体和额外20%伤害减免**/
   P2220_p104 = "2220_p104",
   /**哮天犬获得100%额外血量，并获得嘲讽技能【嘲讽：强制当前目标攻击自己持续3秒】；杀戮命令只攻击到一个敌人时造成额外50%伤害**/
   P2220_x101 = "2220_x101",
   /**宙斯引导神罚时进入不可选中状态，神罚命中单位越少伤害越高，最多提升200%**/
   P3320_x101 = "3320_x101",
   /**深海吟唱溢出的治疗量会外以100%转化为真实伤害均摊给附近敌人**/
   P6330_x101 = "6330_x101",
   /**午时已到锁定的敌人不足3时，依然会射出3发子弹在已锁定的目标内随机分配**/
   P4340_x101 = "4340_x101",
   /**挥砍和青龙斩有概率触发1次额外连击，可重复触发**/
   P2310_x101 = "2310_x101",
   /**海姆达尔会根据免疫敌方技能伤害的次数为下次星界驱驰加成，每次增加额外30%伤害**/
   P5220_x101 = "5220_x101",
   /**能量脉冲的数量增加至4，且冰冻其中1个目标**/
   P4120_x101 = "4120_x101",
   /**当格鲁特被击败时，只队伍中还有其他成员存活，则格鲁特会进入再生状态10秒后格鲁特再生并恢复自身50%最大生命值**/
   P1141_p101 = "1141_p101",
   /**星空男爵的元素枪可以随机制造并操纵四种古老的元素作为子弹：【土：伤害提升至↙100%】【水：降低目标20%防御持续5秒】【火：附加灼烧效果】【气：造成真实伤害】**/
   P4311_s201 = "4311_s201",
   /**期间每打出一次元素递归效果，则延长爆能洗礼0.5秒时间**/
   P4311_s305 = "4311_s305",
   /**元素子弹命中敌人后会产生对应的元素印记，当四种元素同时存在后会产生元素递归效果【元素递归：元素爆炸对目标造成↙150%伤害，并将4个元素分别传给附近的随机单位】**/
   P4311_p101 = "4311_p101",
   /**每次元素递归会为我方随机1个远程单位附加元素护盾【元素护盾：增加星空男爵↙30%的护盾持续5秒，护盾持续期间会额外增加20%攻速】**/
   P4311_x101 = "4311_x101",
   /***钢铁战甲激活能量脉冲系统，使钢铁英雄释放普攻时有概率追加额外1颗子弹；钢铁英雄在STK女团编组中时攻速额外增加10%*/
   P4330_p101 = "4330_p101",
   /***泰坦反应炉持续释放能量供给钢铁战甲作战，使穿透激光变为扫射激光可击中更多的敌人*/
   P4330_x101 = "4330_x101",
   /***毒毒的攻击形式变得更有序，通常按照锤剪布依次循环*/
   P1340_s305 = "1340_s305",
   /***寄生状态时宿主会获得毒毒30%的攻击和防御属性加成*/
   P1340_p104 = "1340_p104",
   /***寄生状态时毒液大招CD-5*/
   P1340_x101 = "1340_x101",
   /***灾难狂欢降临时，目标身上每有一种负面效果则使受到灾难狂欢的伤害增加5%,单场战斗中第3次灾难狂欢会获得强化，对击中目标额外造成10%沃尔特最大生命值的真实伤害*/
   P6110_p101 = "6110_p101",
   /***灾难狂欢转移异常状态的数量会为自己增加对应层数的宴会时间【宴会时间：每层宴会时间会使下次放血疗法的攻击目标增加1】并且使放血疗法可对同一单位叠加使用*/
   P6110_x101 = "6110_x101",
   /***托尔大招首次攻击跳跃*/
   P2222_x103 = "2222_x103",
   /***波塞冬死亡则当前的海神宝珠立即爆炸*/
   P3220_s203 = "3220_s203",
   /***海神宝珠爆炸需要的总伤害降低至全员总攻击力的550%,波塞冬死亡则当前的海神宝珠立即爆炸*/
   P3220_p101 = "3220_p101",
   /***海神宝珠变为活化海灵，爆炸前作为召唤物与波塞冬一起作战*/
   P3220_x101 = "3220_x101",
   /***诺娃在非战斗状态时会进入隐形状态，进入战斗后解除隐形状态并获得30%额外攻击力加成持续10秒*/
   P4312_p101 = "4312_p101",
   /***诺娃或全息诱饵发起爆头时，另外一个单位也会对其目标追加1次爆头*/
   P4312_p104 = "4312_p104",
   /***野性磁场激活期间普攻变成范围攻击，每次攻击为自己回复击中目标数量x2%的最大生命值*/
   P1230_x101 = "1230_x101",
   /***单次战斗中，触发过不屈以后的肉身炮弹将会每次砸地都造成眩晕效果*/
   P2240_x101 = "2240_x101",
   /***单次战斗中，触发过不屈以后的肉身炮弹将会每次砸地都造成眩晕效果*/
   P2240_x102 = "2240_x102",
   /***孙悟空的劈棍有概率更换为其他的棍法招式；【戳棍：攻击面前小范围扇形区域造成↙200%伤害】【转棍：攻击自身周围中等范围圆形区域造成↙150%伤害】*/
   P2430_s201 = "2430_s201",
   /***使具有蜂蜜效果的单位对抗具有蜂毒效果单位时额外拥有15%伤害减免*/
   P3230_x101 = "3230_x101",
   /***使用心灵控制后洛基会幻形一次此英雄，每次幻形洛基都会获得此英雄10%攻防血属性加成*/
   P3321_x101 = "3321_x101",
   /***紫薯精获得可以随心操控无限拳套的力量，破灭响指释放期间赋予己方队友可以自由行动的能力*/
   P3440_x101 = "3440_x101",
}

/***其他技能分类 */
export enum OtherPassivitySkillFlag {
   Camp = 1,
   Career = 2,
}

/***光环枚举 */
export enum HaloType {
   /***属性增益 */
   Attr = "attr",
   /***伤害 */
   Hurt = "hurt",
   /*** 一定时间后生效，触发1次伤害后移除 */
   ContactBoom = "contactBoom",
   /*** 添加BUFF */
   AddBuff = "addBuff",
   /*** 治疗 */
   Heal = "heal",
   /*** 治疗 */
   HealMaxHp = "healMaxHp",
   /***免疫某种技能的子类型 */
   NotHurtBySkillSubType = "notHurtBySkillSubType",
   /***增加skillindex下的技能增伤,amount */
   AddSkillAmount = "addSkillAmount",
   /***队伍伤害 */
   TeamHurt = "teamHurt",
   /***禁锢，进入后的目标不能走出当前范围 */
   Imprisonment = "imprisonment",
   /***锁血目标血量不会小于等于amount的值  */
   LockingBlood = "lockingBlood",

}

/***怪物标签 */
export enum MonsterFlag {
   Normal = 0,
   /***隐身怪 */
   Hide = 1,
}