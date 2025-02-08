import { Constructor } from "cc";
import { MergeFunction } from "db://assets/scripts/core/utils/LambdaExtension";

/**
 * 强类型 泛型 Map
 */
export class TypeMap {
    
    private _typeMap = new Map<Constructor<any>, any>();

    get<T>(clazz: Constructor<T>): T | undefined {
        return this._typeMap.get(clazz) as T;
    }

    put<T>(clazz: Constructor<T>, instance: T): void {
        this._typeMap.set(clazz, instance);
    }

    getOrCreate<T>(clazz: Constructor<T>, factory: () => T): T {
        let instance = this.get(clazz);

        if (!instance) {
            instance = factory();
            this.put(clazz, instance);
        }

        return instance;
    }

    merge<T>(clazz: Constructor<T>, value: T, mergeFunc: MergeFunction<T>): T {
        return this._typeMap.merge(clazz, value, mergeFunc);
    }

    remove<T>(clazz: Constructor<T>): T {
        let instance = this.get(clazz);
        this._typeMap.delete(clazz);
        return instance;
    }

    removeReturnSelf<T>(clazz: Constructor<T>): TypeMap {
        this._typeMap.delete(clazz);
        return this;
    }
}
