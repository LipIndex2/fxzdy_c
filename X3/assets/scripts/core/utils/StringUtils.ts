import { MathUtils } from "./MathUtils";

/**
 * 字符串操作工具类
 */
export class StringUtils {

    /**亿*/
    static HUNDRED_MILLION: number = 100000000
    /**万*/
    static TEN_THOUSAND: number = 10000

    /**
     * 左侧填充
     * @param str
     * @param targetLength
     * @param padString
     */
    public static padStart(str: string | number, targetLength: number, padString: string = ' ') {
        str = str?.toString() || "";
        while (str.length < targetLength) {
            str = padString + str;
        }
        return str;
    }

    /**
     * 检测长度
     */
    public static chkstrlen(str: string): number {
        var strlen = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
                strlen += 2;
            else
                strlen++;
        }
        return strlen;
    }

    /**裁剪字符串*/
    public static cutStr(str: string, maxLen: number): string {
        if (str == null || str == '') {
            return str
        }
        let strlen = 0;
        let result: string = ''
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                strlen += 2;

            } else {
                strlen++;
            }
            result += str.charAt(i)
            if (strlen >= maxLen) {
                break
            }
        }
        return result
    }

    /**
     * 比较两个版本号，判断新版本是否比旧版本更新。
     * @param oldVersion - 旧版本号字符串
     * @param newVersion - 新版本号字符串
     * @returns 如果新版本比旧版本更新，则返回 true；否则返回 false。
     */
    public static isNewVersion(oldVersion: string, newVersion: string): boolean {
        if (!newVersion) {
            return false;
        }

        if (!oldVersion) {
            return true;
        }

        let v1 = oldVersion.split('.') || [];
        let v2 = newVersion.split('.') || [];
        let len = Math.max(v1.length, v2.length);

        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }

        for (let i = 0; i < len; i++) {
            let num1 = parseInt(v1[i]);
            let num2 = parseInt(v2[i]);

            if (num1 > num2) {
                return false;
            } else if (num1 < num2) {
                return true;
            }
        }
        return false;
    }

    /**
     * 格式化字串
     * @param source 原始字符串 eg. "hell$1world"
     * @param obj  长度最大为9, 指针从1开始
     * @return 替换后的字符串
     */
    public static formatStr(source: string, ...obj: any[]): string {
        var i = 0;
        for (i = 0; i < obj.length; i++) {
            source = source.replace("$" + (i + 1), obj[i]);
        }
        return source;
    }

    /**
     * 去掉全部空格
     */
    static repBlank(str: string) {
        var pattern = /\s+/g;
        return str.replace(pattern, "");
    }

    /**
     * 去掉首尾空格
     */
    static repLeadTrailBlank(str: string) {
        var pattern = /^\s+|\s+$/g;
        return str.replace(pattern, "");
    }

    /**
     * 中文转数字
     * 例子:
     * StringUtil.ChineseToNumber(三百四十三) = 343 (number）
     * */
    private static chnNumCharCN = {
        "零": 0,
        "一": 1,
        "二": 2,
        "三": 3,
        "四": 4,
        "五": 5,
        "六": 6,
        "七": 7,
        "八": 8,
        "九": 9
    };
    private static chnNameValueCN = {
        "十": { value: 10, secUnit: false },
        "百": { value: 100, secUnit: false },
        "千": { value: 1000, secUnit: false },
        "万": { value: 10000, secUnit: true },
        "亿": { value: 100000000, secUnit: true }
    }
    public static ChineseToNumber(chnStr: string) {
        let rtn = 0;
        let section = 0;
        let number = 0;
        let secUnit = false;
        let str = chnStr.split('');

        for (let i = 0; i < str.length; i++) {
            let num = StringUtils.chnNumCharCN[str[i]];
            if (typeof num !== 'undefined') {
                number = num;
                if (i === str.length - 1) {
                    section += number;
                }
            } else {
                let unit = StringUtils.chnNameValueCN[str[i]].value;
                secUnit = StringUtils.chnNameValueCN[str[i]].secUnit;
                if (secUnit) {
                    section = (section + number) * unit;
                    rtn += section;
                    section = 0;
                } else {
                    section += (number * unit);
                }
                number = 0;
            }
        }
        return rtn + section;
    }

    /**
     * 数字转中文
     * 例子:
     * StringUtil.NumberToChinese(325) = "三百二十五" (string）
     * */
    private static chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    private static chnNumChar2 = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    private static chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
    private static chnUnitChar = ["", "十", "百", "千"];
    static NumberToChinese(num: number, traditional = false) {
        let unitPos = 0;
        let strIns = '', chnStr = '';
        let needZero = false;
        let chnNumChar = traditional ? StringUtils.chnNumChar2 : StringUtils.chnNumChar;
        let chnUnitSection = StringUtils.chnUnitSection;
        if (num === 0) {
            return chnNumChar[0];
        }
        if (num >= 10 && num < 20) {
            let tmp = num % 10;
            chnStr += this.chnUnitChar[1];
            if (tmp > 0) {
                chnStr += this.chnNumChar[tmp];
            }
            return chnStr;
        }

        while (num > 0) {
            let section = num % 10000;
            if (needZero) {
                chnStr = chnNumChar[0] + chnStr;
            }
            strIns = StringUtils.SectionToChinese(section, traditional);
            strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
            chnStr = strIns + chnStr;
            needZero = (section < 1000) && (section > 0);
            num = Math.floor(num / 10000);
            unitPos++;
        }

        return chnStr;
    }

    //转万单位以下
    private static SectionToChinese(section: number, traditional = false) {
        let strIns = '', chnStr = '';
        let unitPos = 0;
        let zero = true;
        let chnNumChar = traditional ? StringUtils.chnNumChar2 : StringUtils.chnNumChar;
        let chnUnitChar = StringUtils.chnUnitChar;
        while (section > 0) {
            let v = section % 10;
            if (v === 0) {
                if (!zero) {
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            } else {
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    }

    /**
     * 去掉转义字符
     * @param str 
     * @returns 
     */
    static repEscape(str: string): string {
        var str = str.replace(/['"\/bfnrt]/g, '');
        return str;
    }

    /**
     * 去掉特殊字符
     * @param str 
     * @returns 
     */
    static repInvalid(str: string): string {
        var str = str.replace(/[-_,!|~`()#$%^&*{}:;"L<>?]/g, '');
        return str;
    }

    /**
     * 仅保留字母、数字、汉字和空格
     * @param str 
     * @returns 
     */
    static repInvalid2(str: string): string {
        const regex = /[^\w\s\u4e00-\u9fa5]/gi;
        str = str.replace(regex, "");
        return str;
    }

    static formatNumber(num: number): string {
        let str: string = "";
        let numStr: string = num.toString();
        if (numStr.length <= 3) return numStr;
        let i: number = numStr.length - 1;
        let j: number = 0;
        for (; i >= 0; i--) {
            j++;
            str = numStr.charAt(i) + str;
            if (j == 3 && i > 0) {
                str = "," + str;
                j = 0;
            }
        }
        return str;
    }

    /**
     * 判断是否为空字符串
     * @param text
     */
    static isBlank(text: string) {
        return text == null || text.trim() == "";
    }

    static isNotBlank(text: string) {
        return !StringUtils.isBlank(text);
    }


    /**字符串object1转换
     * @returns {k:number,v: number}
     */
    static toObject1(str: string, split2: string = ":"): { k: number, v: number } {
        let idx = str.indexOf(split2);
        if (idx > -1) {
            return { k: Number(str.slice(0, idx)), v: Number(str.slice(idx + 1)) };
        }
        return null;
    }

    /**字符串object1转换
     * @returns {k:number,v: number}[]
     */
    static toObject1Arr(str: string, split1: string = ";", split2: string = ":"): { k: number, v: number }[] {
        var arr = [];
        var strs = str.split(split1);
        for (var i = 0, l = strs.length; i < l; ++i) {
            let obj = this.toObject1(strs[i], split2);
            if (obj) {
                arr.push(obj);
            }

        }
        return arr;
    }

    static strToArr(str: string, split1: string = ";", split2: string = ","): any[][] {
        var strs = str.split(split1);
        var arr = [];
        for (var i = 0; i < strs.length; i++) {
            if (strs[i]) {
                arr.push(strs[i].split(split2))
            }
        }
        return arr
    }

    /**数字单位  1KM 2千兆 3万亿 */
    public static numType: number = 1;
    /**
         * 转换数字单位统一用这个方法，会根据配置自动转“KM千兆万亿”
         * @param isDot 是否显示小数（1位），默认不显示
         * @param isFv 是否战力
         */
    public static numShortToKM(num: number, isDot: boolean = false): string {
        var shu: string;//数
        var word: string = "";//KM
        if (StringUtils.numType <= 2) {//KM 千兆
            if (Math.abs(num) >= 100000000) {
                shu = MathUtils.toFixedNoStr(num / 1000000, isDot ? 1 : 0);
                word = StringUtils.numType == 1 ? "M" : "兆";
            }
            else if (Math.abs(num) >= 100000) {
                shu = MathUtils.toFixedNoStr(num / 1000, isDot ? 1 : 0);
                word = StringUtils.numType == 1 ? "K" : "千";
            }
            else {
                shu = MathUtils.toFixedNoStr(num, isDot ? 1 : 0);
            }
        }
        else {//万亿
            if (Math.abs(num) >= 100000000) {
                shu = MathUtils.toFixedNoStr(num / 100000000, isDot ? 1 : 0);
                word = "亿";//"亿";
            }
            else if (Math.abs(num) >= 10000) {
                shu = MathUtils.toFixedNoStr(num / 10000, isDot ? 1 : 0);
                word = "万";//"万";
            }
            else {
                shu = MathUtils.toFixedNoStr(num, isDot ? 1 : 0);
            }
        }

        var str = Number(shu) + word;
        return str
    }

    /**富文本 描述文本 ↙替换成图标 */
    static repleaceDescToAtkImage(desc: string) {
        return desc.replace(/↙/g, "<img src='ui://comm/tsgj_green_icon' align=top offset=3 width=20 height=20/>");
    }

    static isNumberString(taskTypeStr: string) {
        try {
            return !isNaN(Number(taskTypeStr));
        } catch (error) {
            return false;
        }
    }

    /**数字转字符串*/
    static numToStr(value: number, decimalCnt: number = 0): string {
        let str = value.toString();
        let integerStr: string = null
        let decimalStr: string = null
        let pointIndex = str.indexOf('.')
        if (pointIndex != -1) {
            //有小数点
            integerStr = str.substring(0, pointIndex)
            decimalStr = str.substring(pointIndex + 1)
        } else {
            //整数
            integerStr = str
            decimalStr = ''
        }
        if (decimalStr == '' || decimalCnt == 0) {
            str = integerStr
        } else {
            if (decimalStr.length > decimalCnt) {
                //多余的小数就裁剪
                decimalStr = decimalStr.substring(0, decimalCnt)
            }
            while (decimalStr.charAt(decimalStr.length - 1) === '0') {
                //去除末尾的0
                decimalStr = decimalStr.substring(0, decimalStr.length - 1)
            }
            if (decimalStr == '') {
                str = integerStr
            } else {
                str = (integerStr + '.' + decimalStr)
            }
        }
        return str;
    }


    /**获取战力数值展示*/
    static getFightStr(value: number) {
        if (value < 0 || isNaN(value)) {
            return '0'
        }

        /**数值单位*/
        let unit = ''
        //小数点后保留几位
        let decimalCnt = 0
        if (value >= 10 * this.HUNDRED_MILLION) {
            value = value / this.HUNDRED_MILLION
            unit = '亿'
            decimalCnt = 1
        } else if (value >= this.HUNDRED_MILLION) {
            value = value / this.HUNDRED_MILLION
            unit = '亿'
            decimalCnt = 2
        } else if (value >= 1000 * this.TEN_THOUSAND) {
            value = value / this.TEN_THOUSAND
            unit = '万'
            decimalCnt = 0
        } else if (value >= 100 * this.TEN_THOUSAND) {
            value = value / this.TEN_THOUSAND
            unit = '万'
            decimalCnt = 1
        } else if (value >= 10 * this.TEN_THOUSAND) {
            value = value / this.TEN_THOUSAND
            unit = '万'
            decimalCnt = 2
        }

        let str: string = this.numToStr(value, decimalCnt);
        return str + unit
    }
}