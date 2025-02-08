/** 英雄固定属性（HeroConfig） */
export enum AttrType {
    /** 攻击 */
    Attack = 1,
    /** 血量 */
    Blood = 2,
    /** 防御 */
    Defense = 3,
}

/** 属性类型（一二级属性） */
export enum AttributeType {
    /** 面板属性 */
    PANEL_ATTR = 1,
    /** 二级属性 */
    SECONDARY_ATTR = 2,
}

/** 所有属性（AttributeConfig 的 id */
export enum Attribute {
    /** 攻击 */
    ATK = "ATK",
    /** 血量 */
    HP = "HP",
    /** 防御 */
    DEF = "DEF",
    /** 攻击% */
    ATK_BONUS = "ATK_BONUS",
    /** 防御% */
    DEF_BONUS = "DEF_BONUS",
    /** 生命% */
    HP_BONUS = "HP_BONUS",
    /** 额外攻击 */
    ATK_ADD = "ATK_ADD",
    /** 额外防御 */
    DEF_ADD = "DEF_ADD",
    /** 额外生命 */
    HP_ADD = "HP_ADD",

    /** 闪避率 */
    DOD_RATE = "DOD_RATE",
    /** 命中率 */
    DOD_RES = "DOD_RES",
    /** 暴击率 */
    CRI_RATE = "CRI_RATE",
    /** 暴击伤害 */
    CRI_DMG = "CRI_DMG",
    /** 暴击伤害减少 */
    CRI_DMG_DEC = "CRI_DMG_DEC",
    /** 抗暴率 */
    CRI_RES = "CRI_RES",
    /** 格挡率 */
    BLK_RATE = "BLK_RATE",
    /** 格挡伤害 */
    BLK_DMG = "BLK_DMG",
    /** 格挡伤害减少 */
    BLK_DMG_DEC = "BLK_DMG_DEC",
    /** 抗格挡率 */
    BLK_RES = "BLK_RES",
    /** 伤害增加 */
    DMG_INC = "DMG_INC",
    /** 伤害减免 */
    DMG_RES = "DMG_RES",
    /** 移动速度 */
    MOVE_SPD = "MOVE_SPD",
    /** 攻击速度 */
    ATK_SPD = "ATK_SPD",
    /** 攻击范围 */
    ATK_RNG = "ATK_RNG",
    /** 冷却缩减 */
    CDR = "CDR",
    /** 攻击增加 */
    ATK_INC = "ATK_INC",
    /** 防御增加 */
    DEF_INC = "DEF_INC",
    /** 生命（上限）增加 */
    HP_INC = "HP_INC",
    /** 攻击降低 */
    ATK_DEC = "ATK_DEC",
    /** 防御降低（破甲） */
    DEF_DEC = "DEF_DEC",
    /** 生命（上限）降低 */
    HP_DEC = "HP_DEC",
    /** 效果命中 */
    EFF_RATE = "EFF_RATE",
    /** 效果抗性（韧性） */
    EFF_RES = "EFF_RES",
    /** 吸血 */
    LIFE_STEAL = "LIFE_STEAL",
    /** 反伤 */
    REFLECT_DMG = "REFLECT_DMG",
    /** 穿甲 */
    ARP = "ARP",
    /** 治愈率 */
    HL_INC = "HL_INC",
    /** 减疗 */
    HR_DEC = "HR_DEC",
    /** 受愈 */
    HR_INC = "HR_INC",
    /** 普攻增伤 */
    BAD_INC = "BAD_INC",
    /** 技能增伤*/
    SD_INC = "SD_INC",
    /** 减前置冷却（未实现） */
    PCDR = "PCDR",
    /** 破甲抵抗 */
    ARP_RES = "ARP_RES",
    /** 普攻减伤 */
    BAD_RES = "BAD_RES",
    /** 技能减伤 */
    SD_RES = "SD_RES",
    /** 远程防御 */
    RNG_DEF = "RNG_DEF",
    /** 近战防御 */
    ML_DEF = "ML_DEF",
    /** 异常强化 */
    HR_IDOT_INCNC = "HR_IDOT_INCNC",
    /** 异常抗性 */
    DOT_RES = "DOT_RES",
    /** 对人族伤害提升 */
    T_DMG_INC = "T_DMG_INC",
    /** 来自人族伤害降低 */
    T_DMG_RES = "T_DMG_RES",
    /** 对神裔伤害提升 */
    P_DMG_INC = "P_DMG_INC",
    /** 来自神裔伤害降低 */
    P_DMG_RES = "P_DMG_RES",
    /** 对智械伤害提升 */
    M_DMG_INC = "M_DMG_INC",
    /** 来自智械伤害降低 */
    M_DMG_RES = "M_DMG_RES",
    /** 对异魔伤害提升 */
    S_DMG_INC = "S_DMG_INC",
    /** 来自异魔伤害降低 */
    S_DMG_RES = "S_DMG_RES",
    /** 范围伤害减免 */
    RANGE_DMG_RES = "RANGE_DMG_RES",
    /** 效果强化 */
    EFF_INC = "EFF_INC",
    /** PVP伤害提升 */
    PVP_DMG_INC = "PVP_DMG_INC",
    /** PVP伤害减免 */
    PVP_DMG_RES = "PVP_DMG_RES",
    /** 额外攻击修正 */
    ATK_ADD_MOD = "ATK_ADD_MOD",
    /** 额外防御修正 */
    DEF_ADD_MOD = "DEF_ADD_MOD",
    /** 额外生命修正 */
    HP_ADD_MOD = "HP_ADD_MOD",
    /** * 星灵增伤 */
    PET_DMG_INC = "PET_DMG_INC",
    /** * 远程增伤 */
    RNG_DMG_INC = "RNG_DMG_INC",
    /** * 近战增伤 */
    ML_DMG_INC = "ML_DMG_INC",
    /** * 远程减伤 */
    RNG_DMG_RES = "RNG_DMG_RES",
    /** * 近战减伤 */
    ML_DMG_RES = "ML_DMG_RES",
    /** * 射击增伤 */
    MM_DMG_INC = "MM_DMG_INC",
    /** * 射击减伤 */
    MM_DMG_RES = "MM_DMG_RES",
    /** * 异能增伤 */
    MG_DMG_INC = "MG_DMG_INC",
    /** * 异能减伤 */
    MG_DMG_RES = "MG_DMG_RES",
    /** * 重骑增伤 */
    RD_DMG_INC = "RD_DMG_INC",
    /** * 重骑减伤 */
    RD_DMG_RES = "RD_DMG_RES",
    /** * 格斗增伤 */
    FT_DMG_INC = "FT_DMG_INC",
    /** * 格斗减伤 */
    FT_DMG_RES = "FT_DMG_RES",
}
