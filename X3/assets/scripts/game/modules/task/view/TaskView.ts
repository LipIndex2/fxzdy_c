import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { EventTouch } from "cc"
import { TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import { TaskTabButton } from "db://assets/scripts/game/modules/task/component/TaskTabButton";
import { DailyTaskPartComponent } from "db://assets/scripts/game/modules/task/view/dailyTask/DailyTaskPartComponent";
import {
    AchievementPartComponent
} from "db://assets/scripts/game/modules/task/view/achievement/AchievementPartComponent";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";


const {GObject} = fgui;

export enum EnumTaskViewTabIndex {
    // 任务
    TASK = 0,
    // 成就
    ACHIEVEMENT = 1
}

/**
 * 任务主界面
 */
@bindScript(UITaskKeys.TaskView)
export class TaskView extends UICommWin {

    // GM tab 类型 | 对应 GMView 的 FGUI Controller "innerView" index
    private readonly _tabArray = new Array<string>(
        "任务",
        "成就",
    );

    // region FGUI
    static pkgName: string = "task";

    static viewName: string = "TaskView";

    // endregion

    private get view(): ui.task.TaskView {
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
        G.Logger.debug(" onInit ");

        // 触摸外部
        // this.view.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        // TODO 临时处理 | 成就暂不投放, 故隐藏
        this.view.tempTaskTab.redDot.visible = false;

        this.view.tabList.setVirtual();
        this.view.tabList.itemRenderer = this.itemRendererForTabList.bind(this);

        // @ts-ignore
        const taskPartComp = this.view.taskPartComp as DailyTaskPartComponent;
        // @ts-ignore
        const achievementPartComp = this.view.achievementPartComp as AchievementPartComponent;
        achievementPartComp.bindParent(this)
    }

    private onTouchEnd(event: EventTouch) {
        G.Logger.debug(event, " onTouchEnd ")

        // 点击空白处关闭
        if (TouchUtils.isTouchInUi(event, this.view.bg._uiTrans)) {
            return
        }
        this.closeSelf()
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")


        // FGUIMaskUtils.createBackgroundMask(this.view)


    }

    public onClose(): void {
        G.Logger.debug(" onClose ")

    }


    private itemRendererForTabList(index: number, view: TaskTabButton) {
        const name = this._tabArray[index];
        if (!name) {
            return
        }

        let chooseFlag = false;
        const tabIndex = this.view.getController("tab").selectedIndex;
        if (tabIndex == index) {
            chooseFlag = true;
            this.view.labelTitle.text = name;
        }
        view.reset(index, name, chooseFlag)
    }


}