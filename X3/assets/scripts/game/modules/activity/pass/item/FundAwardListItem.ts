import * as fgui from "fairygui-cc";
import { ActivityFundVo } from "../../model/ActivityFundVo";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";

/** 基金item */
@bindFguiExtension("ui://activityPass/PassAwardListItem")
export class FundAwardListItem extends fgui.GComponent {
    private _cfg: table.activity.Fund.FundTaskConfig;
    /**  通行证vo */
    private _data: ActivityFundVo;

    static pkgName: string = "activityPass";
    static viewName: string = "PassAwardListItem";

    private get view(): ui.activityPass.item.PassAwardListItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.list_award.itemRenderer = this.itemRenderer.bind(this);

        this.view.item.on(fgui.Event.CLICK, this.onGetClick, this);
    }

    public updateData(data: table.activity.Fund.FundTaskConfig, Vo: ActivityFundVo) {
        if (!data) return;
        this._cfg = data;
        this._data = Vo;

        this.updateUI();
    }

    private updateUI() {
        //@ts-ignore
        this.view.item.item.reset(this._cfg.rewards[0].k, this._cfg.rewards[0].v);
        this.view.list_award.numItems = this._cfg.chargeRewards.length;

        this.view.T_level.text = `${this._cfg.totalProgress}`;

        //当前item状态 0:未达成 1:已达成未领取 2:已领取
        let state = 0;
        if (this._data.isRewardGet(this._cfg.id)) {
            state = 2;
        } else if (this._data.isRewardCanGet(this._cfg.id)) {
            state = 1;
        }

        //@ts-ignore
        let itemFrameBtn = this.view.item.item as ItemFrameBtn;
        if (this._data.isRewardCanGet(this._cfg.id)) {
            itemFrameBtn.isCanClick(false);
            itemFrameBtn.playEffect();
        } else {
            itemFrameBtn.isCanClick(true);
            itemFrameBtn.clearAnim();
        }

        this.view.T_desc.text = this._data.fundCfg.desc;
        this.view.getController("c1").selectedIndex = state;
        itemFrameBtn.setHaveGain(state == 2);
    }

    private itemRenderer(index: number, item: ui.activityPass.item.PassAwardItem) {
        let data = this._cfg.chargeRewards[index];
        //@ts-ignore
        let itemFrameBtn = item.item as ItemFrameBtn;
        itemFrameBtn.reset(data.k, data.v);

        item.img_suo.visible = !this._data.activityVo.boughtFund;

        item.item.item.getController("haveGain").selectedIndex = this._data.isRewardGetByHigh(this._cfg.id) ? 1 : 0;

        itemFrameBtn.isCanClick(true);
        if (this._data.isRewardCanGetByHigh(this._cfg.id)) {
            itemFrameBtn.isCanClick(false);
            itemFrameBtn.playEffect();
            let self = this;
            item.clearClick();
            item.onClick(() => {
                self.onGetClick();
            }, self);
        } else {
            // itemFrameBtn.clearClick();
            itemFrameBtn.clearAnim();
            itemFrameBtn.isCanClick(true);
        }
    }

    private onGetClick() {
        if (this._data.isRewardCanGet(this._cfg.id)) {
            let syncData = {
                activityId: this._data.activityId,
                itemId: "id",
                hidePopWin: 2,
            } as ActivitySyncData;
            ActivityModel.ins().sendDrawItemReward(syncData);
        }

        // let syncData = {
        //     activityId: this._data.activityId,
        //     itemId: "id",
        //     hidePopWin: 2,
        // } as ActivitySyncData;
        // ActivityModel.ins().sendDrawItemReward(syncData);
    }
}
