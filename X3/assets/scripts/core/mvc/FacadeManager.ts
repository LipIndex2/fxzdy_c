import { game } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import { LinkTableArray } from "../utils/LinkTableArray";
import { INotification } from "./interface/INotification";
import EventManager from "./event/EventManager";
import { GameTimer } from "../timer/GameTimer";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { DEBUG } from "cc/env";

/**
 * MVC管理器
 */
export default class FacadeManager extends BaseSingleton {

    private waitToSendEvent: LinkTableArray = new LinkTableArray();


    constructor() {
        super();
    }

    public registerByName(name: string, instance: INotification): void {
        EventManager.ins().on(name, instance.notificationHandler, instance);
    }

    public registerByNames(names: string[], instance: INotification): void {
        if (!names?.length) return;
        for (let i = 0; i < names.length; i++) {
            EventManager.ins().on(names[i], instance.notificationHandler, instance);
        }
    }

    public removeByName(name: string, instance: INotification) {
        EventManager.ins().off(name, instance.notificationHandler, instance);
    }

    public removeByNames(names: string[], instance: INotification) {
        if (!names?.length) return;
        for (let i = 0; i < names.length; i++) {
            EventManager.ins().off(names[i], instance.notificationHandler, instance);
        }
    }

    /**
     * 注册全局事件对象，则这个对象就可以监听全局事件了
     * @param instance
     */
    public registerNotification(instance: INotification): void {
        //if (instance.isAdd)
        //    return;
        //instance.isAdd = true;

        // 使用 Set 去重
        let events: Array<string> = instance.listenNotifications();
        if (events && events.length > 0) {
            const uniqueEvents = new Set(events);

            for (const event of uniqueEvents) {
                if (!event) {
                    continue;
                }
                this.registerByName(event, instance);
            }
        }

    }

    /**
     * 移除这个实例上所有的监听的事件
     * @param instance
     */
    public removeNotification(instance: INotification): void {
        let events: Array<string> = instance.listenNotifications();
        let count = events && events.length;
        if (count) {
            for (let i: number = 0; i < count; ++i) {
                this.removeByName(events[i], instance);
            }
        }
    }

    /**
     * 异步触发
     * 触发指定的事件，进行全局调用。会调用用BaseNotification.handleNotification
     * @param name 事件名称
     * @param arg 自定义的参数
     */
    public emit(name: string, arg?: any): void {
        if (DEBUG) {
            // debug 模式下打印事件
            if (this.isLogEventNameInDebugMode(name)) {
                Logger.debug(arg, `send event. eventName = ${name}, arg = `);
            }
        }
        // 实现分帧处理所有的事件
        this.waitToSendEvent.push({ name, arg });
        //this.emitNext();
        GameTimer.ins().callLater(this, this.emitNext);
    }

    /**
     * 马上触发
     * 不进行分帧的触发，立马执行监听的地方
     * 非必要请用emit
     * @param name
     * @param arg
     */
    public emitNow(name: string, arg?: any): void {
        EventManager.ins().dispatchEvent(name, arg);
    }

    private emitNext(): void {
        while (this.waitToSendEvent.count > 0) {
            let event = this.waitToSendEvent.shift(); //先进先出
            EventManager.ins().dispatchEvent(event.name, event.arg);
            //todo
            //if (game.totalTime - game.frameStartTime > 16) {
            //Logger.warn("事件处理消耗大于一帧，请检查逻辑是否比较复杂：" + event);
            //}
            if (game.totalTime - game.frameStartTime > 33) {
                GameTimer.ins().callLater(this, this.emitNext);
                break;
            }
        }
    }

    private isLogEventNameInDebugMode(name: string) {
        // 部分 event 太高频，不打印
        return name != "MAP_TEAN_POS_UPDATE" && name != "BATTLE_SKILL_CD_UPDATE" && name != "BATTLE_HP_CHANGED" && name != "BATTLE_USE_SKILL_COMPLETE";
    }
}

window["FacadeManager"] = FacadeManager;