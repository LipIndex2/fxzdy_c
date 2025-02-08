import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";

/**boolean */
export class BooleanParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): boolean {
        var signal = SocketAbstractParse.getFlagSignal(flag);
        if (signal == 0x00) {
            return false;
        }
        else if (signal == 0x01) {
            return true;
        }
        console.log("BooleanParse::getValue => UnknowSignalException");
        return null;
    }

    setValue(ctx: SocketContext, obj: boolean): void {
        var buf = ctx.getBuffer();
        var flag = SocketParseType.BOOLEAN;
        if (obj == true) {
            // #### 0001
            flag |= 0x01;
            buf.writeByte(flag);
        }
        else {
            // #### 0000
            buf.writeByte(flag);
        }
    }
}
