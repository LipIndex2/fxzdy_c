import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { SevenDayTaskRowComp } from "db://assets/scripts/game/modules/activity/sevenDay/components/SevenDayTaskRowComp";
import { SevenDayTaskDayBtn } from "db://assets/scripts/game/modules/activity/sevenDay/btn/SevenDayTaskDayBtn";
import { SevenDayProgressComp } from "db://assets/scripts/game/modules/activity/sevenDay/components/SevenDayProgressComp";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivitySevenDayTaskModelVo } from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { UiTweenMgr } from "db://assets/scripts/core/comm/UiTweenMgr";

@bindFguiExtension("ui://sevenDay/SevenDayTaskSubView")
export class SevenDayTaskSubView extends FGUI.GComponent implements INotification {
    // 进度配置
    private _progressConfigs: table.activity.Carnival.CarnivalRewardConfig[] = [];
    // 天数
    private _chooseDay = 1;
    // 任务u
    private _tasks: Array<TaskData> = [];
    private _isChooseLockDay: boolean = false;
    private _isFirstEnter: boolean = true;

    private _vo: ActivitySevenDayTaskModelVo = null;

    get view(): ui.sevenDay.subView.SevenDayTaskSubView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CLOSE_ViEW,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE,
            NotificationKey.SEVEN_DAY_TASK_UPDATE,
            NotificationKey.SEVEN_DAY_TASK_CHOOSE_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.SYSTEM_NEW_DAY:
            case NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE:
            case NotificationKey.SEVEN_DAY_TASK_UPDATE: {
                this.reset();
                break;
            }
            case NotificationKey.SEVEN_DAY_TASK_CHOOSE_DAY: {
                this.updateChooseDay(args as number);
                break;
            }
            case NotificationKey.ACTIVITY_END_REFRESH:
                let activityId = this._vo.activityId;
                if (args === activityId) {
                    UIManager.ins().close(UIActivityKey.SevenDayTaskPage);
                }
                break;
        }
    }

    private taskListEffectUuid: string;
    protected onConstruct() {
        FacadeManager.ins().registerNotification(this);

        this._vo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!this._vo || this._vo.isActivityOver()) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`);
            return;
        }
        this._chooseDay = this._vo.getMaxDay();

        this.view.progressList.itemRenderer = this.irBar.bind(this);

        this.view.taskDayList.setVirtual();
        this.view.taskDayList.itemRenderer = this.irDay.bind(this);

        this.view.taskList.setVirtual();
        // this.view.taskList.itemRenderer = this.irTask.bind(this);
        this.taskListEffectUuid = this.view.taskList.node.uuid
        this.view.taskList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect2(this.view.taskList.node.uuid, this.irTask, this);

        this.view.fgTaskMask.onClick(() => {
            FloatingTextManager.ins().showTips("达到指定天数后开启");
        }, this);

        this.view.btnRule.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.SEVEN_DAY_TASK, this.view.btnRule);
        }, this);

        GameTimer.ins().frameOnce(3, this, () => {
            this.reset();
        });
        GameTimer.ins().loop(1000, this, this.onUpdateTime);
    }

    private isFirst: boolean = true
    public onOpen(): void {
        if (!this.isFirst) {
            UiTweenMgr.ins().resetListItemRendererEffect(this.view.taskList)
            // this.view.taskList.scrollToView(0, false, true);
            this.view.taskList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect2(this.view.taskList.node.uuid, this.irTask, this, { beginIndex: this.view.taskList["_firstIndex"] });
            this.reset();
        }
        this.isFirst = false;
    }

    onUpdateTime() {
        if (!this._vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`);
            return;
        }

        const endTimeMs = this._vo.visibleEndTime;

        // 相差时间
        const diffTimeMs = Math.max(0, endTimeMs - TimeManager.serverNow);

        const timeText = TimeUtils.formatTimeMsToDayHourMinuteSecondText(diffTimeMs);
        this.view.labelRestTime.text = `${timeText}`;
    }

    protected onPreDispose() {
        UiTweenMgr.ins().removeListItemRendererEffect(this.taskListEffectUuid)
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    private reset() {
        const vo: ActivitySevenDayTaskModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`);
            return;
        }
        const activityId = vo.activityId;

        // progress
        this._progressConfigs = SevenDayConfigManager.getSevenDayProgressConfigArray(activityId);
        this.view.progressList.numItems = 0;
        this.view.progressList.numItems = this._progressConfigs.length;

        if (ArrayUtils.isEmpty(this._progressConfigs)) {
            Logger.error(`策划配错啦. 检查 CarnivalRewardConfig 活动id = ${activityId}`);
        }

        // day
        this.view.taskDayList.numItems = 7;
        this.view.taskDayList.refreshVirtualList();

        // task
        this._tasks = vo.getTaskSortArrayByDay(this._chooseDay);
        this.view.taskList.numItems = this._tasks.length;
        this.view.taskList.refreshVirtualList();

        // score
        const score = vo.getScore();
        this.view.labelProgress.text = `${score}`;

        // 是否下一天
        this.view.getController("isChooseNextDay").selectedIndex = this._isChooseLockDay ? 1 : 0;

        this.onUpdateTime();

        if (this._isFirstEnter) {
            this._isFirstEnter = false;
            const gainCount = vo.getHaveGainRewardIdCount();

            this.view.progressList.scrollToView(Math.max(0, gainCount), false, true);
        }
    }

    irBar(index: number, comp: SevenDayProgressComp) {
        const isLast = index + 1 == this._progressConfigs.length;
        const isFirst = index == 0;
        // comp.visible = !isLast;

        comp.reset(this._progressConfigs[index], isFirst, isLast);
    }

    irDay(index: number, comp: SevenDayTaskDayBtn) {
        const day = index + 1;

        comp.reset(day, this._chooseDay);
    }

    irTask(index: number, comp: SevenDayTaskRowComp) {
        comp.reset(this._tasks[index], this);
    }

    private updateChooseDay(day: number) {
        const vo: ActivitySevenDayTaskModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`);
            return;
        }
        const maxDay = vo.getMaxDay();

        this._isChooseLockDay = maxDay < day;
        this._chooseDay = day;

        this.reset();

        UiTweenMgr.ins().removeListItemRendererEffect(this.taskListEffectUuid)
        // first
        this.view.taskList.scrollToView(0, false, true);
    }
}
