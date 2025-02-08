import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "db://assets/scripts/game/GIns";
import G from "db://assets/scripts/core/comm/G";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";

export class HeroSupplyController extends BaseController {
    private _heroSupplyVo: ActivityHeroSupplyModelVo;

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.ACTIVITY_STUFF_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_NEW_DAY:
            case NotificationKey.ACTIVITY_STUFF_UPDATE:
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
            case NotificationKey.ACTIVITY_END_REFRESH:
                this.initRedDot();
                break;
        }
    }

    onInit(): void {
    }

    protected initRedDot(): void {
        // task
        this._heroSupplyVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;

        G.GameTimer.once(500, this, this.refreshRedDotForTask);
    }

    refreshRedDotForTask() {
        if (!this._heroSupplyVo) {
            return;
        }

        const canGainDayArray = this._heroSupplyVo.getDayToIsCanGainMap(true);
        for (let [day, isCanGain] of canGainDayArray) {
            GIns.redDotMgr.setRedDot(
                RedDotKeys.HeroSupply_day,
                isCanGain,
                [day]
            );
        }

    }

}

HeroSupplyController.ins().doInit();
