import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";
import { TaskOneRowComponent } from "db://assets/scripts/game/modules/task/component/TaskOneRowComponent";
import { TaskRewardWithScoreComponent } from './component/TaskRewardWithScoreComponent';
import { TaskTabButton } from "db://assets/scripts/game/modules/task/component/TaskTabButton";
import { DailyTaskPartComponent } from "db://assets/scripts/game/modules/task/view/dailyTask/DailyTaskPartComponent";
import {
    AchievementPartComponent
} from "db://assets/scripts/game/modules/task/view/achievement/AchievementPartComponent";
import { EventTaskProgressChange } from "db://assets/scripts/game/modules/task/event/EventTaskProgressChange";
import { ActivityTaskConfigManager } from "db://assets/scripts/game/modules/activity/task/ActivityTaskConfigManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { DrawCardUIKeys } from '../drawcard/DrawCardUIKeys';

const { ccclass, property } = _decorator;

/**
 * 邮件控制器
 */
export class TaskController extends BaseController {

    private _sid: any;
    private _eventForOpenUI: EventTaskProgressChange;

    listenNotifications(): string[] {
        return [
            NotificationKey.TASK_PROGRESS_CHANGE,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.TASK_PROGRESS_CHANGE: {
                this.onTaskProgressChange(args);
                break;
            }
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://task/TaskOneRowComponent", TaskOneRowComponent)
        G.FGUIManager.bindScript("ui://task/TaskRewardWithScoreComponent", TaskRewardWithScoreComponent)
        G.FGUIManager.bindScript("ui://task/TaskTabButton", TaskTabButton)
        G.FGUIManager.bindScript("ui://task/DailyTaskPartComponent", DailyTaskPartComponent)
        G.FGUIManager.bindScript("ui://task/AchievementPartComponent", AchievementPartComponent)

    }

    private onTaskProgressChange(event: EventTaskProgressChange) {
        const configById = ActivityTaskConfigManager.getConfigById(event.taskId);
        if (configById) {
            if (!configById.isNeedTipsUI) {
                return;
            }

            if (event.maxProgress <= 0) {
                return;
            }
            if (this._eventForOpenUI) {
                if (event.maxProgress < this._eventForOpenUI.maxProgress) {
                    this._eventForOpenUI = event;
                }
            } else {
                this._eventForOpenUI = event;
            }

            let delayTime: number = 1000;
            if (UIManager.ins().isOpened(DrawCardUIKeys.DrawCardNormalView)) {
                //招募界面的话，延迟2秒
                delayTime = 2000;
            }

            if (UIManager.ins().isOpened(DrawCardUIKeys.DrawCardResultView)) {
                //招募界面上有抽奖结果界面变回1秒
                delayTime = 1000;
            }

            clearTimeout(this._sid);
            this._sid = setTimeout(() => {
                const event = this._eventForOpenUI;
                if (!event) {
                    return;
                }
                UIManager.ins().open(UITaskKeys.TaskHeaderTipsView, event);
                this._eventForOpenUI = null;
            }, delayTime);
        }
    }
}

TaskController.ins().doInit();


