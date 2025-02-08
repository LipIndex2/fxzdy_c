import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/** ArrayBuffer */
export class ArrayBufferParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): ArrayBuffer {
        var buf = ctx.getBuffer();
        var len = SocketAbstractParse.readVarInt32(buf, buf.readUint8());
        if (buf.bytesAvailable < len) {
            console.log("ArrayBufferParse::getValue => EOFError");
            return null;
        }
        var result = null;
        if (len > 0) {
            result = buf.readArrayBuffer(len);
        }
        return result;
    }

    setValue(ctx: SocketContext, obj: ArrayBuffer): void {
        var buf = ctx.getBuffer();
        var len = obj.byteLength;
        buf.writeByte(SocketParseType.BYTE_ARRAY);
        SocketAbstractParse.putVarInt32(buf, len);
        buf.writeArrayBuffer(obj, 0, len);
    }
}
