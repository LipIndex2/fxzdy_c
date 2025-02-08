import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import GIns from "../../../../GIns";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";

/**
 * 终身活动
 * 奖励item
 */
@bindFguiExtension("ui://activityLifelong/awardItem")
export class LifelongAwardItem extends fgui.GComponent {
    static pkgName: string = "activityLifelong";
    static viewName: string = "awardItem";

    private get view(): ui.activityLifelong.item.awardItem {
        return this as any;
    }

    private _vo: ActivityReachStandardVo;
    private _cfg: table.activity.Task.ActivityTaskConfig;
    //状态
    private _state = 0;

    protected onInit(): void {
        this.view.list_award.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {}

    public updateView(vo: ActivityReachStandardVo, cfg: table.activity.Task.ActivityTaskConfig, index: number, lastCfg: table.activity.Task.ActivityTaskConfig): void {
        this._vo = vo;
        this._cfg = cfg;

        this.view.T_num.text = `${cfg.maxProgress}`;

        let taskData = vo.getTaskVo(cfg.id);

        this._state = 0;
        if (vo.getTaskIsDone(this._cfg.id)) {
            this._state = 2;
        } else {
            if (taskData && taskData.state == 3) {
                this._state = 1;
            }
        }

        if (this._state != 0 && this._vo.showItemIndex == -1) {
            this._vo.showItemIndex = index;
        }
        this.view.getController("c1").selectedIndex = this._state;
        this.view.getController("c2").selectedIndex = this._cfg.id % 2;

        this.view.list_award.numItems = cfg.rewards.length;
        this.view.bar.max = 1;
        this.view.bar.value = 0;
        let miniCount = 0;
        if (index != this._vo.lifelongRewardCfgs.length - 1) {
            this.view.bar.height = 80;
            //上一个任务配置
            let preCfg = lastCfg;
            miniCount = preCfg?.maxProgress;
        } else {
            this.view.bar.height = 635;
        }

        if (this._state == 2) {
            this.view.bar.max = 1;
            this.view.bar.value = 1;
        } else {
            let count = taskData.progress - miniCount;
            if (count <= 0) {
                count = 0;
            }
            this.view.bar.max = cfg.maxProgress - miniCount;
            this.view.bar.value = count;
        }

        // FguiScriptUtils.toMyScriptClass(this.view..redDot, RedDotCom).showByType(this._state == 2 ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
    }

    private awardItemRenderer(index: number, item: ItemFrameBtn): void {
        let itemData = this._cfg.rewards[index];
        item.reset(itemData.k, itemData.v);

        if (this._state == 1) {
            item.playEffect();
            item.clearClick();
            item.onClick(() => {
                let data: ActivitySyncData = {
                    activityId: this._vo.activityId,
                    itemId: "TASK_" + this._cfg.id,
                    hidePopWin: 2,
                };
                GIns.activityModel.sendDrawItemReward(data);
            });
        } else {
            item.clearAnim();
        }
    }
}
