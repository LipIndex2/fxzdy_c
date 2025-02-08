import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class GrowthPathPanelComp extends FGUI.GComponent {
    private _rewardItems: Array<NoOwnerItem> = [];
    private _taskData: TaskData;
    private _config: table.activity.Task.ActivityTaskConfig;

    private get view(): ui.growthPath.components.GrowthPathPanelComp {
        return this as any;
    }

    onConstruct(): void {
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.iR.bind(this);

        this.view.onClick(this.onClick0, this)
    }


    @CdUtils.ExecuteInCDTimeMs(1000, "成长之路, 领取大奖")
    onClick0() {

        if (!this._taskData) {
            return;
        }

        const taskId = this._taskData.taskId;
        const taskState = this._taskData.state;
        if (taskState != ServerEnums.TaskState.COMPLETED) {
            console.warn(`GrowthPathPanelComp.onClick0: task not completed | taskId = ${taskId}`)
            return;
        }

        ActivityModel.ins().sendDrawItemReward({
            activityId: this._config.activityId,
            itemId: taskId.toString(),
            hidePopWin: 2,
        } as ActivitySyncData)
    }

    iR(index: number, obj: ItemFrameBtn) {
        obj.resetByNoOwnerItem(this._rewardItems[index]);
        const isFinish = this._taskData.isFinish();
        if (isFinish) {
            obj.setHaveGain(true);
        }
        if (this._taskData?.state == ServerEnums.TaskState.COMPLETED) {
            obj.playEffect()
        } else {
            obj.clearAnim()
        }
    }

    reset(taskData: TaskData): void {

        if (!taskData) {
            return;
        }
        this._taskData = taskData;

        const taskId = taskData.taskId;
        const taskC: table.activity.Task.ActivityTaskConfig = ActivityTaskConfigManager.getConfigById(taskId);
        if (!taskC) {
            return;
        }
        this._config = taskC;


        const value = taskData.currentProgress;
        const max = taskC.maxProgress;
        this.view.barPercent.max = max;
        this.view.barPercent.value = value;

        this.view.labelPercent.text = `${value}/${max}`;
        this.view.labelTitle.text = `${taskC.growUpStageId}阶`;

        this._rewardItems = taskData.getRewardItems() || [];
        this.view.itemList.numItems = this._rewardItems.length;

    }


}