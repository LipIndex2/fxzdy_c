import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { EnumTaskViewTabIndex, TaskView } from "db://assets/scripts/game/modules/task/view/TaskView";
import {
    TaskOneRowComponent
} from "db://assets/scripts/game/modules/task/component/TaskOneRowComponent";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { AchievementModel } from "db://assets/scripts/game/modules/task/model/AchievementModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { UiTweenMgr } from "../../../../../core/comm/UiTweenMgr";
import { Tween } from "cc";


/**
 * 每日任务
 */
export class AchievementPartComponent extends fgui.GComponent implements INotification {


    // 父页面
    private _parentView: TaskView = null!;
    // 首次渲染 ?
    private _firstRenderFlag: boolean = true;
    // 排序后的任务id
    private _sortTaskIdArray: number[] = []

    // region 静态属性 for FGUI
    static pkgName: string = "task";

    static viewName: string = "AchievementPartComponent";


    // endregion


    // FGUI 任务按钮的 controller 


    private get view(): ui.task.achievement.AchievementPartComponent {
        return this as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_ACHIEVEMENT_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_ACHIEVEMENT_CHANGE: {
                this.reset();
                break;
            }
        }
    }

    constructor () {
        super();
    }

    protected onEnable(): void {
        super.onEnable()
        UiTweenMgr.ins().listShowEffect(this.view.taskList, this.view.bg)
    }

    protected onDisable(): void {
        super.onDisable()
        UiTweenMgr.ins().removeTweenEffect(this.view.taskList, this.view.bg)
    }

    bindParent(parentView: TaskView) {
        this._parentView = parentView

        this.reset()
    }

    // onConstruct() {
    //     this.onInit()
    // }


    protected onPreDispose() {
        G.FacadeManager.removeNotification(this)
        super.onPreDispose();
    }

    public onInit() {
        G.FacadeManager.registerNotification(this)

        this.view.taskList.setVirtual();
        this.view.taskList.itemRenderer = this.itemRendererForTaskList.bind(this);

    }

    reset() {
        // TODO 
        this._sortTaskIdArray = AchievementModel.ins().getViewTaskIdArray()

        this.view.taskList.numItems = this._sortTaskIdArray.length;
        this.view.taskList.refreshVirtualList();


    }


    /**
     * 物品类型
     * @private
     */
    private itemRendererForTaskList(index: number, view: TaskOneRowComponent) {
        const taskId = this._sortTaskIdArray[index];
        if (!taskId) {
            return
        }
        view.reset(ServerEnums.TaskType.ACHIEVEMENT, taskId)
    }
}