export interface IBtnConfirmViewOnceTodayOpenArgs {
    /**标题*/
    title?: string;
    /**取消 (不设置 则为 仅可确认弹窗)*/
    titleCancel?: string;
    /**确认*/
    titleConfirm: string;
    /**内容*/
    content: string;
    /** 勾选框文本 */
    lbTip?: string;
    /**本地记录的key值*/
    localKey: string;
    /**点击确认回调*/
    onClickConfirm: () => void;
    /**点击取消回调*/
    onClickCancel?: () => void;

    /** 勾选回调 */
    onSelectedFun?: () => void;
}
