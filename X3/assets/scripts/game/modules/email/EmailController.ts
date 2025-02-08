import {_decorator} from 'cc';
import G from "db://assets/scripts/core/comm/G";
import {BaseController} from "db://assets/scripts/core/mvc/controller/BaseController";
import {EmailOneRowView} from "db://assets/scripts/game/modules/email/view/components/EmailOneRowView";

const {ccclass, property} = _decorator;

/**
 * 邮件控制器
 */
export class EmailController extends BaseController {

    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://email/EmailOneRowView", EmailOneRowView);
        G.FGUIManager.bindScript("ui://email/EmailContentRewardPartView", null);
        G.FGUIManager.bindScript("ui://email/EmailContentView", null);

    }

}

EmailController.ins().doInit();


