import { tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { OrderModel } from "../../order/OrderModule";
import { ChargeI18nKeys } from "../const/ChargeI18nKeys";
import { Tween } from "cc";


/** 普通充值item */
export class ChargeNormalItem extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeNormalItem";

    protected _goodData: table.order.ChargeGoodsConfig = null
    protected _firstRewardId: number = 0

    private get view(): ui.charge.item.ChargeNormalItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnBuy.onClick(this.onClickBuy, this)
    }

    protected onClickBuy(): void {
        OrderModel.ins().sendCreateOrder(this._goodData.id)
    }

    protected onPreDispose():void {
        Tween.stopAllByTarget(this.view)
    }

    public setData(data: table.order.ChargeGoodsConfig): void {
        this._goodData = data
        this.view.lbName.text = data.goodsName
        this.view.iconLoader.icon = data.goodsUrl
        this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.price, (data.price / 100))
        let hasBuy: boolean = OrderModel.ins().chargeIds?.indexOf(data.id) != -1
        if (hasBuy == false && data.firstExtraRewards?.length > 0) {
            //展示双倍奖励
            this.view.pFirst.visible = true
            this.view.lbFristReward.text = G.I18nManager.lang(ChargeI18nKeys.give, data.firstExtraRewards[0].v)
            if (this._firstRewardId != data.firstExtraRewards[0].k) {
                this._firstRewardId = data.firstExtraRewards[0].k
                let cfg = G.TableManager.getDataById(table.item.ItemConfig, this._firstRewardId)
                if (cfg) {
                    this.view.fristIconLoader.icon = cfg.smallIconPath
                }
            }
        } else {
            this.view.pFirst.visible = false
        }
    }
}