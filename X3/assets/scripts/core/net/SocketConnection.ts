import { LayaEvent } from "../comm/LayaEvent";
import { ZlibUtils } from "../utils/ZlibUtils";
import { LayaSocket } from "./LayaSocket";
import { SocketMessageConstant } from "./SocketMessageConstant";
import { SocketTransfer } from "./SocketTransfer";
import { LayaByte } from "./parse/LayaByte";
import { EventTarget } from "cc";
import G from "db://assets/scripts/core/comm/G";

/**socket 代理 */
export class SocketConnection extends EventTarget {


    /** Socket 实例 */
    private _socket: LayaSocket;

    /**单例 byte */
    public cacheBytes: LayaByte;

    /**Socket传输的AMF格式 */
    private static SOCKET_AMF_FORMAT = 0;

    /**信息头部长度  这里的头是指（头+消息）的头 */
    public static HEADER_LEN = 17 //1+4+8+2+2

    constructor() {
        super();
        //临时变量
        this.cacheBytes = new LayaByte();
        this.cacheBytes.endian = LayaByte.BIG_ENDIAN;

        //实例化socket对象
        this._socket = new LayaSocket();
        this._socket.endian = LayaByte.BIG_ENDIAN;
        this._socket.on(LayaEvent.ERROR, this.onError, this);
        this._socket.on(LayaEvent.OPEN, this.onConnect, this);
        this._socket.on(LayaEvent.CLOSE, this.onDisconnect, this);
        this._socket.on(LayaEvent.MESSAGE, this.onMessage, this);
    }

    /** 是否已经连接 */
    public get connected(): boolean {
        return this._socket.connected;
    }

    /**
     * 与服务端建立连接
     * @param serAddr 地址
     */
    public connect(serAddr: string) {
        this._socket.connect(serAddr);
    }

    /** 关闭当前连接 */
    public closeConnect() {
        //this._socket.close(); //安卓后台有概率不清理连接状态 所以用cleanSocket
        this._socket.cleanSocket();
    }

    /**
     * 发送数据。
     * @param module 模块号
     * @param cmd 指令号
     * @param data 发送的数据
     * @param id 通讯的ID
     */
    public send(module: number, cmd: number, c2sData: any, id: number): void {
        var Messages = new LayaByte();
        Messages.endian = LayaByte.BIG_ENDIAN;

        if (c2sData != null) {
            // 新的编码解析方式
            Messages = SocketTransfer.ins.encode(c2sData);
        }

        //构建信息头 [格式][状态][序号[指令][模块] //编码格式（1），状态（4），序号（8），指令（2），模块号（2）
        var MessageHead = new LayaByte();
        MessageHead.endian = LayaByte.BIG_ENDIAN;
        MessageHead.writeByte(SocketConnection.SOCKET_AMF_FORMAT); //AMF类型格式标示.固定为0[格式]
        //状态：状态为int值，以二进制的位来标识信息的状态和类型 //0正常请求 1回应
        MessageHead.writeInt32(0);
        //[序号]
        MessageHead.writeFloat64(id);
        //[指令]
        MessageHead.writeInt16(cmd);
        //[模块]
        MessageHead.writeInt16(module);

        //消息长度 长度（int32）4位+消息头长度+消息体长度
        // var MbagLength = 4 + MessageHead.length + Messages.length;
        var output = this._socket.output;

        // output.writeInt32(MbagLength);
        output.writeArrayBuffer(MessageHead.buffer);
        output.writeArrayBuffer(Messages.buffer);
        this._socket.flush();
    }

    /**
     * 检查状态值中是否有指定状态
     * @param state 状态值
     * @param check 被检查的状态
     */
    private hasState(status: number, check: number) {
        return (status & check) === check ? true : false;
    }

    /**
     * 检查状态值中是否有指定状态
     * @param state 状态值
     */
    private getErrorCode(status: number) {
        return (status >> SocketMessageConstant.ERROR_CODE_BIT);
    }



