import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { LeagueBargainManager } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainManager";

export class LeagueBargainController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_NEW_DAY
        ];
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.SYSTEM_NEW_DAY: {
                LeagueBargainManager.ins().sendLoadInit();
                break;
            }
        }
    }
}
LeagueBargainController.ins().doInit();