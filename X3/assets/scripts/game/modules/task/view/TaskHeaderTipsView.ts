import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { EventTaskProgressChange } from "db://assets/scripts/game/modules/task/event/EventTaskProgressChange";
import { ActivityConfigManager } from "db://assets/scripts/game/comm/activity/config/ActivityConfigManager";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { EnumUIViewLayer } from "db://assets/scripts/core/comm/LayerManager";


/**
 * 任务
 */
@bindScript(UITaskKeys.TaskHeaderTipsView)
export class TaskHeaderTipsView extends UIView {

    static pkgName: string = "task";
    static viewName: string = "TaskHeaderTipsView";
    static _layer = EnumUIViewLayer.TIPS;


    private get view(): ui.task.TaskHeaderTipsView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }
    }

    public onInit(): void {
        Logger.debug(" onInit ");

    }

    onOpen(event: EventTaskProgressChange) {
        const activityTaskConfig = event.getActivityTaskConfig();
        if (!activityTaskConfig) {
            Logger.error("没找到活动任务配置");
            this.closeSelf();
            return;
        }
        const activityId = activityTaskConfig.activityId;
        const activityConfig = ActivityConfigManager.getConfigById(activityId);
        if (!activityConfig) {

            Logger.error(`没找到活动任务配置. activityId = ${activityId}`);
            this.closeSelf();
            return;
        }
        this.view.T_title.text = activityConfig.name;
        this.view.T_desc.text = activityTaskConfig.desc;
        const value = event.newProgress;
        const max = activityTaskConfig.maxProgress;
        this.view.bar.value = Math.min(max, value);
        this.view.bar.max = max;

        const isMax = value >= max;
        this.view.getController("isDone").selectedIndex = isMax ? 1 : 0;


        this.view.getTransition("anim").play(() => {
            this.closeSelf();
        });


    }


}