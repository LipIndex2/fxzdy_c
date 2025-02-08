
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
/**
 * 属性枚举
 * 
 * @see ServerEnums.AttributeType
 */
export enum AttrEnum {
    /**攻击*/
    ATK = 1,
    /**防御*/
    DEF,
    /**生命*/
    HP,
    /**攻击%*/
    ATK_BONUS,
    /**防御%*/
    DEF_BONUS,
    /**生命%*/
    HP_BONUS,
    /**额外攻击*/
    ATK_ADD,
    /**额外防御*/
    DEF_ADD,
    /**额外生命*/
    HP_ADD,
    /**闪避率*/
    DOD_RATE,
    /**命中率*/
    DOD_RES,
    /**暴击率*/
    CRI_RATE,
    /**暴击伤害*/
    CRI_DMG,
    /**暴击伤害减少*/
    CRI_DMG_DEC,
    /**抗暴率*/
    CRI_RES,
    /**格挡率*/
    BLK_RATE,
    /**格挡伤害*/
    BLK_DMG,
    /**格挡伤害减少*/
    BLK_DMG_DEC,
    /**抗格挡率*/
    BLK_RES,
    /**伤害增加*/
    DMG_INC,
    /**伤害减免*/
    DMG_RES,
    /**移动速度*/
    MOVE_SPD,
    /**攻击速度%*/
    ATK_SPD,
    /**攻击范围*/
    ATK_RNG,
    /**冷却缩减*/
    CDR,
    /**攻击增加*/
    ATK_INC,
    /**防御增加*/
    DEF_INC,
    /**生命（上限）增加*/
    HP_INC,
    /**攻击降低*/
    ATK_DEC,
    /**防御降低（破甲）*/
    DEF_DEC,
    /**生命（上限）降低*/
    HP_DEC,
    /**效果命中*/
    EFF_RATE,
    /**效果抗性（韧性）*/
    EFF_RES,
    /**吸血*/
    LIFE_STEAL,
    /**反伤*/
    REFLECT_DMG,
    /** 穿甲 */
    ARP,
    /** 治愈率 */
    HL_INC,
    /** 减疗 */
    HR_DEC,
    /** 受愈 */
    HR_INC,
    /** 普攻增伤（未实现） */
    BAD_INC,
    /** 技能增伤（未实现） */
    SD_INC,
    /** 减前置冷却（未实现） */
    PCDR,
    /** 破甲抵抗 */
    ARP_RES,
    /** 普攻减伤 */
    BAD_RES,
    /** 技能减伤 */
    SD_RES,
    /** 远程防御 */
    RNG_DEF,
    /** 近战防御 */
    ML_DEF,
    /** 异常强化 */
    HR_IDOT_INCNC,
    /** 异常抗性 */
    DOT_RES,
    /** 对人族伤害提升 */
    T_DMG_INC,
    /** 来自人族伤害降低 */
    T_DMG_RES,
    /** 对神裔伤害提升 */
    P_DMG_INC,
    /** 来自神裔伤害降低 */
    P_DMG_RES,
    /** 对智械伤害提升 */
    M_DMG_INC,
    /** 来自智械伤害降低 */
    M_DMG_RES,
    /** 对异魔伤害提升 */
    S_DMG_INC,
    /** 来自异魔伤害降低 */
    S_DMG_RES,
    /** 范围伤害减免 */
    RANGE_DMG_RES,
    /** 效果强化 */
    EFF_INC,
    /** PVP伤害提升 */
    PVP_DMG_INC,
    /** PVP伤害减免 */
    PVP_DMG_RES,
    /** 额外攻击修正 */
    ATK_ADD_MOD,
    /** 额外防御修正 */
    DEF_ADD_MOD,
    /** 额外生命修正 */
    HP_ADD_MOD,
    /** * 星灵增伤 */
    PET_DMG_INC,
    /** * 远程增伤 */
    RNG_DMG_INC,
    /** * 近战增伤 */
    ML_DMG_INC,
    /** * 远程减伤 */
    RNG_DMG_RES,
    /** * 近战减伤 */
    ML_DMG_RES,
    /** * 射击增伤 */
    MM_DMG_INC,
    /** * 射击减伤 */
    MM_DMG_RES,
    /** * 异能增伤 */
    MG_DMG_INC,
    /** * 异能减伤 */
    MG_DMG_RES,
    /** * 重骑增伤 */
    RD_DMG_INC,
    /** * 重骑减伤 */
    RD_DMG_RES,
    /** * 格斗增伤 */
    FT_DMG_INC,
    /** * 格斗减伤 */
    FT_DMG_RES,
}





















