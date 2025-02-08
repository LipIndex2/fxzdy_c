import LoginNotificationKey from "../LoginNotificationKey";
import { AccountHistoryModel } from "./model/AccountHistoryModel";
import LoginModel from "./model/LoginModel";
import { ChooseServerModel } from "./model/ChooseServerModel";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ConnectProcedure } from "../../procedure/ConnectProcedure";
import { Logger } from "../../../core/log/Logger";
import { UIManager } from "../../../core/mvc/UIManager";
import { UILoginKey } from "./const/UILoginConfig";
import { LoginReqMgr } from "./model/LoginReqMgr";
import G from "../../../core/comm/G";
import { SdkManager } from "../../../core/sdk/SdkManager";
import { UINoticeKey, UINoticePriorityType } from "../notice/const/UINoticeConfig";
import { INoticeVo } from "./vo/ILoginVo";
import { NoticeWin } from "../notice/view/NoticeWin";
import { TimeManager } from "../../../core/time/TimeManager";

export class LoginController extends BaseController {
    listenNotifications(): string[] {
        return [
            LoginNotificationKey.SDK_LOGINED,
            LoginNotificationKey.SDK_LOGOUTED,
            LoginNotificationKey.ACCOUNT_LOGIN,
            LoginNotificationKey.LOGIN_SUCCESS,
            LoginNotificationKey.ENTER_GAME,
            LoginNotificationKey.LOGIN_PROGRESS_UPDATE,
            LoginNotificationKey.ACCOUNT_LOGIN_FAILED,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.SDK_LOGINED:
                this.onSdkLogined(args);
                break;
            case LoginNotificationKey.SDK_LOGOUTED:
                this.onSdkLogouted();
                break;
            case LoginNotificationKey.ACCOUNT_LOGIN:
                this.loginAccount(args);
                break;
            case LoginNotificationKey.LOGIN_SUCCESS:
                this.onLogined();
                break;
            case LoginNotificationKey.ENTER_GAME:
                this.connectServer();
                break;
            case LoginNotificationKey.ACCOUNT_LOGIN_FAILED:
                this.onLoginFailed(args);
                break;
        }
    }

    constructor() {
        super();
        Logger.game(" LoginController init ");
    }

    onInit(): void {
    }

    /**账号登陆 */
    public onSdkLogined(args: { [key: string]: any }): void {
        if (!args || !args.data) return;
        LoginReqMgr.ins().reqLoginServer(args);
    }

    /**账号登出 */
    public onSdkLogouted() {
        if (UIManager.ins().isOpened(UILoginKey.LOGIN_PAGE)) {
            if (UIManager.ins().isOpened(UILoginKey.LOGIN_PROGRESS_WIN)) {
                G.reload();
                //SdkManager.ins().floatMenu(false);
            } else {
                LoginModel.ins().reset();
                UIManager.ins().open(UILoginKey.LOGIN_PAGE);
                SdkManager.ins().login();
            }
        } else {
            G.reload();
        }
    }

    /**账号登陆 */
    public loginAccount(args: { [key: string]: any }): void {
        if (!args || !args.userId) return;
        AccountHistoryModel.ins().saveAccount(args.userId, args.password);
        LoginReqMgr.ins().reqLoginServer(args);
    }

    public onLogined() {
        ChooseServerModel.ins().initServerList();
        UIManager.ins().open(UILoginKey.LOGIN_PAGE, null, () => {
            SdkManager.ins().floatMenu(true);
            this.checkShowLoginNotice();
        });
    }

    private onLoginFailed(canTryAgain: boolean) {
        if (SdkManager.ins().isEnable()) {
            SdkManager.ins().logout();
        } else {
            UIManager.ins().open(UILoginKey.ACCOUNT_WIN);
        }
    }

    private tempNotices = "";
    private readonly LOCKPRIORITY = -9999;

    /**检测公告是否自动弹出 */
    public checkShowLoginNotice() {
        //显示公告
        let notices = LoginModel.ins().vo.notices;
        if (notices.length) {
            let temp = JSON.stringify(notices);
            if (this.isLockNotice(notices) || this.tempNotices != temp) {
                //存在不可关公告 || 内容不相同
                UIManager.ins().open(UINoticeKey.NoticeWin);
                this.tempNotices = temp;
            }
        }
    }

    /**是否存在不可关闭公告 */
    public isLockNotice(notices: INoticeVo[]) {
        let curTime = TimeManager.serverNow;
        for (let i = 0; i < notices.length; i++) {
            const notice = notices[i];
            if (notice.priority == UINoticePriorityType.LOCKPRIORITY) {
                if (curTime < notice.end) {
                    return true;
                }
            }
        }
        return false;
    }


    public connectServer() {
        ConnectProcedure.start();
    }
}

LoginController.ins().doInit();