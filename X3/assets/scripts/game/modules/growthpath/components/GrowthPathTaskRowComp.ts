import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GrowthPathUIKeys } from "db://assets/scripts/game/modules/growthpath/GrowthPathUIKeys";
import { UIActivityKey } from "../../activity/const/UIActivityConfig";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

export class GrowthPathTaskRowComp extends FGUI.GComponent {
    private _config: table.activity.Task.ActivityTaskConfig;

    private get view(): ui.growthPath.components.GrowthPathTaskRowComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


        this.view.btnGo.onClick(this.onClickGo0, this);
        this.view.btnGain.onClick(this.onClickGain0, this);

    }

    @CdUtils.ExecuteInCDTimeMs(1000)
    onClickGain0() {
        const config = this._config;
        if (!config) {
            return;
        }
        ActivityModel.ins().sendDrawItemReward({
            activityId: config.activityId,
            itemId: config.id.toString(),
            hidePopWin: 2
        } as ActivitySyncData)


    }

    @CdUtils.ExecuteInCDTimeMs(1000)
    onClickGo0() {
        const c = this._config;
        if (c) {
            FacadeManager.ins().emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, c.jumpId);

            UIManager.ins().close(UIActivityKey.EntranceMainView);
        }
        
    }

    reset(taskData: TaskData): void {
// 任务
        const taskId = taskData.taskId;
        const c = ActivityTaskConfigManager.getConfigById(taskId);
        if (!c) {
            return;
        }
        this._config = c;

        this.view.labelTitle.text = c.desc;
        const currentProgress = taskData.currentProgress;
        const maxProgress = c.maxProgress;

        const showProgress = Math.min(currentProgress, maxProgress);
        this.view.labelCount.text = `${showProgress}/${maxProgress}`;


        this.view.barPercent.value = currentProgress;
        this.view.barPercent.max = maxProgress;

        this.view.getController("taskState").selectedIndex = Math.max(0, taskData.state - 1);
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).showByType(taskData.state == 3 ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL)

        // 奖励
        const items = taskData.getRewardItems();
        new Map([
            [0, this.view.item1],
            [1, this.view.item2]
        ]).forEach((item, index) => {
            const itemData = items[index];
            if (itemData) {
                const itemFrame = FguiScriptUtils.toMyScriptClass(item, ItemFrameBtn);
                itemFrame.resetByNoOwnerItem(itemData);
            }
        });
    }

}