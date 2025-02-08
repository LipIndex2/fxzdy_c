import { BufferAsset, Constructor } from "cc";
import { Res } from "../res/Res";
import { TableZipParser } from "./TableZipParser";
import { js } from "cc";
import { Logger } from "../log/Logger";

type condType<T, V> = Partial<Record<keyof T, V>>
type keyCondFuncType<T, U extends keyof T, P extends T[U]> = Partial<Record<U, (value: P, targetObj?: T) => boolean>>
/**
 * 配置表管理器
 */
export class TableManager {

    public static tableUrl = "localData";
    private static tableZipParser: TableZipParser;

    /**是否已加载表资源 */
    public static isLoaded() {
        return this.tableZipParser && this.tableZipParser.isLoaded;
    }

    /**是否已完成 */
    public static isComplete() {
        return this.tableZipParser && this.tableZipParser.isComplete();
    }

    /**
     * 加载配置表
     * */
    public static loadTable(onComplete: (buffer: BufferAsset) => void): void {
        Res.getResRef(
            { url: this.tableUrl, type: BufferAsset },
            "ParserTable",
            (ref) => {
                if (ref) {
                    let asset = ref.content;
                    ref.dispose();

                    onComplete(asset.buffer());
                } else {
                    onComplete(null);
                }
            });
    }

    /**
     * 解析Zip压缩数据
     * @param data 传进来个的是zip文件数据
     * @param onComplete
     * @param parserFileList 需要在加载之后就解析的文件，如果没有指定，则默认加载之后就立刻解析所有的文件
     */
    public static parserTableByZipData(data: ArrayBuffer, onComplete: () => void, parserFileList?: Array<string>) {
        this.tableZipParser = new TableZipParser();
        this.tableZipParser.parser(data, onComplete, parserFileList);
    }

    /**
     * 继续解析剩余表数据
     * @param onComplete
     */
    public static parserTableContinue(onComplete: () => void) {
        this.tableZipParser?.parserTableList(onComplete);
    }

    /**
     * 读取表的Id项，匹配出结果
     * @param tableFullName 类定义
     * @param id 匹配的值
     */
    public static getDataById<T>(tableFullName: Constructor<T>, id: string | number): T {
        let tableData = this.tableZipParser.getData(tableFullName.toString());
        return tableData[id];
    }

    /**
     * 多条件匹配
     * tableFullName 类定义
     * cons 查找的条件ID
     * conValue 条件匹配的值
     */
    public static getDataByMulti<T>(tableFullName: Constructor<T>, cons: string[], conValue: string[] | number[]): T[] {
        let tables = this.getAllData(tableFullName);
        //开始匹配
        let tempArr: any[] = [];
        for (let i: number = 0, len: number = tables.length; i < len; i++) {
            let table = tables[i];
            let ti = 0;
            for (let j: number = 0, jlen: number = cons.length; j < jlen; j++) {
                if (table[cons[j]] == conValue[j]) {
                    ti++;
                }
            }
            if (cons.length == ti) {
                tempArr.push(table);
            }
        }
        return tempArr;
    }
    /**
     * 多条件匹配，只取找到的第一条数据
     * @param tableFullName 
     * @param conds  k v条件匹配，v为基本类型，用等于不等于判断
     * @param keyCondFunc  k v条件匹配，v为方法，满足条件返回true， 不满足返回false
     * @returns 找到满足所有条件的数据，找不到为null
     */
    public static get1DataByMulti<T, V, U extends keyof T, P extends T[U]>(tableFullName: Constructor<T>, conds: condType<T, V>, keyCondFunc?: keyCondFuncType<T, U, P>): T | null{
        let _conds = {}
        conds ? js.mixin(_conds, conds) : 0
        keyCondFunc ? js.mixin(_conds, keyCondFunc) : 0
        let keys = Object.keys(_conds)
        let keyLen = keys.length
        if (keyLen == 0) {
            Logger.config("所有条件都为空？？")
            return null
        }
        
        let array = this.getAllData(tableFullName)
        let arrLen = array.length;
        for (let di = 0; di < arrLen; ++di) {
            let info = array[di]
            let i = 0
            for (; i < keyLen; ++i) {
                let key = keys[i]
                let testFun = keyCondFunc && keyCondFunc[key]

                //只要有一个条件为false就不符合判断，break判断下一个数据
                if (testFun) {
                    if (!testFun(info[key], info))
                        break
                } else if (info[key] !== conds[key]) {
                    break
                }
            }
            if(i == keyLen) {
                return info //找到所有判断条件都为true的数据
            }
        }

        return null
    }

    /**
     * 获取整个表格的数据
     * @param tableFullName
     */
    public static getAllData<T>(tableFullName: Constructor<T>): T[] {
        if (tableFullName == null) {
            return [];
        }
        return this.tableZipParser.getDataArray(tableFullName.toString()) as T[];
    }

    /**
     * 获取整个表格的数据 浅拷贝
     * @param tableFullName
     */
    public static getAllSallowCopy<T>(tableFullName: Constructor<T>): T[] {
        let allData: T[] = this.getAllData(tableFullName);
        return allData ? allData.slice() : [];
    }
}