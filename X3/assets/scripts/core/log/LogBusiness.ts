import {DateUtils} from "db://assets/scripts/core/utils/DateUtils";
import {DEBUG} from "cc/env"

/**
 * 高性能记录业务日志的装饰器
 * 1. 高性能, 减少栈帧处理
 * 2. 自动记录调用参数和返回值
 * 3. 自动记录报错位置, 且在异步不丢失方法位置
 *
 * @decorator @LogBusiness
 * @constructor
 * @param businessTitle 业务标题
 * @author luohaojun
 */
export function LogBusiness(businessTitle: string = "") {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 线上模式不开启
        if (!DEBUG) {
            return;
        }
        
        const className = target?.constructor?.name || "null";
        const methodName = propertyKey || "null";

        const originalMethod = descriptor.value;


        descriptor.value = function (...args: any[]) {

            const dateTimeStr = DateUtils.getCurrentDateTimeText()
            try {
                console.log(`[${dateTimeStr}] [${className}.${methodName}] ${businessTitle} | @LogBusiness | call args:`, args);
                const result = originalMethod.apply(this, args);
                
                // return void
                if (result !== undefined) {
                    console.log(`[${dateTimeStr}] [${className}.${methodName}] ${businessTitle} | @LogBusiness | return value:`, result);
                }
                return result;
            } catch (error) {
                // cocos 捕捉异常会丢失正确的栈帧, 此处打印能保留正确的栈帧信息
                console.error(`[${dateTimeStr}] [${className}.${methodName}] ${businessTitle} | @LogBusiness | unknown error:`, error);

                // 继续抛出异常
                throw error;
            }
        };
    };
}