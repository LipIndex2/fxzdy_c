import {BaseModel} from "db://assets/scripts/core/mvc/model/BaseModel";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    AchievementTaskContext
} from "db://assets/scripts/game/modules/task/context/AchievementTaskContext";
import {TaskData} from "db://assets/scripts/game/modules/task/structs/TaskData";
import {
    EventDailyTaskAddScoreArgs,
    EventTaskAddProgressArgs
} from "db://assets/scripts/game/modules/task/structs/EventTaskArgs";
import {ServerEnums} from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 成就模块协议
 * @author GameCreator
 */
export class AchievementModel extends BaseModel {

    // 成就状态
    private _context: AchievementTaskContext;


    // ------------------------------------------------------
    /**
     * 模块标识
     */
    private MODULE = 25;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TASK_ADD_PROGRESS,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.EVENT_TASK_ADD_PROGRESS:
                this.addProgressTry(args as EventTaskAddProgressArgs);
                break;
            default:
                break;
        }
    }

    
    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        this.addNotification();
        
        // 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recDrawAchievementReward);
        this.registerMsg(moduleId, 2, this.recDrawMultipleAchievementReward);

    }

    /*********************************协议发送*********************************/

    /**
     * 领取成就奖励
     * 模块号：25	指令号：1
     */
    public sendDrawAchievementReward(c2s: Vo.achievement.DrawAchievementRewardC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 领取成就奖励
     * 模块号：25	指令号：2
     */
    public sendDrawMultipleAchievementReward(c2s: Vo.achievement.DrawMultipleAchievementRewardC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 领取成就奖励
     * 模块号：25	指令号：1
     */
    public recDrawAchievementReward(data: Vo.achievement.DrawAchievementRewardS2C): void {
        if (data.code < 0) {
            G.Logger.debug(data, "领取成就奖励失败")
            return
        }

        const result = data.content;
        if (!result) {
            G.Logger.debug("领取成就奖励失败，原因：奖励列表为空")
            return
        }

        let rewardArray = result.rewardsResult;
        this._context.markTaskFinish(result.taskId)

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardArray);

        G.FacadeManager.emit(NotificationKey.EVENT_ACHIEVEMENT_CHANGE);
    }

    /**
     * 领取成就奖励
     * 模块号：25	指令号：2
     */
    public recDrawMultipleAchievementReward(data: Vo.achievement.DrawMultipleAchievementRewardS2C): void {
        if (data.code < 0) {
            G.Logger.debug(data, "领取成就奖励失败")
            return
        }

        const result = data.content;
        if (!result) {
            G.Logger.debug("领取成就奖励失败，原因：奖励列表为空")
            return
        }

        let rewardArray = new Array<Vo.reward.RewardResult>();
        for (let taskRewardVo of result) {
            const taskId = taskRewardVo.taskId;
            const rewards = taskRewardVo.rewardsResult;

            rewardArray = rewardArray.concat(rewards)

            // 记录成就任务 id
            this._context.markTaskFinish(taskId)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardArray);

        G.FacadeManager.emit(NotificationKey.EVENT_ACHIEVEMENT_CHANGE);
    }

    /*********************************协议推送*********************************/


    // region 我的方法

    initData(initVo: Vo.achievement.AchievementLoginVo) {
        this._context = AchievementTaskContext.from(initVo)
    }

    /**
     * 获取排序后的任务 id
     */
    getViewTaskIdArray(): number[] {
        return this._context.getViewTaskIdArray()
        
    }

    getTaskByTaskId(taskId: number): TaskData | null {
        return this._context.getTaskByTaskId(taskId)
    }

    /**
     * 获取正在进行的任务 id
     */
    getDoingTaskIdArray(): number[] {
        return this._context.getDoingTaskIdArray()
    }

    // 获取可以完成的任务id 
    getCanCompleteTaskIdArray(): number[] {
        return this._context.getCanCompleteTaskIdArray()
    }


    /**
     * 添加进度
     * @param arg0
     */
    addProgressTry(arg0: EventTaskAddProgressArgs) {
        if (!arg0) {
            return
        }
        if (arg0.taskType !== ServerEnums.TaskType.ACHIEVEMENT) {
            return
        }
        const taskId = arg0.taskId;
        const addProgress = arg0.addProgress;

        const isOk = this._context.addTaskProgress(taskId, addProgress);
        if (isOk) {
            G.Logger.debug(`[成就任务] 进度增加成功. taskId = ${taskId}, addProgress = ${addProgress}`)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_ACHIEVEMENT_CHANGE);
    }
    
    // endregion
}
