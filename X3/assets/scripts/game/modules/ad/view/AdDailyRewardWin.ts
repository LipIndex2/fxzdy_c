import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapConfigManager } from "../../../tiledMap/config/MapConfigManager";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIADConfig } from "../const/UIADConfig";
import { IAdPlayVo } from "../model/vo/IAdPlayVo";

/**
 * 守卫母舰已选择buff
 */
@bindScript(UIADConfig.AdDailyRewardWin)
export class AdDailyRewardWin extends UICommWin {

    static pkgName: string = "ad";
    static viewName: string = "AdDailyRewardWin";

    protected _buildingId: number = 0
    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.ad.view.AdDailyRewardWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MONTHCARD_BUY_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MONTHCARD_BUY_COMPLETE:
                break
        }
    }

    protected initComp(): void {
        this.addComp(new ViewBlackBgComp())
    }

    protected onInit(): void {
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        this.view.btnPlay.onClick(this.onClickPlay, this)
    }

    protected itemRendererForReward(index:number, item:ItemFrameBtn):void {
        let reward:{k:any, v:any} = MapConfigManager.getAdCfg().rewards[index]
        item.resetByConfigKv(reward)
    }

    protected onClickPlay():void {
        let args:IAdPlayVo = {
            type:ServerEnums.AdvertType.MAIN_CITY_RANDOM_BOX_REWARD
        }
        this.emit(NotificationKey.AD_START_PLAY, args)
    }

    protected onTimer():void {
        if (GIns.mapVisibleMgr.isAdvertBoxShow() == false) {
            this.closeSelf()
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.listReward.numItems = MapConfigManager.getAdCfg().rewards.length
        G.GameTimer.loop(500, this, this.onTimer)
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this)
    }
}