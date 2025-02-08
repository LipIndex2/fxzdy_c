import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";

/** 自动弹框基类 */
export class AutoPopBaseContext implements INotification {
    protected _isRegister: boolean = false;

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    constructor() {
        setTimeout(() => {
            this.onInit();
        }, 10);
    }

    protected onAutoPopDataChange(): void {
        FacadeManager.ins().emit(NotificationKey.AUTO_POP_CHANGE);
    }

    protected onInit(): void {
        if (this._isRegister == false) {
            this._isRegister = true;
            FacadeManager.ins().registerNotification(this);
        }
    }

    public onDestroy(): void {
        FacadeManager.ins().removeNotification(this);
    }

    /**检测弹框处理 返回true代表有弹窗*/
    public checkPopNext(): boolean {
        return false;
    }
}
