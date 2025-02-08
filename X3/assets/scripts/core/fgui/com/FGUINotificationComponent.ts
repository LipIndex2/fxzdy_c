import * as fgui from "fairygui-cc";
import { INotification } from "../../mvc/interface/INotification";
import FacadeManager from "../../mvc/FacadeManager";

/**带注册通知的fgui组件 */
export default class FGUINotificationComponent extends fgui.GComponent implements INotification {
    /**
     * 该对象是否添加到事件管理器中
     */
    public isAddNoti: boolean = false;

    listenNotifications(): string[] | null {
        return;
    }
    notificationHandler(eventName: string, args?: any): void {
    }

    protected addNotification() {
        if (!this.isAddNoti) {
            this.isAddNoti = true;
            FacadeManager.ins().registerNotification(this);
        }
    }

    protected removeNotification() {
        if (this.isAddNoti) {
            this.isAddNoti = false;
            FacadeManager.ins().removeNotification(this);
        }
    }

    protected onConstruct() {
        super.onConstruct();
        this.addNotification();
    }

    public dispose(): void {
        super.dispose();
        this.removeNotification();
    }
}
