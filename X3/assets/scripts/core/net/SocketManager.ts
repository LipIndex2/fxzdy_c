import { PoolManager } from "../pool/PoolManager";
import { SocketC2SVo } from "./SocketC2SVo";
import { EventTarget } from "cc";
import { SocketConnection } from "./SocketConnection";
import { LayaEvent } from "../comm/LayaEvent";
import G from "db://assets/scripts/core/comm/G";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

export enum ConnectState {
    /**未连接 */
    Unconnect = 0,
    /**连接中 */
    Connecting = 1,
    /**重连中 */
    Reconnecting = 2,
    /**已连接 */
    Connected = 3,
}

export class SocketManager extends EventTarget {

    private _socket: SocketConnection;

    private _c2sVoDic: object;

    private _state: ConnectState = ConnectState.Unconnect;

    /**服务器地址 */
    private _serverAddr: string;

    /**注册事件 */
    private _eventDic: object = Object.create(null);

    private _noTipsErrorMap: object = Object.create(null);

    /**累计接收数据 */
    private _reposeNum = 0;

    private static _ins: SocketManager;

    //找bug用的
    private sendRecord: Array<string> = []; //发送记录
    private receptionRecor: Array<string> = []; //接送记录
    private pushRecord: Array<string> = []; //推送记录
    private recordLimit: number = 15;

    public static ins(): SocketManager {
        if (!SocketManager._ins) {
            SocketManager._ins = new SocketManager();
        }
        return SocketManager._ins;
    }

    constructor () {
        super();
        this._socket = new SocketConnection();
        this._socket.on(LayaEvent.ERROR, this.onFailConnect, this);
        this._socket.on(LayaEvent.OPEN, this.onSuccessConnect, this);
        this._socket.on(LayaEvent.CLOSE, this.onCloseConnect, this);
        this._socket.on(LayaEvent.MESSAGE, this.onMsgRepose, this);
    }

    /**获取连接状态 */
    public get state() {
        return this._state;
    }

    /**累计接收数量 （用于判断连接是否通畅）*/
    public get reposeNum() {
        return this._reposeNum;
    }

    /**关闭链接
     * @return boolean 是否成功执行断开
     */
    public closeConnect(): boolean {
        //this._isManualClose = true;
        //this.clear();
        this._state = ConnectState.Unconnect;

        let isConnected = this._socket.connected;
        this._socket?.closeConnect();

        return isConnected;
    }

    /**
     * 与服务端建立Socket连接
     * @param ip IP地址
     * @param port 端口
     */
    public connect(addr: string): void {
        if (addr.indexOf("://") == -1) {
            if (addr.indexOf(":") != -1) {
                addr = "ws://" + addr;
            } else {
                addr = "wss://" + addr;
            }
        }

        this._serverAddr = addr;
        this._state = ConnectState.Connecting;
        this._socket.connect(addr);
    }

    /**
     * 重新Socket连接
     * @param ip IP地址
     * @param port 端口
     */
    public reconnect(): boolean {
        if (!this._serverAddr || this._state !== ConnectState.Unconnect) return false;

        this._state = ConnectState.Reconnecting;
        this._socket.connect(this._serverAddr);
        return true;
    }

    /**
     * 注册消息
     * @param module 模块号
     * @param cmd 命令号
     * @param callback 回调
     * @param noTipsError 不提示后端错误
     */
    public registerMsg(module: number, cmd: number, callback: Function, noTipsError: boolean = false): void {
        var modelDic = this._eventDic[module] || Object.create(null);
        modelDic[cmd] = callback;
        this._eventDic[module] = modelDic;

        if (noTipsError) {
            this._noTipsErrorMap[module + "_" + cmd] = true;
        }
    }

    /**
     * 删除消息
     * @param module 模块号
     * @param cmd 命令号
     */
    public removeMsg(module: number, cmd: number): void {
        if (this._eventDic[module] && this._eventDic[module][cmd]) {
            delete this._eventDic[module][cmd];
        }
    }

    /**链接成功 */
    private onSuccessConnect(): void {
        this._c2sVoDic = Object.create(null);
        this._state = ConnectState.Connected;
        console.log("连接成功");
        this.emit(LayaEvent.OPEN);
    }

    /**关闭 */
    private onCloseConnect(): void {
        this._c2sVoDic = null;
        this._state = ConnectState.Unconnect;
        console.log("关闭连接");
        this.emit(LayaEvent.CLOSE);
    }

    /**链接失败 */
    private onFailConnect(e): void {
        this._state = ConnectState.Unconnect;
        console.log("连接失败");
        this.emit(LayaEvent.ERROR, e);
    }

    /**清空 */
    public clear(): void {
        this._serverAddr = null;
    }

    private delaySendModuleMap: { [key: string]: number } = {};
    /****设置需要有点击间隔的协议号 */
    public setDelaySendModule(moduleId: number, cmd: number): void {
        this.delaySendModuleMap[moduleId + "_" + cmd] = 1;
    }

    public checkDelaySendModule(moduleId: number, cmd: number): boolean {
        let lastTime = this.delaySendModuleMap[moduleId + "_" + cmd];
        if (lastTime) {
            let nowTime = Date.now();
            if ((nowTime - lastTime) < 1000)
                return false;
            this.delaySendModuleMap[moduleId + "_" + cmd] = nowTime;
        }
        return true;
    }

