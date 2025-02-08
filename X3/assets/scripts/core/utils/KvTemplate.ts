/**
 * kv 文本模板
 * 将 ${key} 替换为 value
 * @author luohaojun
 */
export class KvTemplate {
    // 模板
    readonly template: string;
    // key-value 映射
    readonly kvMap: Map<string, string> = new Map();

    private constructor(template: string, kvMap?: Map<string, any>) {
        this.template = template || "";
        if (kvMap) {
            this.kvMap = kvMap.toDataStream()
                .toMap(
                    (item) => item.key,
                    (item) => {
                        if (item.value || item.value === 0) {
                            return item.value.toString()
                        }
                        return "null"
                    }
                );
        }
    }

    static create(template: string,
                  kvMap?: Map<string, any>
    ): KvTemplate {
        return new KvTemplate(template, kvMap);
    }

    static createByObject(template: string,
                          obj: any
    ): KvTemplate {
        const map = new Map<string, any>();
        if (obj) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    map.set(key, obj[key]);
                }
            }
        }
        return new KvTemplate(template, map);
    }

    /**
     * 自动识别 key, 手动转为 value
     * @param keyToValue
     */
    replaceKey(keyToValue: (key: string) => string): KvTemplate {
        if (!keyToValue) {
            return this;
        }

        // 使用正则表达式匹配出所有的 ${xxx} 模板变量
        const regex = /\$\{(.*?)\}/g;

        // 遍历模板中的所有匹配项
        let matchArray: Array<string>;
        while ((matchArray = regex.exec(this.template)) !== null) {
            // 原始的 key, 即 ${xxx} 中的 xxx
            const keyName: string = matchArray[1];
            // 使用转换函数处理 key
            const value = keyToValue(keyName);

            this.kvMap.set(keyName, value);
        }

        return this;
    }

    /**
     * kv
     * @param key
     * @param value
     */
    put(key: string, value: any) {
        if (value) {
            this.kvMap.set(key, value.toString())
        } else {
            this.kvMap.set(key, "null")
        }
    }

    /**
     * 对象当 Map
     * @param obj
     */
    putKvByObj(obj: any) {
        if (!obj) {
            return;
        }
        const map = new Map();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                this.put(key, value)
            }
        }

    }

    // 渲染模板
    render(): string {
        // 替换 ${key}
        const regex = /\$\{(.*?)\}/g;
        return this.template.replace(regex, (substring: string, key0: string) => {
            return this.kvMap.get(key0) || '';
        });
    }
}