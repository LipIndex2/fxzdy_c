import { sys } from "cc";
import { DEBUG } from "cc/env"

export class DebugUtils {

    /**
     * Debug + 浏览器模式
     */
    static isDebugAndInBrowser(): boolean {
        return DEBUG && sys.isBrowser;
    }

    /**
     * 是否发布模式
     * - 针对 App
     */
    static isReleaseMode(): boolean {
        return !this.isDebugMode();
    }


    static isDebugMode(): boolean {
        return DEBUG;
    }

    /**
     * 检查是否启用了游戏管理员（GM）模式。
     * @returns 如果启用了DEBUG模式或者window对象中存在gmEnable属性，则返回true，否则返回false。
     */
    static isEnableGM(): boolean {
        return DEBUG || window["gmEnable"];
    }

}