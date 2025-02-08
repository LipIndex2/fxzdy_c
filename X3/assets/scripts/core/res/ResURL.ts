import { Asset, SpriteFrame, Texture2D, js } from "cc";


/**
 * 请求资源类型
 * 如： { url: assetName, bundle: bundleName, type: Asset}
 */
export type ResURL = { 
    url: string, 
    bundle?: string, 
    type?: string | typeof Asset 
} | string;

/**
 * 资源地址转唯一KEY
 * @param url 
 * @returns 
 */
export function url2Key(url: ResURL): string {
    return ResURLUtils.url2Key(url);
}

/**
 * 唯一key转URL
 * @param key 
 * @returns 
 */
export function key2URL(key: string): ResURL {
    return ResURLUtils.key2Url(key);
}

/**
 * 获取全路径
 * @param url 
 * @returns 
 */
export function fullURL(url: ResURL): string {
    if (typeof url == "string") {
        return url;
    }
    if (url.type == Texture2D) {
        return url.url + "/texture";
    }
    if (url.type == SpriteFrame) {
        return url.url + "/spriteFrame"
    }
    return url.url;
}

class ResURLUtils {

    /**
     * 获取全路径
     * @param url 
     * @returns 
     */
    static _getURL(key: string): string {
        let len: number = key.length;
        let end: number = len - 8;
        //texture
        let t = key.substring(end);
        if (t === "/texture") {
            return key.substring(0, end);
        }
        //spriteFrame
        end = len - 12;
        t = key.substring(end);
        if (t === "/spriteFrame") {
            return key.substring(0, end);
        }
        return key;
    }

    /**
     * 唯一key转URL
     * @param key 
     * @returns 
     */
    static key2Url(key: string): ResURL {
        if (key.indexOf("|")) {
            let arr: Array<string> = key.split("|");
            let type: typeof Asset = js.getClassByName(arr[2]) as any;
            return { url: this._getURL(arr[0]), bundle: arr[1], type: type };
        }
        return key;
    }

    /**
     * 资源地址转唯一KEY
     * @param url 
     * @returns 
     */
    static url2Key(url: ResURL): string {
        if (url == null || url == undefined) {
            return "";
        }
        if (typeof url == "string") {
            return url;
        }
        if (!url.type) {
            url.type = Asset;
        }
        if (!url.bundle) {
            url.bundle = "resources";
        }
        let clsName = js.getClassName(url.type);
        if (url.type == SpriteFrame) {
            return url.url + "/spriteFrame" + "|" + url.bundle + "|" + clsName;
        }
        if (url.type == Texture2D) {
            return url.url + "/texture" + "|" + url.bundle + "|" + clsName;
        }
        return url.url + "|" + url.bundle + "|" + clsName;
    }
}