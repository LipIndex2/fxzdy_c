import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ChargeController } from "../../../charge/ChargeController";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { CornerMark } from "../../../common/view/CornerMark";
import { OrderModel } from "../../../order/OrderModule";
import { ActivityMallBuyConfigData, ActivityMallModelVo } from "../../model/ActivityMallModelVo";
import { ItemUtils } from "../../../item/utils/ItemUtils";

/** 新手特惠item */
export class RookieSaleItem extends fgui.GComponent {
    static pkgName: string = "activityRookieSale";
    static viewName: string = "RookieSaleItem";

    protected _cfgData: ActivityMallBuyConfigData = null
    protected _vo: ActivityMallModelVo = null
    protected _rewards: { k: any, v: any }[] = null

    private get view(): ui.activityRookieSale.item.RookieSaleItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        this.view.btn_buy.onClick(this.onClickDraw, this)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.reset(this._rewards[index].k, this._rewards[index].v)
        if (this._cfgData.orderCfg?.effects) {
            item.playOtherEffect(this._cfgData.orderCfg.effects[index])
        }
        else
            item.clearAnim()
    }

    protected onClickDraw(): void {
        if (this._vo.isBuyMax(this._cfgData?.cfg?.id)) {
            return;
        }
        if (this._cfgData.orderCfg) {
            OrderModel.ins().sendCreateOrder(this._cfgData.orderCfg.id)
        } else {
            let data = {
                activityId: this._cfgData.cfg.activityId,
                itemId: this._cfgData.cfg.id + '',
                hidePopWin: 2,
            } as ActivitySyncData;
            ActivityModel.ins().sendDrawItemReward(data)
        }
    }

    protected onClickGoto(): void {
        ChargeController.ins().openChargeMainView()
    }

    public setData(cfgData: ActivityMallBuyConfigData, vo: ActivityMallModelVo): void {
        this._cfgData = cfgData;
        this._vo = vo;
        if (!cfgData) {
            return;
        }

        if (cfgData.orderCfg) {
            //是充值商品
            this._rewards = cfgData.orderCfg.rewards
        } else {
            this._rewards = cfgData.costCfg?.rewards
        }

        this.view.lb_dis.text = cfgData.cfg.discountShow + "%";
        this.view.grp_dis.visible = !!cfgData.cfg.discountShow;

        this.view.listReward.numItems = this._rewards.length;
        this.view.lb_name.text = cfgData.orderCfg ? cfgData.orderCfg.goodsName : cfgData.costCfg?.name
        // this.view.lbProgress.text = G.I18nManager.lang(ChargeI18nKeys.limitBuyCount, remainNum, totalNum)

        let buyNum = vo.getBuyCount(cfgData.cfg.id)
        let buyLimit = cfgData.cfg.buyLimit;
        this.view.lb_limit.text = `限购：${buyLimit - buyNum}/${buyLimit}`;
        let isSellOut: boolean = vo.isBuyMax(cfgData?.cfg?.id)
        if (isSellOut) {
            this.view.getController('costStyle').selectedIndex = 0;
            this.view.lb_price.text = '售罄';
            this.view.lb_sym.visible = false;
            this.view.img_gray.visible = true;
            // this.view.lb_limit.text = "限购：0/1";
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, false)
        } else {
            if (cfgData.orderCfg) {
                //是充值商品
                this.view.getController('costStyle').selectedIndex = 0;
                this.view.lb_price.text = cfgData.orderCfg.price / 100 + "";
                this.view.lb_sym.text = "元";
                this.view.lb_sym.visible = true;
            } else {
                if (cfgData.costCfg.costs == null) {
                    this.view.getController('costStyle').selectedIndex = 1;
                } else {
                    this.view.getController('costStyle').selectedIndex = 2;
                    let cfg = ItemUtils.getItemConfigByItemId(cfgData.costCfg.costs[0].k);
                    this.view.iconCost.icon = cfg ? cfg.smallIconPath : '';
                    this.view.lbCost.text = cfgData.costCfg.costs[0].v;
                }
            }
            // this.view.lb_limit.text = "限购：1/1";
            this.view.img_gray.visible = false;
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, cfgData.costCfg != null && cfgData.costCfg.costs == null);
        }
        let cornerMark = FguiScriptUtils.toMyScriptClass(this.view.cornerMark, CornerMark)
        if (cfgData.cfg.markTip && !isSellOut) {
            cornerMark.showTip(cfgData.cfg.markTip)
        } else {
            cornerMark.clearTip()
        }
    }
}