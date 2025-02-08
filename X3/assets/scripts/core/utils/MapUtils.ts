import { KeyExtractor, MergeFunction } from "./LambdaExtension";

/**
 * Map 实体
 */
export class MapEntry<K, V> {
    key!: K
    value!: V
}

/**
 * Map 工具
 */
export class MapUtils {

    static empty<K, V>(): Map<K, V> {
        return new Map();
    }

    static isEmpty<K, V>(map: Map<K, V>): boolean {
        if (map == null) {
            return true;
        }
        return map.size === 0;
    }

    static isNotEmpty<K, V>(map: Map<K, V>): boolean {
        return !this.isEmpty(map);
    }

    /**
     * 将一个对象转换为 Map
     * @param obj 需要转换的对象
     * @param keyExtractor
     * @param valueExtractor
     * @returns 转换后的 Map
     */
    static fromObject<K, V>(obj: any,
                            keyExtractor: KeyExtractor<string, K>,
                            valueExtractor: KeyExtractor<any, V>,
    ): Map<K, V> {
        const map = new Map<K, V>();
        if (obj == null) {
            return map;
        }

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = keyExtractor(key);
                const value = obj[key];
                if (value == null) {
                    map.set(newKey, null);
                }
                const newValue = valueExtractor(value);
                map.set(newKey, newValue);
            }
        }

        return map;
    }

    public static mergeAll<K, V>(output: Map<K, V>,
                                 mergeValueFunction: MergeFunction<V>,
                                 ...otherMaps: Map<K, V>[]
    ): Map<K, V> {
        return this.mergeAllByRepeat(
            output,
            mergeValueFunction,
            1,
            ...otherMaps,
        )
    }

    public static mergeAllByRepeat<K, V>(output: Map<K, V>,
                                         mergeValueFunction: MergeFunction<V>,
                                         repeatCount: number,
                                         ...otherMaps: Map<K, V>[]
    ): Map<K, V> {
        if (repeatCount <= 0 || output == null || mergeValueFunction == null) {
            return output;
        } else {
            for (const kvMap of otherMaps) {
                if (kvMap != null) {
                    for (let i = 0; i < repeatCount; ++i) {
                        kvMap.forEach((value, key) => {
                            if (output.has(key)) {
                                const newVar: V = output.get(key)!;
                                let mergeValue: any = mergeValueFunction(newVar, value);
                                output.set(key, mergeValue);
                            } else {
                                output.set(key, value);
                            }
                        });
                    }
                }
            }

            return output;
        }
    }


    static union<K, V>(...mapArray: Map<K, V>[]): Map<K, V> {
        if (!mapArray) {
            return this.empty();
        } else {
            const kvHashMap = new Map<K, V>();
            for (const kvMap of mapArray) {
                if (kvMap != null) {
                    kvMap.forEach((value, key) => {
                        kvHashMap.set(key, value);
                    });
                }
            }
            return kvHashMap;
        }
    }

    static toLevel1Map<K1, T>(dataList: T[],
                              keyExtractor1: KeyExtractor<T, K1>,
                              mergeFunction: MergeFunction<T>,
    ): Map<K1, T> {
        return dataList == null ? this.empty() : dataList.reduce((map, newItem) => {
            const key = keyExtractor1(newItem);
            const oldItem = map.get(key);
            if (oldItem) {
                map.set(key, newItem);
            } else {
                map.set(key, mergeFunction(oldItem, newItem));
            }
            return map;
        }, new Map<K1, T>());
    }

    static toLevel2Map<K1, K2, T>(dataList: T[],
                                  keyExtractor1: KeyExtractor<T, K1>,
                                  keyExtractor2: KeyExtractor<T, K2>,
                                  mergeFunction: MergeFunction<T>,
    ): Map<K1, Map<K2, T>> {
        return dataList == null ? this.empty() : dataList.reduce((map, newItem) => {
            const key1 = keyExtractor1(newItem);
            const key2 = keyExtractor2(newItem);
            const innerMap = map.get(key1) || new Map<K2, T>();
            const oldItem = innerMap.get(key2);
            if (oldItem == null) {
                innerMap.set(key2, newItem);
            } else {
                innerMap.set(key2, mergeFunction(oldItem, newItem));
            }
            map.set(key1, innerMap);
            return map;
        }, new Map<K1, Map<K2, T>>());
    }

    /**
     * 转为 lv.3 Map
     * @param dataList
     * @param keyExtractor1
     * @param keyExtractor2
     * @param keyExtractor3
     * @param mergeFunction
     */
    static toLevel3Map<K1, K2, K3, T>(
        dataList: T[],
        keyExtractor1: KeyExtractor<T, K1>,
        keyExtractor2: KeyExtractor<T, K2>,
        keyExtractor3: KeyExtractor<T, K3>,
        mergeFunction: MergeFunction<T>,
    ): Map<K1, Map<K2, Map<K3, T>>> {
        return dataList == null ? this.empty() : dataList.reduce((map, newItem) => {
            const key1 = keyExtractor1(newItem);
            const key2 = keyExtractor2(newItem);
            const key3 = keyExtractor3(newItem);
            const innerMap2 = (map.get(key1) || new Map<K2, Map<K3, T>>()).get(key2) || new Map<K3, T>();

            const oldItem: T = innerMap2.get(key3) as T;
            if (oldItem == null) {
                innerMap2.set(key3, newItem);
            } else {
                innerMap2.set(key3, mergeFunction(oldItem, newItem));
            }
            const innerMap1 = map.get(key1) || new Map<K2, Map<K3, T>>();
            innerMap1.set(key2, innerMap2);
            map.set(key1, innerMap1);
            return map;
        }, new Map<K1, Map<K2, Map<K3, T>>>());
    }


    /**
     * 获取指定 key 对应的值，如果不存在则创建并返回默认值
     * @param map 要操作的 Map 对象
     * @param key 要获取或创建的键
     * @param defaultValueCreator 默认值
     * @returns 指定键对应的值
     */
    static getOrCreate<K, V>(map: Map<K, V>, key: K, defaultValueCreator: (() => V)): V {
        if (!map.has(key)) {
            let value = defaultValueCreator();
            map.set(key, value);
        }
        return map.get(key)!;
    }

    /**
     * 合并函数
     * @param map Map 要操作的 Map
     * @param key key
     * @param value 值
     * @param mergeFunc 合并value函数
     */
    static merge<K, V>(map: Map<K, V>,
                       key: K,
                       value: V,
                       mergeFunc: (v1: V, v2: V) => V,
    ): V | null {
        if (!map) {
            return null
        }
        let newValue = value;
        if (map.has(key)) {
            const existingValue = map.get(key);
            if (existingValue !== undefined) {
                const mergedValue = mergeFunc(existingValue, value);
                map.set(key, mergedValue);
                newValue = mergedValue;
            }
        } else {
            map.set(key, value);
        }
        return newValue
    }

    static generateAllMapEntry<K, V>(data: Map<K, V>): MapEntry<K, V>[] {
        const entryList = Array<MapEntry<K, V>>(data.size);
        let count = 0
        for (let obj of data.entries()) {
            let entry = new MapEntry<K, V>();
            entry.key = obj[0]
            entry.value = obj[1]
            entryList[count++] = entry
        }
        return entryList
    }

    /**
     * 计算两个 Map 的差异 Map = A - B
     * @param mapA
     * @param mapB
     * @param mergeFunc 合并差异函数
     */
    static diff<K, V>(mapA: Map<K, V>,
                      mapB: Map<K, V>,
                      mergeFunc: (v1: V, v2: V) => V
    ) {
        const diffMap = new Map<K, V>();
        for (let [itemId, valueA] of mapA.entries()) {
            if (!mapB.has(itemId)) {
                diffMap.set(itemId, valueA);
            } else {
                const valueB = mapB.get(itemId);
                const diffCount = mergeFunc(valueA, valueB);
                diffMap.set(itemId, diffCount);
            }
        }
        return diffMap
    }

    /**
     * 获取首个 key
     * @param map
     * @param defaultKey
     */
    static getFirstKey<K, V>(map: Map<K, V>, defaultKey: K = null): K {
        if (map.size === 0) {
            // Return the default value if the map is empty
            return defaultKey;
        }

        for (const key of map.keys()) {
            // Return the first key encountered
            return key;
        }
    }

    static getLastValue<K, V>(map: Map<K, V>): V | null {
        if ((map?.size || 0) === 0) {
            // Return the default value if the map is empty
            return null;
        }

        let lastValue: V | null = null;
        for (const value of map.values()) {
            lastValue = value;
        }

        return lastValue;
    }
}
