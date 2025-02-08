import { Constructor } from "cc";
import { TableManager } from "../../core/table/TableManager";
import BaseSingleton from "../../core/base/BaseSingleton";


export class BaseTableManager<T> {
    static ins<T extends any>(this: Constructor<T>): T {
        if (!(<any>this)._ins) {
            (<any>this)._ins = new this();
        }
        return (<any>this)._ins;
    }

    private _tableName: any;
    constructor(_tableName) {
        this._tableName = _tableName;
    }

    /**查找数据 */
    findById(id: string | number): T {
        return TableManager.getDataById(this._tableName, id);
    }

    /** 全部数据 */
    getAllData(): Array<T> {
        return TableManager.getAllData(this._tableName);
    }


}