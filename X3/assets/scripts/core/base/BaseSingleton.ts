import { Constructor } from "cc";

/**
 * 泛型单例
 * ps： 一般各个 Manager 继承用
 */
export default class BaseSingleton {

    /**
     * lazy singleton
     */
    static ins<T extends any>(this: Constructor<T>): T {
        if (!(<any>this)._ins) {
            (<any>this)._ins = new this();
            (<any>this)._ins.onInit()
        }
        return (<any>this)._ins;
    }

    /**
     * 一般用不到, 调用需谨慎
     */
    static destroy(): void {
        if ((<any>this)._ins) {
            (<any>this)._ins.onDestroy();
            (<any>this)._ins = null;
        }
    }

    // 初始化时
    protected onInit(): void {
    };


    protected onDestroy(): void {
    };
}