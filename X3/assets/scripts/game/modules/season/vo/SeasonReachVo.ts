import G from "../../../../core/comm/G";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ActivityState, PassType, SeasonReachScoreType, TaskState } from "../EnumSeason";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonBaseVo } from "./SeasonBaseVo";

/**
 * 积分冲榜
 */
export class SeasonReachVo extends SeasonBaseVo {
    /** 根据类型获取任务列表 */
    private _taskCfgs: Map<number, table.seasonactivity.Task.SeasonActivityTaskConfig[]> ;

    /**活动对应的vo数据  */
    public get activityVo(): Vo.seasonactivity.SeasonReachVo {
        return this.content as Vo.seasonactivity.SeasonReachVo;
    }

    public onInitDone() {
        this.isShowRed();
        this.initTaskCfgs();
    }

    /**获取对应任务的状态 */
    public getTaskState(id: number) {
        const t = this;
        const tvos = t.activityVo?.taskInfoVo;
        if (tvos) {
            const finishedTaskIds = tvos.finishedTaskIds || [];
            if (finishedTaskIds.indexOf(id) != -1) {
                return TaskState.FINISH;
            }
            const taskInfos = tvos.currentTasks;
            const cvo = taskInfos.find(v => {
                return v.taskId == id;
            })
            if (cvo?.state == TaskState.CAN_GET) {
                return TaskState.CAN_GET;
            }
            return TaskState.ING;
        }
    }

    public finishTaskId(id: number): void {
        const t = this;
        const tvos = t.activityVo?.taskInfoVo;
        if (tvos.finishedTaskIds && tvos.finishedTaskIds.indexOf(id) == -1) {
            tvos.finishedTaskIds.push(id);
        }
    }

    /**一次过完成多个 */
    public finishTaskIds(ids:number[]=[]):void{
        const t = this;
        const finishedTaskIds = t.activityVo?.taskInfoVo?.finishedTaskIds;
        if(finishedTaskIds){
            ids.forEach(id=>{
                const taskVo = t.getTaskVo(id);
                taskVo.state =  TaskState.FINISH;
                if (finishedTaskIds.indexOf(id) == -1) {
                    finishedTaskIds.push(id);
                }
            })
        }
    }

    public updateTaskData(vo: Vo.task.TaskVo) {
        const id = vo.taskId;
        const taskVo = this.getTaskVo(id);
        if (taskVo) {
            taskVo.progress = vo.progress != undefined ? vo.progress : taskVo.progress;
            taskVo.state = vo.state != undefined ? vo.state : taskVo.state;
        }

        G.GameTimer.callLater(this, this.updateLater);
    }

    public updateLater() {
        FacadeManager.ins().emit(NotificationKey.SEASON_TASK_UPDATE);
        this.isShowRed();
    }

    public isShowRed() {
        const allTypes = [];
        const setTypes = [];
        const allTasks = SeasonConfigManager.getTasks(this.activityId);
        allTasks.forEach(cfg => {
            const type = cfg.taskType;
            if (allTypes.indexOf(type) == -1) {
                allTypes.push(type);
            }
            const state = this.getTaskState(cfg.id);
            const selTime = this.getSettleTime();
            if (state == TaskState.CAN_GET && this.state == ActivityState.ING && selTime > 0) {
                GIns.redDotMgr.setRedDot(RedDotKeys.Season_entrance_Rewards, true, [this.activityId, type]);
                if (setTypes.indexOf(type) == -1) {
                    setTypes.push(type);
                }
            }
        })
        for (let i = allTypes.length - 1; i >= 0; i--) {
            const type = allTypes[i];
            if (setTypes.indexOf(type) == -1) {
                //还没设置
                GIns.redDotMgr.setRedDot(RedDotKeys.Season_entrance_Rewards, false, [this.activityId, type]);
            }
        }
        return true
    }

    public get taskVos(): Vo.task.TaskVo[] {
        return this.activityVo?.taskInfoVo?.currentTasks || [];
    }

    /** 获取对应任务的vo */
    public getTaskVo(taskId: number): Vo.task.TaskVo {
        for (let taskVo of this.taskVos) {
            if (taskVo.taskId == taskId) {
                return taskVo;
            }
        }
        return null;
    }

    public initTaskCfgs(){
        const t = this;
        t.getTaskCfgs(SeasonReachScoreType.HERO_UP_STAR);
        t.getTaskCfgs(SeasonReachScoreType.ARENA);
    }


    public getTaskCfgs(taskType: number): table.seasonactivity.Task.SeasonActivityTaskConfig[] {
        const t = this;
        const typeStr = SeasonReachScoreType[taskType]
        if(!this._taskCfgs){
            this._taskCfgs = new Map();
        }
        let tasks = this._taskCfgs.get(taskType);
        if (!tasks) {
            tasks = []
            const allTasks = SeasonConfigManager.getTasks(t.activityId);
            allTasks.forEach(cfg => {
                if (typeStr == cfg.taskType) {
                    tasks.push(cfg);
                }
            })
            t._taskCfgs.set(taskType, tasks);
        }
        return tasks
    }

}