/**
 * Enum 红点显示方式
 * -----------
 * 越小的优先度越高
 */
export enum EnumRedDotShowType {
    // 不显示
    NULL = 0,
    // 奖励可领取
    REWARD = 1,
    // 可提升/可培养/可升星--红色
    LV_UP_RED = 2,
    // 强红点
    HIGH = 3,
    // 普通红点
    NORMAL = 4,
    // 可提升/可升级  --绿色
    LV_UP_GREEN = 5,
    // 新获得/新解锁
    NEW = 6,
    // "道具可领取 图标高亮加扫光
    ITEM_HEIGHT_LIGHT = 7,
    // 主城可交互
    MAIN_CITY = 8,
}
