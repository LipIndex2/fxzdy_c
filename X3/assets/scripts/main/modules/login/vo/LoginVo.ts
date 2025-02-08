import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { ILoginVo, INoticeVo, IRoleVo, IServerVo } from "../vo/ILoginVo";

/**
 * 登录模型
 */
export default class LoginVo extends BaseModel {
    private _loginVo: ILoginVo;

    constructor() {
        super();
    }

    /**初始化后端数据 */
    initVo(vo: ILoginVo) {
        this._loginVo = vo;
    }

    /**重置 */
    public reset() {
        this._loginVo = null;
    }


    /**服务器列表数据 */
    public get serverList(): IServerVo[] {
        return [{ id: 1, name: "测试服", address: 'ws://106.52.201.68:18801', states: 1, startTime: 1737424800 }];
    }

    /** 已创建的角色信息 */
    public get roleVos(): IRoleVo[] {
        return this._loginVo?.roleVos || [];
    }

    /** 公告 */
    public get notices(): INoticeVo[] {
        return this._loginVo?.updateNotices || [];
    }

    /**账号信息 */
    public get account(): string {
        return this._loginVo?.account;
    }

    /** 获取后端返回标识 */
    public get uid(): string {
        return this._loginVo?.account || "";
    }

    /** 代理商id */
    public get oid(): number {
        return this._loginVo?.oid || ChannelManager.ins().oid;
    }

    /** 登录数据*/
    public get loginVo(): ILoginVo {
        return this._loginVo;
    }

    /** 登录数据*/
    public set loginVo(vo: ILoginVo) {
        this._loginVo = vo;
    }

    /**是否已登录 */
    public get isLogined() {
        return !!this._loginVo;
    }

    /**是否需要实名制 */
    public needRealName() {
        return ChannelManager.ins().channel.realName === true;
    }

    /**登录签名 */
    public get loginSign() {
        return this._loginVo?.loginSign;
    }

    /**创角参数 */
    public get loginParam() {
        return this._loginVo?.loginParam;
    }

    /**创角签名 */
    public get createRoleSign() {
        return this._loginVo?.createRoleSign;
    }

    /**创角参数 */
    public get createRoleParam() {
        return this._loginVo?.createRoleParam;
    }

    /**推荐创角服务器Id */
    public get recommendServer() {
        return this._loginVo?.recommendServer;
    }

    /**快速登录使用 
     * @see Vo.account.ReLoginInfoVo*/
    public get reLoginInfo() {
        return this._loginVo?.reLoginSign ? { param: this._loginVo.reLoginParam, timestamp: this._loginVo.timestamp, sign: this._loginVo.reLoginSign } : null;
    }

    /**清理 可重登状态 (不可重登)*/
    public cleanRelogin() {
        if (this._loginVo && this._loginVo.reLoginSign) {
            this._loginVo.reLoginSign = null;
        }
    }

    /**获取数据时的服务器时间戳 */
    public get timestamp() {
        return this._loginVo ? this._loginVo.timestamp : Date.now();
    }
}