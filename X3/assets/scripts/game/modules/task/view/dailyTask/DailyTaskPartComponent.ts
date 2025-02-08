import * as fgui from "fairygui-cc";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import { TaskOneRowComponent } from "db://assets/scripts/game/modules/task/component/TaskOneRowComponent";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import {
    EnumDailyTaskActiveBoxType,
    TaskRewardWithScoreComponent
} from "db://assets/scripts/game/modules/task/component/TaskRewardWithScoreComponent";
import { CommonConfigValueKeys } from "db://assets/scripts/game/modules/common/const/CommonConfigValueKeys";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { DiffTime } from "../../../../comm/utils/DiffTime";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TaskI18nKeys } from "db://assets/scripts/game/modules/task/const/TaskI18nKeys";
import { clamp, Vec3 } from "cc";
import { UiTweenMgr } from "../../../../../core/comm/UiTweenMgr";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrame } from "db://assets/scripts/game/modules/common/item/ItemFrame";


/**
 * 每日任务
 */
export class DailyTaskPartComponent extends fgui.GComponent implements INotification {


    private readonly barNotFullOffsetWidth: number = 30;
    // 首次渲染 ?
    private _firstRenderFlag: boolean = true;
    // 排序后的任务id
    private _sortedDailyTaskIdArray: number[] = []


