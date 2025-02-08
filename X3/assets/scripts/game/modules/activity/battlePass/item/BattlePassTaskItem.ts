import * as fgui from "fairygui-cc";
import { ActivityBattlePassVo } from "../../model/ActivityBattlePassVo";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { JumpManager } from "../../../jump/JumpManager";
import { FloatingTextManager } from "../../../floatingText/FloatingTextManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { RedDotManager } from "../../../common/redDot/RedDotManager";
import GIns from "../../../../GIns";





/** 通行证  任务item */
@bindFguiExtension("ui://activityBattlePass/BattlePassTaskItem")
export class BattlePassTaskItem extends fgui.GComponent {

    private _cfg: table.activity.BattlePass.BattlePassTaskConfig;
    /**  通行证vo */
    private _data: ActivityBattlePassVo;

    private _state = 0;

    static pkgName: string = "activityBattlePass";
    static viewName: string = "BattlePassTaskItem";

    private get view(): ui.activityBattlePass.item.BattlePassTaskItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.btn_get.on(fgui.Event.CLICK, this.onGet, this);
    }

    private onGet() {
        if (this._state == 0) {
            //跳转前往
            if (!this._cfg.jumpId) {
                GIns.floatingTextMgr.showTips("没有配跳转id ");
                return;
            }
            JumpManager.ins().jumpById(this._cfg.jumpId);
        } else if (this._state == 1) {
            //领取奖励
            let syncData = {
                activityId: this._data.activityId,
                itemId: "TASK_" + this._cfg.id,
                hidePopWin: 3,
            } as ActivitySyncData;
            ActivityModel.ins().sendDrawItemReward(syncData);
        }

    }

    public updateData(data: table.activity.BattlePass.BattlePassTaskConfig, Vo: ActivityBattlePassVo) {
        if (!data) return;
        this._cfg = data;
        this._data = Vo;

        this.updateUI();

        FguiScriptUtils.toMyScriptClass(this.view.btn_get.redDot, RedDotCom).reset(RedDotKeys.StarPass_task, [this._cfg.id]);

        if (!this._cfg.jumpId && this._state == 0) {
            this.view.btn_get.visible = false;
        } else {
            this.view.btn_get.visible = true;
        }
    }

    private updateUI() {
        this.view.T_taks.text = this._cfg.taskDesc;
        //@ts-ignore
        this.view.item.reset(this._data.passCfg.expItemId, this._cfg.battlePassExp);
        this._state = 0;
        let taskData = this._data.getTaskDataById(this._cfg.id);
        if (this._data.taskIsFinished(this._cfg.id)) {
            this._state = 2;
        } else {
            if (taskData && taskData.state == 3) {
                this._state = 1;
            }
        }

        // RedDotManager.ins().setRedDot(RedDotKeys.StarPass_task, this._state == 1, [this._cfg.id]);

        this.view.getController("c1").selectedIndex = this._state;
        let progress = 0;
        if (this._state == 2) {
            progress = this._cfg.totalProgress;
        }
        this.view.bar.value = taskData?.progress || progress;
        this.view.bar.max = this._cfg.totalProgress;
        this.view.T_bar.text = `${this.view.bar.value}/${this._cfg.totalProgress}`
    }



}