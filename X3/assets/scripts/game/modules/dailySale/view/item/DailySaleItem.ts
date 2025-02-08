/**@format */
import { Tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { OrderModel } from "../../../order/OrderModule";
import { DailySaleI18nKeys } from "../../const/DailySaleI18nKeys";
import { DailySaleCfgData, DailySaleModel } from "../../model/DailySaleModel";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

/** 每日特惠item */

export class DailySaleItem extends fgui.GComponent {
    static pkgName: string = "dailySale";
    static viewName: string = "DailySaleItem";

    protected _cfgData: DailySaleCfgData = null;
    protected _firstRewardId: number = 0;
    protected _rewards: { k: any; v: any }[] = [];

    private get view(): ui.dailySale.item.DailySaleItem {
        return this as any;
    }

    constructor () {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.btnDraw.onClick(this.onClickBuy, this);
        this.view.listReward.itemRenderer =
            this.itemRendererForReward.bind(this);
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item?.reset(this._rewards[index].k, this._rewards[index].v);
        item.setScale(0.9, 0.9);

        if (this._cfgData?.orderCfg?.effects && !this.view.iconBuy.visible) {
            item.playOtherEffect(this._cfgData.orderCfg.effects[index]);
        }
        else {
            item.clearAnim()
        }
    }

    protected onClickBuy(): void {
        let data = this._cfgData;
        if (
            data.orderCfg &&
            DailySaleModel.ins().hasBuyPackGift(data.cfg.groupId) == false &&
            DailySaleModel.ins().hasBuyGift(data.cfg.id) == false
        ) {
            OrderModel.ins().sendCreateOrder(this._cfgData.orderCfg.id);
        } else if (
            data.freeCfg &&
            !DailySaleModel.ins().hasDrewFreeGift(data.freeCfg.id)
        ) {
            DailySaleModel.ins().sendReceiveSaleReward({
                saleId: data.freeCfg.id,
            });
        }
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view);
    }

    public setData(data: DailySaleCfgData): void {
        this._cfgData = data;
        let { btnDraw, lbLimit, iconBuy } = this.view;

        // this.view.lbName.text = data.orderCfg.goodsName

        if (
            DailySaleModel.ins().hasBuyPackGift(data.cfg.groupId) ||
            DailySaleModel.ins().hasBuyGift(data.cfg.id)
        ) {
            //购买了打包礼包或者这个礼包
            iconBuy.visible = true;
            btnDraw.visible = false;
            btnDraw.enabled = false;
            lbLimit.text = G.I18nManager.lang(DailySaleI18nKeys.buyLimit, 1, 1);
        } else {
            iconBuy.visible = false;
            btnDraw.visible = true;
            btnDraw.enabled = true;
            lbLimit.text = G.I18nManager.lang(DailySaleI18nKeys.buyLimit, 0, 1);
            if (data.orderCfg) {
                btnDraw.title = G.I18nManager.lang(
                    DailySaleI18nKeys.price,
                    data.orderCfg.price / 100
                );
            } else if (data.freeCfg) {
                FguiScriptUtils.toMyScriptClass(
                    btnDraw.redDot,
                    RedDotCom
                ).reset(RedDotKeys.Charge_dailySale_free);
                btnDraw.title = G.I18nManager.lang(DailySaleI18nKeys.freeGift);
            }
        }

        this._rewards = data.orderCfg
            ? data.orderCfg.rewards
            : data.freeCfg.rewards;
        this.view.listReward.numItems = this._rewards.length;
    }
}
