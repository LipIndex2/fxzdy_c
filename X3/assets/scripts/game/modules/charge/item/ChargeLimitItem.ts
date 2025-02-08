import { Tween } from "cc";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { CornerMark } from "../../common/view/CornerMark";
import { ConditionManager } from "../../condition/ConditionManager";
import { MallController } from "../../mall/MallController";
import { MallData, MallModel } from "../../mall/model/MallModel";
import { ChargeI18nKeys } from "../const/ChargeI18nKeys";
import { ChargeLimitIconItem } from "./ChargeLimitIconItem";


/** 限购商城item */
export class ChargeLimitItem extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeLimitItem";

    protected _mallData: MallData = null
    protected _firstRewardId: number = 0
    protected _rewards: { k: any, v: any }[] = []
    protected _isAdBuy: boolean = false

    private get view(): ui.charge.item.ChargeLimitItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnBuy.onClick(this.onClickBuy, this)
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)

        //编辑器的布局属性丢失了 需要自己再赋值
        this.view.btnBuy.gPrice.layout = fgui.GroupLayoutType.Horizontal
    }

    protected itemRendererForReward(index: number, item: ChargeLimitIconItem): void {
        item?.setData(this._rewards[index])
    }

    protected onClickBuy(): void {
        if (this._mallData.cfg.buyConditions && !ConditionManager.ins().checkCondition(this._mallData.cfg.buyConditions)) {
            let openTip = ConditionManager.ins().getOpenConditionTips(this._mallData.cfg.buyConditions)
            GIns.floatingTextMgr.showTips(openTip);
            return;

        }
        if (this._isAdBuy) {
            //播放广告
            let args: IAdPlayVo = {
                type: ServerEnums.AdvertType.MALL,
                param: this._mallData.id + ''
            }
            G.FacadeManager.emit(NotificationKey.AD_START_PLAY, args)
            return
        }
        MallController.ins().buyMall(this._mallData.cfg, this._isAdBuy)
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view)
    }

    public setData(data: MallData): void {
        this._mallData = data
        if (data.cfg.buyLimit > 0) {
            //存在限购
            let remainCount = Math.max(0, data.cfg.buyLimit - data.buyNum)
            this.view.lbLimit.text = G.I18nManager.lang(ChargeI18nKeys.limitBuyCount, remainCount, data.cfg.buyLimit)
        } else {
            this.view.lbLimit.text = ''
        }
        let isSellOut: boolean = MallModel.ins().isSellOut(data)
        this.view.pSellOut.visible = isSellOut
        this.view.iconLoader.icon = data.cfg.icon
        let price: number = 0

        if (data.orderCfg) {
            price = data.orderCfg.price / 100
        }
        this._isAdBuy = false
        if (isSellOut) {
            this.view.btnBuy.enabled = false
            this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.sellOut)
        } else {
            this.view.btnBuy.enabled = true
            if (price > 0) {
                this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.price, price)
            } else {
                this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.free)
            }
            this._isAdBuy = GIns.adModel.getRemainAdTimes(data.adBuyNum, ServerEnums.AdvertType.MALL, data.id.toString()) > 0
        }
        this.view.btnBuy.getController('isAd').selectedIndex = this._isAdBuy ? 1 : 0
        this.view.btnBuy.lbPrice.ensureSizeCorrect()
        this.view.btnBuy.gPrice.ensureBoundsCorrect()

        this._rewards = MallModel.ins().getMallReward(data)
        this.view.listReward.numItems = this._rewards.length

        //@ts-ignore
        let redDotCom = this.view.redDot as RedDotCom
        redDotCom?.showByType(price == 0 && this.view.pSellOut.visible == false ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL)

        let cornerMark = FguiScriptUtils.toMyScriptClass(this.view.cornerMark, CornerMark)
        if (data.cfg.markTip && !isSellOut) {
            cornerMark.showTip(data.cfg.markTip)
        } else {
            cornerMark.clearTip()
        }
    }
}