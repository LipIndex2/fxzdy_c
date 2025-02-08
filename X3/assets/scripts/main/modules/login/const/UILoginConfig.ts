export enum UILoginKey {
   LOGIN_PAGE = "LOGIN_PAGE",
   LOGIN_PROGRESS_WIN = "LOGIN_PROGRESS_WIN",
   ACCOUNT_WIN = "ACCOUNT_WIN",
   AGE_TIPS_WIN = "AGE_TIPS_WIN",
   LOGIN_CONFIRM_VIEW = "LOGIN_CONFIRM_VIEW",
}

export interface LoginConfirmViewOpenArgs {
   /**标题*/
   title: string,
   /**取消 (不设置 则为 仅可确认弹窗)*/
   // titleCancel?: string,
   /**确认*/
   titleConfirm: string,
   /**内容*/
   content: string,
   /**点击确认回调*/
   onBtnYes: Function
   /**关闭回调*/
   // closeCb?: Function
   /**是否可以点击背景关闭 在没有取消按钮的情况下*/
   canCloseByBg?: boolean
}