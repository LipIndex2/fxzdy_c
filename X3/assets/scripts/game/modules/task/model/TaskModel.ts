import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { LeagueModel } from "../../league/LeagueModel";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { MiniMapManager } from "../../miniMap/MiniMapManager";
import G from "../../../../core/comm/G";
import { ActivitySevenDayTaskModelVo } from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import GIns from "../../../GIns";
import { ActivityReachStandardVo } from "../../activity/model/ActivityReachStandardVo";
import { ActivityController } from "../../activity/ActivityController";
import { ActivityFundVo } from "../../activity/model/ActivityFundVo";
import { ActivityDoubleWeekVo } from "../../activity/model/ActivityDoubleWeekVo";
import { SeasonManager } from "../../season/SeasonManager";
import { SeasonReachVo } from "../../season/vo/SeasonReachVo";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { SeasonBaseVo } from "../../season/vo/SeasonBaseVo";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 任务模块定义信息
 * @author GameCreator
 */
export class TaskModel extends BaseModel {
    private _taskTypeToIdMap: Map<string, Map<number, TaskData>> = new Map();

    // -----------------------------

    /**
     * 模块标识
     */
    private MODULE = 14;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recAddFakeTaskProgress);
        this.registerMsg(moduleId, 2, this.recTaskFight);
        this.registerMsg(moduleId, -1, this.pushTaskChange);
    }

    /*********************************协议发送*********************************/

    /**
     * 增加模拟任务进度
     * 模块号：14	指令号：1
     */
    public sendAddFakeTaskProgress(): void {
        let c2s = {} as Vo.task.AddFakeTaskProgressC2S;
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 任务战斗
     * 模块号：14	指令号：2
     */
    public sendTaskFight(): void {
        this.send(this.MODULE, 2);
    }

    /*********************************协议监听*********************************/

    /**
     * 增加模拟任务进度
     * 模块号：14	指令号：1
     */
    public recAddFakeTaskProgress(data: Vo.task.AddFakeTaskProgressS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 任务战斗
     * 模块号：14	指令号：2
     */
    public recTaskFight(): void {
        //TODO 在这里处理服务端返回的数据
    }

    /*********************************协议推送*********************************/

    /**
     * 任务改变信息，包括新任务、进度变更、状态变更
     * 模块号：14	指令号：-1
     */
    @LogBusiness("任务推送")
    public pushTaskChange(changedTasks: Vo.task.TaskVo[] | Vo.activity.ActivityTaskVo[] | Vo.seasonactivity.SeasonActivityTaskVo[]): void {
        if (!changedTasks) {
            return;
        }
        changedTasks.forEach((changedTask) => {
            switch (changedTask.taskVoType) {
                case ServerEnums.TaskVoType.NORMAL:
                    this.pushCommonTask(changedTask);
                    break;
                case ServerEnums.TaskVoType.ACTIVITY:
                    this.pushActivityTask((changedTask as Vo.activity.ActivityTaskVo).activityId, changedTask);
                    break;
                case ServerEnums.TaskVoType.SEASON_ACTIVITY:
                    this.pushSeasonTask((changedTask as Vo.seasonactivity.SeasonActivityTaskVo).subActivityId, changedTask);
                    break;
            }
        });
    }

    /**活动任务 */
    public pushActivityTask(activityId: number, changedTask: Vo.task.TaskVo) {
        let vo = GIns.activityModel.getActivityVoById(activityId) as BaseActivityVo;
        if (!vo) return;
        const type = changedTask.type;
        switch (type) {
            // case ServerEnums.TaskType.GROW_UP:
            // case ServerEnums.TaskType.FUND:
            // case ServerEnums.TaskType.CARNIVAL:
            // case ServerEnums.TaskType.BATTLE_PASS:
            // case ServerEnums.TaskType.REACH_STANDARD:
            // case ServerEnums.TaskType.DOUBLE_WEEKLY:
            default:
                vo.updateTaskData(changedTask);
                FacadeManager.ins().emit(NotificationKey.ACTIVITY_RED_DOT_CHANGE, vo.activityId);
                break;
        }
    }

    /**赛季任务 */
    public pushSeasonTask(subActivityId: number, changedTask: Vo.task.TaskVo) {
        let vo = SeasonManager.ins().getSubActityVo(subActivityId) as SeasonBaseVo;
        if (!vo) return;
        const type = changedTask.type;
        switch (type) {
            // case ServerEnums.TaskType.SEASON_REACH:
            default:
                vo.updateTaskData(changedTask);
                break;
        }
    }

    /**通用功能任务 */
    public pushCommonTask(changedTask: Vo.task.TaskVo) {
        const type = changedTask.type;
        switch (type) {
            case ServerEnums.TaskType.TRUNK_TASK: {
                // 主线任务
                TrunkTaskModel.ins().onServerPushTrunkTaskChange(changedTask);
                break;
            }
            case ServerEnums.TaskType.DAILY_TASK: {
                // 主线任务
                DailyTaskModel.ins().updateTaskState(changedTask);
                break;
            }
            case ServerEnums.TaskType.LEAGUE_CHALLENGE:
                LeagueModel.ins().updateTaskState(changedTask);
                break;
            case ServerEnums.TaskType.TRUNK_MAP_TASK:
                MiniMapManager.ins().updateMiniMapTask(changedTask);
                break;
            case ServerEnums.TaskType.LEAGUE_WEEKLY:
                LeagueModel.ins().updateLeagueWeeklyTask(changedTask);
                break;
            case ServerEnums.TaskType.COLLECTIBLES:
                GIns.collectionsModel.pushTaskChange(changedTask);
                break;
            case ServerEnums.TaskType.MAP_BUILDING:
                GIns.mapModel.pushBuildingTask(changedTask);
                break;
        }
    }

    // ----------------------------------------------------------------------------
    // region 我的方法

    initData(taskInitData: Vo.task.TaskInfoVo) {
        if (!taskInitData) {
            return;
        }
        // 后端说废弃
        // taskInitData.finishedTaskIds.forEach(taskId => {
        //     const taskData = TaskData.createFinishTask(taskId, ServerEnums.TaskType.);
        //     this.addTask(taskData);
        // });
    }

    getTaskById(taskId: number): TaskData {
        //TODO 在这里处理服务端返回的数据
        return null;
    }

    // endregion
    private addTask(taskData: TaskData) {}
}
