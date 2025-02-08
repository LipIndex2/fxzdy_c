import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { ActivityCareerTrialsVo } from "../../model/ActivityCareerTrialsVo";

/**
 * 职业试炼通行证
 * 奖励item
 */
@bindFguiExtension("ui://activityCareerTrials/TrialsBattlePassItem1")
export class TrialsBattlePassItem1 extends fgui.GComponent {
    private _cfg: table.activity.BattlePass.BattlePassRewardConfig;
    /**  职业试炼vo */
    private _data: ActivityCareerTrialsVo;

    static pkgName: string = "activityCareerTrials";
    static viewName: string = "TrialsBattlePassItem1";

    private get view(): ui.activityCareerTrials.item.TrialsBattlePassItem1 {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.list_award1.itemRenderer = this.itemAward1Renderer.bind(this);
        this.view.list_award2.itemRenderer = this.itemAward2Renderer.bind(this);
    }

    public updateData(data: table.activity.BattlePass.BattlePassRewardConfig, Vo: ActivityCareerTrialsVo) {
        if (!data) return;
        this._cfg = data;
        this._data = Vo;

        this.updateUI();
    }

    private updateUI() {
        this.view.list_award1.numItems = this._cfg.rewards.length;
        this.view.list_award2.numItems = this._cfg.chargeRewards.length;

        for (let i = 0; i < this.view.list_award1.numItems; i++) {
            let item = this.view.list_award1.getChildAt(i);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_pass_item_free, [this._cfg.id]);
        }
        for (let i = 0; i < this.view.list_award2.numItems; i++) {
            let item = this.view.list_award2.getChildAt(i);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_pass_item_pay, [this._cfg.id]);
        }

        this.view.T_level.text = this._cfg.level.toString();
    }

    private itemAward1Renderer(index: number, item: ItemFrameBtn) {
        let data = this._cfg.rewards[index];
        item.reset(data.k, data.v);
        item.setHaveGain(false);

        item.isCanClick(true);
        //@ts-ignore
        item.item.clearClick();

        let hasRed = false;
        if (this._data.isRewardCanGet(this._cfg.id)) {
            //可领取
            item.playEffect();
            item.isCanClick(false);

            let self = this;
            //@ts-ignore
            item.item.onClick(() => {
                self.getArawd();
            }, self);
            hasRed = true;
        } else {
            item.clearAnim();
        }
        if (this._data.isRewardGet(this._cfg.id)) {
            //已领取
            item.setHaveGain(true);
        }

        // RedDotManager.ins().setRedDot(RedDotKeys.StarPass_item, hasRed, [index]);
    }
    private itemAward2Renderer(index: number, item: ItemFrameBtn) {
        let data = this._cfg.chargeRewards[index];
        item.reset(data.k, data.v);
        item.setHaveGain(false);
        item.isShowLock(false);
        item.clearAnim();
        item.isCanClick(true);
        //@ts-ignore
        item.item.clearClick();

        let hasRed = false;
        if (this._data.isRewardCanGetByHigh(this._cfg.id)) {
            //可领取
            item.playEffect();
            item.isCanClick(false);

            let self = this;
            //@ts-ignore
            item.item.onClick(() => {
                self.getArawd();
            }, self);
            hasRed = true;
        }
        if (this._data.isRewardGetByHigh(this._cfg.id)) {
            //已领取
            item.setHaveGain(true);
        }
        if (this._data.activityVo.boughtPassIds.indexOf(+this._data.passCfg.chargeGoodsId) == -1) {
            //未解锁
            item.isShowLock(true);
        }

        // RedDotManager.ins().setRedDot(RedDotKeys.StarPass_item, hasRed, [index]);
        // FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StarPass_pay, [i])
    }

    //领取奖励
    private getArawd() {
        let syncData = {
            activityId: this._data.activityId,
            itemId: "BATTLE_PASS",
            hidePopWin: 2,
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(syncData);
    }
}
