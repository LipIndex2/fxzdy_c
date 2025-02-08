import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import GIns from "../../../../GIns";
import { ActivityCareerTrialsVo } from "../../model/ActivityCareerTrialsVo";
import { TableManager } from "../../../../../core/table/TableManager";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

/**
 * 职业试炼
 * 基金item
 */
@bindFguiExtension("ui://activityCareerTrials/TrialsFundItem")
export class TrialsFundItem extends fgui.GComponent {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "TrialsFundItem";

    private get view(): ui.activityCareerTrials.item.TrialsFundItem {
        return this as any;
    }

    private _vo: ActivityCareerTrialsVo;
    private _cfg: table.activity.Fund.FundTaskConfig;
    private _state: number = 0;

    onInit() {
        this.view.list_award1.itemRenderer = this.awardItemRenderer1.bind(this);
        this.view.list_award2.itemRenderer = this.awardItemRenderer2.bind(this);
        this.view.btn_buy1.on(fgui.Event.CLICK, this.onBuy1Click, this);
        this.view.btn_buy2.on(fgui.Event.CLICK, this.onBuy2Click, this);
    }

    public setData(vo: ActivityCareerTrialsVo, cfg: table.activity.Fund.FundTaskConfig, isLastOne: boolean) {
        this._vo = vo;
        this._cfg = cfg;

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_fund_item, [this._cfg.id]);

        //状态
        this.view.btn_buy1.visible = true;
        this.view.btn_buy2.visible = true;
        this.view.img_sq1.visible = false;
        this.view.img_sq2.visible = false;
        this.view.getController("c2").selectedIndex = isLastOne ? 1 : 0;
        this.view.getController("c1").selectedIndex = 0;
        this._state = this._vo.getFundTaskStatusById(this._cfg.id);
        if (this._state != 2) {
            this.view.getController("c1").selectedIndex = this._state;
        } else {
            this.view.getController("c1").selectedIndex = 1;

            //已领取
            this.view.btn_buy1.visible = false;
            this.view.img_sq1.visible = true;
        }

        this.view.list_award1.numItems = this._cfg.rewards.length;
        this.view.list_award2.numItems = this._cfg.chargeRewards.length;

        //任务
        // let heroitem = this.view.item as any;
        // let heroVo = GIns.heroMgr.getHeroVoByID(this._vo.cfg.fundShowHeroId[0]);
        // heroitem.setHeroVo(heroVo, true);
        // heroitem.setStar(cfg.totalProgress);
        // heroitem.isShowName(false);
        // heroitem.isShowCamp(false);
        // heroitem.isShowLevel(false);
        // heroitem.isShowLock(this._state == 0);
        this.view.T_task.text = "Lv." + this._cfg.totalProgress;

        let chargeCfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this._cfg.chargeGoodsId);
        this.view.btn_buy2.text = `${chargeCfg.price / 100}元`;
        let buyCount = this._cfg.chargeGoodsLimit - this._vo.getFundBuyTimesById(this._cfg.id);
        this.view.T_buyCount.text = `限购次数：${buyCount}/${this._cfg.chargeGoodsLimit}`;
        if (buyCount <= 0) {
            // this.view.btn_buy2.grayed = true;
            // this.view.btn_buy2.touchable = false;
            //已领取
            this.view.btn_buy2.visible = false;
            this.view.img_sq2.visible = true;
        }
    }

    //免费奖励
    private awardItemRenderer1(index: number, item: ItemFrameBtn) {
        let itemData = this._cfg.rewards[index];
        item.reset(itemData.k, itemData.v);
        // if (this._state == 2) {
        //     item.setHaveGain(true);
        // }
    }
    //付费奖励
    private awardItemRenderer2(index: number, item: ItemFrameBtn) {
        let itemData = this._cfg.chargeRewards[index];
        item.reset(itemData.k, itemData.v);
    }

    //领取免费奖励
    private onBuy1Click() {
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "FUND:" + this._cfg.id,
            hidePopWin: 2,
        } as ActivitySyncData;
        GIns.activityModel.sendDrawItemReward(syncData);
    }
    //购买付费奖励
    private onBuy2Click() {
        GIns.orderModel.sendCreateOrder(this._cfg.chargeGoodsId);
    }
}
