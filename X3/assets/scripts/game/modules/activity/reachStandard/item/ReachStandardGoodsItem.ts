import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { TableManager } from "../../../../../core/table/TableManager";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { NoOwnerItem } from "../../../backpack/vo/NoOwnerItem";
import { ChargeController } from "../../../charge/ChargeController";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
/**
 * 达标活动
 * 礼包item
 */
@bindFguiExtension("ui://activityReachStandard/ReachStandardGoodsItem")
export class ReachStandardGoodsItem extends fgui.GComponent {
    static pkgName: string = "activityReachStandard";
    static viewName: string = "ReachStandardGoodsItem";
    private get view(): ui.activityReachStandard.item.ReachStandardGoodsItem {
        return this as any;
    }

    private _vo: ActivityReachStandardVo;
    private _cfg: table.activity.Mall.ActivityMallGoodsConfig;

    private _rewards = [];

    onInit() {
        this.view.list_award.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onBuyClick, this);
        this.view.btn_buy.on(fgui.Event.CLICK, this.onItemBuyClick, this);
    }

    public setData(cfg: table.activity.Mall.ActivityMallGoodsConfig, vo: ActivityReachStandardVo) {
        this._cfg = cfg;
        this._vo = vo;
        let count = this._vo.getGoodsBuyCount(this._cfg.id);
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_free, [this._vo.activityId, this._cfg.id]);

        this.view.btn_buy.visible = false;
        this.view.btn_get.visible = true;
        if (this._cfg.chargeGoodsId) {
            //付费礼包
            let goodsCfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this._cfg.chargeGoodsId);
            this.view.T_name.text = goodsCfg.goodsName;
            this._rewards = goodsCfg.rewards;
            this.view.list_award.numItems = this._rewards.length;
            this.view.btn_get.text = `${goodsCfg.price / 100}元`;
        } else {
            let freeGoodsCfg = TableManager.getDataById(table.activity.Mall.ActivityMallCostRewardConfig, this._cfg.id);
            if (freeGoodsCfg?.costs) {
                //道具换购
                this.view.btn_buy.visible = true;
                this.view.btn_get.visible = false;
                let noOwnerItem = NoOwnerItem.createByConfigKv(freeGoodsCfg?.costs[0]);
                //@ts-ignore
                this.view.btn_buy.reset("购买", noOwnerItem);
                this.view.T_name.text = freeGoodsCfg.name;
                this._rewards = freeGoodsCfg.rewards;
                this.view.list_award.numItems = this._rewards.length;
            } else {
                //免费礼包
                this.view.T_name.text = freeGoodsCfg.name;
                this._rewards = freeGoodsCfg.rewards;
                this.view.list_award.numItems = this._rewards.length;
                if (!freeGoodsCfg.costs) {
                    this.view.btn_get.text = `免费`;
                }
            }
        }

        if (this._cfg.buyLimit) {
            this.view.T_count.visible = true;
            let type = this.getLimitChargeTitleText(ServerEnums.MallGoodsLimitBuyType[this._cfg.limitBuyType]);
            this.view.T_count.text = `${type}${this._cfg.buyLimit - count}/${this._cfg.buyLimit}`;
            this.view.getController("c1").selectedIndex = count < this._cfg.buyLimit ? 0 : 1;
        } else {
            this.view.T_count.visible = false;
            this.view.getController("c1").selectedIndex = 0;
        }
    }

    getLimitChargeTitleText(limitBuyType: number): string {
        let tilteStr: string = "";
        switch (limitBuyType) {
            case ServerEnums.MallGoodsLimitBuyType.DAILY:
                tilteStr = "每天限购:";
                break;
            case ServerEnums.MallGoodsLimitBuyType.WEEKLY:
                tilteStr = "每周限购:";
                break;
            case ServerEnums.MallGoodsLimitBuyType.DOUBLE_WEEKLY:
                tilteStr = "每两周限购:";
                break;
            case ServerEnums.MallGoodsLimitBuyType.MONTHLY:
                tilteStr = "每月限购:";
                break;
            case ServerEnums.MallGoodsLimitBuyType.FOREVER:
                tilteStr = "永久限购:";
                break;
        }
        return tilteStr;
    }

    //奖励
    private awardItemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._rewards[index];
        item.reset(data.k, data.v);
    }
    //购买礼包
    private onBuyClick() {
        if (this._cfg.chargeGoodsId) {
            GIns.orderModel.sendCreateOrder(this._cfg.chargeGoodsId);
        } else {
            let data: ActivitySyncData = {
                activityId: this._vo.activityId,
                itemId: "GOODS_" + this._cfg.id,
                hidePopWin: 2,
            };
            GIns.activityModel.sendDrawItemReward(data);
        }
    }
    //道具购买
    private onItemBuyClick() {
        let data: ActivitySyncData = {
            activityId: this._vo.activityId,
            itemId: "GOODS",
            hidePopWin: 2,
            otherParams: this._cfg.id.toString(),
        };
        GIns.activityModel.sendBuyGoods(data);
    }
}
