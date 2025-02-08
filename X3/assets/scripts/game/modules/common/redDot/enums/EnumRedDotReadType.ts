/**
 * Enum 红点已读方式
 */
export enum EnumRedDotReadType {
// 一次性, 可刷新重算红点
    ONCE = 0,
    // 本次登录不再累计
    LOGIN_ONCE = 1,
    // 本机永久不再累计
    FOREVER = 2,
    // 今日一次
    TODAY_ONCE = 3,

}