    /**
     * 判断数据是否有错，
     * 错误的情况下没有信息包
     * @param	value
     * @return
     */
    private getDataErrorStr(errorCode: number = 0) {
        if (errorCode > 0) {
            var strError: string = null;
            switch (errorCode) {
                case SocketMessageConstant.COMMAND_NOT_FOUND:
                    strError = "请求指令不存在";
                    break;
                case SocketMessageConstant.DECODE_EXCEPTION:
                    strError = "解码异常";
                    break;
                case SocketMessageConstant.ENCODE_EXCEPTION:
                    strError = "编码异常";
                    break;
                case SocketMessageConstant.PARAMETER_EXCEPTION:
                    strError = "参数异常";
                    break;
                case SocketMessageConstant.IDENTITY_EXCEPTION:
                    strError = "会话身份异常";
                    break;
                case SocketMessageConstant.FORWARD_TARGET_NOT_FOUND:
                    strError = "找不到转发目标，转发失败";
                    break;
                case SocketMessageConstant.FORWARD_SERVER_NOT_OPEN:
                    strError = "转发服务未开启";
                    break;
                case SocketMessageConstant.NOT_SUPPORT_CODER:
                    strError = "不支持的编码方式";
                    break;
                case SocketMessageConstant.UNKNOWN_EXCEPTION:
                    strError = "未知异常";
                    break;
                case SocketMessageConstant.REQUEST_TO_FREQUENTLY:
                    strError = "网络请求频繁，请稍后重试";
                    break;
                default:
                    strError = "未知错误";
                    break;
            }
            return strError;
        }
        return null;
    }

    /** 接收务器的数据 */
    private onMessage(message: ArrayBuffer): void {
        var cacheBytes = this.cacheBytes;
        cacheBytes.clear();
        cacheBytes.writeArrayBuffer(message);
        cacheBytes.pos = 0;

        if (SocketConnection.HEADER_LEN <= cacheBytes.length) {
            //格式
            var format = cacheBytes.readByte(); //1字节
            //状态
            var status = cacheBytes.readInt32(); //4字节
            //序号
            var id = cacheBytes.readFloat64(); //8字节
            //指令
            var cmd = cacheBytes.readInt16(); //2字节
            //模块
            var module = cacheBytes.readInt16(); // 2字节
            //数据
            var s2cData = null;
            //错误信息
            var errorCode = this.getErrorCode(status);

            //判断消息错误
            if (errorCode) {
                var strErrorReason = this.getDataErrorStr(errorCode);
                G.Logger.error(`[服务端socket报错] module = ${module}, cmd = ${cmd}, id = ${id}, status = ${status}, error = ${strErrorReason}`);
            }

            if (cacheBytes.bytesAvailable > 0) {
                var bytes = new LayaByte();
                bytes.endian = LayaByte.BIG_ENDIAN;
                bytes.writeArrayBuffer(cacheBytes.buffer, cacheBytes.pos, cacheBytes.length - cacheBytes.pos);
                bytes.pos = 0;

                if (this.hasState(status, SocketMessageConstant.STATE_COMPRESS)) {
                    var ab = ZlibUtils.analyzeData(bytes.buffer);
                    bytes = new LayaByte(ab);
                }

                //解析数据
                s2cData = SocketTransfer.ins.decode(bytes);
            }
            this.emit(LayaEvent.MESSAGE, [module, cmd, s2cData, id, strErrorReason]);
        }

        cacheBytes.clear();
    }

    /** 重连的数据包 */
    public reconnectMessage(message: ArrayBuffer) {
        this.onMessage(message);
    }

    /** socket连接 */
    private onConnect() {
        // 发出已连接事件
        this.emit(LayaEvent.OPEN);
    }

    /** 断开socket连接回调 */
    private onDisconnect() {
        this.emit(LayaEvent.CLOSE);
    }

    /** 连接IO错误 */
    private onError(e) {
        this.emit(LayaEvent.ERROR, e);
    }
}

