import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { RedDotKeys } from "../common/redDot/RedDotKeys";

export class FactoryRedDotController extends BaseController {
    protected _powerTimerKey: string = null
    protected _isOpenFactory: boolean = false

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_UPDATE_INFO,
            NotificationKey.FACTORY_PRODUCT_LINE_UPDATE,
            NotificationKey.FACTORY_RECORD_UPDATE
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_UPDATE_INFO:
                this.checkMyOccupyRedDot()
                break
            case NotificationKey.FACTORY_PRODUCT_LINE_UPDATE:
                this.checkMyOccupyRedDot()
                break
            case NotificationKey.FACTORY_RECORD_UPDATE:
                this.checkRecordRedDot()
                break
        }
    }

    /**我的占领奖励红点*/
    protected checkMyOccupyRedDot(): void {
        G.GameTimer.clearAll(this)
        let myOccupys = GIns.factoryModel.myVo?.occupyProductLineVos
        let minNextTime: number = 0
        let nowTime: number = G.TimeManager.serverNow
        GIns.redDotMgr.clearAll(RedDotKeys.Factory_occupyReward_item)
        myOccupys?.forEach((vo) => {
            let diffTime = vo.endTime - nowTime
            if (diffTime > 0) {
                //还没到时间
                if (minNextTime == 0 || minNextTime > diffTime) {
                    minNextTime = diffTime
                }
                GIns.redDotMgr.setRedDot(RedDotKeys.Factory_occupyReward_item, false, [vo.productLineId])
            } else {
                //到时间了
                GIns.redDotMgr.setRedDot(RedDotKeys.Factory_occupyReward_item, true, [vo.productLineId])
            }
        })
        if (minNextTime > 0) {
            //延迟检测
            G.GameTimer.loop(minNextTime, this, this.checkMyOccupyRedDot)
        }
    }

    /**战报红点*/
    protected checkRecordRedDot(): void {
        GIns.redDotMgr.clearAll(RedDotKeys.Factory_record_item)
        GIns.factoryModel?.records?.forEach((record) => {
            GIns.redDotMgr.setRedDot(RedDotKeys.Factory_record_item, record?.vo.read == false, [record.vo.id])
        })
    }

    onInit(): void {

    }
}

FactoryRedDotController.ins().doInit()