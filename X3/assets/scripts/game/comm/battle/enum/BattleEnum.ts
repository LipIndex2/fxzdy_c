/**
 * 世界单位分类
 */
export enum WorldUnitTeam {
   // 玩家的己方队伍
   Self = 1,
   // 敌方队伍
   Enemy,
}

export enum UnitType {
   /**资源刷新点 (非实体单位，仅用于数据刷新)*/
   ResourcePoint = -1,
   /**未定义的Unit */
   Unknow = 0,
   /**角色 */
   Actor,
   /**子弹 */
   Bullet,
   /**队伍 */
   Team,
   /**英雄 */
   Hero,
   /**怪物 */
   Monster,
   /**Boss */
   Boss,
   /**材料 */
   Mineral,
   /**建筑 */
   Building,
   /**NPC */
   NPC,
   /**队长技能 */
   LeaderSkill,
   /**掉落 */
   Drop,
   /**其他技能 */
   OtherSkill,
   /**宠物 */
   Pet,
   /**收藏品技能 */
   CollectSkill,
}

export enum BulletType {
   /**普通子弹（必中目标单位） */
   NormalBullet = 1,
   /**跟踪子弹 （跟随目标单位）*/
   SmartBullet,
   /**物理子弹 （碰撞）*/
   PhysicalBullet,
   /**炸弹 （无弹道） */
   Bomb,
   /**前方矩形范围弹道*/
   Rectangle,
   /**抛物线弹道*/
   Throw,
   /**拉伸弹道*/
   Stretch,
   /**弹射弹道*/
   Bounce,
   /**闪电链*/
   StretchBounceBullet,
   /**火箭弹*/
   Rocket,
   /**持续的直线矩形子弹(激光)*/
   LoopRectangle,
   /***穿透子弹 */
   ThroughBullet,
   /***回旋子弹 */
   ConvoluteBullet,
   /**持续的旋转矩形子弹(激光)*/
   LoopRotateRectangle,
   /**追着目标的抛物线弹道*/
   ThrowTarget,
   /**陨石弹道*/
   Meteorite,
}

export enum LeaderSkillype {
   /**无人机轰炸 */
   WuRenJi = "30001",
   /**歼灭激光 */
   JianMieJiGuang = "30002",
   /**女神祈福 */
   NvShenQiFu = "30004",
   /**静滞结界 */
   JingZhiJieJie = "30005",
   /**天降爆虫 */
   BaoChong = "30006",
   /**反震能量场 */
   FanZhenNengLiangChang = "30007",
}

export enum CollectSkillype {
   /**海拉之冠 */
   HaiLaZhiGuan = "SCP_20001",
   /**阿斯加德之巅 */
   ASiJiaDeZhiDian = "SCP_20002",
   /**无限手套 */
   WuXianShouTao = "SCP_30001",
}

export enum ActorState {
   None = 0,
   /**闲置 */
   Idle = 1,
   /**移动 */
   Running,
   /**攻击 */
   Attack,
   /**起手式 施法 吟唱 （前置硬直 被控可打断）*/
   Casting,
   /**技能施法中 （持续伤害）*/
   SKilling,
   /**移动中攻击 */
   RunAttack,
   /**眩晕 */
   Vertigo,
   /**采集 （矿 树 气）*/
   Collect,
   /**受击 */
   Hurt,
   /**死亡 */
   Die,
   /**安全 （城中）*/
   Safe,
}

/**方向类型 */
export enum DirctionType {
   Left = -1,
   Rigth = 1,
}


/**位置类型 */
export enum SeatType {
   Front = 1,
   Middle,
   Rear
}


export enum HurtNumType {
   /***普通伤害 */
   Hurt = 1,
   /***技能伤害 */
   Skill,
   /***暴击普通伤害 */
   CirtNormalHurt,
   /***治疗 */
   Heal,
   /***护盾 */
   ShieldNum,
   /***真实伤害 */
   RealHurtNum,
   /***暴击技能伤害 */
   CirtHurt,
   /***暴击真实伤害 */
   CirtRealHurtNum,
   /***属性增益 */
   AttrUp,
   /***属性减益 */
   AttrDown,
   /***异常状态 */
   Abnormal,
   Material,
   Exp,
   /***其他飘字 */
   Other,
}

export enum DropType {
   wood = 1,
   mine,
   meat,
}

/**配置怪物类型 */
export enum MonsterType {
   Boss = "BOSS",
   /**小怪 */
   Monster = "NORMAL",
   /**精英 */
   Elite = "ELITE",
}