    private get view(): ui.task.dailyTask.DailyTaskPartComponent {
        return this as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_DAILY_TASK_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_DAILY_TASK_CHANGE: {
                this.reset();
                break;
            }
        }
    }

    protected onEnable(): void {
        super.onEnable()
        UiTweenMgr.ins().listShowEffect(this.view.taskList, this.view.bgTask)
    }

    protected onDisable(): void {
        super.onDisable()
        UiTweenMgr.ins().removeTweenEffect(this.view.taskList, this.view.bgTask)
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this)
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    public onInit() {
        FacadeManager.ins().registerNotification(this)

        // 文本
        this.view.labelDailyTaskTitle.text = TaskI18nKeys.DAILY_TASK_PANEL_TITLE
        this.view.dailyComp.labelTitle.text = TaskI18nKeys.DAILY_SCORE
        this.view.weekComp.labelTitle.text = TaskI18nKeys.WEEK_SCORE

        this.view.taskList.setVirtual();
        this.view.taskList.itemRenderer = this.itemRendererForTaskList.bind(this);


        this.reset();

        GameTimer.ins().frameLoop(60, this, this.updateTaskTime0)
    }

    reset() {
        this.updateTaskTime0();

        const dailyActiveBoxConfigArray: table.dailytask.DailyActiveBoxConfig[] = TableManager.getAllData(table.dailytask.DailyActiveBoxConfig);
        const maxDailyScore = dailyActiveBoxConfigArray.toDataStream()
            .map(config => config.needDailyScore)
            .maxByWeightNumber(score => score);
        const weekScoreBoxConfigArray = TableManager.getAllData(table.dailytask.WeeklyActiveBoxConfig);
        const maxWeekScore = weekScoreBoxConfigArray.toDataStream()
            .map(config => config.needWeekScore)
            .maxByWeightNumber(score => score);

        const dailyScore: number = DailyTaskModel.ins().getDailyScore()
        const weekScore: number = DailyTaskModel.ins().getWeekScore()

        // region 进度条
        let reachDailyMax: boolean = false
        let reachWeeklyMax: boolean = false

        // 进度条: 日活跃积分
        let dailyProgressValue: number = 0;
        let weeklyProgressValue: number = 0;
        if (dailyScore > 0) {
            if (dailyScore >= maxDailyScore) {
                dailyProgressValue = 100
                reachDailyMax = true;
            } else {
                dailyProgressValue = Math.min(dailyScore / maxDailyScore * 100, 100)
            }
        } else {
            dailyProgressValue = 0
        }

        // 进度条: 周活跃积分
        if (weekScore > 0) {
            if (weekScore >= maxWeekScore) {
                weeklyProgressValue = 100
                reachWeeklyMax = true;
            } else {
                weeklyProgressValue = Math.min(weekScore / maxWeekScore * 100, 100)
            }
        } else {
            weeklyProgressValue = 0
        }
        // set 进度条的值 for 日活
        if (reachDailyMax) {
            this.view.dailyComp.progressBarForScore.value = dailyProgressValue
        } else {
            const oldWidth = this.view.dailyComp.progressBarForScore.width;
            const rate = (oldWidth - this.barNotFullOffsetWidth) / oldWidth
            this.view.dailyComp.progressBarForScore.value = dailyProgressValue * rate
        }
        // set 进度条的值 for 周活
        if (reachWeeklyMax) {
            this.view.weekComp.progressBarForScore.value = weeklyProgressValue
        } else {
            const oldWidth = this.view.weekComp.progressBarForScore.width;
            const rate = (oldWidth - this.barNotFullOffsetWidth) / oldWidth
            this.view.weekComp.progressBarForScore.value = weeklyProgressValue * rate
        }


        // endregion

        // [箱子] 每日活跃度
        const _dailyScoreBoxMap: Map<number, ui.task.dailyTask.TaskRewardWithScoreComponent> = new Map([
            [0, this.view.dailyComp.scorePercent20],
            [1, this.view.dailyComp.scorePercent40],
            [2, this.view.dailyComp.scorePercent60],
            [3, this.view.dailyComp.scorePercent80],
            [4, this.view.dailyComp.scorePercent100],
        ]);
        _dailyScoreBoxMap.forEach((uiComp, index) => {
            this.handleDailyScoreBox0(dailyActiveBoxConfigArray, uiComp, index, maxDailyScore, reachDailyMax);
        })

        // [箱子] 每周活跃度
        const _weekScoreBoxMap: Map<number, ui.task.dailyTask.TaskRewardWithScoreComponent> = new Map([
            [0, this.view.weekComp.scorePercent20],
            [1, this.view.weekComp.scorePercent40],
            [2, this.view.weekComp.scorePercent60],
            [3, this.view.weekComp.scorePercent80],
            [4, this.view.weekComp.scorePercent100],
        ]);
        _weekScoreBoxMap.forEach((uiComp, index) => {
            this.handleWeekScoreBox0(weekScoreBoxConfigArray, uiComp, index, maxWeekScore, reachWeeklyMax);
        })


        // all 积分
        this.view.dailyComp.labelScore.text = DailyTaskModel.ins().getDailyScore().toString()
        this.view.weekComp.labelScore.text = DailyTaskModel.ins().getWeekScore().toString()

        // 渲染任务
        const sortedDailyTaskIdArray = DailyTaskModel.ins().getSortedDailyTaskIdArray();
        this._sortedDailyTaskIdArray = sortedDailyTaskIdArray
        // 渲染
        if (this._firstRenderFlag) {
            // 首次渲染
            this.view.taskList.numItems = sortedDailyTaskIdArray.length;
            this._firstRenderFlag = false
        } else {
            // 更新渲染
            this.view.taskList.numItems = 0;
            setTimeout(() => {
                this.view.taskList.numItems = sortedDailyTaskIdArray.length;
            }, 200)
        }

    }


    private updateTaskTime0() {
        const resetHourConfig = TableManager.getDataById(table.common.ConfigValue, CommonConfigValueKeys.SYSTEM_START_HOUR_OF_DAY);
        if (!resetHourConfig) {
            return
        }

        const resetHour: number = resetHourConfig.content.toInt();

        // 下一个 0 点重置时间
        const nextResetTime = DateUtils.getNextResetTimeByResetHour(TimeManager.serverNow, resetHour)

        // text 还有多久重置
        const diffTime = DiffTime.createByAtTimeMs(nextResetTime);
        this.view.labelTimeReset.text = diffTime.toTaskExpireTimeDescText()

    }

    /**
     * 每日积分
     * @param dailyActiveBoxConfigArray
     * @param uiComp
     * @param index
     * @param maxScore
     * @param reachMaxFlag
     * @private
     */
    private handleDailyScoreBox0(dailyActiveBoxConfigArray: table.dailytask.DailyActiveBoxConfig[],
        uiComp: ui.task.dailyTask.TaskRewardWithScoreComponent,
        index: number,
        maxScore: number,
        reachMaxFlag: boolean
    ) {

        const parentUI = this.view.dailyComp.progressBarForScore._uiTrans;
        let itemPosMaxWidth = this.view.dailyComp.progressBarForScore.fakeScoreBar.width;
        const parentPos = parentUI.node.position;

        // 日活跃 奖励
        const config0 = dailyActiveBoxConfigArray[index];
        if (!config0) {
            return
        }

        const noOwnerItem = ItemUtils.parseStringToOnlyOneItem(config0.rewardText);
        if (noOwnerItem) {
            const itemFrame = FguiScriptUtils.toMyScriptClass(uiComp.itemPart, ItemFrame);
            itemFrame.resetByNoOwnerItem(noOwnerItem);



        }
        // 积分
        const needScore = config0.needDailyScore;
        uiComp.scoreComp.labelScore.text = needScore.toString();

        // 设置百分比位置
        this.resetScoreItemPercentPos(uiComp, parentPos, needScore, maxScore, itemPosMaxWidth);

        const boxId = config0.id;


        const componentScript = FguiScriptUtils.toMyScriptClass(uiComp, TaskRewardWithScoreComponent);
        // 重置UI
        componentScript.reset(EnumDailyTaskActiveBoxType.DAILY, boxId, needScore)
    }


    private resetScoreItemPercentPos(
        uiComp: ui.task.dailyTask.TaskRewardWithScoreComponent,
        parentPos: Readonly<Vec3>,
        needScore: number,
        maxScore: number,
        width: number,
    ) {
        // reset ui position
        if (needScore > 0) {
            const oldPos = uiComp.node.position;
            const percent = needScore / maxScore;

            // let offsetPercent = clamp(percent , 0, 1) ;
            let offsetPercent = clamp(percent, 0, 1);
            uiComp.node.setPosition(parentPos.x + width * offsetPercent - uiComp.width / 2, oldPos.y);
        }
    }

    /**
     * 每周积分箱子
     * @param weekScoreBoxConfigArray 配置数组
     * @param uiComp 组件
     * @param index 索引
     * @param maxScore
     * @param reachMaxFlag
     * @private
     */
    private handleWeekScoreBox0(weekScoreBoxConfigArray: table.dailytask.WeeklyActiveBoxConfig[],
        uiComp: ui.task.dailyTask.TaskRewardWithScoreComponent,
        index: number,
        maxScore: number,
        reachMaxFlag: boolean
    ) {
        const parentUI = this.view.dailyComp.progressBarForScore._uiTrans;
        let itemPosMaxWidth = this.view.dailyComp.progressBarForScore.fakeScoreBar.width;
        const parentPos = parentUI.node.position;

        // 日活跃 奖励
        const config0 = weekScoreBoxConfigArray[index];
        if (!config0) {
            return
        }
        const noOwnerItem = ItemUtils.parseStringToOnlyOneItem(config0.rewardText);
        if (noOwnerItem) {
            const itemConfig = ItemUtils.getItemConfigByItemId(noOwnerItem.itemId);
            if (itemConfig) {
                // 图标
                uiComp.itemPart.img_item.icon = itemConfig.iconPath;
                uiComp.itemPart.img_frame.icon = ItemUtils.getQualityIconResourcePath(itemConfig.quality);
            }

            // 数量
            uiComp.itemPart.T_num.text = noOwnerItem.count.toString();

        }
        // 积分
        const needScore = config0.needWeekScore;
        uiComp.scoreComp.labelScore.text = needScore.toString();

        // 重置积分
        this.resetScoreItemPercentPos(uiComp, parentPos, needScore, maxScore, itemPosMaxWidth);

        const boxId = config0.id;

        // @ts-ignore
        const componentScript = uiComp as TaskRewardWithScoreComponent;
        componentScript.reset(EnumDailyTaskActiveBoxType.WEEKLY, boxId, needScore)
    }


    /**
     * 物品类型
     * @private
     */
    private itemRendererForTaskList(index: number, view: TaskOneRowComponent) {

        const dailyTaskId = this._sortedDailyTaskIdArray[index];
        if (!dailyTaskId) {
            return
        }
        view.reset(ServerEnums.TaskType.DAILY_TASK, dailyTaskId)
    }
}