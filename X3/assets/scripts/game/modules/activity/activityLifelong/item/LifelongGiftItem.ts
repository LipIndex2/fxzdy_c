import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../../common/redDot/enums/EnumRedDotShowType";

/**
 * 终身活动
 * 礼包item
 */
@bindFguiExtension("ui://activityLifelong/giftItem")
export class LifelongGiftItem extends fgui.GComponent {
    static pkgName: string = "activityLifelong";
    static viewName: string = "giftItem";

    private get view(): ui.activityLifelong.item.giftItem {
        return this as any;
    }

    private _vo: ActivityReachStandardVo;
    private _cfg: table.activity.Mall.ActivityMallGoodsConfig;
    //奖励
    private _rewards;

    protected onInit(): void {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);

        this.view.btn_get.on(fgui.Event.CLICK, this.onBtnGetClick, this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {}

    public updateView(vo: ActivityReachStandardVo, cfg: table.activity.Mall.ActivityMallGoodsConfig): void {
        this._vo = vo;
        this._cfg = cfg;

        if (this._cfg.chargeGoodsId) {
            //付费礼包
            let goodsCfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this._cfg.chargeGoodsId);
            this.view.T_name.text = goodsCfg.goodsName;
            this._rewards = goodsCfg.rewards;
            this.view.list_award.numItems = this._rewards.length;
            this.view.btn_get.text = `${goodsCfg.price / 100}元`;
        } else {
            //免费礼包
            let freeGoodsCfg = TableManager.getDataById(table.activity.Mall.ActivityMallCostRewardConfig, this._cfg.id);
            this.view.T_name.text = freeGoodsCfg.name;
            this._rewards = freeGoodsCfg.rewards;
            this.view.list_award.numItems = this._rewards.length;
            if (!freeGoodsCfg.costs) {
                this.view.btn_get.text = `免费`;
            }
        }

        let buyLimit = cfg.buyLimit;
        let buyNum = vo.getGoodsBuyCount(cfg.id);
        this.view.T_count.text = `限购：${buyLimit - buyNum}/${buyLimit}`;

        this.view.getController("c1").selectedIndex = buyLimit > buyNum ? 0 : 1;

        FguiScriptUtils.toMyScriptClass(this.view.btn_get.redDot, RedDotCom).showByType(this._vo.fallRedDot ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
    }

    private awardItemRenderer(index: number, item: ItemFrameBtn): void {
        let itemData = this._rewards[index];
        item.reset(itemData.k, itemData.v);
    }

    private onBtnGetClick() {
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
}
