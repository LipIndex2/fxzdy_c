import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { MallData, MallModel } from "../../mall/model/MallModel";
import { ChargeController } from "../ChargeController";
import { ChargeLimitItem } from "./ChargeLimitItem";
import { ChargeLimitItem2 } from "./ChargeLimitItem2";
import { GListEffectType } from "../../../../core/prototypes/FguiGListEffect";


/** 限购商城每个类型item */
export class ChargeLimitPageItem extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeLimitItem";

    protected _mallDatas: MallData[] = null
    protected _firstRewardId: number = 0
    protected _refreshTime: number = 0

    protected _parentIndex: number = 0
    protected _showEffect: boolean = false

    private get view(): ui.charge.item.ChargeLimitPageItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list2.setVirtual()
        this.view.list.scrollItemToViewOnClick = false
        this.view.list2.scrollItemToViewOnClick = false
        this.view.list.itemRenderer = this.itemRendererForMall.bind(this)
        this.view.list2.itemRenderer = this.itemRendererForMall2.bind(this)
        G.GameTimer.loop(1000, this, this.onTimer)
    }

    protected itemRendererForMall(index: number, item: ChargeLimitItem): void {
        item?.setData(this._mallDatas[index])
    }

    protected itemRendererForMall2(index: number, item: ChargeLimitItem2): void {
        item?.setData(this._mallDatas[index])
    }

    protected onTimer(): void {
        if (this._refreshTime > 0) {
            let serverTime = G.TimeManager.serverNow
            let countDownTime = this._refreshTime - serverTime
            if (countDownTime < 0) {
                countDownTime = 0
            }
            this.view.lbTime.text = TimeUtils.formatTimeMsToDayHourMinuteText(countDownTime)
        }
    }

    protected resizeList(list: fgui.GList): void {
        this.view.height = list.y + list.height
    }

    public setData(data: MallData[], limitBuyType: number, parentIndex: number, parentList:fgui.GList): void {
        this._mallDatas = data
        this._parentIndex = parentIndex
        if (parentList.isShowEffect) {
            this.view.list.resetRefreshTimes()
            this.view.list.effectType = GListEffectType.FADE_IN
            this.view.list.effectParams = {delay:this._parentIndex * 0.06, interval:0.06}
        } else {
            this.view.list.effectType = GListEffectType.None
        }
        this.view.lbTitle.text = ChargeController.ins().getLimitChargeTitleText(limitBuyType)
        this._refreshTime = MallModel.ins().getMallRefreshTime(ServerEnums.MallGoodsType.LIMIT_BUY, limitBuyType)
        if (this._refreshTime > 0) {
            this.view.pTime.visible = true
            this.onTimer()
        } else {
            this.view.pTime.visible = false
        }
        if (limitBuyType == ServerEnums.GoodsLimitBuyType.MONTH) {
            this.view.list.visible = false
            this.view.list2.visible = true
            this.view.list2.numItems = data.length
            this.view.list2.resizeToFit()
            this.resizeList(this.view.list2)
        } else {
            this.view.list.visible = true
            this.view.list2.visible = false
            this.view.list.numItems = data.length
            this.view.list.resizeToFit()
            this.resizeList(this.view.list)
        }
    }

    public onPreDispose(): void {
        G.GameTimer.clearAll(this)
    }
}