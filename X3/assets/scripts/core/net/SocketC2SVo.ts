import { IPool } from "../pool/IPoolInstance";
import { _decorator } from "cc";
const {ccclass} = _decorator;
@ccclass("SocketC2SVo")
/**客户端发送到服务端数据 */
export class SocketC2SVo implements IPool {

    /**模块id */
    public module: number;

    /**指令id */
    public cmd: number;

    /**客户端数据 */
    public customData: any;

    /**发送数据 */
    public c2sData: any;

    /**序号 */
    public id: number;

    /**自动序号 */
    private static _autoId: number = 0;

    /**
     * 初始化
     * @param module 模块号
     * @param cmd 指令号
     * @param c2sData 发送的数据
     * @param customData 客户端数据
     */
    public initObj(module: number, cmd: number, c2sData: number, customData?: any): void {
        this.module = module;
        this.cmd = cmd;
        this.c2sData = c2sData;
        this.customData = customData;
        this.id = ++SocketC2SVo._autoId;
    }

    /**
     * 销毁对象
     */
    public onRecovery(): void {
        this.customData = null;
        this.c2sData = null;
    }
}

