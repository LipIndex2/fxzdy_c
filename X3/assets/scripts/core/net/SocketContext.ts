import { IPool } from "../pool/IPoolInstance";
import { SocketAbstractParse } from "./SocketAbstractParse";
import { SocketParseType } from "./SocketParseType";
import { SocketTransfer } from "./SocketTransfer";
import { LayaByte } from "./parse/LayaByte";

import { _decorator } from "cc";
import {LongForNetwork} from "db://assets/scripts/core/prototypes/LongForNetwork";
const { ccclass } = _decorator;
@ccclass("SocketContext")

/**socket 代理 */
export class SocketContext implements IPool {

    private buffer: LayaByte

    /**
     * 销毁对象
     */
    public destroy() {
        this.buffer = null;
    }

    public setBuffer(buffer: LayaByte) {
        this.buffer = buffer;
    }

    public getBuffer() {
        return this.buffer;
    }

    /**获得数据 */
    public getValue(flag: number): any {
        var type = SocketAbstractParse.getFlagTypes(flag);
        var proxy = SocketTransfer.ins.getParse(type);
        if (proxy != null) {
            return proxy.getValue(this, flag);
        }
        console.log("Context::getValue => WrongTypeException");
        return null;
    }

    /**获取类型默认数据 */
    public getTypeDef(obj): any {
        var type = null;
        if (obj["__vocp__"]) {
            type = SocketTransfer.ins.getTypeByName(obj["__vocp__"]);
        }
        return type;
    }

    /**设置数据 */
    public setValue(value: any): void {
        var type;
        // 类型
        if (value == null) {
            type = SocketParseType.NULL;
        }
        else if (typeof (value) == "number") {
            type = SocketParseType.NUMBER;
        }
        else if (value instanceof LongForNetwork) {
            type = SocketParseType.NUMBER;
        }
        else if (typeof (value) == "string") {
            type = SocketParseType.STRING;
        }
        else if (typeof (value) == "boolean") {
            type = SocketParseType.BOOLEAN;
        }
        else if (value["name"] != null && value["ordinal"] != null) {
            type = SocketParseType.ENUM;
        }
        else if (value instanceof Date) {
            type = SocketParseType.DATE_TIME;
        }
        else if (value instanceof LayaByte) {
            type = SocketParseType.BYTE_ARRAY;
        }
        else if (value instanceof Array) {
            type = SocketParseType.ARRAY;
        }
        /*
            else if (value instanceof BigNumber) {
                //大数据转换成字符串发给服务端
                type = SocketParseType.STRING;
                value = value.toString();
            }*/
        else {
            if (value.__vocp__) {
                type = SocketParseType.OBJECT;
            }
            else {
                type = SocketParseType.MAP;
            }
        }
        var proxy = SocketTransfer.ins.getParse(type);
        if (proxy != null) {
            proxy.setValue(this, value);
        }
        else {
            console.log("Context::setValue => WrongTypeException");
        }
    }

    onRecovery(): void {
        
    }
}
