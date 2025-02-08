import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import LoginNotificationKey from "db://assets/scripts/main/modules/LoginNotificationKey";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import { EnumTabItemNameForClient } from "../../../ui/main/const/EnumTabItemNameForClient";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { UIChargeConfig } from "../../charge/const/UIChargeConfig";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { AutoPopBaseContext } from "./AutoPopBaseContext";

/** 每日特惠自动弹框 */
export class AutoPopDailySaleContext extends AutoPopBaseContext {

    protected _isInitState: boolean = false;
    /**功能是否开启*/
    protected _isOpen: boolean = false;
    /**是否显示入口*/
    protected _isShowEntrance: boolean = false;
    /**入口展示条件*/
    protected _entranceConditions: any[] = null;
    protected _isWaitOpen: boolean = false;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.initState();
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok && this._isInitState && (this._isOpen == false || this._isShowEntrance == false)) {
            this.checkStateChange();
        }
    }

    protected initState(): void {
        this._isInitState = true;
        this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.DAILY_SALE);
        let mainTabCfgs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig);
        let enterCfg = mainTabCfgs.find(value => value.nameForClient == EnumTabItemNameForClient.dailySale);
        if (enterCfg) {
            this._entranceConditions = enterCfg.conditionText;
            this._isShowEntrance = GIns.conditionMgr.checkCondition(this._entranceConditions);
        } else {
            this._entranceConditions = [];
            this._isShowEntrance = true;
        }
    }

    protected checkStateChange(): void {
        if (this._isOpen == false) {
            this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.DAILY_SALE);
        }
        if (this._isShowEntrance == false) {
            this._isShowEntrance = GIns.conditionMgr.checkCondition(this._entranceConditions);
        }

        if (this._isOpen && this._isShowEntrance) {
            this._isWaitOpen = true;
            this.onAutoPopDataChange();
        }
    }

    public checkPopNext(): boolean {
        let result: boolean = false;
        if (this._isWaitOpen) {
            //只打开主界面
            if (G.UIManager.isUiTop(UIMainKey.MAIN_PAGE)) {
                G.UIManager.open(UIChargeConfig.DailySaleMainView);
                this._isWaitOpen = false;
                result = true;
            }
        }
        return result;
    }
}
