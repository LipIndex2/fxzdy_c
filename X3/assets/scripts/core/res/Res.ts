import { Asset, AssetManager, assetManager } from "cc";
import { ResManager } from "./ResManager";
import { ResRef } from "./ResRef";
import { fullURL, ResURL, url2Key } from "./ResURL";
import { Resource } from "./Resource";
import { Constructor } from "cc";
import { getBundleNameByUrl } from "./AssetBundleKeys";


/**
 * 加载结果 callback
 */
export interface LoadCallback<T> {
    (error: Error | null,
        asset: T,
    ): void;
}


/**
 * 资源加载器
 */
export type ResLoader = (url: ResURL,
    bundle: AssetManager.Bundle,
    refKey: string,
    progress?: (progress: number) => void,
    cb?: (err: Error, resRef: ResRef) => void
) => void;


/**
 * 资源加载
 */
export class Res {

    private static _nameToLoaderMap = new Map<string, ResLoader>();

    static setResLoader(key: string, loader: ResLoader): void {
        this._nameToLoaderMap.set(key, loader);
    }

    static getResLoader(key: string): ResLoader {
        const loader = this._nameToLoaderMap.get(key);
        if (!loader) {
            throw new Error("未注册的加载器：" + key);
        }
        return loader;
    }

    /**
     * (不建议使用，不在资源管理管理，需手动进行引用计算！！！)
     * 加载 Asset Bundle 中的资源的方法 
     * @param bundleName 包名
     * @param assetName 包里面的资产路径。 例如: resources/prefabs/MyPrefab.prefab -> prefabs/MyPrefab.prefab
     * @param assetType 资产类型
     * @param completeCallback 加载完成回调
     * @deprecated
     */
    static load<T extends Asset>(
        bundleName: string = "resources",
        assetName: string,
        assetType: Constructor<T>,
        completeCallback: LoadCallback<T>,
    ): void {
        // this.loadAsset({ url: assetName, bundle: bundleName, type: (assetType as any) }, null, (ref: ResRef) => {
        //     if (!ref) {
        //         console.error(`从资源包 '${bundleName}' 中加载资源 '${assetName}' 失败:`);
        //         completeCallback(new Error("资源加载失败"), null);
        //         return;
        //     }
        //     // 成功加载资源，调用完成回调
        //     completeCallback(null, ref.content as T);
        // });

        // 加载 Asset Bundle
        assetManager.loadBundle(bundleName,
            (err, bundle) => {
                if (err) {
                    console.error(`加载资源包 '${bundleName}' 失败:`, err);
                    completeCallback(err, null);
                    return;
                }

                // 在 Asset Bundle 中加载资源
                bundle.load(assetName,
                    assetType,
                    null,
                    (err, asset: T) => {
                        if (err) {
                            console.error(`从资源包 '${bundleName}' 中加载资源 '${assetName}' 失败:`, err);
                            completeCallback(err, null);
                            return;
                        }

                        // 资源唯一定位
                        // const resKey = `${bundleName}/${assetName}`;
                        // ResManager.ins().addResRef(resKey, null)

                        // 成功加载资源，调用完成回调
                        completeCallback(null, asset);
                    });
            });
    }

    /**
     * 获取资源引用
     * @param url   
     * @param refKey    谁持有该引用
     * @param progress  进度汇报函数
     * @returns
     */
    static getResRef(url: ResURL, refKey: string, complete?: (resRef?: ResRef) => void): void {
        if (Array.isArray(url)) {
            throw new Error("获取资源列表请调用getResRefList或getResRefMap");
        }
        this.loadAsset(url, refKey, complete);
    }

    /**
    * 获取资源引用
    * @param url   
    * @param refKey    谁持有该引用
    * @param progress  进度汇报函数
    * @returns
    */
    static getResRefByUrl(_url: string, bundle?: string, type?: string | typeof Asset, complete?: (resRef?: ResRef) => void): void {
        if (Array.isArray(_url)) {
            throw new Error("获取资源列表请调用getResRefList或getResRefMap");
        }
        let url = { url: _url, bundle: bundle, type: type } as ResURL;

        this.loadAsset(url, bundle, complete);
    }

    /**
    * 获取资源引用组
    * @param urls   资源路径
    * @param refKey    谁持有该引用
    * @param progress  进度汇报函数
    * @returns
    */
    static getResRefByUrls(_urls: string[], bundle?: string, type?: string | typeof Asset, refKey?: string, complete?: (resRef?: ResRef[]) => void): void {
        let urls = _urls.map((_url) => {
            let url = {
                url: _url,
                type: type,
                bundle: bundle,
            } as ResURL;
            return url;
        });

        this.getResRefList(urls, refKey, complete);
    }

    /**
     * 获取资源引用列表
     * @param urls 
     * @param refKey 
     * @param progress 
     * @returns 
     */
    static getResRefList(urls: Array<ResURL>, refKey: string, complete?: (resRefs: ResRef[]) => void): void {
        let resRefs = [];
        let sortMap: { [url2Key: string]: number } = {};
        for (let index = 0; index < urls.length; index++) {
            const url = urls[index];
            let u2Key = url2Key(url);
            sortMap[u2Key] = index;

            this.loadAsset(url, refKey,
                (resRef) => {
                    if (!resRef) {
                        console.error("加载失败:" + u2Key);
                        complete && complete(null); //任一失败 则为失败
                        complete = null;
                        return;
                    }

                    resRefs.push(resRef);
                    if (resRefs.length >= urls.length) {
                        resRefs.sort((a, b) => {
                            return sortMap[a.url2key] - sortMap[b.url2key];
                        });

                        complete && complete(resRefs);
                    }
                });
        }
    }

