import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ActivityGirlGroupVo } from "../../activity/model/ActivityGirlGroupVo";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { UICommonKey } from "../../common/const/UICommonConfig";
import G from "../../../../core/comm/G";

/**
 * 女团
 * 打赏礼包item
 */
@bindFguiExtension("ui://girlGroup/GirlGroupAwardItem")
export class GirlGroupAwardItem extends fgui.GComponent {
    static pkgName: string = "girlGroup";
    static viewName: string = "GirlGroupAwardItem";

    private get view(): ui.girlGroup.item.GirlGroupAwardItem {
        return this as any;
    }

    private _vo: ActivityGirlGroupVo;
    private _goodsCfg: table.order.ChargeGoodsConfig;
    private _cfg: table.activity.GirlGroup.GirlGroupGoodsConfig

    private _tabcfg: table.activity.GirlGroup.GirlGroupGoodsConditionConfig;

    onInit() {
        this.view.list_item.itemRenderer = this.itemRenderer.bind(this);
        this.view.btn_buy.on(fgui.Event.CLICK, this.onBuyClick, this);
    }

    setData(cfg: table.activity.GirlGroup.GirlGroupGoodsConfig, curDay: number) {
        this._cfg = cfg;
        this._vo = GIns.activityModel.getActivityVoById(cfg.activityId);
        this._goodsCfg = TableManager.getDataById(table.order.ChargeGoodsConfig, cfg.chargeGoodsId);

        this.view.T_name.text = this._goodsCfg.goodsName;
        this.view.list_item.numItems = this._goodsCfg.rewards.length;
        if (cfg.discount) {
            this.view.T_discounts.text = cfg.discount + "%";
            this.view.gp_discounts.visible = true;
        } else {
            this.view.gp_discounts.visible = false;
        }

        this._tabcfg = TableManager.getDataById(table.activity.GirlGroup.GirlGroupGoodsConditionConfig, cfg.conditionId);
        //状态 0 未解锁， 1解锁
        let state = 0;
        if (GIns.conditionMgr.checkCondition(this._tabcfg.conditions)) {
            state = 1;
        }

        this.view.getController("c1").selectedIndex = state;
        if (this._vo.isBuyGoods(cfg.id)) this.view.getController("c1").selectedIndex = 2;
        let count = this._vo.isBuyGoods(cfg.id) ? 0 : 1;
        this.view.T_tips.text = `限购${count}/1`;
        if (state == 0) {
            this.view.T_tips.text = this._tabcfg.goodsTips;
        }

        this.view.btn_buy.text = `${this._goodsCfg.price / 100}元`;
    }

    private itemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._goodsCfg.rewards[index];
        item.reset(data.k, data.v);

        if (this._goodsCfg.effects && !this._vo.isBuyGoods(this._cfg.id)) {
            item.playOtherEffect(this._goodsCfg.effects[index])
        }
        else {
            item.clearAnim()
        }
    }

    private onBuyClick() {
        if (GIns.conditionMgr.checkCondition(this._tabcfg.conditions)) {
            GIns.orderModel.sendCreateOrder(this._goodsCfg.id);
        } else {
            let uiParam: BtnConfirmViewOpenArgs = {
                title: "提示",
                content: this._tabcfg.jumpTips,
                titleCancel: CommonI18nKeys.cancel,
                titleConfirm: CommonI18nKeys.confirm,
                onBtnYes: () => {
                    if (this._tabcfg.jumpId) {
                        GIns.jumpManager.jumpById(this._tabcfg.jumpId);
                    } else {
                        console.error("没配置跳转id!!!!");
                    }
                },
            };
            G.UIManager.open(UICommonKey.BtnConfirmWarnView, uiParam);
        }
    }
}
