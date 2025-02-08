import G from "../../../../core/comm/G";
import { BaseController } from "../../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../../core/mvc/UIManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { DrawCardUIKeys } from "../../drawcard/DrawCardUIKeys";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityDoubleWeekVo } from "../model/ActivityDoubleWeekVo";

export class DoubleWeekController extends BaseController {
    listenNotifications(): string[] {
        return [NotificationKey.DOUBLE_WEEK_TASK_UPDATE, NotificationKey.ACTIVITY_UPDATE];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DOUBLE_WEEK_TASK_UPDATE:
                this.showWin(args);
                G.GameTimer.once(200, this, this.uptadeRed);
                // this.uptadeRed();
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                G.GameTimer.once(200, this, this.uptadeRed);
                // this.uptadeRed();
                break;
            default:
                break;
        }
    }

    private showWin(data: any) {
        if (!data) return;

        let delayTime: number = 300;
        if (UIManager.ins().isOpened(DrawCardUIKeys.DrawCardNormalView)) {
            //招募界面的话，延迟2秒
            delayTime = 1000;
        }

        if (UIManager.ins().isOpened(DrawCardUIKeys.DrawCardResultView)) {
            //招募界面上有抽奖结果界面变回1秒
            delayTime = 300;
        }

        GameTimer.ins().once(delayTime, this, () => {
            UIManager.ins().open(UIActivityKey.DoubleWeekTaskTipsWin, data);
        });


    }

    private uptadeRed() {
        let vos = GIns.activityModel.getActivityVosByType(ServerEnums.ActivityType.DOUBLE_WEEKLY) as ActivityDoubleWeekVo[];
        if (!vos) return;
        for (let i = 0; i < vos.length; i++) {
            let vo = vos[i];
            vo.isShowRed();
        }
    }
}
DoubleWeekController.ins().doInit();
