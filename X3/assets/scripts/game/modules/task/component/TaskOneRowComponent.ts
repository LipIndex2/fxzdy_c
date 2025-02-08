import G from "db://assets/scripts/core/comm/G";
import { TouchSideUtils } from "db://assets/scripts/core/utils/TouchSideUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TaskI18nKeys } from "db://assets/scripts/game/modules/task/const/TaskI18nKeys";
import { AchievementModel } from "db://assets/scripts/game/modules/task/model/AchievementModel";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { EventClickItem } from "../../item/event/EventClickItem";
import TaskType = ServerEnums.TaskType;

enum EnumTaskRewardType {
    // 道具
    ITEM = 0,
    // 积分
    SCORE = 1,
}


/**
 * 每日任务的一行
 */
export class TaskOneRowComponent extends fgui.GComponent {

    private _taskData: TaskData = null;

    // FGUI 任务按钮的 controller 
    private readonly FGUI_BUTTON_CTRL_NAME = "taskState";


    private get view(): ui.task.common.TaskOneRowComponent {
        return this as any;
    }

    onConstruct() {

        // 按钮颜色
        // this.view.btnTask.bgFinish.color = new Color("#3866BA");
        // this.view.btnTask.labelFinish.text = TaskI18nKeys.TASK_ROW_FINISH;

        this.view.rewardItem.onClick(this.onItemClick0, this);
        this.view.btnTask.btnGo.onClick(this.onClickGo, this);
        this.view.btnTask.btnComplete.onClick(this.onClickComplete, this);

    }

    onClickGo() {
        this.jumpToTaskTarget0();
    }

    onClickComplete() {
        this.gainTaskReward0()
    }


