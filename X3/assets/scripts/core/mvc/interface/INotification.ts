/**
 * EventListener API
 * 监听 event 的规范
 */
export interface INotification {
    
    /**
     * 子类必须实现这个函数，然后返回这个类监听的事件名称
     * 相当于注册事件
     * 
     * @return eventName | null = 不关心任何事件
     */
    listenNotifications(): string[] | null;

    /**
     * 子类必现实现这个函数。
     * 如果有事件触发时，会调用这个函数，并且你可以通过判断不同的事件名称在这里实现你子类的逻辑
     * 相当于触发事件时的处理函数
     * 
     * @param eventName 事件名称
     * @param args 自定义的事件参数
     */
    notificationHandler(eventName: string, args?: any): void;
}