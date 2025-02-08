/**
 * 同类型合并函数
 * @param value1 类型 V1
 * @param value2 类型 V2
 * @returns 合并后的类型 V
 */
export type BiFunction<V1, V2, V> = (value1: V1, value2: V2) => V;

/**
 * 从对象中提炼出 key
 */
export type KeyExtractor<T, K> = (item: T) => K;

/**
 *  合并函数 lambda
 *  @param a 对象 T
 *  @param b 对象 T
 *  @returns 合并后的对象 T
 */
export interface MergeFunction<T> {
    (a: T, b: T): T;
}
