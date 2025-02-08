import { SocketManager } from '../../net/SocketManager';
import { BaseNotification } from '../BaseNotification';
/**
 * MVC Model层
 * 所有的Model必须继承这个BaseModel
 */
export class BaseModel extends BaseNotification {

    static ins<T extends {}>(this: new (...arg) => T): T {
        if (!(<any>this)._ins) {
            (<any>this)._ins = new this();
        }
        return (<any>this)._ins;
    }

    static destroy(): void {
        if ((<any>this)._ins) {
            (<any>this)._ins.onDestroy();
            (<any>this)._ins = null;
        }
    }

    onDestroy(): void {
        super.onDestroy();
    };

    constructor() {
        super();
        //FacadeManager.ins().registerModel(this);
        this.doInit();
    }

    doInit(){
        this.addNotification();
    }

    /**
     * 当退出游戏时调用。
     * 一般用于清理数据
     * @protected
     */
    protected onExitGame(): void {
        this.removeNotification();
    }

    /**
     * 游戏断线重新连接成功之后调用
     * @protected
     */
    protected onReConnect(): void {
    }

    /**
     * 
     * @param module 模块号
     * @param cmd 命令
     * @param callback 
     * @param noTipsError 不提示后端错误码
     */
    protected registerMsg(module: number, cmd: number, callback: Function, noTipsError?:boolean): void {
        SocketManager.ins().registerMsg(module, cmd, callback.bind(this), noTipsError);
    }

    /**
     * 发送数据。
     * @param module 模块号
     * @param cmd 指令号
     * @param c2sData 发送的数据
     * @param customData 客户端数据
     */
    public send(module: number, cmd: number, c2sData?: any, customData?: any): void {
        SocketManager.ins().send(module, cmd, c2sData, customData);
    }
}