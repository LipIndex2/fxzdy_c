import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { EnumCurrencyItemId } from "../../backpack/vo/BackpackContext";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityMallModelVo } from "../model/ActivityMallModelVo";
import { tween } from "cc";

/** 开服累充 */
@bindScript(UIActivityKey.rookieSaleView)
export class RookieSaleView extends UIView {
    static pkgName: string = "activityRookieSale";
    static viewName: string = "RookieSaleView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    /** vo */
    private _vo: ActivityMallModelVo;
    protected _showDatas: table.activity.TotalCharge.TotalChargeConfig[] = []

    private get view(): ui.activityRookieSale.view.RookieSaleView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo?.activityId) {
                    this._vo = ActivityModel.ins().getActivityVoById(args);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateUI();
                break;
        }
    }

    protected onInit() {
        //@ts-ignore
        let headItem = this.view.headerItem as HeaderItem
        headItem.reset(EnumCurrencyItemId.DIAMOND, true)

        G.GameTimer.loop(500, this, this.onTimer)
    }

    protected itemRendererForCharge(index: number, item): void {
        item.setData(this._vo.goodConfigArray[index], this._vo)
    }

    protected onTimer(): void {
        const leftTimeMs = this._vo?.getLeftTime();
        this.view.lb_time.text = '活动倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);
    }

    public updateUI(): void {
        this._vo.goodConfigArray.sort((a, b) => {
            let priceA = a.orderCfg ? a.orderCfg.price : 0
            let priceB = b.orderCfg ? b.orderCfg.price : 0
            return priceA - priceB
        })
        // this.view.list.numItems = this._vo.chargeCfgs.length
        for (let i in this._vo.goodConfigArray) {
            if (this.view.scr_item[`item_${i}`]) {
                this.view.scr_item[`item_${i}`].setData(this._vo.goodConfigArray[i], this._vo)
            }
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let openArgs = args as table.activity.ActivityConstant.ActivityClientConfig
        let activityId = openArgs?.typeParam
        this._vo = ActivityModel.ins().getActivityVoById(activityId)
        if (this._vo == null) {
            return
        }
        this.updateUI()
        this.onTimer()
        this.showTweenEffect([this.view.scr_item.item_7, this.view.scr_item.item_0, this.view.scr_item.item_1, this.view.scr_item.item_2,
        this.view.scr_item.item_3, this.view.scr_item.item_4, this.view.scr_item.item_5, this.view.scr_item.item_6])
    }

    private showTweenEffect(comps: fgui.GComponent[]): void {
        for (let i = 0; i < comps.length; i++) {
            comps[i].alpha = 0;
            comps[i].scaleX = 0.7;
            comps[i].scaleY = 0.7;
            tween(comps[i]).delay(0.05 * i).to(0.1, { alpha: 1 }).start()
            tween(comps[i]).delay(0.05 * i).to(0.1, { scaleX: 1, scaleY: 1 }, { easing: "backOut" }).start()
        }
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }
}