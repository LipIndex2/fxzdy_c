import {BaseModel} from "db://assets/scripts/core/mvc/model/BaseModel";
import {DailyTaskContext} from "db://assets/scripts/game/modules/task/context/DailyTaskContext";
import {TaskData} from "db://assets/scripts/game/modules/task/structs/TaskData";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    EventDailyTaskAddScoreArgs,
    EventTaskAddProgressArgs
} from "db://assets/scripts/game/modules/task/structs/EventTaskArgs";
import {ServerEnums} from "db://assets/scripts/libs/extras/ServerEnums";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";

/**
 * 日常任务模块协议
 * @author GameCreator
 */
export class DailyTaskModel extends BaseModel {

    
    // 状态数据
    private _context!: DailyTaskContext;


    /**
     * 模块标识
     */
    private MODULE = 24;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_DAILY_TASK_ADD_SCORE,
            NotificationKey.EVENT_TASK_ADD_PROGRESS,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.EVENT_DAILY_TASK_ADD_SCORE:
                this.addScore(args as EventDailyTaskAddScoreArgs);
                break;
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
        // 注册所有的指令
        let moduleId = this.MODULE;

        this.registerMsg(moduleId, 1, this.recDrawTaskReward);
        this.registerMsg(moduleId, 2, this.recDrawDailyActiveBox);
        this.registerMsg(moduleId, 3, this.recDrawWeeklyActiveBox);
        this.registerMsg(moduleId, -1, this.pushDailyTaskReset);

