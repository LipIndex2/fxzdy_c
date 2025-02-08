/**
 * 对象工具
 */
export default class ObjectUtils {


    static isString(obj: any): boolean {
        return obj === null || typeof obj === 'string';
    }

    /**
     * 是否为空
     * @param obj
     */
    static isNullOrUndefined(obj: any): boolean {
        return obj === null || typeof obj === 'undefined';
    }


    /**
     * 检查是否是数字
     */
    static isNumber(obj: any): boolean {
        return Object.prototype.toString.call(obj) === '[object Number]';
    }

    /**
     * 判断指定的值是否为对象
     * @param value 值
     */
    public static isObject(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
     * 深拷贝
     * @param target 目标
     */
    public static deepCopy(target: any): any {
        if (target == null || typeof target !== 'object') {
            return target;
        }

        let result: any = null;

        if (target instanceof Date) {
            result = new Date();
            result.setTime(target.getTime());
            return result;
        }

        if (target instanceof Array) {
            result = [];
            for (let i = 0, length = target.length; i < length; i++) {
                result[i] = this.deepCopy(target[i]);
            }
            return result;
        }

        if (target instanceof Object) {
            result = {};
            for (const key in target) {
                if (target.hasOwnProperty(key)) {
                    result[key] = this.deepCopy(target[key]);
                }
            }
            return result;
        }

        console.warn(`不支持的类型：${result}`);
    }

    /**
     * 拷贝对象
     * @param target 目标
     */
    public static copy(target: object): object {
        return JSON.parse(JSON.stringify(target));
    }

    /** 浅复制 */
    public static copyObjectArr(obj: any) {
        var ret; // = (typeof obj).toLowerCase()==="array" ? [] : {};
        var a = obj.constructor;
        switch (a) {
            case Array:
                ret = [];
                break;
            case Object:
                ret = {};
                break;
        }
        var key;
        for (key in obj) {
            ret[key] = obj[key];
        }
        return ret;
    }

    /**
     * 合并对象到tarObj
     * 如果有相同的，则会直接相加
     */
    public static mergeObj(tarObj: Object, sourceObj: Object) {
        if (sourceObj) {
            var key;
            for (key in sourceObj) {
                if (tarObj[key]) {
                    tarObj[key] = tarObj[key] + sourceObj[key];
                }
                else {
                    tarObj[key] = sourceObj[key];
                }
            }
        }
    }

    /**
    * 合并对象到tarObj
    * 如果有相同的，替换
    */
    public static mergeSameObj(tarObj: Object, sourceObj: Object) {
        if (sourceObj) {
            var key;
            for (key in sourceObj) {
                tarObj[key] = sourceObj[key];
            }
        }
    }

    /**
     * 合并对象到tarObj2 {"type":xxx, "value": xxx}
     * 如果有相同的，则会直接相加
     */
    public static mergeObj2(tarObj: Object, sourceObj: Object) {
        if (sourceObj) {
            if (tarObj[sourceObj["type"]]) {
                tarObj[sourceObj["type"]] = sourceObj["value"] + tarObj[sourceObj["type"]];
            }
            else {
                tarObj[sourceObj["type"]] = sourceObj["value"];
            }
        }
    }

    /**
     * 合并对象到tarObj
     * 如果有相同的，则会替换
     */
    static sameObj(tarObj: Object, sourceObj: Object) {
        if (sourceObj) {
            var key;
            for (key in sourceObj) {
                if (tarObj[key]) {
                    tarObj[key] = sourceObj[key];
                }
            }
        }
    }

    /**
     * 计算两个加成对象的属性增量
     * @param lastObj
     * @param curObj
     */
    static calObjAdd(lastObj: Object, curObj: Object, addObj: Object = {}, fix: number = 100): void {
        if (curObj) {
            for (let key in curObj) {
                if (lastObj?.[key]) {
                    let curValue = Math.floor(curObj[key] * fix);
                    let lastValue = Math.floor(lastObj[key] * fix);
                    let addValue = (curValue - lastValue) / fix;
                    if (addValue > 0) {
                        addObj[key] = addValue;
                    }
                } else {
                    addObj[key] = curObj[key];
                }
            }
        }
    }

    /**
     * 判断两个对象是否相同
     * @param a
     * @param b
     * @returns
     */
    static isObjectValueEqual(a: Object, b: Object): boolean {
        //取对象a和b的属性名
        var aProps = Object.keys(a);
        var bProps = Object.keys(b);
        //判断属性名的length是否一致
        if (aProps.length != bProps.length) {
            return false;
        }
        //循环取出属性名，再判断属性值是否一致
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        return true;
    }

    /**
     * 剔除对象中属性某个属性，并返回新对象
     * @param obj
     * @param keys
     * @returns
     */
    static omit(obj: Object, keys: string[]) {
        let delMap = {}
        for (let i = 0; i < keys.length; i++) {
            delMap[keys[i]] = true;
        }

        const newObj = {};
        for (let key in obj) {
            if (!delMap[key]) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }

    /**
     * 将对象转换为map
     * @param obj
     * @param keyConvertor
     * @param valueConvertor
     */
    static toMap<K, V>(obj: Object,
        keyConvertor: (key: string) => K,
        valueConvertor: (value: any) => V,
    ): Map<K, V> {
        const map = new Map<K, V>();
        for (let key in obj) {
            const value: any = obj[key];

            const k = keyConvertor(key);
            const v = valueConvertor(value);
            map.set(k, v);
        }
        return map;
    }
}