    /**
     * 获取资源引用字典
     * @param urls 
     * @param refKey 
     * @param result 
     * @param progress 
     * @returns 
     */
    static getResRefMap(urls: Array<ResURL>, refKey: string, result?: Map<string, ResRef>, complete?: (resRefMap: Map<string, ResRef>) => void) {
        result = result || new Map<string, ResRef>();
        this.getResRefList(urls, refKey, (resRefs) => {
            for (let index = 0; index < resRefs.length; index++) {
                const element = resRefs[index];
                result.set(element.url2key, element);
            }
            complete && complete(result);
        });
    }

    /***正在加载的资源 */
    static loadingMap: { [urlKey: string]: boolean } = {}
    /***相同资源正在加载中的等待列表 */
    static waitSameLoadingMap: { [urlKey: string]: { complete?: (resRef: ResRef) => void, refKey: string }[] } = {}
    /**加载资源 */
    private static loadAsset(url: ResURL, refKey: string, complete?: (resRef: ResRef) => void): void {
        if (typeof url == "string") {
            throw new Error("url不能为字符串" + url);
        }

        if (!url.type) url.type = Asset;
        if (!url.bundle) url.bundle = getBundleNameByUrl(url.url); // AssetBundleKeys.DEFAULT;

        const urlKey: string = url2Key(url);
        if (ResManager.ins().hasRes(urlKey)) {//已加载完成
            let res = ResManager.ins().getRes(urlKey);
            let ref = ResRef.createRef(res.content, urlKey, refKey);
            complete(ref);
            return;
        }

        if (this.loadingMap[urlKey]) {
            //正在加载相同资源
            if (!this.waitSameLoadingMap[urlKey])
                this.waitSameLoadingMap[urlKey] = []
            this.waitSameLoadingMap[urlKey].push({ complete: complete, refKey: refKey })
            return
        }

        let bundle = assetManager.getBundle(url.bundle);
        let loader: ResLoader;
        if (!bundle) {
            assetManager.loadBundle(url.bundle, (err: Error, bundle: AssetManager.Bundle) => {
                if (err) {
                    complete(null);
                    return;
                }
                if (typeof url.type == "string") {
                    loader = this.getResLoader(url.type);
                } else {
                    loader = this.defaultAssetLoader;
                }
                loader(url, bundle, refKey, null, (err: Error, resRef: ResRef) => {
                    if (err) {
                        complete(null);
                        return;
                    }
                    complete(resRef);
                });
            });
        } else {
            if (typeof url.type == "string") {
                loader = this.getResLoader(url.type);
            } else {
                loader = this.defaultAssetLoader;
            }
            this.loadingMap[urlKey] = true;
            loader(url, bundle, refKey, null, (err: Error, resRef: ResRef) => {
                if (err) {
                    complete(null);
                    this.onLoadComplete(url);
                    return;
                }
                complete(resRef);
                this.onLoadComplete(url)
            });
        }
    }

    private static onLoadComplete(url: ResURL): void {
        const urlKey: string = url2Key(url);
        delete this.loadingMap[urlKey];
        let list = this.waitSameLoadingMap[urlKey];
        if (list?.length) {
            let newRef: ResRef;
            let res = ResManager.ins().getRes(urlKey);
            for (let i = 0; i < list.length; i++) {
                if (res) {
                    newRef = ResRef.createRef(res.content, res.url2key, list[i].refKey);
                }

                if (list[i].complete)
                    list[i].complete(newRef);

            }
        }
        delete this.waitSameLoadingMap[urlKey];
    }

    /**
     * 默认加载器
     * @param url 
     * @param bundle 
     * @param progress 
     * @param cb 
     */
    static defaultAssetLoader(url: ResURL, bundle: AssetManager.Bundle, refKey: string, progress?: (progress: number) => void, cb?: (err?: Error, resRef?: ResRef) => void): void {
        if (typeof url == "string") {
            throw new Error("url不能为字符串" + url);
        }
        if (typeof url.type == "string") {
            throw new Error("url.type不能为字符串" + url);
        }

        bundle.load(fullURL(url), url.type, progress, (err: Error, asset: Asset) => {
            if (err) {
                cb && cb(err);
                return;
            }
            const urlKey = url2Key(url);
            //如果已经存在
            if (ResManager.ins().hasRes(urlKey)) {
                let res = ResManager.ins().getRes(urlKey);
                let ref = ResRef.createRef(res.content, urlKey, refKey);
                cb && cb(undefined, ref);
                return;
            } else {
                let res: Resource = new Resource();
                res.url2key = urlKey;
                res.content = asset;
                ResManager.ins().addRes(res);
                let ref = ResRef.createRef(res.content, urlKey, refKey);
                cb && cb(undefined, ref);
            }
        });
    }
}