import * as fgui from "fairygui-cc";


/** 好友页面基类 */
export class FriendBasePage extends fgui.GComponent {

    //界面是否需要刷新
    public refreshDirty: boolean = true
    public lastRefreshTime: number = 0
    public maxRefreshTime: number = 20000

    constructor() {
        super();
    }

    protected onEnable(): void {
        this.checkAndUpdateUI()
    }

    /**设置操作按钮是否可用*/
    protected setOperBtnEnabled(btn: fgui.GButton, isEnabled:boolean):void {
        btn.grayed = !isEnabled
        btn.enabled = isEnabled
    }

    public checkAndUpdateUI(): void {
        if (this.refreshDirty || Date.now() - this.lastRefreshTime >= this.maxRefreshTime) {
            this.updateUI()
            this.refreshDirty = false
        }
    }

    public updateUI(): void {
        this.lastRefreshTime = Date.now()
    }

    public clearView():void {

    }
}