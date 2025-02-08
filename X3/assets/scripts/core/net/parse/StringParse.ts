import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";
import { LayaByte } from "./LayaByte";

/**string */
export class StringParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): string {
        var buf = ctx.getBuffer();
        var len = SocketAbstractParse.readVarInt32(buf, buf.readUint8());

        if (buf.bytesAvailable < len) {
            console.log("StringParse::getValue => EOFError");
            return;
        }
        return buf.readUTFBytes(len);
    }

    setValue(ctx: SocketContext, str: string): void {
        var buf = ctx.getBuffer();
        var bytes = new LayaByte();
        bytes.writeUTFBytes(str);
        var len = bytes.length;
        buf.writeByte(SocketParseType.STRING);
        SocketAbstractParse.putVarInt32(buf, len);
        buf.writeArrayBuffer(bytes.buffer, 0, len);
    }
}
