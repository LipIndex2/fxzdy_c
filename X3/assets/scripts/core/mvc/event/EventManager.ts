import { log, warn } from "cc";
import BaseSingleton from "../../base/BaseSingleton";

class EventData {
    public event!: string;
    public listener!: (event: string, args: any) => void;
    public obj: any;
}

export default class EventManager extends BaseSingleton {
    private events: any = {};
    /**
     * 注册全局事件
     * @param event(string)      事件名
     * @param listener(function) 处理事件的侦听器函数
     * @param thisObj(object)    侦听函数绑定的this对象
     */
    on(event: string, listener: (event: string, args: any) => void, thisObj: object) {
        if (!event || !listener) {
            warn(`注册【${event}】事件的侦听器函数为空`);
            return;
        }

        let list: Array<EventData> = this.events[event];
        if (list == null) {
            list = [];
            this.events[event] = list;
        }

        let length = list.length;
        for (let i = 0; i < length; i++) {
            let bin = list[i];
            if (bin.listener == listener && bin.obj == thisObj) {
                warn(`名为【${event}】的事件重复注册侦听器`);
                return;
            }
        }

        let data: EventData = new EventData();
        data.event = event;
        data.listener = listener;
        data.obj = thisObj;
        list.push(data);
    }

    /**
     * 监听一次事件，事件响应后，该监听自动移除
     * @param event 
     * @param listener 
     * @param thisObj 
     */
    once(event: string, listener: (event: string, args: any) => void, thisObj: object) {
        let _listener: any = ($event: string, $args: any) => {
            this.off(event, _listener, thisObj);
            _listener = null;
            listener.call(thisObj, $event, $args);
        }
        this.on(event, _listener, thisObj);
    }

    /**
     * 移除全局事件
     * @param event(string)      事件名
     * @param listener(function) 处理事件的侦听器函数
     * @param thisObj(object)    侦听函数绑定的this对象
     */
    off(event: string, listener: Function, thisObj: object) {
        let list: Array<EventData> = this.events[event];
        if (!list) {
            log(`名为【${event}】的事件不存在`);
            return;
        }
        let length = list.length;
        for (let i = 0; i < length; i++) {
            let bin: EventData = list[i];
            if (bin.listener == listener && bin.obj == thisObj) {
                list.splice(i, 1);
                break;
            }
        }
        if (list.length == 0) {
            delete this.events[event];
        }
    }

    offAll(thisObj: object) {
        let events = this.events;
        for (let event in events) {
            let list: Array<EventData> = event[event];
            for (let i: number = list.length - 1; i >= 0; --i) {
                let data: EventData = list[i];
                if (data.obj == thisObj) {
                    list.splice(i, 1);
                }
            }
        }
    }

    /** 
     * 触发全局事件 
     * @param event(string)      事件名
     * @param arg(any)           事件参数
     */
    dispatchEvent(event: string, arg: any = null) {
        let list: Array<EventData> = this.events[event];
        if (list != null) {
            let temp: Array<EventData> = list.concat();
            let length = temp.length;
            for (let i = 0; i < length; i++) {
                let eventBin = temp[i];
                eventBin.listener.call(eventBin.obj, event, arg);
            }
        }
    }
}