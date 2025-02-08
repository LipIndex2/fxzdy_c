import { sys } from "cc";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";

/**
 * 账号记录模块
 */
export class AccountHistoryModel extends BaseModel {

    private _accountKey = "historyAcount";
    private _pwdKey = "historyPwd";
    private _autoKey = "autoLogin";
    private _showServerKey = "showServerList";

    private _accountList = [];
    private _pwdList = [];

    private _isAutoLogin = false;
    private _isShowServer = false;

    constructor() {
        super();

        const accountStr = sys.localStorage.getItem(this._accountKey) // (this._accountKey);
        const pwdStr = sys.localStorage.getItem(this._pwdKey);

        const autoLoginStr = sys.localStorage.getItem(this._autoKey);
        const showServerListStr = sys.localStorage.getItem(this._showServerKey);

        if (accountStr && pwdStr) {
            let accounts = JSON.parse(accountStr);
            let pwds = JSON.parse(pwdStr);
            if (accounts && pwds && accounts.length === pwds.length) {
                this._accountList = accounts;
                this._pwdList = pwds;
            }
        }

        if (autoLoginStr) this._isAutoLogin = true;
        if (showServerListStr) {
            this._isShowServer = true;
            sys.localStorage.setItem(this._showServerKey, false); //只使用一次
        }
    }

    /**是否自动登陆 */
    public isAutoLogin() {
        return this._isAutoLogin;
    }

    /**设置自动登陆 */
    public setAutoLogin(auto: boolean) {
        if (auto) {
            !this._isAutoLogin && sys.localStorage.setItem(this._autoKey, "1");
        } else {
            sys.localStorage.removeItem(this._autoKey);
        }
    }

    /**是否显示服务器列表 */
    public isShowServerList() {
        return this._isShowServer;
    }

    /**设置显示服务器列表 */
    public setShowServerList(show: boolean) {
        if (show) {
            sys.localStorage.setItem(this._showServerKey, "1");
        } else {
            sys.localStorage.removeItem(this._showServerKey);
        }
    }

    /**记录账号 */
    public saveAccount(account: string, pwd: string) {

        //长度不一致，清空数组
        if (this._accountList.length !== this._pwdList.length) {
            this._accountList = [];
            this._pwdList = [];
        }

        let index = this._accountList.indexOf(account);

        if (index === 0) {
            //没改变，不保存
            return;
        }

        if (index !== -1) {
            this._accountList.splice(index, 1);
            this._pwdList.splice(index, 1);
        }

        this._accountList.unshift(account);
        this._pwdList.unshift(pwd);


        sys.localStorage.setItem(this._accountKey, JSON.stringify(this._accountList));
        sys.localStorage.setItem(this._pwdKey, JSON.stringify(this._pwdList));
    }

    public getAccountList() {
        return this._accountList;
    }

    public getNewAccount(): string {
        return this._accountList.length && this._accountList[0];
    }

    public getNewPwd(): string {
        return this._pwdList.length && this._pwdList[0];
    }

    public getAccountByIndex(idx: number) {
        if (idx >= this._accountList.length) {
            return null;
        } else {
            return this._accountList[idx];
        }
    }

    public getPwdByIndex(idx: number) {
        if (idx >= this._pwdList.length) {
            return null;
        } else {
            return this._pwdList[idx];
        }
    }
}