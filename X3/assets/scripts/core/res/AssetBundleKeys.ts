export const AssetBundleNameByRoot = {
    // 默认
    default: "resources",
    login: "resources",
    ui: "resources",
    effect: "resources",

    image: "resources2",
    audio: "resources2",
    video: "resources2",

    spine: "resources3",
    spriteFrame: "resources3",
    map: "resources3",
}

/**
 * Bundle 统一名字
 */
export enum AssetBundleKeys {

    // 默认
    DEFAULT = "resources",

    /**login */
    LOGIN = "resources",

    /**ui资源 */
    UI = "resources",

    /**材质 */
    EFFECT = "resources",

    /**image文件夹资源 */
    IMAGE = "resources2",

    /**音频 */
    AUDIO = "resources2",

    /**音频 */
    VIDEO = "resources2",

    /** spine */
    SPINE = "resources3",

    /**序列帧 */
    SPRITE_FRAME = "resources3",

    /**地图 */
    MAP = "resources3",
}

export function getBundleNameByUrl(url: string): string {
    let dirName = url.substring(0, url.indexOf("/"));
    let key = AssetBundleNameByRoot[dirName];

    return key || AssetBundleNameByRoot.default;
}