    private onItemClick0(event: fgui.Event) {

        if (!this._taskData) {
            return;
        }
        const clickPos = event.pos;
        const touchSideEnum = TouchSideUtils.getTouchSideInCanvasByClickPos(clickPos);

        if (this._taskData.taskType == ServerEnums.TaskType.ACHIEVEMENT) {
            const config = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, this._taskData.taskId);
            if (config) {
                const noOwnerItem = ItemUtils.parseStringToOnlyOneItem(config.rewardText);
                if (!noOwnerItem) {
                    return;
                }
                G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                    event,
                    noOwnerItem.getItemConfig(),
                    this.view.rewardItem._uiTrans,
                    noOwnerItem.count,
                ));
            }
            return
        }
    }

    jumpToTaskTarget0() {
        // [跳转]
        let jumpId = 0;
        if (this._taskData.taskType === ServerEnums.TaskType.DAILY_TASK) {
            // 每日
            jumpId = G.TableManager.getDataById(table.dailytask.DailyTaskConfig, this._taskData.taskId)?.jumpId || 0;
        } else if (this._taskData.taskType === ServerEnums.TaskType.ACHIEVEMENT) {
            // 成就
            jumpId = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, this._taskData.taskId)?.jumpId || 0;
        }

        // other...

        G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, jumpId)
    }

    // 领奖
    gainTaskReward0() {
        // 每日任务
        if (this._taskData.taskType === ServerEnums.TaskType.DAILY_TASK) {
            this.gainDailyTaskReward0()
            return;
        }
        // 成就任务
        if (this._taskData.taskType === ServerEnums.TaskType.ACHIEVEMENT) {
            this.gainAchievementTaskReward0()
            return;
        }

        // other...
    }

    // 完成成就
    gainAchievementTaskReward0() {
        // 一个一个领取
        AchievementModel.ins().sendDrawAchievementReward({
            taskConfigId: this._taskData.taskId
        } as Vo.achievement.DrawAchievementRewardC2S);
    }

    // 完成每日任务
    gainDailyTaskReward0() {
        // 单任务领取
        // const dailyTaskId = this._taskData.taskId;
        // if (dailyTaskId <= 0) {
        //     G.Logger.error(`任务ID错误. dailyTaskId = ${dailyTaskId}`)
        //     return;
        // }

        // 一键领取
        const completeTaskIds: number[] = DailyTaskModel.ins().getAllCompleteTaskIdArray()
        if (completeTaskIds.length <= 0) {
            G.Logger.warn("每日任务 | 没有可以完成的")
            return;
        }

        DailyTaskModel.ins().sendDrawTaskReward({
            taskConfigIds: completeTaskIds
        } as Vo.dailytask.DrawTaskRewardC2S);
    }

    /**
     * 重置组件
     * @param taskType
     * @param taskId
     */
    reset(taskType: ServerEnums.TaskType,
          taskId: number
    ) {
        switch (taskType) {
            case ServerEnums.TaskType.DAILY_TASK: {
                this.handleDailyTask0(taskId);
                break;
            }
            case ServerEnums.TaskType.ACHIEVEMENT: {
                this.handleAchievementTask0(taskId);
                break;
            }
        }

        this.refreshRedDot(taskType, taskId);
    }

    /**
     * 成就任务
     * @param taskId
     * @private
     */
    private handleAchievementTask0(taskId: number) {
        this.view.getController("rewardType").selectedIndex = EnumTaskRewardType.ITEM;


        const taskData = AchievementModel.ins().getTaskByTaskId(taskId);
        if (!taskData) {
            G.Logger.error(`服务端丢给我的数据有问题. dailyTaskId = ${taskId}`)
            return
        }
        this._taskData = taskData;

        if (taskData.isFinish()) {
            // this.view.btnTask.offClick(this.onBtnTaskClick0, this)
            this.view.btnTask.clearClick()
            this.view.rewardItem.maskFg.visible = true
        } else {
            this.view.rewardItem.maskFg.visible = false
        }

        const config = G.TableManager.getDataById(table.achievement.AchievementTaskConfig, taskId);
        if (!config) {
            G.Logger.error(`[成就任务] 配置不存在. dailyTaskId = ${taskId}`)
            return
        }

        const rewardText = config.rewardText;
        const noOwnerItem = ItemUtils.parseStringToOnlyOneItem(rewardText);
        if (!noOwnerItem) {
            G.Logger.error(`[成就任务] 奖励配置有问题. taskId = ${taskId}`)
            return;
        }

        const itemConfig = ItemUtils.getItemConfigByItemId(noOwnerItem.itemId);
        if (!itemConfig) {
            G.Logger.error(`[成就任务] 奖励道具配置不存在. itemId = ${noOwnerItem.itemId}`)
            return;
        }

        // text
        this.view.labelTaskTarget.text = config.desc;
        // 小图标
        this.view.rewardItem.img_item.icon = itemConfig.smallIconPath;
        this.view.rewardItem.img_frame.icon = ItemUtils.getQualityIconResourcePath(itemConfig.quality);
        this.view.rewardItem.T_num.text = noOwnerItem.count?.toString() || "0"


        // 进度条
        this.setProgressBar(
            taskData.currentProgress,
            config.totalProgress
        );

        // 按钮
        this.setButtonByTaskState0(taskData);
    }

    /**
     * 每日任务
     * @param taskId
     */
    private handleDailyTask0(taskId: number) {
        this.view.getController("rewardType").selectedIndex = EnumTaskRewardType.SCORE;

        const taskData = DailyTaskModel.ins().getDailyTaskById(taskId);
        if (!taskData) {
            G.Logger.error(`服务端丢给我的数据有问题. dailyTaskId = ${taskId}`)
            return
        }
        this._taskData = taskData;

        if (taskData.isFinish()) {
            // this.view.btnTask.offClick(this.onBtnTaskClick0, this)
            this.view.btnTask.clearClick()
        }

        const dailyTaskConfig = G.TableManager.getDataById(table.dailytask.DailyTaskConfig, taskId);
        if (!dailyTaskConfig) {
            G.Logger.error(`每日任务配置不存在. dailyTaskId = ${taskId}`)
            return
        }

        // text
        this.view.labelTaskTarget.text = dailyTaskConfig.desc;
        this.view.labelTaskRewardText.text = TaskI18nKeys.DAILY_TASK_ACTIVE_SCORE
        this.view.labelScoreAdd.text = `+${dailyTaskConfig.score}`


        // 进度条
        this.setProgressBar(
            taskData.currentProgress,
            dailyTaskConfig.maxProgressValue
        );

        // 按钮
        this.setButtonByTaskState0(taskData);
    }

    /**
     * 设置进度条
     * @param currentProgress
     * @param maxProgressValue
     * @private
     */
    private setProgressBar(currentProgress: number, maxProgressValue: number) {
        // 进度条 + 文本
        if (currentProgress > 0) {
            this.view.progressBarTask.value = currentProgress / maxProgressValue * 100;

            this.view.labelProgressBarValue
                .setVar("currentCount", currentProgress.toString())
                .setVar("maxCount", maxProgressValue?.toString() || "0")

            this.view.labelProgressBarValue.flushVars()

        } else {
            this.view.progressBarTask.value = 0;
            this.view.labelProgressBarValue
                .setVar("currentCount", "0")
                .setVar("maxCount", maxProgressValue?.toString() || "0")
                .flushVars()
        }

    }

    /**
     * 设置按钮状态
     * @param taskData
     * @private
     */
    private setButtonByTaskState0(taskData: TaskData) {
        switch (taskData.state) {
            case ServerEnums.TaskState.IN_PROGRESS: {
                // 可完成
                this.view.btnTask.getController(this.FGUI_BUTTON_CTRL_NAME).selectedIndex = 0
                break;
            }
            case ServerEnums.TaskState.COMPLETED: {
                // 可完成
                this.view.btnTask.getController(this.FGUI_BUTTON_CTRL_NAME).selectedIndex = 1
                break;
            }
            case ServerEnums.TaskState.FINISHED: {
                // 已完成
                this.view.btnTask.getController(this.FGUI_BUTTON_CTRL_NAME).selectedIndex = 2

                // this.view.btnTask.offClick(this.onBtnTaskClick0, this)
                break;
            }
            default: {
                this.view.btnTask.getController(this.FGUI_BUTTON_CTRL_NAME).selectedIndex = 0
                break;
            }
        }
    }

    // red dot
    private refreshRedDot(taskType: TaskType, taskId: number) {

        const redDotCom = RedDotUtils.castComp(this.view.btnTask.btnComplete.redDot);


        switch (taskType) {
            case ServerEnums.TaskType.DAILY_TASK: {
                // redDotCom.reset(RedDotKeys.dailyTask_taskRow, [taskId]);
                redDotCom.showByType(EnumRedDotShowType.NULL);
                break;
            }
            case ServerEnums.TaskType.ACHIEVEMENT: {
                // redDotCom.reset(RedDotKeys.achievement_taskRow, [taskId]);
                redDotCom.showByType(EnumRedDotShowType.NULL);
                break;
            }
            default: {
                redDotCom.showByType(EnumRedDotShowType.NULL);
                break;
            }
        }
    }
}