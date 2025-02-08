import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import GIns from "db://assets/scripts/game/GIns";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";
import { ActivityMallModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityMallModelVo";


export class BlackShopController extends BaseController {
    private _vos: ActivityMallModelVo[] = [];


    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK, NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_END_REFRESH:
                this.initRedDot(args);
                break;
        }
    }


    protected initRedDot(activityId: number): void {
        // task
        this._vos = GIns.activityModel.getActivityVosByType(ServerEnums.ActivityType.ACTIVITY_MALL) as ActivityMallModelVo[];

        G.GameTimer.once(500, this, () => {
            this.refreshRedDot(activityId);
        });
    }

    private refreshRedDot(id: number) {
        for (let vo of (this._vos || [])) {
            const isMyActivity = vo && vo.activityId == id;
            if (isMyActivity) {
                vo.refreshRedDot();
            }
        }
    }
}

BlackShopController.ins().doInit();