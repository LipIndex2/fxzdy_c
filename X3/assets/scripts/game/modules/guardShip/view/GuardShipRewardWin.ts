import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { GuardShipRewardItem } from "./item/GuardShipRewardItem";

/**
 * 守卫母舰奖励预览
 */
@bindScript(UIGuardShipConfig.GuardShipRewardWin)
export class GuardShipRewardWin extends UICommWin {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipRewardWin";

    protected _cfgs: table.guardship.GuardShipRankConfig[] = []

    private get view(): ui.guardShip.view.GuardShipRewardWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.RANK_ON_DATA_RESP
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.RANK_ON_DATA_RESP:
                this.view.listReward.numItems = this._cfgs?.length
        }
    }

    protected onInit(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected itemRendererForReward(index: number, item: GuardShipRewardItem): void {
        item.setData(this._cfgs[index], index > 0 ? this._cfgs[index - 1] : null)
    }

    protected onTimer(): void {
        let endTime = GIns.guardShipModel.endTime - G.TimeManager.serverNow
        const timeText = TimeUtils.formatTimeMsToDayHourMinuteText(endTime)
        this.view.lbTime.text = `结算倒计时：${timeText}`
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._cfgs.length <= 0) {
            this._cfgs = G.TableManager.getAllData(table.guardship.GuardShipRankConfig).concat()
        }
        this.view.listReward.numItems = this._cfgs.length
        G.GameTimer.loop(1000, this, this.onTimer)
        this.onTimer()
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this)
    }
}