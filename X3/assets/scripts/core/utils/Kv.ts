/**
 * KV 对象
 * ps: 区别于 Map/Dictionary 的 kv
 */
export class Kv<K, V> {
    key: K
    value: V

    toString(): string {
        return `${this.key}:${this.value}`
    }
}

export class KvUtils {

    /**
     * 生成 Kv 数组
     * @param data
     */
    static generateKvArrayByMap<K, V>(data: Map<K, V>): Kv<K, V>[] {
        const kvArray = Array<Kv<K, V>>(data.size);
        let count = 0
        for (let obj of data.entries()) {
            let kv = new Kv<K, V>();
            kv.key = obj[0]
            kv.value = obj[1]
            kvArray[count++] = kv
        }
        return kvArray
    }


}