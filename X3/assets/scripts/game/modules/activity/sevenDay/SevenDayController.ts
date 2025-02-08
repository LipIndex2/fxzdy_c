import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivitySevenDayTaskModelVo } from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import GIns from "db://assets/scripts/game/GIns";
import G from "db://assets/scripts/core/comm/G";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivitySignInVo } from "../model/ActivitySignInVo";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";

export class SevenDayController extends BaseController {
    private _taskVo: ActivitySevenDayTaskModelVo;

    private _signVos: ActivitySignInVo[] = [];

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

    onInit(): void {}

    public initRedDot(id: number): void {
        // task
        this._taskVo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        this._signVos = GIns.activityModel.getActivityVosByType(ServerEnums.ActivityType.SIGN) as ActivitySignInVo[];

        G.GameTimer.once(500, this, () => {
            this.refreshRedDotForTask(id);
            this.refreshRedDotForLogin(id);
        });
    }

    refreshRedDotForTask(id: number) {
        if (!this._taskVo) {
            return;
        }

        if (id !== this._taskVo.activityId) return;
        const allTaskArray = this._taskVo.getAllTaskArray();

        for (let taskDatum of allTaskArray) {
            const taskId = taskDatum.taskId;
            const config = SevenDayConfigManager.getTaskConfig(taskId);
            if (!config) {
                continue;
            }
            const day = SevenDayConfigManager.getDayByTaskId(taskId);

            const isCanComplete = taskDatum.isCanComplete();
            GIns.redDotMgr.setRedDot(RedDotKeys.SevenDay_Task_DAY_ROW, isCanComplete, [day, taskId]);
        }
    }

    private refreshRedDotForLogin(id: number): void {
        if (!this._signVos) {
            return;
        }

        for (let vo of this._signVos) {
            if (vo && vo.activityId == id) {
                const isHaveRedDot = vo.isShowRed();
                GIns.redDotMgr.setRedDot(RedDotKeys.Activity_signIn_reward, isHaveRedDot);
            }
        }
    }
}

SevenDayController.ins().doInit();
