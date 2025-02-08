import { Constructor, sys } from "cc";
import { JsonUtils } from "db://assets/scripts/core/utils/JsonUtils";
import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";

/**
 * 本地存储助手
 * 跟角色无关
 * ===
 */
export class LocalStorageUtils {

    /**
     * 设置
     * @param key
     * @param value
     * @param errorCallback
     */
    static set(
        key: string,
        value: any,
        errorCallback: (error: Error) => void = null
    ) {
        if (sys.localStorage) {
            if (value === null) {
                sys.localStorage.removeItem(key);
                return;
            }
            try {
                if (ObjectUtils.isString(value)) {
                    sys.localStorage.setItem(key, value);
                } else if (ObjectUtils.isNumber(value)) {
                    sys.localStorage.setItem(key, value);
                } else {
                    const json = JsonUtils.serialize(value);
                    sys.localStorage.setItem(key, json);

                }
            } catch (e) {
                if (errorCallback) {
                    errorCallback(e);
                }
            }
        } else {
            console.error(`sys.localStorage not found. key = ${key}`)
        }
    }

    /**
     * 获取
     * @param key
     * @param clazz
     * @param defaultValueCreator
     */
    static get<T>(
        key: string,
        clazz: Constructor<T>,
        defaultValueCreator: () => T = null,
    ): T {
        if (sys.localStorage) {
            try {
                let value: string = sys.localStorage.getItem(key)?.toString();
                if (!value) {
                    if (defaultValueCreator) {
                        return defaultValueCreator();
                    }
                    return null;
                }

                const className = clazz?.name || "";
                // Boolean
                if (className === "Boolean") {
                    return (value === "true") as T;
                }
                // Number
                if (className == "Number") {
                    if (value.includes(".")) {
                        return Number.parseFloat(value) as T;
                    } else {
                        return Number.parseInt(value) as T;
                    }
                }
                // String
                if (className == "String") {
                    return value as T;
                }

                // 反序列化
                return JsonUtils.deserialize(value, clazz);
            } catch (error) {
                console.error(`sys.localStorage get key error. key = ${key}`, error)
                if (defaultValueCreator) {
                    return defaultValueCreator();
                }
                return null;
            }
        } else {
            console.error(`sys.localStorage not found. key = ${key}`)
        }
    }

    /**
     * 根据前缀名匹配 keys
     * @param prefixName
     */
    static getAllKeyPreLike(prefixName: string): string[] {
        const matchingKeys: string[] = [];

        // 遍历 LocalStorage 中的所有键
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefixName)) {
                matchingKeys.push(key);
            }
        }

        return matchingKeys;
    }


}