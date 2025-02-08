import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";

export class RedDotController extends BaseController {


    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.SYSTEM_NEW_DAY,
            // NotificationKey.SERVER_TIME_CHANGE
        ]
    }

    notificationHandler(event: string, args?: any): any {
        switch (event) {
            // case NotificationKey.SERVER_TIME_CHANGE:
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
            case NotificationKey.SYSTEM_NEW_DAY: {
                RedDotManager.ins().tryRefreshNewDay();
                break;
            }
        }
    }
}

RedDotController.ins().doInit()