import G from "../../../../core/comm/G";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 双周活动vo
 */
export class ActivityDoubleWeekVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.task.TaskInfoVo {
        return this.content as Vo.task.TaskInfoVo;
    }

    //当前活动配置
    private _cfg: table.activity.DoubleWeekly.DoubleWeeklyConfig;
    //所有任务配置
    private _cfgs: table.activity.Task.ActivityTaskConfig[];

    onInitDone(): void {
        this.isShowRed();
    }

    public get cfg() {
        if (!this._cfg) {
            this._cfg = TableManager.getDataById(table.activity.DoubleWeekly.DoubleWeeklyConfig, this.activityId);
        }
        return this._cfg;
    }
    /** 当前活动任务 */
    public get cfgs(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._cfgs) {
            let allCfgs = TableManager.getAllData(table.activity.Task.ActivityTaskConfig);
            this._cfgs = [];
            for (let cfg of allCfgs) {
                if (cfg.activityId == this.activityId) {
                    if (this.version == 0) {
                        this._cfgs.push(cfg);
                    } else if (cfg.version == this.version) {
                        this._cfgs.push(cfg);
                    }
                }
            }
        }

        this._cfgs.sort((a, b) => {
            if (this.isCompleteTask(a.id) != this.isCompleteTask(b.id)) {
                return this.isCompleteTask(a.id) ? -1 : 1;
            }

            if (this.isGetTaskReward(a.id) != this.isGetTaskReward(b.id)) {
                return this.isGetTaskReward(a.id) ? 1 : -1;
            }
            return a.id - b.id;
        });

        return this._cfgs;
    }

    /** 获取任务进度 */
    public getTaskProgress(taskId: number): number {
        for (let taskVo of this.activityVo.currentTasks) {
            if (taskVo.taskId == taskId) {
                return taskVo.progress;
            }
        }
        return 0;
    }

    /** 判断是否完成任务 */
    public isCompleteTask(taskId: number): boolean {
        if (this.activityVo.finishedTaskIds.indexOf(taskId) != -1) return false;

        for (let taskVo of this.activityVo.currentTasks) {
            if (taskVo.taskId == taskId) {
                return taskVo.state == 3;
            }
        }
        return false;
    }

    /** 判断是否已领取任务奖励 */
    public isGetTaskReward(taskId: number): boolean {
        return this.activityVo.finishedTaskIds.indexOf(taskId) != -1;
    }

    /** 添加已领取的任务id */
    public addGetTaskReward(taskId: number) {
        this.activityVo.finishedTaskIds.push(taskId);
    }

    /**当前需要推送的任务 */
    private _curPushTaskData: Vo.task.TaskVo;
    /** 更新任务 */
    public updateTaskData(data: Vo.task.TaskVo) {
        //TODO
        if (data) {
            for (let taskVo of this.activityVo.currentTasks) {
                if (taskVo.taskId == data.taskId) {
                    taskVo.state = data.state;
                    taskVo.progress = data.progress;
                }
            }
        }

        if (!this._curPushTaskData || data.taskId < this._curPushTaskData.taskId) {
            this._curPushTaskData = data;
        }

        // this.isShowRed();
        G.GameTimer.once(1000, this, () => {
            FacadeManager.ins().emit(NotificationKey.DOUBLE_WEEK_TASK_UPDATE, this._curPushTaskData);
            this._curPushTaskData = null;
        });
    }

    /**
     * 是否显示红点
     */
    public isShowRed(): boolean {
        let isShow = false;
        for (let cfg of this.cfgs) {
            if (!this.isGetTaskReward(cfg.id) && this.isCompleteTask(cfg.id)) {
                isShow = true;
            }
            GIns.redDotMgr.setRedDot(RedDotKeys.DoubleWeekActivity_task, !this.isGetTaskReward(cfg.id) && this.isCompleteTask(cfg.id), [cfg.id]);
        }

        return isShow;
    }

    /**
     * 活动是否结束
     */
    public isActivityOver(): boolean {
        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        const isDone = this.isDone();
        if (isDone) {
            return isDone;
        }
        return false;
    }
}
