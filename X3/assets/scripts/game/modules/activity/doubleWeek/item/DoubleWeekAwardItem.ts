import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ActivityDoubleWeekVo } from "../../model/ActivityDoubleWeekVo";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

/**
 * 双周活动
 * 礼包item
 */
@bindFguiExtension("ui://activityDoubleWeek/DoubleWeekAwardItem")
export class DoubleWeekAwardItem extends fgui.GComponent {
    static pkgName: string = "activityDoubleWeek";
    static viewName: string = "DoubleWeekAwardItem";
    private get view(): ui.activityDoubleWeek.item.DoubleWeekAwardItem {
        return this as any;
    }
    private _vo: ActivityDoubleWeekVo;
    private _cfg: table.activity.Task.ActivityTaskConfig;

    onInit() {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.btn_gotu.on(fgui.Event.CLICK, this.onGoToClick, this);
    }

    public setData(args: table.activity.Task.ActivityTaskConfig, vo: ActivityDoubleWeekVo) {
        this._cfg = args;
        this._vo = vo;
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.DoubleWeekActivity_task, [this._cfg.id]);

        this.view.T_desc.text = this._cfg.desc;
        this.view.list_award.numItems = this._cfg.rewards.length;

        this.view.bar.max = this._cfg.maxProgress;
        this.view.bar.value = this._vo.getTaskProgress(this._cfg.id);

        let state = 0;
        if (this._vo.isCompleteTask(this._cfg.id)) {
            state = 1;
            this.view.bar.value = this._cfg.maxProgress;
        }
        if (this._vo.isGetTaskReward(this._cfg.id)) {
            state = 2;
            this.view.bar.value = this._cfg.maxProgress;
        }

        this.view.getController("c1").selectedIndex = state;
    }

    private awardItemRenderer(index: number, item: ItemFrameBtn) {
        let itemData = this._cfg.rewards[index];
        item.resetByConfigKv(itemData);
    }

    private onGetClick() {
        //领取奖励
        let syncData = {
            activityId: this._vo.activityId,
            itemId: this._cfg.id.toString(),
            hidePopWin: 2,
        } as ActivitySyncData;
        GIns.activityModel.sendDrawItemReward(syncData);
        this._vo.addGetTaskReward(this._cfg.id);
    }

    private onGoToClick() {
        if (!this._vo.cfg.jumpId) return false;
        GIns.jumpManager.jumpById(this._vo.cfg.jumpId);
    }
}
