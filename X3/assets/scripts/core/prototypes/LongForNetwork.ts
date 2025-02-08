/**
 * 专门用于网络传输协议
 */
export class LongForNetwork extends Number {
    
    // 数字
    _value: number = 0;

    get numberValue(): number {
        return this._value;
    }
    
    /**
     * 纯粹是为了协议识别 Long 类型临时用的, 必须用这个来创建通信 long 
     * @param num
     */
    static fromNumber(num: number): number {
        const longForCmd = new LongForNetwork();
        longForCmd._value = Math.floor(num);
        // @ts-ignore
        return longForCmd;
    }
}