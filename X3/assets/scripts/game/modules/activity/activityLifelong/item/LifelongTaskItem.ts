import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../../common/redDot/enums/EnumRedDotShowType";

/**
 * 终身活动
 * 任务item
 */
@bindFguiExtension("ui://activityLifelong/taskItem")
export class LifelongTaskItem extends fgui.GComponent {
    static pkgName: string = "activityLifelong";
    static viewName: string = "taskItem";

    private get view(): ui.activityLifelong.item.taskItem {
        return this as any;
    }

    private _vo: ActivityReachStandardVo;

    private _cfg: table.activity.Task.ActivityTaskConfig;
    //状态
    private _state = 0;

    protected onInit(): void {
        this.view.btn_goto.on(fgui.Event.CLICK, this.onBtnGotoClick, this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onBtnGetClick, this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {}

    public updateView(vo: ActivityReachStandardVo, cfg: table.activity.Task.ActivityTaskConfig): void {
        this._vo = vo;
        this._cfg = cfg;

        this.view.T_taskDesc.text = cfg.desc;
        //@ts-ignore
        let itemFrameBtn = this.view.item as ItemFrameBtn;
        itemFrameBtn.reset(cfg.rewards[0].k, cfg.rewards[0].v);
        itemFrameBtn.clearAnim();

        this.view.bar.max = cfg.maxProgress;

        let taskData = vo.getTaskVo(cfg.id);

        this._state = 0;
        if (vo.getTaskIsDone(this._cfg.id)) {
            this._state = 2;
        } else {
            if (taskData && taskData.state == 3) {
                this._state = 1;
                itemFrameBtn.playEffect();
            }
        }
        this.view.getController("c1").selectedIndex = this._state;
        let progress = 0;
        if (this._state == 2) {
            progress = this._cfg.maxProgress;
        }
        this.view.bar.value = taskData?.progress || progress;

        FguiScriptUtils.toMyScriptClass(this.view.btn_get.redDot, RedDotCom).showByType(this._state == 1 ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);

        if (this._cfg.jumpId) {
            this.view.btn_goto.visible = true;
        } else {
            this.view.btn_goto.visible = false;
        }
    }

    private onBtnGotoClick() {
        if (this._cfg.jumpId) {
            GIns.jumpManager.jumpById(this._cfg.jumpId);
        } else {
            GIns.floatingTextMgr.showTips("未配置跳转id");
        }
    }

    private onBtnGetClick() {
        let data: ActivitySyncData = {
            activityId: this._vo.activityId,
            itemId: "TASK_" + this._cfg.id,
            hidePopWin: 2,
        };
        GIns.activityModel.sendDrawItemReward(data);
    }
}