        this.addNotification()
    }

    /*********************************协议发送*********************************/

    /**
     * 领取任务奖励
     * 模块号：24	指令号：1
     */
    public sendDrawTaskReward(c2s: Vo.dailytask.DrawTaskRewardC2S): void {
        G.Logger.debug(c2s, "领取每日任务奖励")
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 领取日活跃宝箱奖励
     * 模块号：24	指令号：2
     */
    public sendDrawDailyActiveBox(c2s: Vo.dailytask.DrawDailyActiveBoxC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 领取周活跃宝箱奖励
     * 模块号：24	指令号：3
     */
    public sendDrawWeeklyActiveBox(c2s: Vo.dailytask.DrawWeeklyActiveBoxC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 领取任务奖励
     * 模块号：24	指令号：1
     */
    public recDrawTaskReward(data: Vo.dailytask.DrawTaskRewardS2C,
                             c2s: Vo.dailytask.DrawTaskRewardC2S
    ): void {
        if (data.code < 0) {
            G.Logger.error(`领取每日任务奖励 error. taskIds = ${JSON.stringify(c2s)}`, data)
            return
        }

        // 添加的积分
        const addScore = data.content.addActive;
        if (addScore > 0) {
            G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_ADD_SCORE, {
                addScore: addScore
            } as EventDailyTaskAddScoreArgs)
        }

        this.finishTask(c2s.taskConfigIds)

        // 奖励
        const taskRewards = data.content.rewardVos;
        if (taskRewards) {
            const rewards = taskRewards.toDataStream()
                .map(it => it.rewardsResult)
                .filterNotNull()
                .flatMap(it => it)
                .toArray();
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards as Array<Vo.reward.RewardResult>)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE)
    }


    /**
     * 领取日活跃宝箱奖励
     * 模块号：24	指令号：2
     */
    public recDrawDailyActiveBox(data: Vo.dailytask.DrawDailyActiveBoxS2C,
                                 c2s: Vo.dailytask.DrawDailyActiveBoxC2S
    ): void {
        if (data.code < 0) {
            G.Logger.error(`领取日活跃奖励失败. data.code = ${data.code}`)
            return;
        }

        G.Logger.debug(data, `领取日活跃奖励失败. data`)
        const result = data.content;

        // 领取的部分
        result.drawBoxIds.forEach(boxId => {
            this._context.addDailyActiveBoxByIdByGain(boxId)
        });

        // 奖励
        const rewardResults = result.rewardResults;
        if (rewardResults) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardResults as Array<Vo.reward.RewardResult>)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE)

    }

    /**
     * 领取周活跃宝箱奖励
     * 模块号：24	指令号：3
     */
    public recDrawWeeklyActiveBox(data: Vo.dailytask.DrawWeeklyActiveBoxS2C,
                                  c2s: Vo.dailytask.DrawWeeklyActiveBoxC2S
    ): void {
        if (data.code < 0) {
            const errorMsg = `领取周活跃奖励失败. data.code = ${data.code}`;
            G.Logger.error(errorMsg)
            G.FacadeManager.emit(NotificationKey.EVENT_FLOATING_TEXT_DEBUG, errorMsg)
            return;
        }

        G.Logger.debug(data, `领取周活跃奖励ok. data`)
        const result = data.content;

        // 领取的部分
        if (result.drawBoxIds?.length === 0) {
            G.Logger.warn("为什么 Server 返回的 drawBoxIds 为空?????? 救命.", data)
            G.FacadeManager.emit(NotificationKey.EVENT_FLOATING_TEXT_DEBUG, "为什么 Server 成功却返回的 drawBoxIds 为空? 救命.")
        }
        // 领取了的奖励
        result.drawBoxIds.forEach(boxId => {
            this._context.addWeekActiveBoxByIdByGain(boxId)
        });

        // 奖励
        const rewardResults = result.rewardResults;
        if (rewardResults) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardResults as Array<Vo.reward.RewardResult>)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE)
    }

    /*********************************协议推送*********************************/

    /**
     * 推送日常任务重置
     * 模块号：24	指令号：-1
     */
    public pushDailyTaskReset(vo: Vo.dailytask.DailyTaskResetVo): void {
        this._context.resetByServer(vo)
        
        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE)
    }


    // -----------------------------  my method ---------------------------------
    // region 我的方法


    /**
     * 初始化数据
     * @param initData
     */
    initData(initData: Vo.dailytask.DailyTaskLoginVo) {
        this._context = DailyTaskContext.from(initData)
    }

    // endregion 

    getDailyTaskById(dailyTaskId: number): TaskData | null {
        return this._context.getDailyTaskById(dailyTaskId)
    }

    /**
     * 获取排序后的 taskId []
     */
    getSortedDailyTaskIdArray(): number[] {
        return this._context.getSortedDailyTaskIdArray()
    }

    getDailyScore(): number {
        return this._context.dailyScore
    }

    getWeekScore(): number {
        return this._context.weekScore
    }


    /**
     * 添加每日积分
     * @param args
     */
    addScore(args: EventDailyTaskAddScoreArgs) {
        this._context.addDailyScore(args.addScore)

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE);
    }

    // 完成任务
    finishTask(finishTaskIds: number[]) {
        this._context.finishTask(finishTaskIds)

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE);

    }


    /**
     * 进度变更
     * @param changedTask
     */
    updateTaskState(changedTask: Vo.task.TaskVo) {

        this._context.updateTaskState(changedTask)
    }

    /**
     * 获取所有进行中的任务id
     */
    getDoingTaskIdArray(): number[] {
        return this._context.getDoingTaskIdArray()
    }

    /**
     * 添加进度
     * @param arg0
     */
    addProgressTry(arg0: EventTaskAddProgressArgs) {
        if (!arg0) {
            return
        }
        if (arg0.taskType !== ServerEnums.TaskType.DAILY_TASK) {
            return
        }
        const taskId = arg0.taskId;
        const addProgress = arg0.addProgress;

        const isOk = this._context.addProgress(taskId, addProgress);
        if (isOk) {
            G.Logger.debug(`每日任务进度增加成功. taskId = ${taskId}, addProgress = ${addProgress}`)
        }

        G.FacadeManager.emit(NotificationKey.EVENT_DAILY_TASK_CHANGE);
    }

    // 日活跃宝箱
    isGainDailyActiveBox(boxId: number): boolean {
        return this._context.isGainDailyActiveBoxById(boxId)
    }

    // 周活跃宝箱
    isGainWeekActiveBox(boxId: number): boolean {
        return this._context.isGainWeekActiveBoxById(boxId)
    }

    // 所有已完成的任务id
    getAllCompleteTaskIdArray(): number[] {
        return this._context.getAllCompleteTaskIdArray()
    }

    // 可以获得的日活跃箱子配置id 
    getCanGainDailyBoxIdArray(): number[] {
        return this._context.getCanGainDailyBoxIdArray()
    }

    // 可以获得的周活跃箱子配置id 
    getCanGainWeekBoxIdArray(): number[] {
        return this._context.getCanGainWeekBoxIdArray()
    }

    // 有任何任务/奖励可领取
    isHaveAnyRewardCanGain(): boolean {
        return this._context.isHaveAnyRewardCanGain()
    }


    refreshRedDot() {

        this._context.refreshRedDot();


    }
}
