import ObjectUtils from "./ObjectUtils";

/**
 * 数字工具
 * @author LuoHaoJun
 */
export class NumberUtils {

    static parseInt(num: number, defaultValue: number = 0): number {
        if (ObjectUtils.isNullOrUndefined(num)) {
            return defaultValue;
        }
        return parseInt(num.toString());
    }

    static parseFloat(num: number, defaultValue: number = 0): number {
        if (ObjectUtils.isNullOrUndefined(num)) {
            return defaultValue;
        }
        return parseFloat(num.toString());
    }

    /**
     * 计算数字有多少个, 例如: 9999 = return 4
     * digit = 用于表示数字的[单个数字]符号 0-9
     * @param value 数字
     * @returns 数字的位数
     */
    static countDigits(value: number): number {
        return String(value).length;
    }

    /**
     * 检查数组中的数字是否连续
     * @param numbers 数字数组
     * @returns 是否连续
     */
    static isConsecutive(numbers: number[]): boolean {
        if (numbers.length < 2) {
            // 如果数组长度小于2，不需要检查连续性
            return true;
        }

        // 先将数组排序
        numbers.sort((a, b) => a - b);

        // 检查相邻数字是否连续
        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] !== numbers[i - 1] + 1) {
                return false;
            }
        }

        return true;
    }

    /**文件大小单位转换 */
    public static numberToSizeStr(size: number, fixed: number = 0): string {
        let str;
        if (size > 1024 * 1024 * 1024) {
            str = (size / 1024 / 1024 / 1024).toFixed(fixed) + "GB";
        } else if (size > 1024 * 1024) {
            str = (size / 1024 / 1024).toFixed(fixed) + "MB";
        } else if (size > 1024) {
            str = (size / 1024).toFixed(fixed) + "KB";
        } else {
            str = size + "B";
        }
        return str;
    }
}