import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import NotificationKey from "../../event/NotificationKey";
import { MallModel } from "../mall/model/MallModel";
import { UILimitPackConfig } from "./const/UILimitPackConfig";

/**限时礼包*/
export class LimitPackController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_DATA_INIT_COMPLETE,
            NotificationKey.MALL_POPUP_CHANGE,
            NotificationKey.SYSTEM_TIME_UPDATE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_INIT_COMPLETE:
            case NotificationKey.MALL_POPUP_CHANGE:
                this.checkEndTime()
                break
            case NotificationKey.SYSTEM_TIME_UPDATE:
                this.checkEndTime()
                break
        }
    }

    onInit(): void {

    }

    public checkEndTime(): void {
        G.GameTimer.clearAll(this)
        let popUpTimeMap = MallModel.ins().popupDataMap
        if (popUpTimeMap.size > 0) {
            let minTime = 0
            let timeOutIds: number[] = []
            let nowTime = G.TimeManager.serverNow
            popUpTimeMap.forEach((value, id) => {
                if (value.endTime <= nowTime) {
                    //时间已过
                    timeOutIds.push(id)
                } else if (minTime == 0 || value.endTime < minTime) {
                    //最早结束时间
                    minTime = value.endTime
                }
            })
            MallModel.ins().minPopupEndTime = minTime
            if (timeOutIds.length > 0) {
                //重新触发数据变化
                timeOutIds?.forEach((id) => {
                    popUpTimeMap.delete(id)
                })
                G.FacadeManager.emit(NotificationKey.MALL_POPUP_CHANGE)
            } else {
                let delayTime = Math.max(0, minTime - nowTime)
                if (delayTime > 0) {
                    G.GameTimer.once(delayTime, this, this.checkEndTime)
                }
            }

        }
    }

    public openPopupWin(defaultId: number = -1): void {
        G.UIManager.open(UILimitPackConfig.LIMITPACK_MAIN_WIN, defaultId)
    }
}
LimitPackController.ins().doInit();