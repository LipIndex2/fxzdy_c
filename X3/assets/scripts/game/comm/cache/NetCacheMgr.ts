import BaseSingleton from "../../../core/base/BaseSingleton";

/**
 * 网络接口缓存管理
 */
export class NetCacheMgr extends BaseSingleton {
    private _cacheMap = {};
    private _cacheTime = {};

    /**
     * 转换关键字
     */
    public static toKey(...args) {
        let str = "";
        for (let i = 0; i < args.length; i++) {
            if (args[i].toString) {
                str += args[i].toString();
            } else {
                str += JSON.stringify(args[i]);
            }
        }
        return str;
    }

    /**清理缓存 */
    public clean(key: string) {
        if (this._cacheMap[key]) {
            delete this._cacheMap[key];
            delete this._cacheTime[key];
        }
    }

    /**
     * 存缓存数据 (如果出入数据已是缓存，则不存储)
     * @param key 关键字
     * @param cache 缓存内容
     */
    public save(key: string, cache: object): void {
        if (this._cacheMap[key] !== cache) {
            this._cacheMap[key] = cache;
            this._cacheTime[key] = Date.now();
        }
    }

    /**
     * 取缓存数据 （数据超时则未空）
     * @param key 关键字
     * @param overtime 超时时间ms （默认2分钟）
     * @returns 缓存内容  返回null则超时需刷新数据
     */
    public get(key: string, overtime: number = 120000) {
        if (this._cacheMap[key] && this._cacheTime[key] + overtime > Date.now()) {
            return this._cacheMap[key];
        }
        return null;
    }
}
