import FGUIManager from "../../../core/fgui/FGUIManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import { TextData } from "./FloatingTextManager";
import { UIFloatingTextKey } from "./const/UIFloatingTextConfig";


//飘字
export class FloatingTextController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_NEW_FLOATING_TEXT,

        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_NEW_FLOATING_TEXT:
                this.floatingText(args);
                break
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
    }

    floatingText(textData: TextData) {
        if (!UIManager.ins().isOpened(UIFloatingTextKey.FLOATING_TEXT_MAIN_VIEW)) {
            UIManager.ins().open(UIFloatingTextKey.FLOATING_TEXT_MAIN_VIEW, textData);
        }
    }
}

FloatingTextController.ins().doInit();