/** 引导 */
export enum UIGuideConfig {
    /** 引导主界面 */
    GUIDE_MAIN_VIEW = "GUIDE_MAIN_VIEW",

    /**下方对话 */
    GuideDialogView = "GuideDialogView",

    /**上方对话 （自动播放）*/
    GuideDialogSmallView = "GuideDialogSmallView",

    /**教学*/
    GuideTeachView = "GuideTeachView",

    /**创建引导怪物 */
    GuideCreateMonsterView = "GuideCreateMonsterView",


    /**引导专用传送 */
    TransferAnimByGuideWin = "TransferAnimByGuideWin",


    /**教学*/
    GuideWeakTouchView = "GuideWeakTouchView",

}

/**点击弱引导参数 */
export interface GuideWeakTouchArgs {
    /**
     * 目标界面key
     */
    viewName: string;

    /**
     * 组件名
     * 如：列表倒数 item.list.-1
     */
    itemName: string;
}