import { SdkManager } from "../sdk/SdkManager";
import { StringUtils } from "../utils/StringUtils";

/**
 * 屏蔽字管理
 */
export class ForbiddenManager {
    /**敏感字库 */
    private static _sensitiveMap: any;

    /**提示匹配效率 */
    private static _chatReplace = [
        "*",
        "**",
        "***",
        "****",
        "*****"
    ];

    /**更新字库 */
    static initWorkMap(obj) {
        this._sensitiveMap = obj;
    }

    /**是否已初始化 */
    static isInited() {
        return !!this._sensitiveMap;
    }

    /**
    *判断字符串是否含有屏蔽词
    * @param str
    * @param index 开发位置
    * @return
    *
    */
    private static _isForbidden(str: string, index: number = 0): boolean {
        if (!str) {
            return false;
        }

        // 记下样本
        let originStr = StringUtils.repBlank(str);
        let result = this._matchSensitive(originStr, index);
        if (result.match === false && result.everMatch === true) {
            originStr = originStr;
            return this._isForbidden(originStr, result.chat + 1);
        } else if (result.match) {
            return true;
        }
        return false;
    }

    /**
     * 异步检查给定字符串是否被禁止。
     * @param str - 需要检查的字符串。
     * @param callback - 回调函数，接收一个字符串参数，如果字符串被禁止则为 null，否则为原字符串。
     */
    static isForbidden(str: string, callback: (str: string | null) => void) {
        if (this._isForbidden(str)) {
            callback && callback(null);
            return;
        }

        SdkManager.ins().checkMsg(str, callback);
    }


    /**
     * 异步检查并替换字符串中的敏感内容。
     * @param str - 需要检查和替换的原始字符串。
     * @param callback - 回调函数，接收处理后的字符串或null（如果发生错误）。
     */
    static replace(str: string, callback: (str: string | null) => void) {
        let newStr = this._replace(str);
        SdkManager.ins().checkMsg(newStr, callback);
    }


    /**
     * 将文字替的敏感词替换。
     * @param str
     * @return
     *
     */
    private static _replace(str: string): string {
        if (!str)
            return "";

        return this._checkAndReplaceWord(str, 0);
    }

    /**
    * 配置词库 (该方法遇到一个匹配进去了，就好跳出，不会连续校验)
    *
    * @param {*} word 要匹配的文本
    * @param {*} start 匹配开始的索引
    * @returns
    * @memberof DFA
    */
    private static _matchSensitive(word: string, start: number) {
        let result = false;
        if (!this._sensitiveMap) {
            return { match: result };
        }
        // 过滤单词
        let nowMap = this._sensitiveMap;
        let matchWord = '';
        let everMatch = false;
        // 首次进入匹配的索引
        let starMatchChat = -1;
        // 记录匹配到了第几个字
        let markChat = 0;
        /**完整匹配的索引 */
        let sucC = 0;
        /**完整匹配的字 */
        let sucW = "";
        for (let i = start; i < word.length; i++) {
            markChat = i;
            const char = word.charAt(i);
            const wordMap = nowMap[char];
            if (wordMap) {
                if (starMatchChat < 0) {
                    starMatchChat = i;
                }
                matchWord += char;
                everMatch = true;
                if (wordMap.hasOwnProperty('la')) {
                    //last
                    result = true;
                    sucC = markChat;
                    sucW = matchWord;
                }
                nowMap = wordMap;
            } else {
                if (everMatch) {
                    break;
                }
            }
        }
        let matchResult: any = {};
        matchResult.match = result;
        matchResult.word = result ? sucW : matchWord;
        matchResult.everMatch = everMatch;
        matchResult.chat = result ? sucC : starMatchChat;
        return matchResult;
    }

    /**
     * 替换屏蔽字
     */
    private static _checkAndReplaceWord(str: string, index: number): string { // 记下样本
        let originStr = str;
        let checkStr = StringUtils.repBlank(str);
        let result = this._matchSensitive(checkStr, index);
        let len = 0;
        if (result.match === false && result.everMatch === true) { // 有匹配过且没匹配上,证明后续的还是有可能会有匹配的则从新匹配一次
            return this._checkAndReplaceWord(originStr, result.chat + 1);
        } else if (result.match) {
            len = result.word.length;
            originStr = checkStr.replace(result.word, this._chatReplace[len - 1] || this.getChangeStr(len));
            return this._checkAndReplaceWord(originStr, result.chat);
        }
        return originStr;
    }

    private static getChangeStr(length: number): string {
        var str = "";
        for (var i = 0; i < length; i++) {
            str += "*";
        }
        return str;
    }
}