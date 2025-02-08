import FGUI from "db://assets/scripts/core/fgui/FGUI";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { RedDotCom } from "db://assets/scripts/game/modules/common/redDot/redDotCom";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { EnumTabItemNameForClient } from "db://assets/scripts/game/ui/main/const/EnumTabItemNameForClient";
import { MainPageManager } from "db://assets/scripts/game/ui/main/MainPageManager";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "db://assets/scripts/core/mvc/view/FguiNotificationGComponent";


@bindFguiExtension("ui://main/MainMoreBtnComp")
export class MainMoreBtnComp extends FguiNotificationGComponent implements INotification {
    private _config: table.mainpage.MainPageTabItemConfig;


    private get view(): ui.main.components.MainMoreBtnComp {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.RED_DOT_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.RED_DOT_CHANGE: {
                this.reset(this._config);
                break;
            }
        }
    }


    protected onInit() {
        this.view.onClick(this.onClick0, this);
    }


    protected onPreDispose() {
        super.onPreDispose();
    }

    onClick0() {
        if (!this._config) {
            console.error("没找到该按钮配置!");
            return;
        }
        MainPageManager.ins().clickTabItemByName(this._config);

    }


    reset(config: table.mainpage.MainPageTabItemConfig) {
        if (!config) {
            return;
        }
        this._config = config;

        const btn = this.view.btn;
        btn.title = config.showName;
        btn.imageLogo.icon = config.iconNormalAssetPath;

        const nameForClient = config.nameForClient;
        this.updateRedDot(nameForClient);
    }


    protected updateRedDot(nameForClient: string): void {
        const redDot = FguiScriptUtils.toMyScriptClass(this.view.btn.redPoint, RedDotCom);

        switch (nameForClient) {
            case EnumTabItemNameForClient.dailySale:
                redDot.reset(RedDotKeys.Charge_dailySale);
                break
            case EnumTabItemNameForClient.FRIEND:
                redDot.reset(RedDotKeys.Friend);
                break
            case EnumTabItemNameForClient.BACKPACK:
                redDot.reset(RedDotKeys.backpack);
                break
            case EnumTabItemNameForClient.TASK:
                redDot.reset(RedDotKeys.task);
                break
            case EnumTabItemNameForClient.EMAIL:
                redDot.reset(RedDotKeys.email);
                break
            case EnumTabItemNameForClient.SHOP:
                redDot.reset(RedDotKeys.Shop_enter);
                break
            default:
                //没有红点的item设置一个空值
                redDot.reset(RedDotKeys.Null)
                break
        }
    }
}