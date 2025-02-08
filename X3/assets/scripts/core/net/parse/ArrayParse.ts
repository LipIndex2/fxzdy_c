import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/**Array */
export class ArrayParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): Array<any> {
        var buf = ctx.getBuffer();
        var result = new Array();
        var len = SocketAbstractParse.readVarInt32(buf, buf.readUint8());

        if (buf.bytesAvailable < len) {
            console.log("ArrayParse::getValue => EOFError");
            return null;
        }

        for (var i = 0; i < len; i++) {
            var fValue = buf.readUint8();
            var obj = ctx.getValue(fValue);
            result[i] = obj;
        }
        return result;

    }

    setValue(ctx: SocketContext, obj: Array<any>): void {
        var buf = ctx.getBuffer();
        var len = obj.length;
        buf.writeByte(SocketParseType.ARRAY);
        SocketAbstractParse.putVarInt32(buf, len);
        for (var i = 0; i < len; i++) {
            ctx.setValue(obj[i]);
        }
    }
}

