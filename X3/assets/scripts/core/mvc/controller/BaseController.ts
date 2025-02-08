import { BaseNotification } from './../BaseNotification';



/**
 * MVC Controller
 * 用于实现页面跳转前的一些逻辑
 * 一个模块如果没有什么复杂的逻辑，则不需要提供Controller，直接使用ViewManager打开页面就可以了
 */
export abstract class BaseController extends BaseNotification {

    static ins<T extends {}>(this: new () => T): T {
        if (!(<any>this)._ins) {
            (<any>this)._ins = new this();
        }
        return (<any>this)._ins;
    }

    static destroy(): void {
        if ((<any>this)._ins) {
            (<any>this)._ins.onDestroy();
            (<any>this)._ins = null;
        }
    }

    /**初始化 */
    doInit() {
        setTimeout(() => {
            this.addNotification();
            this.onInit();
        }, 10);
    }

    /**子类重写 */
    onInit() {
    }

    onDestroy(): void {
        super.onDestroy();
        this.removeNotification();
    };
}