    /**
     * 发送数据。
     * @param moduleId 模块号
     * @param cmd 指令号
     * @param c2sData 发送的数据
     * @param customData 客户端数据
     * @param lockTouch 是否锁屏
     */
    public send(moduleId: number, cmd: number, c2sData?: any, customData?: any): void {
        //判断需要点击间隔的协议
        if (!this.checkDelaySendModule(moduleId, cmd))
            return

        if (this._state !== ConnectState.Connected) {
            // tips
            G.FacadeManager.emit("event:floatingText:show", "网络连接失败，请检查网络连接或重新连接！")
            return;
        }

        var vo: SocketC2SVo = PoolManager.getItem(SocketC2SVo);
        vo.initObj(moduleId, cmd, c2sData, customData);

        //服务端强烈要求打开
        if (DebugUtils.isDebugAndInBrowser()) {
            // 屏蔽心跳包 
            if (moduleId !== 0 || cmd !== 2) {
                G.Logger.net(c2sData, `发送 moduleId=${moduleId}, cmd=${cmd})`);
                console.log(JSON.stringify(c2sData))
            }
        }

        this.seneByVo(vo);
    }

    /**
    * 发送数据。
    * @param vo SocketC2SVo
    */
    public seneByVo(vo: SocketC2SVo): void {
        if (this._c2sVoDic) {
            if (vo.module !== 0 || vo.cmd !== 2) { //屏蔽心跳包 
                this.sendRecord.push(vo.module + "_" + vo.cmd + "@" + (vo.customData ? "1" : "0") + ":" + Date.now());
                if (this.sendRecord.length > this.recordLimit) {
                    this.sendRecord.shift();
                }
            }
            this._c2sVoDic[vo.id] = vo;
            this._socket.send(vo.module, vo.cmd, vo.c2sData, vo.id);
        }
        else {
            console.log("socket close not send");
        }
    }

    /**获取自定义参数 （一次性接口） */
    private getCustomData(id: number): any {
        var customData;
        if (id && this._c2sVoDic) {
            var vo: SocketC2SVo = this._c2sVoDic[id];
            if (vo) {
                customData = vo.customData
                PoolManager.recovery(vo);
                delete this._c2sVoDic[id];
            }
        }
        return customData;
    }

    private onMsgRepose(args: any[]) {
        this.onRepose(args[0], args[1], args[2], args[3], args[4]);
    }

    private onRepose(module: number, cmd: number, s2cData: any, id: number, stringError?: string): void {
        if (cmd < 0) {
            this.pushRecord.push(module + "_" + cmd + ":" + Date.now());
            if (this.pushRecord.length > this.recordLimit) {
                this.pushRecord.shift();
            }
        }

        if (stringError && stringError !== "") {
            // 暂时在这里 跳出
            //TipsMgr.showLoginTipView(stringError);
            //return
        }

        this._reposeNum++;

        if (!s2cData && stringError) {
            //没有数据跳出
            return;
        }

        var fun: Function;
        if (this._eventDic[module]) {
            fun = this._eventDic[module][cmd];
        }
        if (fun) {
            let result: { code: number }
            if (cmd < 0) {
                result = s2cData;
            }
            else {
                if (typeof (s2cData) === "number") {
                    result = {
                        code: s2cData,
                    }
                }
                else {
                    result = s2cData;
                }
            }

            //服务端强烈要求打开
            if (DebugUtils.isDebugAndInBrowser()) {
                if (module !== 0 || cmd !== 2) { //屏蔽心跳包 
                    const cloneObj = JSON.parse(JSON.stringify(result));
                    G.Logger.net(cloneObj, `收到 Server Packet | moduleId=${module}, cmd=${cmd})`);
                }
            }

            // ! 测试 + 服务端 | 当服务端结果码小于0 时, 提示
            if (G.networkDebugFlag) {
                if (module > 0 && (module !== 0 || cmd !== 2)) { //屏蔽心跳包  
                    this.receptionRecor.push(module + "_" + cmd + "$" + (result && result.code ? result.code : 0) + ":" + Date.now());
                    if (this.receptionRecor.length > this.recordLimit) {
                        this.receptionRecor.shift();
                    }
                }

                if (result && result.code !== undefined && result.code < 0) {
                    const code = result.code;
                    const errorLog = `Server Error. moduleId=${module}, cmd=${cmd}, code=${code}`;
                    console.error(errorLog);

                    if (!this._noTipsErrorMap[module + "_" + cmd]) {
                        // tips
                        G.FacadeManager.emit("SERVER_ERROR_CODE", code);
                    }

                    if (DebugUtils.isDebugAndInBrowser()) {
                        //强烈要求 DEBUG 环境打开
                        G.FacadeManager.emit("EVENT_FLOATING_TEXT_DEBUG", errorLog);
                    }
                }
            }

            fun(result, this.getCustomData(id));
        }
        else {
            console.warn("没有监听协议 module:" + module + " cmd:" + cmd);
        }
    }

    /**重连数据 */
    public reconnectMessage(message: ArrayBuffer) {
        this._socket.reconnectMessage(message);
    }

    /** 获取协议记录 */
    public getSocketRecord(): string {
        let date = new Date();
        let times = (time) => {
            date.setTime(time);
            return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }

        let fun = (records: Array<string>) => {
            let result = [];
            for (let i = 0, len = records.length; i < len; i++) {
                let ts = records[i].split(":");
                result.push(ts[0] + " " + times(Number(ts[1])));
            }
            return result;
        }

        let sendRecord = fun(this.sendRecord);
        let receptionRecor = fun(this.receptionRecor);
        let pushRecord = fun(this.pushRecord);
        let data = {
            sendRecord: sendRecord,
            receptionRecor: receptionRecor,
            pushRecord: pushRecord
        }
        return JSON.stringify(data);
    }
}

