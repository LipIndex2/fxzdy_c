
import AccountHistoryCom from "../com/AccountHistoryCom";
import { UILoginKey } from "../const/UILoginConfig";
import LoginNotificationKey from "../../LoginNotificationKey";
import { AccountHistoryModel } from "../model/AccountHistoryModel";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ChannelManager } from "../../../../core/sdk/ChannelManager";
import { SdkManager } from "../../../../core/sdk/SdkManager";


@bindScript(UILoginKey.ACCOUNT_WIN)
export class AccountWin extends UIWin {

    static pkgName: string = "account";
    static viewName: string = "AccountWin";

    private get view(): ui.account.AccountWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [LoginNotificationKey.LOGIN_SUCCESS];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.LOGIN_SUCCESS:
                this.closeSelf();
                break;
        }
    }

    public onInit(): void {
        this.view.loginBtn.onClick(this.onLogin, this);
        this.view.historyBtn.onClick(this.onHistory, this);
    }

    public onOpen(): void {
        var account = AccountHistoryModel.ins().getNewAccount();
        var pwd = AccountHistoryModel.ins().getNewPwd();

        if (account && pwd) {
            this.view.accountInput.text = account;
            // this.view.passwordInput.text = pwd;
        }

        let accountList = AccountHistoryModel.ins().getAccountList();
        if (accountList && accountList.length >= 2) {
            this.view.historyBtn.visible = true;
            let hisCom: AccountHistoryCom = this.view.historyCom as any;
            hisCom.initData(accountList, this.onClickHistory.bind(this));
        }
    }

    public onClose(): void {
    }

    public onLogin(): void {

        let isSdk = SdkManager.ins().isEnable();

        if (isSdk) {
            SdkManager.ins().login();
            return;
        }

        // if (isSdk) {
        //     SdkManager.ins().login();

        var account = this.view.accountInput.text.trim();
        var password = "123";//this.view.passwordInput.text.trim();
        if (account && password && account.length >= 3) {
            this.emit(LoginNotificationKey.ACCOUNT_LOGIN, { userId: account, password: password, oid: ChannelManager.ins().oid });
        }
        /*
        if (!account || !password) {
            Toast.show(App.LangMgr.getString('account_not_empty'));
        } else if (account.length < 3 || password.length < 3) {
            Toast.show(App.LangMgr.getString('account_len_limit'));
        } else {
            AccountHistoryModel.ins().saveAccount(account, password);
            LoginController.ins().loginAccount(account, password);
        }*/
    }

    private onHistory() {
        if (this.view.historyCom.visible) {
            this.view.historyCom.visible = false;
        } else {
            this.view.historyCom.visible = true;
        }
    }


    private onClickHistory(index: number) {
        var account = AccountHistoryModel.ins().getAccountByIndex(index);
        var pwd = AccountHistoryModel.ins().getPwdByIndex(index);

        if (account && pwd) {
            this.view.accountInput.text = account;
            // this.view.passwordInput.text = pwd;
        }
        this.onHistory();
    }

}
