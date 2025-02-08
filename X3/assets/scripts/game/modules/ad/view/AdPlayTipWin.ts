import { sys } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NativeAPI } from "../../../../core/native/NativeAPI";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MonthCardController } from "../../monthCard/MonthCardController";
import { AdController } from "../AdController";
import { UIADConfig } from "../const/UIADConfig";
import { IAdPlayVo } from "../model/vo/IAdPlayVo";

/**
 * 广告播放确认框
 */
@bindScript(UIADConfig.AdPlayTipWin)
export class AdPlayTipWin extends UICommWin {

    static pkgName: string = "ad";
    static viewName: string = "AdPlayTipWin";

    protected _vo: IAdPlayVo = null

    private get view(): ui.ad.view.AdPlayTipWin {
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
                this.handleBuyMonthCard()
                break
        }
    }

    protected initComp(): void {
        this.addComp(new ViewBlackBgComp())
    }

    protected onInit(): void {
        this.view.btnPlay.onClick(this.onClickPlay, this)
        this.view.btnBuy.onClick(this.onClickBuy, this)
    }

    protected handleBuyMonthCard(): void {
        if (GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.FOREVER)) {
            //在这个界面激活了终身卡 马上跳过广告
            AdController.ins().playAdComplete(this._vo.type)
            this.closeSelf()
        }
    }

    protected onClickPlay(): void {
        GIns.adModel.isShowTip = !this.view.btnGouXuan.selected
        if (sys.isBrowser) {
            AdController.ins().playAdComplete(this._vo.type)
        } else {
            //调用播放广告sdk
            NativeAPI.showAd(ServerEnums.AdvertType[this._vo.type])
        }
        this.closeSelf()
    }

    protected onClickBuy(): void {
        MonthCardController.ins().openForeverBuyWin()
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = args as IAdPlayVo
        this.view.btnGouXuan.selected = !GIns.adModel.isShowTip
    }

    protected onClose(dontDispose?: boolean): void {
        GIns.adModel.isShowTip = !this.view.btnGouXuan.selected
    }
}