import BaseSingleton from "../base/BaseSingleton";
import { Logger } from "../log/Logger";
import { IResource } from "./IResource";
import { IResRef } from "./IResRef";

/**
 * 资源管理器
 * ps: 这个 ResManager 的概念是 AssetReleaseManager 的概念
 * 目的:
 * 1. 自动 gc 释放 cocos 的 asset
 */
export class ResManager extends BaseSingleton {

    /**
     * 资源保留长时间GC（秒）
     */
    static GC_TIME: number = 40;

    /**
     * 自动清理
     */
    static AUTO_GC: boolean = true;

    /**
     * 资源
     */
    protected _resMap: Map<string, IResource> = new Map<string, IResource>();

    /**
     * 无主资源
     * 只会清理无主资源
     * 根据引用变化，会被加入/移除
     */
    protected _ownerlessResMap: Map<string, IResource> = new Map<string, IResource>();

    /**
     * 引用
     */
    protected _refMap: Map<string, IResRef[]> = new Map<string, IResRef[]>();


    /**运行时间, 单位 second */
    private _curTime: number = 0;
    /**gc间隔时间秒 */
    private _autoGCInterval: number = 10;
    /**下次gc时间*/
    private _nextGCTime: number = 0;

    /**每帧释放上限 */
    private _perFrameDestroyMax = 3;

    reset() {
        this._curTime = 0;
        this._resMap.clear();
    }

    onUpdate(dt: number): void {
        this._curTime += dt;
        if (ResManager.AUTO_GC && this._nextGCTime < this._curTime) {
            this.gc();
        }
    }

    addRes(res: IResource): void {
        if (this._resMap.has(res.url2key)) {
            throw new Error("重复添加资源！");
        }
        this._resMap.set(res.url2key, res);
        res.lastOpTime = this._curTime;

        if (!this._ownerlessResMap.get(res.url2key)) {
            this._ownerlessResMap.set(res.url2key, res);
        }
    }

    hasRes(key: string): boolean {
        return this._resMap.has(key);
    }

    getRes(key: string): IResource {
        return this._resMap.get(key);
    }

    /**加入引用组 */
    private addRefGroup(ref: IResRef) {
        let refKey = ref.refKey;
        if (refKey) {
            let refs = this._refMap.get(refKey);
            if (!refs) {
                refs = [];
                this._refMap.set(refKey, refs);
            }
            refs.push(ref);
        }
    }

    /**移出引用组 */
    private removeRefGroup(ref: IResRef) {
        let refKey = ref.refKey;
        if (ref.refKey) {
            let refs = this._refMap.get(ref.refKey);
            if (refs) {
                let index: number = refs.indexOf(ref);
                refs.splice(index, 1);
                if (!refs.length) {
                    this._refMap.delete(refKey);
                }
            }
        }
    }

    /**增加引用 */
    addRef(ref: IResRef) {
        if (!this._resMap.has(ref.url2key)) {
            console.error("未找到资源：" + ref.url2key);
            return;
        }
        let res: IResource = this._resMap.get(ref.url2key);
        res.addRef(ref);
        res.lastOpTime = this._curTime;

        this.addRefGroup(ref);

        if (this._ownerlessResMap.get(res.url2key)) {
            this._ownerlessResMap.delete(res.url2key);
        }
    }

    /**删除引用 */
    removeRef(ref: IResRef): boolean {
        if (!this._resMap.has(ref.url2key)) {
            console.error("未找到资源：" + ref.url2key);
            return;
        }
        this.removeRefGroup(ref);

        let res: IResource = this._resMap.get(ref.url2key);
        res.removeRef(ref);
        res.lastOpTime = this._curTime;

        if (!res.forever && !res.refLength) {
            this._ownerlessResMap.set(res.url2key, res);
        }
    }

    /**
     * 回收
     * 无主资源
     */
    gc(ignoreTime?: boolean) {
        let currentTime: number = this._curTime;
        if (this._ownerlessResMap.size) {
            Logger.system("res " + this._ownerlessResMap.size + " / " + this._resMap.size);
            let destroyCount = 0;
            for (let [url2Key, res] of this._ownerlessResMap) {
                if (res.refLength) {
                    this._ownerlessResMap.delete(url2Key);
                    continue;
                }
                if (ignoreTime || currentTime - res.lastOpTime > ResManager.GC_TIME) {//超过允许的时间就回收
                    this.destroyRes(res);
                    if (++destroyCount >= this._perFrameDestroyMax) {
                        return; //下帧继续
                    }
                }
            }
        }

        this._nextGCTime = currentTime + this._autoGCInterval;
    }

    /**
     * 销毁
     * @param {IResource} res  
     */
    protected destroyRes(res: IResource): void {
        Logger.system("destroyRes " + res.url2key);
        this._resMap.delete(res.url2key);
        this._ownerlessResMap.delete(res.url2key);
        res.destroy();
    }

    /**资源列表 */
    get resList(): Array<IResource> {
        return Array.from(this._resMap.values());
    }


    /**清理引用组资源
     * @param refKey 引用key
     */
    disposeRefGroupByRefKey(refKey: string) {
        let refs = this._refMap.get(refKey);
        if (refs) {
            for (let i = 0; i < refs.length; i++) {
                this.removeRef(refs[i]);
            }
        }
    }
}

window["ResManager"] = ResManager;