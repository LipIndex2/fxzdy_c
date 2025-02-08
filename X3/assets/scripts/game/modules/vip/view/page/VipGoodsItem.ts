import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { ChargeI18nKeys } from "../../../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { ConditionManager } from "../../../condition/ConditionManager";

import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { RedDotManager } from "../../../common/redDot/RedDotManager";
import { MallController } from "../../../mall/MallController";
import { MallData } from "../../../mall/model/MallModel";
import { VipI18nKeys } from "../../const/VipI18nKeys";
import { tween } from "cc";
import { Tween } from "cc";


/** vip 商品item */
export class VipGoodsItem extends fgui.GComponent {
    static pkgName: string = "vip";
    static viewName: string = "VipGoodsItem";

    protected _mallData: MallData = null
    protected _firstRewardId: number = 0
    protected _rewards: { k: any, v: any }[] = []

    protected _showEffect:boolean = false
    protected _parentIndex:number = 0

    private get view(): ui.vip.item.VipGoodsItem {
        return this as any;
    }

    protected onInit() {
        this.view.btnBuy.onClick(this.onClickBuy, this)
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item?.reset(this._rewards[index].k, this._rewards[index].v)
    }

    protected onClickBuy(): void {
        MallController.ins().buyMall(this._mallData.cfg)
    }

    protected onPreDispose():void {
        Tween.stopAllByTarget(this.view)
    }

    public setData(data: MallData): void {
        this._mallData = data
        if (data.cfg.discountShow > 0) {
            //展示折扣
            this.view.pDiscount.visible = true
            this.view.lbDiscount.text = G.I18nManager.lang(VipI18nKeys.discount)
            this.view.lbDiscountValue.text = `${data.cfg.discountShow}%`
        } else {
            this.view.pDiscount.visible = false
        }

        this._rewards = data.orderCfg ? data.orderCfg.rewards : data.costCfg.rewards
        this.view.listReward.numItems = this._rewards.length
        //这里展示的道具都是未售罄的 所以只需要判断是否满足购买条件限制
        let canBuy = ConditionManager.ins().checkCondition(data.cfg.buyConditions)
        //@ts-ignore
        let redDotComp = this.view.btnBuy.redDot as RedDotCom
        if (data.costCfg && data.costCfg.costItems?.length > 0) {
            //需要消耗道具
            this.view.btnBuy.pCost.visible = true
            this.view.btnBuy.lbPrice.visible = false
            let itemId = data.costCfg.costItems[0].k
            let itemCount = data.costCfg.costItems[0].v
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId)
            this.view.btnBuy.iconCost.icon = itemCfg?.smallIconPath
            this.view.btnBuy.lbCost.text = itemCount
            // redDotComp.reset(RedDotKeys.Charge_vip_item, [itemId]);
            if (canBuy) {
                RedDotManager.ins().markRedDotForeverRead(RedDotKeys.Charge_vip_item, [data.id])
                redDotComp.showByType(EnumRedDotShowType.NORMAL)
            } else {
                redDotComp.showByType(EnumRedDotShowType.NULL)
            }
        } else {
            this.view.btnBuy.pCost.visible = false
            this.view.btnBuy.lbPrice.visible = true
            if (data.orderCfg) {
                this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.price, data.orderCfg.price / 100)
                redDotComp.showByType(EnumRedDotShowType.NULL)
            } else {
                this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.free)
                redDotComp.showByType(canBuy ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL)
            }
        }
        if (data.cfg.buyLimit > 0) {
            //存在限购
            let remainCount = Math.max(0, data.cfg.buyLimit - data.buyNum)
            this.view.lbLimit.text = G.I18nManager.lang(ChargeI18nKeys.limitBuyCount, remainCount, data.cfg.buyLimit)
        } else {
            this.view.lbLimit.text = ''
        }

        this.view.btnBuy.enabled = canBuy
    }

    public showEffect(delay: number): void {
        Tween.stopAllByTarget(this.view)
        this.view.visible = false
        tween(this.view).delay(delay).call(() => {
            if (this.view?.node?.isValid) {
                this.view.visible = true
                this.view.alpha = 0
            }
        }).to(0.3, { alpha: 1 }).start()
    }
}