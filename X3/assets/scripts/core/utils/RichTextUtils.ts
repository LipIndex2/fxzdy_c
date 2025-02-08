import { RichText, SpriteAtlas } from "cc";
import * as fgui from "fairygui-cc";
import { Res } from "../res/Res";
import { ResRef } from "../res/ResRef";
import { StringUtils } from "./StringUtils";

/**富文本工具*/
export class RichTextUtils {
    static defaultParser: fgui.UBBParser = new fgui.UBBParser();
    static setTextWithImg(text: string, richText: RichText, atlasPath: string, bundleName?: string): void {
        let finalText = text;
        Res.getResRef({ bundle: bundleName, url: atlasPath, type: SpriteAtlas }, null,
            (res: ResRef) => {
                if (!res) {
                    return
                }
                if (richText?.isValid) {
                    richText.imageAtlas = res.content;
                    richText.string = finalText;
                }
            });
    }

    /**截断富文本功能*/
    static substring(str: string, maxLen: number = 10): string {
        let realStr: string = this.defaultParser.parse(str)
        const regex = /<.+?\/?>/g; // 匹配尖括号标签
        const matchArr = realStr.match(regex);
        // console.log("matchArr", matchArr);
        const specialChar = "&&";//分隔符
        const replaceStr = realStr.replace(regex, specialChar); // 标签数组
        let textArr = replaceStr.split(specialChar); // 文字数组
        // console.log("textArr", textArr);
        const strArr = []; // 存放处理过的文字数组
        let paraNum = 0; // 待替换参数个数
        for (let text of textArr) {
            // 非空字符替换成类似 $[0-n] 参数
            if (text !== "") {
                text = `$[${paraNum}]`;
                paraNum += 1;
            }
            strArr.push(text);
        }
        // console.log("strArr", strArr);
        let templetStr = strArr.join(specialChar); // 数组转成待替换字符串
        // console.log("templetStr", templetStr);
        textArr = textArr.filter((value) => value != '');//去除空字符串

        while (templetStr.search(specialChar) !== -1) {
            // 数组转成的字符串原本 '特殊字符' 位置都是富文本标签的位置, 替换回标签
            if (matchArr.length > 0) {
                templetStr = templetStr.replace(
                    specialChar,
                    matchArr[0].toString()
                );
                matchArr.splice(0, 1);
            } else {
                templetStr = templetStr.replace(specialChar, ""); // 空字符串替换,防止死循环
                // console.warn("matchArr not enough");
                break;
            }
        }
        // console.log("templetStr", templetStr);
        const arrayParm = new Array(paraNum).fill(""); // 替换参数数组
        let showLen: number = 0
        let lastCutIndex: number = -1
        for (let i = 0; i < textArr.length; i++) {
            if (showLen >= maxLen) {
                break
            }
            let len = StringUtils.chkstrlen(textArr[i])
            if (showLen + len <= maxLen) {
                arrayParm[i] = textArr[i]
                showLen += len
            } else {
                let subStr = StringUtils.cutStr(textArr[i], maxLen - showLen)
                arrayParm[i] = subStr
                showLen += maxLen - showLen
                lastCutIndex = i
                break
            }
        }
        if (lastCutIndex != -1) {
            let keyStr = `$[${lastCutIndex}]`
            let index = templetStr.indexOf(keyStr)
            const imgReg = /<img[^>]+>/g
            if (index != -1) {
                //截取之后的图片标签都不要了
                let startStr = templetStr.substring(0, index + keyStr.length)
                let endStr = templetStr.substring(index + keyStr.length)
                endStr = endStr.replace(imgReg, '')
                templetStr = startStr + endStr
            }
        }
        let showStr = templetStr
        arrayParm.forEach((value, index) => {
            showStr = showStr.replace(`$[${index}]`,
                arrayParm[index])
        })
        // console.log("RichTextUtils substring", str, showStr);
        return showStr
    }
}