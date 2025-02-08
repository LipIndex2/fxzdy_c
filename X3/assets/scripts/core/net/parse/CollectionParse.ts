import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/** 采集 */
export class CollectionParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): Array<any> {
        var signal = SocketAbstractParse.getFlagSignal(flag);
        // 读取数组
        var arrayFlag = SocketParseType.ARRAY | signal;
        var array = ctx.getValue(arrayFlag);
        return array;
    }

    setValue(ctx: SocketContext, obj: Array<any>): void {
        var buf = ctx.getBuffer();
        var len = obj.length;
        buf.writeByte(SocketParseType.COLLECTION);
        SocketAbstractParse.putVarInt32(buf, len);
        for (var i = 0; i < len; i++) {
            ctx.setValue(obj[i]);
        }
    }
}
