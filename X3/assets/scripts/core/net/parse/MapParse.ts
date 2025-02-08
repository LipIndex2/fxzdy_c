import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/**map */
export class MapParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): object {
        var buf = ctx.getBuffer();
        var tag = buf.readUint8();
        var len = SocketAbstractParse.readVarInt32(buf, tag);
        var result = {};
        for (var i = 0; i < len; i++) {
            var fKey = buf.readUint8();
            var key = ctx.getValue(fKey);
            var fValue = buf.readUint8();
            var value = ctx.getValue(fValue);
            // 字段赋值
            result[key] = value;
        }
        return result;
    }

    setValue(ctx: SocketContext, obj: object): void {
        var buf = ctx.getBuffer();
        var keys = [];
        var vals = [];
        for (var key in obj) {
            let numKey = Number(key);
            if (isNaN(numKey)) {
                keys.push(key);
            } else {
                keys.push(Number(key));
            }
            vals.push(obj[key]);
        }

        var len = keys.length;
        buf.writeByte(SocketParseType.MAP);
        SocketAbstractParse.putVarInt32(buf, len);

        for (var i = 0; i < len; i++) {
            ctx.setValue(keys[i]);
            ctx.setValue(vals[i]);
        }
    }
}
