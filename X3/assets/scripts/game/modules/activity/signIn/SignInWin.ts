import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { UIGainKeys } from "../../gain/const/UIGainKeys";
import { UIActivityKey } from "../const/UIActivityConfig";
import { SevenDayLoginSubView } from "db://assets/scripts/game/modules/activity/sevenDay/subView/SevenDayLoginSubView";

/**
 * 七日登录弹窗
 */
export class SignInWin extends UICommWin {
    static pkgName: string = "sevenDay";
    static viewName: string = "SignInWin";

    /** 活动id */
    private _id: number;

    private get view(): ui.sevenDay.SignInWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CLOSE_ViEW,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CLOSE_ViEW:
                //关闭的是恭喜获得
                if (args == UIGainKeys.GainItemPopUpView) {
                    this.closeSelf();
                    // if (this._hasRewardWithOpen && this._data.hasAward() == false) {
                    //     this.closeSelf()
                    // }
                }
        }
    }

    protected onInit(): void {
    }

    protected onClose(): void {
        this._id = 0;
        // G.GameTimer.clearAll(this);
    }

    protected onOpen(id: number, isReopen?: boolean): void {
        this._id = id;

        FguiScriptUtils.toMyScriptClass(this.view.login, SevenDayLoginSubView)
            .reset(id)


    }


}

UIScriptManager.bindScript(UIActivityKey.SignInWin, SignInWin);