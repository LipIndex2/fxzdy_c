import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { ActivityGirlGroupVo } from "../activity/model/ActivityGirlGroupVo";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";

export class GirlGroupController extends BaseController {
    private _vo: ActivityGirlGroupVo;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_STUFF_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
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
        // this._vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.GIRL_GROUP) as ActivityGirlGroupVo;
        // this.initRedDot();
    }

    protected initRedDot(): void {
        this._vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.GIRL_GROUP) as ActivityGirlGroupVo;
        if (!this._vo) return;
        G.GameTimer.once(100, this, this.checkRedDot);
        G.GameTimer.once(100, this, this.checkAward2RedDot);
    }

    //每日奖励
    private checkRedDot(): void {
        if (this._vo?.playerVo) {
            GIns.redDotMgr.setRedDot(RedDotKeys.GirlGroup_reward1, this._vo.playerVo && !this._vo.playerVo.gainDailyReward);
        }
    }

    //全服奖励
    private checkAward2RedDot() {
        if (this._vo?.rewardCfgs) {
            let cfgs = this._vo.rewardCfgs;
            for (let cfg of cfgs) {
                let isShow = this._vo.getAwardStatus(cfg) == 1;
                GIns.redDotMgr.setRedDot(RedDotKeys.GirlGroup_reward2_item, isShow, [cfg.id]);
            }
        }
    }
}

GirlGroupController.ins().doInit();
