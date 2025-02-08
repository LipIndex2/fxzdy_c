import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";

/**
 * 挂机
 */
export class HangUpController extends BaseController {

    listenNotifications(): string[] {
        return [
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HANG_UP_OPEN_BATTLE_VIEW: {
            }
        }
    }

    onInit(): void {


    }

}

HangUpController.ins().doInit();


