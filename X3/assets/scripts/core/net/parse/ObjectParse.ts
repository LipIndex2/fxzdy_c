import { SocketAbstractParse } from "../SocketAbstractParse";
import { SocketContext } from "../SocketContext";
import { SocketParseType } from "../SocketParseType";
import { SocketTransfer } from "../SocketTransfer";

/** object */
export class ObjectParse extends SocketAbstractParse {

    getValue(ctx: SocketContext, flag: number): object {
        var buf = ctx.getBuffer();
        var tag = buf.readUint8();

        // 对象解析
        var rawType = SocketAbstractParse.readVarInt32(buf, tag);
        var def = SocketTransfer.ins.getTypeByIdx(rawType);

        if (def == null) {
            // 类型未定义
            //log.error("类型定义[" , rawType , "]不存在")
            console.error("ObjectParse::getValue => UnknowTypeDefException");
            return null;
        }

        // 由于js没有具体的类。所以通用Object代替
        // var result = MsgUtils.getVo(def.getName()); //暂时不需要 __vocp__
        var result = {};
        var fields = def.getFields();

        // 字段数量 , 最大255
        var len = buf.readUint8();
        for (var i = 0; i < len; i++) {
            var fValue = buf.readUint8();
            var value = ctx.getValue(fValue);
            //log.debug("对象" , result , "属性" , f.getName() , "赋值" , value);
            result[fields[i].getName()] = value;
        }
        return result;
    }

    /**客户端vo转成 数组 形式发送 */
    setValue2(ctx: SocketContext, obj: object): void {
        //@ts-ignore
        var c2sVo = ClientVo[obj.__vocp__];
        var arr = [];
        for (var i = 0, len = c2sVo.length; i < len; i++) {
            arr[i] = obj[c2sVo[i]];
        }
        ctx.setValue(arr);
    }

    setValue(ctx: SocketContext, obj: object): void {
        //@ts-ignore
        if (ClientVo[obj.__vocp__]) {
            //客户端vo c2s
            this.setValue2(ctx, obj);
            return;
        }

        var buf = ctx.getBuffer();
        var def = ctx.getTypeDef(obj);
        if (def == null) {
            // 类型定义不存在 （找一下是 客户端vo(c2s)没有，还是服务端vo没有） 还有就是就是发给服务端的vo不要加  xxx.xxxVo(只有c2s才需要 xxx.xxC2S)
            console.error("ObjectParse::getValue => UnknowTypeDefException Vo.");
            return;
        }

        var code = def.getCode();
        var fields = def.getFields();
        var len = fields.length;

        buf.writeByte(SocketParseType.OBJECT);
        SocketAbstractParse.putVarInt32(buf, code);
        buf.writeByte(len);

        for (var i = 0; i < len; i++) {
            var v = obj[fields[i].getName()];
            ctx.setValue(v);
        }
    }
}
