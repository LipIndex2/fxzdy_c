import { SocketContext } from "./SocketContext";
import { LayaByte } from "./parse/LayaByte";

    /** 解析类型基础代理 */
    export class SocketAbstractParse {
        // 1111 0000
        public static TYPE_MASK = 0xF0;
        // 0000 0111
        public static SIGNAL_MASK = 0x07;
        // 0000 1111
        public static NUMBER_MASK = 0x0F;
        // 1000 0000
        public static FLAG_0X80 = 0x80;
        // 0000 1000
        public static FLAG_0X08 = 0x08;


        /**读取取值 */
        public getValue(ctx: SocketContext, flag: number): any {
            return null;
        }

        /**写入值 */
        public setValue(ctx: SocketContext, obj: any) {

        }

        /**获取类型 */
        public static getFlagTypes(flag: number) {
            var code = (flag & SocketAbstractParse.TYPE_MASK);
            if (code == 0) {
                return flag;
            }
            return code;
        }

        /**获取子类型 */
        public static getFlagSignal(flag: number) {
            // 0000 0###
            var signal = (flag & SocketAbstractParse.SIGNAL_MASK);
            return signal;
        }

        /**读取长度 最高32位 */
        public static readVarInt32(buf: LayaByte, value: number) {
            // 1### #### (128 - (byte)0x80)
            if ((value & SocketAbstractParse.FLAG_0X80) == 0) {
                return value & 0x7F;
            }
            var signal = value & SocketAbstractParse.SIGNAL_MASK;
            if (buf.bytesAvailable < signal) {
                console.log("SocketAbstractParse::readVarInt32 出现错误1");
                return 0;
            }
            if (signal > 4 || signal < 0) {
                console.log("SocketAbstractParse::readVarInt32 出现错误2");
                return 0;
            }
            var result = 0;
            for (var i = 8 * (signal - 1); i >= 0; i -= 8) {
                var b = buf.readUint8();
                result += (b & 0xFF) * (1 << i); //二进制规律求值
            }
            return result;
        }

        /**写入长度 最高32位 */
        public static putVarInt32(out: LayaByte, value: number) {
            if (value < 0) {
                // 不能 < 0
                console.log("SocketAbstractParse::putVarInt32 出现错误1");
                return;
            }
            var b, b1, b2, b3, b4;
            // 1### #### (128 - (byte)0x80)
            if (value < SocketAbstractParse.FLAG_0X80) {
                b = value;
                out.writeByte(b);
            }
            else if (value <= 2147483647) { // 2147483647 int32最大值
                // VarInt32
                if (value >>> 24 > 0) {
                    b = (SocketAbstractParse.FLAG_0X80 | 4);
                    out.writeByte(b);
                    //
                    b1 = (value >>> 24 & 0xFF);
                    b2 = (value >>> 16 & 0xFF);
                    b3 = (value >>> 8 & 0xFF);
                    b4 = (value & 0xFF);
                    out.writeByte(b1);
                    out.writeByte(b2);
                    out.writeByte(b3);
                    out.writeByte(b4);
                }
                else if (value >>> 16 > 0) {
                    b = (SocketAbstractParse.FLAG_0X80 | 3);
                    out.writeByte(b);
                    //
                    b2 = (value >>> 16 & 0xFF);
                    b3 = (value >>> 8 & 0xFF);
                    b4 = (value & 0xFF);
                    out.writeByte(b2);
                    out.writeByte(b3);
                    out.writeByte(b4);
                }
                else if (value >>> 8 > 0) {
                    b = (SocketAbstractParse.FLAG_0X80 | 2);
                    out.writeByte(b);
                    //
                    b3 = (value >>> 8 & 0xFF);
                    b4 = (value & 0xFF);
                    out.writeByte(b3);
                    out.writeByte(b4);
                }
                else {
                    b = (SocketAbstractParse.FLAG_0X80 | 1);
                    out.writeByte(b);
                    //
                    b4 = (value & 0xFF);
                    out.writeByte(b4);
                }
            }
            else {
                // 不支持
                console.log("SocketAbstractParse::putVarInt32 出现错误 VarInt值超过范围");
                return;
            }
        }

        /**读取长度 最高64位 */
        static readVarInt64(buf: LayaByte, tag: number) {
            // 1### #### (128 - (byte)0x80)
            if ((tag & SocketAbstractParse.FLAG_0X80) == 0) {
                return tag & 0x7F;
            }
            var signal = tag & SocketAbstractParse.NUMBER_MASK;
            if (buf.bytesAvailable < signal) {
                console.log("SocketAbstractParse::readVarInt64 出现错误 1");
                return;
            }
            if (signal > 8 || signal < 0) {
                console.log("SocketAbstractParse::readVarInt64 出现错误 2");
                return;
            }
            var result = 0;
            for (var i = 8 * (signal - 1); i >= 0; i -= 8) {
                var b = buf.readUint8();
                result += Number(b & 0xFF) * Math.pow(2, i);
            }
            return result;
        }

        /**写入长度 最高64位 */
        static putVarInt64(out: LayaByte, value: number) {
            if (value < 0) {
                // 不能 < 0
                console.log("SocketAbstractParse::putVarInt64 出现错误 => 不能 < 0");
                return;
            }

            //小于 32位
            if (value <= 2147483647) {
                this.putVarInt32(out, value);
                return;
            }

            var b, b0, b1, b2, b3, b4, b5, b6, b7;
            // 1### #### (128 - (byte)0x80)
            if (value < SocketAbstractParse.FLAG_0X80) {
                b = value;
                out.writeByte(b);
            }
            else if (value < 0x7FFFFFFFFFFFFFFF) {
                // VarInt64
                if (Math.floor(value / Math.pow(2, 56)) > 0) {
                    b = (this.FLAG_0X80 | 8);
                    out.writeByte(b);
                    //
                    b0 = (value / Math.pow(2, 56) & 0xFF);
                    b1 = (value / Math.pow(2, 48) & 0xFF);
                    b2 = (value / Math.pow(2, 40) & 0xFF);
                    b3 = (value / Math.pow(2, 32) & 0xFF);
                    b4 = (value / Math.pow(2, 24) & 0xFF);
                    b5 = (value / Math.pow(2, 16) & 0xFF);
                    b6 = (value / Math.pow(2, 8) & 0xFF);
                    b7 = (value & 0xFF);
                    out.writeByte(b1);
                    out.writeByte(b2);
                    out.writeByte(b3);
                    out.writeByte(b4);
                    out.writeByte(b5);
                    out.writeByte(b6);
                    out.writeByte(b7);
                }
                else if (Math.floor(value / Math.pow(2, 48)) > 0) {
                    b = (this.FLAG_0X80 | 7);
                    out.writeByte(b);
                    //
                    b1 = (value / Math.pow(2, 48) & 0xFF);
                    b1 = (value / Math.pow(2, 48) & 0xFF);
                    b2 = (value / Math.pow(2, 40) & 0xFF);
                    b3 = (value / Math.pow(2, 32) & 0xFF);
                    b4 = (value / Math.pow(2, 24) & 0xFF);
                    b5 = (value / Math.pow(2, 16) & 0xFF);
                    b6 = (value / Math.pow(2, 8) & 0xFF);
                    b7 = (value & 0xFF);
                    out.writeByte(b1);
                    out.writeByte(b2);
                    out.writeByte(b3);
                    out.writeByte(b4);
                    out.writeByte(b5);
                    out.writeByte(b6);
                    out.writeByte(b7);
                }
                else if (Math.floor(value / Math.pow(2, 40)) > 0) {
                    b = (this.FLAG_0X80 | 6);
                    out.writeByte(b);
                    //
                    b2 = (value / Math.pow(2, 40) & 0xFF);
                    b3 = (value / Math.pow(2, 32) & 0xFF);
                    b4 = (value / Math.pow(2, 24) & 0xFF);
                    b5 = (value / Math.pow(2, 16) & 0xFF);
                    b6 = (value / Math.pow(2, 8) & 0xFF);
                    b7 = (value & 0xFF);
                    out.writeByte(b2);
                    out.writeByte(b3);
                    out.writeByte(b4);
                    out.writeByte(b5);
                    out.writeByte(b6);
                    out.writeByte(b7);
                }
                else if (Math.floor(value / Math.pow(2, 32)) > 0) {
                    b = (this.FLAG_0X80 | 5);
                    out.writeByte(b);
                    //
                    b3 = (value / Math.pow(2, 32) & 0xFF);
                    b4 = (value / Math.pow(2, 24) & 0xFF);
                    b5 = (value / Math.pow(2, 16) & 0xFF);
                    b6 = (value / Math.pow(2, 8) & 0xFF);
                    b7 = (value & 0xFF);
                    out.writeByte(b3);
                    out.writeByte(b4);
                    out.writeByte(b5);
                    out.writeByte(b6);
                    out.writeByte(b7);
                }
                else {
                    b = (this.FLAG_0X80 | 4);
                    out.writeByte(b);
                    //
                    b4 = (value / Math.pow(2, 24) & 0xFF);
                    b5 = (value / Math.pow(2, 16) & 0xFF);
                    b6 = (value / Math.pow(2, 8) & 0xFF);
                    b7 = (value & 0xFF);
                    out.writeByte(b4);
                    out.writeByte(b5);
                    out.writeByte(b6);
                    out.writeByte(b7);
                }
            }
            else {
                // 不支持
                console.log("SocketAbstractParse::putVarInt64 出现错误 => VarInt值超过范围");
                return;
            }
        }

        /**读取long */
        public static readLong(buf: LayaByte, tag: number): string {

            // 1### #### (128 - (byte)0x80)
            if ((tag & this.FLAG_0X80) == 0) {
                var num = tag & 0x7F;
                return num.toString();
            }
            var signal = tag & this.NUMBER_MASK;
            if (buf.bytesAvailable < signal) {
                console.log("SocketAbstractParse::readLong 出现错误 => buf.bytesAvailable < signal");
                return;
            }
            if (signal > 8 || signal < 0) {
                console.log("SocketAbstractParse::readLong 出现错误 => signal > 8 || signal < 0");
                return;
            }

            var mostSigBits = 0;
            var leastSigBits = 0;
            for (var i = 8 * (signal - 1); i >= 0; i -= 8) {
                var b = buf.readUint8();
                if (i < 32) {
                    leastSigBits += (b & 0xFF) * (1 << i);
                }
                else {
                    mostSigBits += (b & 0xFF) * (1 << i); //(1<<32 = 1 32一个循环)
                }
            }
            return this.longToString(mostSigBits, leastSigBits);
        }

        /**
         * long 转 stirng
         * @param mostSigBits 头部 32位
         * @param leastSigBits 尾部 32位
         */
        public static longToString(mostSigBits: number, leastSigBits: number): string {
            var result = "";
            if (mostSigBits === 0) {
                result += leastSigBits;
            }
            else {
                var big = mostSigBits;
                var small = leastSigBits;
                var uintMax = 4294967296; //(2^32)
                var tempMod = 0;
                var modNum = 0;

                while (small > 0 || big > 0) {
                    //取最后一位
                    tempMod = (big % 10);
                    small = tempMod * uintMax + small;
                    //取最后一位
                    modNum = small % 10;
                    //进位
                    small = Math.floor(small / 10);
                    //进位
                    big = Math.floor(big / 10);

                    result = modNum.toString() + result;
                    if (big === 0) {
                        result = small.toString() + result;
                        small = 0;
                    }
                }
            }
            return result;
        }
    }
