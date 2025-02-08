import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ChargeI18nKeys } from "../../../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { MallController } from "../../../mall/MallController";
import { MallData, MallModel } from "../../../mall/model/MallModel";


@bindFguiExtension('ui://limitPack/LimitPackSmallItem2')
export class LimitPackSmallItem2 extends fgui.GComponent {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackSmallItem2";

    protected _data: MallData = null
    protected _reward: { k: any, v: any }[] = []
    protected _isLock: boolean = false

    private get view(): ui.limitPack.item.LimitPackSmallItem2 {
        return this as any;
    }

    protected onInit(): void {
        this.view.btnBuy.onClick(this.onClickBuy, this)
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected onClickBuy(): void {
        if (this._isLock == false) {
            MallController.ins().buyMall(this._data.cfg)
        }
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.reset(this._reward[index].k, this._reward[index].v)
    }

    public setData(data: MallData, lastData: MallData, showArrow: boolean = false): void {
        this._data = data
        if (data == null) {
            this.view.visible = false
            return
        }
        this.view.visible = true
        if (data.orderCfg) {
            this._reward = data.orderCfg.rewards
            this.view.bgPrice.visible = true
            this.view.bgFree.visible = false
        } else {
            this._reward = data.costCfg?.rewards
            this.view.bgPrice.visible = false
            this.view.bgFree.visible = true
        }
        if (this._reward) {
            this.view.listReward.numItems = this._reward.length
        }
        this.view.arrow.visible = showArrow

        let isSellOut = MallModel.ins().isSellOut(data)
        this._isLock = lastData != null && MallModel.ins().isSellOut(lastData) == false
        if (this._isLock == false) {
            //上一个已经购买了才解锁
            this.view.btnBuy.getController('c1').selectedIndex = 1
            this.view.btnBuy.touchable = !isSellOut

        } else {
            this.view.btnBuy.getController('c1').selectedIndex = 0
            this.view.btnBuy.touchable = false
        }
        this.view.btnBuy.getController('c2').selectedIndex = data.orderCfg || isSellOut ? 0 : 1
        if (isSellOut) {
            this.view.btnBuy.grayed = true
            this.view.btnBuy.lbPrice.text = this.view.btnBuy.lbPriceLock.text = G.I18nManager.lang(ChargeI18nKeys.sellOut)
        } else {
            this.view.btnBuy.grayed = false
            if (data.orderCfg) {
                this.view.btnBuy.lbPrice.text = this.view.btnBuy.lbPriceLock.text = G.I18nManager.lang(ChargeI18nKeys.price, data.orderCfg.price / 100)
            } else {
                this.view.btnBuy.lbPrice.text = this.view.btnBuy.lbPriceLock.text = G.I18nManager.lang(ChargeI18nKeys.free)
            }
        }
        this.view.pSellout.visible = isSellOut
    }
}