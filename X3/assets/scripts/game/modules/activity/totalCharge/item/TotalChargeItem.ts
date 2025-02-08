import * as fgui from "fairygui-cc";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ChargeController } from "../../../charge/ChargeController";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ActivityTotalChargeVo } from "../../model/ActivityTotalChargeVo";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { MonthCardModel } from "../../../monthCard/model/MonthCardModel";
import G from "../../../../../core/comm/G";
import { MonthCardI18nKeys } from "../../../monthCard/const/MonthCardI18nKeys";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";

/** 开服累充item */
export class TotalChargeItem extends fgui.GComponent {
    static pkgName: string = "activityTotalCharge";
    static viewName: string = "TotalChargeItem";

    protected _cfg: table.activity.TotalCharge.TotalChargeConfig = null
    private notShowEffect: boolean = false;

    private get view(): ui.activityTotalCharge.item.TotalChargeItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.awardItem.bind(this)
        this.view.btnDraw.onClick(this.onClickDraw, this)
        this.view.btnGoto.onClick(this.onClickGoto, this)
    }


    private awardItem(index: number, item: ui.comm.item.ItemFrameBtnWithBubble) {
        let data = this._cfg.rewards[index];
        //@ts-ignore
        let itemFrame = item.itemFrame as ItemFrameBtn;
        itemFrame.reset(data.k, data.v);

        if (this._cfg.effects && !this.notShowEffect) {
            itemFrame.playOtherEffect(this._cfg.effects[index]);
        }
        else {
            itemFrame.clearAnim()
        }

        const vo = ActivityModel.ins().getActivityVoById(this._cfg.activityId) as ActivityTotalChargeVo
        let hasDrawReward: boolean = vo.activityVo.rewardIds.indexOf(this._cfg.id) != -1
        if (!hasDrawReward) {
            // const isMCAct = MonthCardModel.ins().isActItem(+data.k);
            // item.lb.text =  G.I18nManager.lang(MonthCardI18nKeys.freeAct);
            // if (isMCAct) {
            //     item.bubble.visible = true;
            //     item.bg.scaleX = item.bg.scaleY = 0;
            //     item.lb.scaleX = item.lb.scaleY = 0;
            //     item.getTransition('t2').play()
            // } 
            // else {
            item.bubble.visible = false;
            item.bg.scaleX = item.bg.scaleY = 1;
            item.lb.scaleX = item.lb.scaleY = 1;
            // }
        } else {
            item.bubble.visible = false;
            item.bg.scaleX = item.bg.scaleY = 1;
            item.lb.scaleX = item.lb.scaleY = 1;
        }
    }

    protected onClickDraw(): void {
        let data = {
            activityId: this._cfg.activityId,
            itemId: this._cfg.id + '',
            hidePopWin: 2,
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(data)
    }

    protected onClickGoto(): void {
        ChargeController.ins().openChargeMainView()
    }

    public setData(cfg: table.activity.TotalCharge.TotalChargeConfig, vo: ActivityTotalChargeVo): void {
        this._cfg = cfg
        //是否已领取奖励
        let hasDrawReward: boolean = vo.activityVo.rewardIds.indexOf(cfg.id) != -1
        let curMoney = Math.min(cfg.chargeMoney, vo.activityVo.money)
        this.view.lbName.text = `累计充值${Math.ceil(cfg.chargeMoney / 100)}元`
        this.view.lbProgress.text = `${Math.ceil(curMoney / 100)}/${Math.ceil(cfg.chargeMoney / 100)}`
        this.notShowEffect = false;
        if (hasDrawReward) {
            this.view.btnDraw.visible = true
            this.view.btnGoto.visible = false
            this.view.btnDraw.enabled = false
            this.view.btnDraw.title = '已领取'
            this.notShowEffect = true;
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, false)
        } else {
            if (curMoney >= cfg.chargeMoney) {
                //可领取
                this.view.btnDraw.visible = true
                this.view.btnGoto.visible = false
                this.view.btnDraw.enabled = true
                this.view.btnDraw.title = '领取'
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, true)
            } else {
                this.notShowEffect = true;
                this.view.btnDraw.visible = false
                this.view.btnGoto.visible = true
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, false)
            }
        }
        this.view.listReward.numItems = cfg.rewards.length
    }
}