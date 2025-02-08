import { DataStream } from "db://assets/scripts/core/utils/DataStream";

// 全局扩展 Array 原型
declare global {
    interface Array<T> {
        // 转为数据流
        toDataStream(): DataStream<T>;

        // 是否含有元素
        contains(element: T): boolean;
    }
}


Array.prototype.toDataStream = function <T>(): DataStream<T> {
    return DataStream.from(this)
};


Array.prototype.contains = function <T>(element: T): boolean {
    return this.indexOf(element) >= 0;
};

