import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/**Date */
export class DateParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): number {
        var buf = ctx.getBuffer()
        var timestame = SocketAbstractParse.readVarInt64(buf, buf.readUint8());
        return timestame * 1000;
    }

    setValue(ctx: SocketContext, obj: Date): void {
        var buf = ctx.getBuffer();
        buf.writeByte(SocketParseType.DATE_TIME);
        var timestame = obj.getTime() / 1000;
        SocketAbstractParse.putVarInt64(buf, timestame);
    }
}
