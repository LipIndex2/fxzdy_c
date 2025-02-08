
import { ILoginVo } from "../vo/ILoginVo";
import LoginVo from "../vo/LoginVo";
import { ChooseServerModel } from "./ChooseServerModel";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import G from "../../../../core/comm/G";

/**
 * 登录模型
 */
export default class LoginModel extends BaseModel {
    private _loginVo: LoginVo;

    constructor() {
        super();
        this._loginVo = new LoginVo();
    }

    /**重置 */
    public reset() {
        this._loginVo.reset();
        ChooseServerModel.ins().reset();
    }

    /**获取登录数据*/
    public get vo() {
        return this._loginVo;
    }

    /**登录数据*/
    public initVo(vo: ILoginVo) {
        this._loginVo.initVo(vo);
        G.TimeManager.setCurServerTime(this._loginVo.timestamp);
    }

    /**是否已登录 */
    public get isLogined() {
        return this._loginVo.isLogined;
    }

    public get serverUrl() {
        return ChannelManager.ins().loginUrl;
    }

    /**获取账号 */
    public getAccount() {
        return this._loginVo.uid + "." + this._loginVo.oid + "_" + ChooseServerModel.ins().serverVo.id;
    }

    /**获取创角签名*/
    public getCreateRoleSignAndTime() {
        return { sign: this._loginVo.createRoleSign, timestamp: this._loginVo.timestamp, param: this._loginVo.createRoleParam };
    }

    /**获取登录签名 */
    public getLoginSignAndTime() {
        return { sign: this._loginVo.loginSign, timestamp: this._loginVo.timestamp, param: this._loginVo.loginParam };
    }
}