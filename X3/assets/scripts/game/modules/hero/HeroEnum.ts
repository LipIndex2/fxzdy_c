
/** 英雄职业 */
export enum HeroCareerType {
    /** 守护 */
    Guard = 1,
    /** 格斗 */
    Grapple = 2,
    /** 异能 */
    GeneVariant = 3,
    /** 射手 */
    Shooter = 4,
    /** 重骑 */
    HeavyCavalry = 5,
    /** 辅助 */
    Assist = 6,
}

/** 英雄阵营 */
export enum HeroCampType {
    /** 人 */
    Human = 1,
    /** 神 */
    God = 2,
    /** 智械 */
    Robot = 3,
    /** 异魔 */
    ExoticDemons = 4,
}

/** 羁绊类型 */
export enum GroupType {
    CAMP = "CAMP",
    CAREER = "CAREER",
}

/** 英雄筛选列表Key */
export enum HeroSelectKey {
    /** 英雄主界面 */
    HERO = "hero",
    /** 布阵界面 */
    FORMATION = "formation",
}