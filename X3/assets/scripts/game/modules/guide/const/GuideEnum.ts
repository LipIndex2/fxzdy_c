/** 触发引导类型 || 完成引导类型 */
export enum GuideVerifyType {
    /** 达到等级 */
    LEVEL = "LEVEL",
    /** 触发器 */
    TRIGGER = "TRIGGER",
    /** 打开 或 关闭某个界面 */
    VIEW = "VIEW",
    /** 道具 */
    HAS_ITEM = "HAS_ITEM",
    /** 解锁建筑 */
    UNLOCK_BUILDING = "UNLOCK_BUILDING",
    /** 进入某个地图 */
    ENTER_WORLD = "ENTER_WORLD",
    /** 完成（领取奖励）某个任务 */
    TASK = "TASK",
    /** 点击某个按钮 */
    BUTTON = "BUTTON",
    /** 靠近（激活）某个建筑 */
    ENTER_BUILDING = "ENTER_BUILDING",
    /** 通关挂机关卡 */
    PASS_STAGE = "PASS_STAGE",
    /** 功能开启 */
    OPEN_FUNCTION = "OPEN_FUNCTION",
}

/** 引导类型 */
export enum GuideType {
    /** 剧情对话教学 （其他类型也能触发）
     * @see table.guide.GuideConfig.plotId */
    PLOT = "PLOT",
    /** 指引到达某个点 */
    FOCUS_POS = "FOCUS_POS",
    /** 箭头定位某个点 */
    ARROW_POS = "ARROW_POS",
    /** 延迟 */
    DELAY = "DELAY",
    /** 点击 */
    TOUCH = "TOUCH",
    /**纯等待完成 */
    WAIT = "WAIT",
    /**刷怪 */
    CREATE_MONSTER = "CREATE_MONSTER",
}

/** 剧情类型 */
export enum GuidePlotType {
    /**强对话框 */
    DIALOG = "dialog",
    /**自动对话框 */
    TIPS = "tips",
    /**自动对话框(黑色) */
    TIPS_BLACK = "tips_black",
    /**教学 */
    TEACH = "teach",
}
