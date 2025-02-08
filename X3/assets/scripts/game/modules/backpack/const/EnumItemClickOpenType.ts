/**
 * 物品点击打开详情类型
 * @enum {number} 对应 ItemConfig.clickOpenType
 */
export enum EnumItemClickOpenType {

    // 无
    NONE = "none",

    // 小提示框
    SMALL_TIPS = "smallTips",
    
    // 合成用的碎片
    COMPOSE_FRAGMENT = "COMPOSE_FRAGMENT",

    // 标准提示
    Normal_TIPS = "normalTips",

    // 背包使用
    InBag = "inBag",

    // 获取途径面板
    COME_FROM_PANEL = "comeFromPanel",

    // 固定奖励宝箱
    FIXED_BOX_PANEL = "fixedBoxPanel",

    // 自选宝箱
    CHOOSE_BOX_PANEL = "chooseBoxPanel",

    // 预览宝箱奖励
    PREVIEW_BOX_PANEL = "previewBoxPanel",
}