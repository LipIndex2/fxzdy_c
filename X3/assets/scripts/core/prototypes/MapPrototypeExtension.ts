import { DataStream } from "db://assets/scripts/core/utils/DataStream";
import { MapEntry } from "db://assets/scripts/core/utils/MapUtils";

// 扩展 Map 原型
export class MapPrototypeExtension {

}

// 全局扩展 Map 原型
declare global {
    interface Map<K, V> {
        // 转为数据流
        toDataStream(): DataStream<MapEntry<K, V>>;

        // 合并 
        merge(key: K, value: V, mergeFunc: (v1: V, v2: V) => V): V

        getOrDefault(key: K, v: V): V

        // 获取或创建
        getOrCreate(key: K, valueCreator: () => V): V
    }
}

// @append 为 Map 添加 toStream 方法, 转为数据流对象
Map.prototype.toDataStream = function <K, V>(): DataStream<MapEntry<K, V>> {
    return DataStream.fromMap(this);
};

// 合并 value
Map.prototype.merge = function <K, V>(key: K, value: V, mergeFunc: (v1: V, v2: V) => V): V {
    let oldValue = this.get(key);
    if (oldValue === undefined) {
        this.set(key, value);
        return value;

    } else {
        let newValue = mergeFunc(oldValue, value);
        this.set(key, newValue);
        return newValue;
    }
};


Map.prototype.getOrCreate = function <K, V>(key: K, valueCreator: () => V): V {
    let oldValue = this.get(key);
    if (oldValue == null) {
        const v = valueCreator();
        this.set(key, v);
        return v;
    }
    return oldValue;
};


Map.prototype.getOrDefault = function <K, V>(key: K, defaultV: V): V {
    let oldValue = this.get(key);
    if (oldValue === null || oldValue === undefined) {
        return defaultV;
    }
    return oldValue;
};