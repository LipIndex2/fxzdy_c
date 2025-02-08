/**
 * 通用装饰器
 */
export class MyDecorator {

    // <参数key, timeoutId>
    private static readonly ARGS_KEY_TO_TIMEOUT_ID_MAP = new Map<string, number>();

    /**
     * 在窗口时间内，只执行最后一次函数调用，不同参数有独立的防抖计时器
     * @param timeMs 防抖时间 ms
     */
    public static AntiShakeCallFunc(timeMs: number) {
        return function (target: any,
                         propKey: string,
                         descriptor: PropertyDescriptor,
        ) {

            let originalFunc = descriptor.value;

            descriptor.value = function (...args: any[]) {
                // 根据函数参数生成唯一的 key，JSON.stringify 是一个简单的方法
                const argsKey = JSON.stringify(args);

                // 如果该参数组合的计时器存在，先清除它
                if (MyDecorator.ARGS_KEY_TO_TIMEOUT_ID_MAP.has(argsKey)) {
                    clearTimeout(MyDecorator.ARGS_KEY_TO_TIMEOUT_ID_MAP.get(argsKey));
                }

                // 设置新的计时器并保存
                const timer = setTimeout(() => {
                    originalFunc.apply(this, args);
                    MyDecorator.ARGS_KEY_TO_TIMEOUT_ID_MAP.delete(argsKey); // 函数执行后清除计时器
                }, timeMs);

                MyDecorator.ARGS_KEY_TO_TIMEOUT_ID_MAP.set(argsKey, timer);
            }
        }
    }

}