import { Constructor } from "cc";

export class PoolManager {
    private static _perMaxSize = 100;
    private static _curPoolId = 0;
    private static _pool: any = {};
    /**
     * 取出一个对象
     * @param classZ Class
     * @return Object
     */
    public static getItem<T>(classZ: Constructor<T>): T {
        let key;
        if (classZ.hasOwnProperty("__poolId")) {
            key = classZ["__poolId"];
        } else {
            key = classZ["__poolId"] = ++this._curPoolId;
        }
        var list: Array<any> = PoolManager._pool[key];
        if (list?.length) {
            let obj = list.pop();
            obj.poolInit && obj.poolInit();
            return obj;
        } else {
            return new classZ();
        }
    }

    /**
     * 回收对象到对象池中。
     * @param obj 需要回收的对象。
     * @returns 如果对象成功回收到对象池中，返回 true；否则返回 false。
     * 如果对象池不存在或已满，则无法恢复对象。
     * 在恢复对象之前，会调用对象的 onRecovery 方法（如果存在）。
     */
    public static recovery(obj: any): boolean {
        if (obj == null || !obj.constructor?.hasOwnProperty("__poolId")) {
            return false;
        }

        let key = obj.constructor?.__poolId;
        if (!key) {
            return false;
        }
        if (!PoolManager._pool[key]) {
            PoolManager._pool[key] = [];
        }

        if (PoolManager._pool[key].length > this._perMaxSize) {
            return false;
        }

        obj.onRecovery && obj.onRecovery();

        PoolManager._pool[key].push(obj);
        return true;
    }

    /**
     * 清除所有对象
     */
    public static clear(): void {
        PoolManager._pool = {};
    }

    /**
     * 清空某一类对象
     * @param classZ Class
     */
    public static clearClass(classZ: any): void {
        if (classZ.hasOwnProperty("__poolId")) {
            let key = classZ["__poolId"];
            PoolManager._pool[key] = null;
            delete PoolManager._pool[key];
        }
    }
}