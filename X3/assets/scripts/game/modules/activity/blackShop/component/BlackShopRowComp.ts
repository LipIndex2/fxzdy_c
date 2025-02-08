import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ActivityMallModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityMallModelVo";
import { ActivityMallConfigManager } from "db://assets/scripts/game/modules/mall/config/ActivityMallConfigManager";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { OrderModel } from "db://assets/scripts/game/modules/order/OrderModule";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

@bindFguiExtension("ui://blackShop/BlackShopRowComp")
export class BlackShopRowComp extends FGUI.GComponent {
    private _config: table.activity.Mall.ActivityMallGoodsConfig;
    private _vo: ActivityMallModelVo;
    private _isCanBuy = true;
    private _isCharge: boolean = false;

    get view(): ui.blackShop.item.BlackShopRowComp {
        return this as any;
    }

    protected onInit() {
        this.view.btn_buy.onClick(this.onClickBuy, this);
        this.view.btn_free.onClick(this.onClickBuy, this);
    }

    onClickBuy() {
        if (!this._isCanBuy) {
            FloatingTextManager.ins().showTips("道具不足");
            return;
        }
        const goodId = this._config.id;

        if (this._isCharge) {
            Logger.game("充值商品");
            OrderModel.ins().sendCreateOrder(this._config.chargeGoodsId);
        } else if (ActivityMallConfigManager.isFree(goodId)) {
            //免费的
            this._vo.sendFree(goodId);
        } else {
            Logger.game("钻石购买商品");
            this._vo.sendBuy(goodId);
        }
    }

    reset(vo: ActivityMallModelVo, config: table.activity.Mall.ActivityMallGoodsConfig) {
        this._isCanBuy = true;
        this._vo = vo;
        this._config = config;
        const goodId = config.id;

        const isCharge = ActivityMallConfigManager.isCharge(goodId);
        this._isCharge = isCharge;

        let isBuyMax = false;
        if (ServerEnums.MallGoodsLimitBuyType[config.limitBuyType] != ServerEnums.MallGoodsLimitBuyType.NEVER) {
            isBuyMax = vo.isBuyMax(goodId);
            this.view.T_titleCount.visible = true;
            this.view.T_count.visible = true;
            const buyCount = vo.getBuyCount(goodId);
            this.view.T_count.text = `${buyCount}/${config.buyLimit}`;
        } else {
            this.view.T_titleCount.visible = false;
            this.view.T_count.visible = false;
        }

        if (isBuyMax) {
            //售罄
            this.view.getController("t").selectedIndex = 2;
        } else if (ActivityMallConfigManager.isFree(goodId)) {
            //免费
            this.view.getController("t").selectedIndex = 1;
        } else {
            //购买
            this.view.getController("t").selectedIndex = 0;
            if (isCharge) {
                this.view.btn_buy.getController("type").selectedIndex = 0;
                const payMoney = ActivityMallConfigManager.getPayMoney(goodId);
                this.view.btn_buy.labelPay.text = `${payMoney}`;
            } else {
                this.view.btn_buy.getController("type").selectedIndex = 1;

                const costItem = ActivityMallConfigManager.getCostItem(goodId);
                this.view.btn_buy.imgItem.icon = costItem.getIconPath();
                this.view.btn_buy.labelCostItemCount.text = `${costItem.count}`;

                this._isCanBuy = BackpackManager.ins().isCanPayItem(costItem);
                if (this._isCanBuy) {
                    this.view.btn_buy.labelCostItemCount.color = ColorUtils.COLOR_WHITE;
                    this.view.btn_buy.labelCostItemCount.stroke = 3;
                    // this.view.btn_buy.labelCostItemCount.node.getComponent(Label).outlineWidth = 3;
                } else {
                    this.view.btn_buy.labelCostItemCount.color = ColorUtils.COLOR_RED;
                    this.view.btn_buy.labelCostItemCount.stroke = 1;
                    // this.view.btn_buy.labelCostItemCount.node.getComponent(Label).outlineWidth = 1;
                }
            }
        }

        if (isCharge) {
            const chargeGoodsConfig = TableManager.getDataById(table.order.ChargeGoodsConfig, config.chargeGoodsId);
            if (!chargeGoodsConfig) {
                return;
            }
            const rewards = ItemUtils.parseKvArrayToItemArray(chargeGoodsConfig.rewards);
            FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp).reset(rewards);
            this.view.T_title.text = chargeGoodsConfig.goodsName;
        } else {
            const goodCostConfig = ActivityMallConfigManager.getGoodCostConfig(goodId);
            if (!goodCostConfig) {
                Logger.error(`没找到商品奖励配置. ActivityMallCostRewardConfig | goodId = ${goodId} `);
                return;
            }
            const rewards = ItemUtils.parseKvArrayToItemArray(goodCostConfig.rewards);
            FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp).reset(rewards);
            this.view.T_title.text = goodCostConfig.name;
        }
    }
}
