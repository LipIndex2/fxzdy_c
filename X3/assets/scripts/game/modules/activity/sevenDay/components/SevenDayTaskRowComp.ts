import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import {
    ActivitySevenDayTaskModelVo
} from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { GainItemEffectUtils } from "../../../gain/view/GainItemEffectUtils";
import { SevenDayTaskSubView } from "../subView/SevenDayTaskSubView";


@bindFguiExtension("ui://sevenDay/SevenDayTaskRowComp")
export class SevenDayTaskRowComp extends FGUI.GComponent {
    private parentUI: SevenDayTaskSubView
    private _config: table.activity.Task.ActivityTaskConfig;

    get view(): ui.sevenDay.item.SevenDayTaskRowComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.btnJump.onClick(this.onClickJump, this);
        this.view.btnGain.onClick(this.onClickGain0, this);
    }

    @CdUtils.ExecuteInCDTimeMs(1000)
    onClickGain0() {
        const config = this._config;
        if (!config) {
            return;
        }

        GainItemEffectUtils.setNextEffectOtherMap(103, this.parentUI.view.nodePoint.x, this.parentUI.view.nodePoint.y);
        // 领取奖励
        ActivityModel.ins().sendDrawItemReward({
            activityId: config.activityId,
            itemId: `TASK_${config.id}`,
            hidePopWin: 2
        } as ActivitySyncData);

    }

    onClickJump() {
        if (!this._config) {
            return;
        }

        JumpManager.ins().jumpById(this._config.jumpId);
    }

    reset(data: TaskData, parentUI: SevenDayTaskSubView) {
        if (!data) {
            return;
        }

        this.parentUI = parentUI;
        const taskId = data.taskId;
        const day = SevenDayConfigManager.getDayByTaskId(taskId);
        RedDotUtils.castComp(this.view.redDot)
            .reset(RedDotKeys.SevenDay_Task_DAY_ROW, [day, taskId])

        const config: table.activity.Task.ActivityTaskConfig = SevenDayConfigManager.getTaskConfig(data.taskId);
        if (!config) {
            return;
        }
        this._config = config;

        const vo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`)
            return;
        }

        const jumpId = config.jumpId;

        // tit
        this.view.labelTitle.text = config.desc;

        // 进度 
        let curProgress = vo.getTaskProgressByTaskId(taskId);
        const maxProgress = config.maxProgress;
        // not high
        const showProgress = Math.min(curProgress, maxProgress);
        this.view.labelProgress.text = `${showProgress}/${maxProgress}`

        // 奖励
        const items = ItemUtils.parseKvArrayToItemArray(config.rewards);
        FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp)
            .reset(items)

        // type
        const taskState = vo.getTaskStateById(taskId);
        this.view.getController("type").selectedIndex = Math.max(0, taskState - 1);

        // no jump no btnJump
        if (jumpId == 0 && taskState == ServerEnums.TaskState.IN_PROGRESS) {
            this.view.getController("type").selectedIndex = 0;
        }
    }
}