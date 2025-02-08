import {SocketAbstractParse} from "../SocketAbstractParse";
import {SocketContext} from "../SocketContext";
import {SocketParseType} from "../SocketParseType";
import {LongForNetwork} from "db://assets/scripts/core/prototypes/LongForNetwork";

/**number */
export class NumberParse extends SocketAbstractParse {

    /**int 32 */
    private static INT32 = 0x01;

    /**int 64 */
    private static INT64 = 0x02;

    /**浮点 */
    private static FLOAT = 0x03;

    /**双精度 */
    private static DOUBLE = 0x04;

    getValue(ctx: SocketContext, flag: number) {
        var buf = ctx.getBuffer();
        var nevigate = ((flag & SocketAbstractParse.FLAG_0X08) != 0); //是否负数 (0000 #000)
        var signal = SocketAbstractParse.getFlagSignal(flag);
        var value = 0;
        if (signal == NumberParse.INT32) {
            value = SocketAbstractParse.readVarInt32(buf, buf.readUint8());
            return nevigate ? -value : value;
        } else if (signal == NumberParse.INT64) {
            value = SocketAbstractParse.readVarInt64(buf, buf.readUint8());
            return nevigate ? -value : value;
            //var longStr = SocketAbstractParse.readLong(buf, buf.readUint8());
            //return new BigNumber(nevigate ? "-" + longStr : longStr);
        } else if (signal == NumberParse.FLOAT) {
            value = buf.readFloat32();
            return value;
        } else if (signal == NumberParse.DOUBLE) {
            value = buf.readFloat64();
            return value;
        }
        console.log("NumberParse::getValue => UnknowSignalException");
        return null;
    }

    setValue(ctx: SocketContext, obj: any) {
        var buf = ctx.getBuffer();
        var flag = SocketParseType.NUMBER;
        if (!obj) {
            obj = 0;
        }

        var v = obj;
        if (v.toString().indexOf(".") > 0) {
            // 小数
            if (v < 0) {
                flag |= SocketAbstractParse.FLAG_0X08 | NumberParse.FLOAT;
            } else {
                flag |= NumberParse.FLOAT;
            }
            buf.writeByte(flag);
            buf.writeFloat32(v);
        } else {
            if (obj instanceof LongForNetwork) {
                // Int64
                if (v < 0) {
                    flag |= SocketAbstractParse.FLAG_0X08 | NumberParse.INT64;
                } else {
                    flag |= NumberParse.INT64;
                }
                buf.writeByte(flag);
                SocketAbstractParse.putVarInt64(buf, Math.abs(v.numberValue));
            } else if (v >= -2147483648 && v <= 2147483647) { //32位
                // Int32
                if (v < 0) {
                    flag |= SocketAbstractParse.FLAG_0X08 | NumberParse.INT32;
                } else {
                    flag |= NumberParse.INT32;
                }
                buf.writeByte(flag);
                SocketAbstractParse.putVarInt32(buf, Math.abs(v));
            } else {
                //异常处理 (支持64位引擎可以去掉)
                //console.log("NumberParse::setValue => 64位的会有精度问题，可以转换字符串发送");
                //v = 0; // js不支持 64的 所以默认处理

                // Int64
                if (v < 0) {
                    flag |= SocketAbstractParse.FLAG_0X08 | NumberParse.INT64;
                } else {
                    flag |= NumberParse.INT64;
                }
                buf.writeByte(flag);
                SocketAbstractParse.putVarInt64(buf, Math.abs(v));
            }
        }

    }
}