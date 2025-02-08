import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/**null */
export class NullParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): any {
        return null;
    }

    setValue(ctx: SocketContext, obj: number): void {
        ctx.getBuffer().writeByte(SocketParseType.NULL);
    }
}
