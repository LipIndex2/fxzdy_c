import { Constructor } from "cc"
import G from "../comm/G"
import { StringUtils } from "./StringUtils"

/**table静态数据解析类*/
export class TableConstUtils {
    /**获取整数*/
    public static getConstConfigToNumber<T>(tableFullName: Constructor<T>, id: string, contentName: string = 'content', defaultValue: number = 0): number {
        let str = this.getConstConfig(tableFullName, id, contentName)
        let value = Number(str)
        if (!isNaN(value)) {
            return value
        }
        return defaultValue
    }

    /**获取KV格式数据*/
    public static getConstConfigToKV<T>(tableFullName: Constructor<T>, id: string, contentName: string = 'content', defaultValue: { k: number, v: number }[] = []): { k: number, v: number }[] {
        let str = this.getConstConfig(tableFullName, id, contentName)
        if (str) {
            return StringUtils.toObject1Arr(str)
        }
        return defaultValue
    }

    /**获取JSON数据*/
    public static getConstConfigToJSON<T>(tableFullName: Constructor<T>, id: string, contentName: string = 'content', defaultValue: any = {}): any {
        let str = this.getConstConfig(tableFullName, id, contentName)
        if (str) {
            try {
                let obj = JSON.parse(str);
                return obj;
            } catch (e) {
                return defaultValue;
            }
        }
        return defaultValue
    }

    /**获取整数数组*/
    public static getConstConfigToNumberArray<T>(tableFullName: Constructor<T>, id: string, contentName: string = 'content', defaultValue: number[] = []): number[] {
        let str = this.getConstConfig(tableFullName, id, contentName)
        if (str) {
            return str.split(';').map(Number);
        }
        return defaultValue
    }

    /**获取字符串*/
    public static getConstConfig<T>(tableFullName: Constructor<T>, id: string | number, contentName: string = 'content', defaultValue: string = ''): string {
        let constCfg = G.TableManager.getDataById(tableFullName, id)
        if (constCfg && constCfg[contentName]) {
            return constCfg[contentName]
        }
        return defaultValue
    }
}