import {EnumI18nLanguageType} from "db://assets/scripts/core/i18n/ConstantI18n";
import G from "db://assets/scripts/core/comm/G";

/**
 * 数字格式
 */
export class NumberFormat {
    constructor(
        public count: number,
        public numberStr: string,
        public unit: string
    ) {

    }

    /**
     * 对外显示的文本
     */
    getViewString(): string {
        return this.numberStr + this.unit;
    }
}


/**
 * 数值格式化工具
 */
export class NumberFormatter {

    private static languageToArrayMap = new Map<EnumI18nLanguageType, string[]>([
        [EnumI18nLanguageType.CN, ['万', '亿']],
        [EnumI18nLanguageType.EN, ['K', 'M']],
    ]);

    private static languageToFormatFuncMap: Map<EnumI18nLanguageType, (count: number) => NumberFormat> = new Map();
    private static _init: boolean = false;

    public static init() {
        if (this._init) {
            return;
        }

        this._init = true;


        this.languageToFormatFuncMap.set(EnumI18nLanguageType.CN, this._getNumberFormatForCN.bind(this));
        this.languageToFormatFuncMap.set(EnumI18nLanguageType.EN, this._getNumberFormatForEN.bind(this));
    }

    /**
     * 中文
     * @param count
     * @private
     */
    private static _getNumberFormatForCN(count: number): NumberFormat | null {
        if (!count) {
            return new NumberFormat(0, "0", '');
        }
        if (count < 100000) {
            return new NumberFormat(count, count.toString(), '');
        }
        let indexForUnit = -1;

        let tempCount = count;
        let lastCount = 0

        while (tempCount >= 10000) {
            lastCount = tempCount % 10000
            tempCount = tempCount / 10000
            indexForUnit += 1
        }
        const unit = this.languageToArrayMap.get(EnumI18nLanguageType.CN)[indexForUnit] || "";

        let keepCount = 0
        if (tempCount >= 1000) {
            keepCount = 0;
        } else if (tempCount >= 100) {
            keepCount = 1;
        } else if (tempCount >= 10) {
            keepCount = 2;
        } else {
            keepCount = 3;
        }

        let isNeedDigit = false;
        let lastCountStr = lastCount.toString();
        if (keepCount > 0) {
            lastCountStr = lastCountStr.substring(0, keepCount);
            isNeedDigit = true;
        }

        let str = tempCount.toInt().toString();
        if (isNeedDigit) {
            str = str + "." + lastCountStr;
        }
        // str.substring()

        return new NumberFormat(count, str, unit)
    }

    /**
     * 非中文, 统一英文
     * @param count
     * @private
     */
    private static _getNumberFormatForEN(count: number): NumberFormat | null {
        if (!count) {
            return new NumberFormat(0, "0", '');
        }
        if (count < 100000) {
            return new NumberFormat(count, count.toString(), '');
        }
        let indexForUnit = -1;

        let tempCount = count;
        let lastCount = 0

        let splitNum = 1000;

        while (tempCount >= splitNum) {
            lastCount = tempCount % splitNum
            tempCount = tempCount / splitNum
            indexForUnit += 1
        }
        const unit = this.languageToArrayMap.get(EnumI18nLanguageType.EN)[indexForUnit] || "";

        let keepCount = 0
        if (tempCount >= 1000) {
            keepCount = 0;
        } else if (tempCount >= 100) {
            keepCount = 1;
        } else if (tempCount >= 10) {
            keepCount = 2;
        } else {
            keepCount = 3;
        }

        let isNeedDigit = false;
        let lastCountStr = lastCount.toString();
        if (keepCount > 0) {
            lastCountStr = lastCountStr.substring(0, keepCount);
            isNeedDigit = true;
        }

        let str = tempCount.toInt().toString();
        if (isNeedDigit) {
            str = str + "." + lastCountStr;
        }
        // str.substring()

        return new NumberFormat(count, str, unit)
    }

    /**
     * 最多显示 4 位数字
     * 格式化数字，将数字格式化为千位分隔符，并添加单位
     * @param count 要格式化的数字
     * @param languageType 语言类型，默认为当前语言
     * @returns 格式化后的字符串
     */
    static formatNumberToString(count: number,
                                languageType: EnumI18nLanguageType = G.I18nManager.getCurrentLanguage()
    ): string {
        this.init();

        let convertFunc = this.languageToFormatFuncMap.get(languageType);
        if (!convertFunc) {
            return this._getNumberFormatForEN(count).getViewString();
        }

        const formatResult = convertFunc(count);
        if (!formatResult) {
            return "0"
        }
        return formatResult.getViewString();
    }
}
