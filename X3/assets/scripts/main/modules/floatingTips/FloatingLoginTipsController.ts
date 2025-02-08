import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import LoginNotificationKey from "../LoginNotificationKey";
import { UIFloatingLoginTipsKey } from "./const/UIFloatingLoginTipsConfig";


//飘字
export class FloatingTextController extends BaseController {

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.FLOATING_LOGIN_TIPS,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.FLOATING_LOGIN_TIPS:
                this.floatingText(args);
                break
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
    }

    floatingText(tipsStr: string) {
        if (!UIManager.ins().isOpened(UIFloatingLoginTipsKey.FloatingLoginTipsView)) {
            UIManager.ins().open(UIFloatingLoginTipsKey.FloatingLoginTipsView, tipsStr);
        }
    }
}

FloatingTextController.ins().doInit();