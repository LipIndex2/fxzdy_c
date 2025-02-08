import { AssetManager } from "cc";
import * as fgui from "fairygui-cc";
import { FGUIPkgResource } from "./FGUIPkgResource";
import { ResManager } from "../res/ResManager";
import { ResRef } from "../res/ResRef";
import { ResURL, url2Key } from "../res/ResURL";
import { GameTimer } from "../timer/GameTimer";

/**
 * 加载FGUI包的工具函数。
 * @param url - 资源的URL。
 * @param bundle - 资源管理器的Bundle。
 * @param refKey - 资源的引用键。
 * @param progress - 可选参数，加载进度的回调函数。
 * @param cb - 可选参数，加载完成后的回调函数，第一个参数为错误信息，第二个参数为资源引用。
 */
export function FGUIPkgLoader(
    url: ResURL,
    bundle: AssetManager.Bundle,
    refKey: string,
    progress?: (progress: number) => void,
    cb?: (err: Error, resRef: ResRef) => void,
): void {
    if (typeof url === 'string') {
        cb && cb(new Error(url + "类型不正确"), null);
    } else {
        fgui.UIPackage.loadPackage(bundle,
            url.url,
            (finish: number, total: number, item: AssetManager.RequestItem) => {
                if (progress) {
                    progress(finish / total);
                }
            },
            (err: Error, pkg: fgui.UIPackage) => {
                if (err) {
                    cb && cb(err, null);
                    return;
                }
                const urlKey = url2Key(url);

                if (!ResManager.ins().hasRes(urlKey)) {
                    let res = new FGUIPkgResource();
                    res.url2key = urlKey;
                    res.content = pkg;
                    ResManager.ins().addRes(res);
                } else {
                    let res = ResManager.ins().getRes(urlKey);
                    pkg = res.content;
                }

                let ref = ResRef.createRef(pkg, urlKey, refKey);

                cb && cb(null, ref);
            }
        )
    }
}