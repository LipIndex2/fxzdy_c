/**@format */
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { OrderModel } from "../../../order/OrderModule";
import { DailySaleI18nKeys } from "../../const/DailySaleI18nKeys";
import { DailySaleCfgData, DailySaleModel } from "../../model/DailySaleModel";
import GIns from "../../../../GIns";
import { UITransform } from "cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";

/** 每日特惠打包item */
export class DailySalePackItem extends fgui.GComponent {
    static pkgName: string = "dailySale";
    static viewName: string = "DailySalePackItem";

    protected _cfgData: DailySaleCfgData = null;
    protected _firstRewardId: number = 0;
    protected _rewards: { k: any; v: any }[] = [];

    private get view(): ui.dailySale.item.DailySalePackItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.packShowBtn.onClick(this.onClickShow, this);
        this.view.btnBuyPack.onClick(this.onClickBuy, this);
    }

    protected onClickBuy(): void {
        if (DailySaleModel.ins().hasBuyNormal(this._cfgData.cfg.groupId)) {
            //已购买过普通礼包，无法购买
            GIns.floatingTextMgr.showTips(DailySaleI18nKeys.packTip3);
            return;
        }
        if (DailySaleModel.ins().hasBuyPackGift(this._cfgData.cfg.groupId)) {
            GIns.floatingTextMgr.showTips(DailySaleI18nKeys.packTip3);
            return;
        }
        OrderModel.ins().sendCreateOrder(this._cfgData.orderCfg.id);
    }

    protected onClickShow(event: fgui.Event): void {
        let firstReward: { k: any; v: any } = null;
        if (this._cfgData.orderCfg.rewards.length > 0) {
            firstReward = this._cfgData.orderCfg.rewards[0];
        }
        if (firstReward) {
            const itemUI = this.view.packShowBtn.node.getComponent(UITransform);
            let itemCfg = G.TableManager.getDataById(
                table.item.ItemConfig,
                firstReward.k
            );
            // 物品详情弹窗
            FacadeManager.ins().emit(
                NotificationKey.CLICK_ITEM,
                EventClickItem.create(event, itemCfg, itemUI, firstReward.v)
            );
        }
    }

    public setData(data: DailySaleCfgData): void {
        this._cfgData = data;
        let view = this.view,
            { btnBuyPack } = view,
            I18nManager = G.I18nManager;

        let dailySaleModelIns = DailySaleModel.ins();
        if (dailySaleModelIns.hasBuyPackGift(data.cfg.groupId)) {
            //已购买打包礼包
            btnBuyPack.title = I18nManager.lang(DailySaleI18nKeys.hasBuy);
            // lbLimit.text = I18nManager.lang(DailySaleI18nKeys.buyLimit, 1, 1)
        } else {
            //只要买过普通礼包，打包礼包购买按钮就置灰，不能购买
            let hasBuyNormal = dailySaleModelIns.hasBuyNormal(data.cfg.groupId);
            if (hasBuyNormal) {
                btnBuyPack.grayed = true;
            } else {
                btnBuyPack.grayed = false;
            }
            // lbLimit.text = I18nManager.lang(DailySaleI18nKeys.buyLimit, 0, 1)
            btnBuyPack.title = data.orderCfg.price / 100 + "元今日打包";
        }
    }
}
