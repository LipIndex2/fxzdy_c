import FacadeManager from "./FacadeManager";
import { INotification } from "./interface/INotification";

/**
 * 全局事件通知
 * 如果一个类继承了BaseNotification，则这个类就拥有接收全局通知的能力
 */
export class BaseNotification implements INotification {

    private enabled: boolean = true;

    /**
     * 该对象是否添加到事件管理器中
     */
    public isAdd: boolean = false;

    constructor () {
    }

    /**
     * 为了减少频繁的移除和添加操作，直接设置事件是否在可用状态就可以了
     * 这个对应被隐藏，而不是被销毁的对象非常有用
     * @param enabled
     */
    public setEnabled(enabled) {
        this.enabled = enabled;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(event: string, args?: any): void {
    }


    protected addNotification() {
        if (!this.isAdd) {
            this.isAdd = true;
            FacadeManager.ins().registerNotification(this);
        }
    }

    protected removeNotification() {
        if (this.isAdd) {
            this.isAdd = false;
            FacadeManager.ins().removeNotification(this);
        }
    }

    protected onDestroy() {
    }

    /**
     * 发送全局消息-分帧处理
     * @param event 
     */
    protected emit(event: string, arg?: any) {
        FacadeManager.ins().emit(event, arg);
    }

    /**
     * 发送全局消息-立即抛出
     * @param event 
     */
    protected emitNow(event: string, arg?: any) {
        FacadeManager.ins().emitNow(event, arg);
    }
}