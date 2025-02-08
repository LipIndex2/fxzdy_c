import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";

export class StringPrototypeExtension {
    static init(): void {
        // just import 
    }
}

// 全局扩展 Array 原型
declare global {
    interface String {
        // 取整
        toInt(): number;

        // 转为数字
        toNumber(): number;
    }
}

String.prototype.toNumber = function (): number {
    try {
        return Number.parseFloat(this);
    } catch (e) {
        console.error(`文本转数字有问题 toNumber str=${this}`, e);
        return 0;
    }
}

String.prototype.toInt = function (): number {
    if (StringUtils.isBlank(this)) {
        return 0;
    }
    try {
        return Number.parseInt(this);
    } catch (e) {
        console.error(`文本转数字有问题 toInt str=${this}`, e);
        return 0;
    }
}
