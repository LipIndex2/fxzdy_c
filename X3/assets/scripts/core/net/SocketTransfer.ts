import { PoolManager } from "../pool/PoolManager";
import { SocketContext } from "./SocketContext";
import { SocketParseType } from "./SocketParseType";
import { SocketTypeDef } from "./SocketTypeDef";
import { ArrayBufferParse } from "./parse/ArrayBufferParse";
import { ArrayParse } from "./parse/ArrayParse";
import { BooleanParse } from "./parse/BooleanParse";
import { CollectionParse } from "./parse/CollectionParse";
import { DateParse } from "./parse/DateParse";
import { LayaByte } from "./parse/LayaByte";
import { MapParse } from "./parse/MapParse";
import { NullParse } from "./parse/NullParse";
import { NumberParse } from "./parse/NumberParse";
import { ObjectParse } from "./parse/ObjectParse";
import { StringParse } from "./parse/StringParse";

/**socket 转换 */
export class SocketTransfer {
    /**
     * key 是 code
     * 值是 TypeDef
     */
    public typeIdxs: Object;
    public typeClassPathMap: Object;

    /**代理 */
    public parses: object;

    /**单例 byte */
    public cacheBytes: LayaByte;

    /**实例 */
    private static _ins: SocketTransfer;

    /**获取实例 */
    public static get ins(): SocketTransfer {
        this._ins = this._ins || new SocketTransfer();
        return this._ins;
    }

    constructor() {
        this.parses = {};
        this.cacheBytes = new LayaByte();
        this.cacheBytes.endian = LayaByte.BIG_ENDIAN;

        this.parses[SocketParseType.NULL] = new NullParse();
        this.parses[SocketParseType.BOOLEAN] = new BooleanParse();
        this.parses[SocketParseType.BYTE_ARRAY] = new ArrayBufferParse();
        this.parses[SocketParseType.NUMBER] = new NumberParse();
        this.parses[SocketParseType.DATE_TIME] = new DateParse();
        this.parses[SocketParseType.STRING] = new StringParse();
        this.parses[SocketParseType.ARRAY] = new ArrayParse();
        this.parses[SocketParseType.COLLECTION] = new CollectionParse();
        this.parses[SocketParseType.MAP] = new MapParse();
        this.parses[SocketParseType.OBJECT] = new ObjectParse();
    }

    public getTypeByIdx(code: number): SocketTypeDef {
        return this.typeIdxs[code];
    }

    public getTypeByName(name: string): SocketTypeDef {
        return this.typeClassPathMap[name];
    }

    public getParse(type: number) {
        return this.parses[type];
    }

    public build(buffer: LayaByte): SocketContext {
        var ctx: SocketContext = PoolManager.getItem(SocketContext);
        ctx.setBuffer(buffer);
        return ctx;
    }

    /**
     * 对象编码
     * @param obj
     * @return
     */
    encode(obj: any) {
        this.cacheBytes.clear();
        var ctx = this.build(this.cacheBytes);
        ctx.setValue(obj);
        PoolManager.recovery(ctx);
        this.cacheBytes.length = this.cacheBytes.pos;
        return this.cacheBytes;
    }

    /**
     * 对象解码
     * @param buf
     * @return
     */
    decode(buf: LayaByte) {
        if (buf.bytesAvailable <= 0) {
            return null;
        }
        var ctx = this.build(buf);
        var flag = buf.readUint8();
        var val = ctx.getValue(flag);
        PoolManager.recovery(ctx);
        return val;
    }

    /**
     * 格式解析
     * @param	bytes
     */
    describe(bytes: ArrayBuffer) {
        this.typeIdxs = {};
        this.typeClassPathMap = {};

        var buf = new LayaByte(bytes);
        buf.endian = LayaByte.BIG_ENDIAN;
        buf.pos = 0;

        // 类型描述
        var code: number;
        var name: string;
        var def: SocketTypeDef;

        while (buf.bytesAvailable > 1) { //最少要两个才可以读 （解压工具问题 100的长度，他也会是65536长度）如果是服务端发 65535过来就会报错了
            // 对象
            def = SocketTypeDef.getType(buf);
            if (def !== null) {
                code = def.getCode();
                name = def.getName();
                this.typeIdxs[code] = def;
                this.typeClassPathMap[name] = def;
            }
            else {
                break;
            }
        }
    }
}
