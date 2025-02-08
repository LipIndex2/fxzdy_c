import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import GIns from "../../../../GIns";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
/**
 * 达标活动
 * 任务item
 */
@bindFguiExtension("ui://activityReachStandard/ReachStandardTaskItem")
export class ReachStandardTaskItem extends fgui.GComponent {
    static pkgName: string = "activityReachStandard";
    static viewName: string = "ReachStandardTaskItem";
    private get view(): ui.activityReachStandard.item.ReachStandardTaskItem {
        return this as any;
    }

    private _vo: ActivityReachStandardVo;
    private _cfg: table.activity.Task.ActivityTaskConfig;
    private _rewards = [];

    private _round: number;

    onInit() {
        this.view.list_award.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onBuyClick, this);
        this.view.btn_goto.on(fgui.Event.CLICK, this.onGoTo, this);
    }

    public setData(cfg: table.activity.Task.ActivityTaskConfig, vo: ActivityReachStandardVo, round?: number) {
        this._cfg = cfg;
        this._vo = vo;

        if (round && round != vo.round) {
            this._round = round;
        } else {
            this._round = vo.round;
        }
        // 红点
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_task, [this._vo.activityId, this._cfg.id]);

        this.view.getController("c1").selectedIndex = 0;
        //
        this.view.T_taskName.text = this._cfg.desc;
        if (this._round == vo.round) {
            let taskVo = this._vo.getTaskVo(this._cfg.id);
            if (!taskVo) {
                this.view.T_count.text = `${this._cfg.maxProgress}/${this._cfg.maxProgress}`;
            } else {
                let count = taskVo.progress > this._cfg.maxProgress ? this._cfg.maxProgress : taskVo.progress;
                this.view.T_count.text = `${count}/${this._cfg.maxProgress}`;
                this.view.getController("c1").selectedIndex = taskVo.state == 3 ? 1 : 0;
            }

            if (this._vo.getTaskIsDone(this._cfg.id)) {
                this.view.getController("c1").selectedIndex = 2;
            }
        } else if (this._round > vo.round) {
            this.view.getController("c1").selectedIndex = 0;
            this.view.T_count.text = `0/${this._cfg.maxProgress}`;
        } else {
            this.view.getController("c1").selectedIndex = 2;
            this.view.T_count.text = `${this._cfg.maxProgress}/${this._cfg.maxProgress}`;
        }

        this.view.list_award.numItems = this._cfg.rewards.length;
    }

    //奖励
    private awardItemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._cfg.rewards[index];
        item.reset(data.k, data.v);

        if (this.view.getController("c1").selectedIndex == 1) {
            item.playEffect();
        } else {
            item.clearAnim();
        }
    }
    //领奖
    private onBuyClick() {
        // if (this.view.getController("c1").selectedIndex == 1) {
        let data: ActivitySyncData = {
            activityId: this._vo.activityId,
            itemId: "TASK_" + this._cfg.id,
            hidePopWin: 2,
        };
        GIns.activityModel.sendDrawItemReward(data);
        // } else {
        // if (this._vo.reachStandardCfg.jumpId) {
        //     GIns.jumpManager.jumpById(this._vo.reachStandardCfg.jumpId);
        // } else {
        //     console.error("未配置跳转");
        // }
        // }
    }

    private onGoTo() {
        const jumpId = this._cfg?.jumpId || 0;

        if (jumpId) {
            GIns.jumpManager.jumpById(jumpId);
        } else {
            console.error(`ActivityTaskConfig 未配置跳转 | id = ${this._cfg?.id}`);
        }
    }
}
