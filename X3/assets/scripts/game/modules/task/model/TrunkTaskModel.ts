import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { TrunkTaskConfigManager } from "db://assets/scripts/game/modules/task/config/TrunkTaskConfigManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import TaskType = ServerEnums.TaskType;
import TaskState = ServerEnums.TaskState;
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { IMainPageAddItemAniArgs } from "../../../ui/main/components/MainPageAniPoint";

/**
 * 主线任务模块
 * @author GameCreator
 */
export class TrunkTaskModel extends BaseModel {

    // 有可能没有任务了
    private _currentTask: TaskData | null

    /**
     * 模块标识
     */
    private MODULE = 26;


    constructor () {
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
        this.registerMsg(moduleId, 1, this.recDrawTaskReward);

    }

    /*********************************协议发送*********************************/

    /**
     * 领取任务奖励
     * 模块号：26	指令号：1
     */
    public sendDrawTaskReward(): void {
        if (!this._currentTask) {
            console.error(`当前没有主线任务任务.`);
            return;
        }
        const taskId = this._currentTask.taskId;
        const maxProgress = TrunkTaskConfigManager.getConfigById(taskId)?.totalProgress || 0;

        // 未完成
        const isNotComplete = this._currentTask.currentProgress < maxProgress
            || this._currentTask.state != ServerEnums.TaskState.COMPLETED;
        if (isNotComplete) {
            console.warn(`任务未完成. 玩家点击太快了, 服务器还没响应过来. cur task = `, this._currentTask);
            FacadeManager.ins().emit(NotificationKey.EVENT_TRUNK_TASK_CHANGE);
            return;
        }

        const c2s: Vo.trunktask.DrawTaskRewardC2S = {
            taskConfigId: taskId,
        }
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 领取任务奖励
     * 模块号：26	指令号：1
     */
    public recDrawTaskReward(data: Vo.trunktask.DrawTaskRewardS2C,
        c2s: Vo.trunktask.DrawTaskRewardC2S
    ): void {
        if (data.code < 0) {
            G.Logger.error(`领取任务奖励失败：`, data);

            // 服务端报错也刷新一下任务状态 | 避免 server bug 导致的任务状态不一致
            G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_CHANGE);
            return;
        }
        G.Logger.net(data, `领取任务奖励成功：`);

        G.Logger.debug(data, `主线任务获取奖励! taskId = ${data.content?.taskId} `);


        // event 奖励
        const rewardsResult = data.content?.rewardsResult;
        if (rewardsResult) {
            G.FacadeManager.emit(NotificationKey.EVENT_GET_ITEM_ANIM, { items: rewardsResult, isShowItemNumEffect: true });
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP, rewardsResult);
        }
        // 任务状态更新
        if (c2s.taskConfigId === this._currentTask.taskId) {
            this._currentTask.state = ServerEnums.TaskState.FINISHED;
        }

        G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_CHANGE);
        AudioManager.ins().playSound(SoundType.reward);
    }

    /*********************************协议推送*********************************/

    private _taskMap: { [id: number]: number } = {};

    @LogBusiness("主线任务数据 init ")
    initData(trunkTaskLoginVo: Vo.trunktask.TrunkTaskLoginVo) {
        TrunkTaskConfigManager.init();

        const taskVo = trunkTaskLoginVo?.currentTaskVo;
        if (!taskVo) {
            // 没有 data, 后端说 = 全部主线任务都完成了
            this._currentTask = TaskData.createFinishTask(TrunkTaskConfigManager.maxTrunkTaskId, TaskType.TRUNK_TASK);
            return;
        }
        // 非主线任务
        if (taskVo.type !== ServerEnums.TaskType.TRUNK_TASK) {
            G.Logger.error(`[TrunkTaskModel] 任务类型不为主线任务，无法初始化.`);
            G.FacadeManager.emit(NotificationKey.EVENT_FLOATING_TEXT_DEBUG, `[TrunkTaskModel] Server 推送的主线任务-初始化数据, 类型有问题.`);
            return;
        }
        this._currentTask = TaskData.fromServerData(taskVo);


    }

    // 任务状态变更 by server
    onServerPushTrunkTaskChange(changedTask: Vo.task.TaskVo) {
        G.Logger.debug(changedTask, `主线任务收到服务端推送! `)

        const oldTaskId = this._currentTask.taskId;
        const newTaskId = changedTask.taskId;
        this._currentTask.taskId = newTaskId
        this._currentTask.currentProgress = changedTask.progress;
        this._currentTask.state = changedTask.state;


        G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_CHANGE);

        // complete
        if (changedTask.state == TaskState.COMPLETED) {
            G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_COMPLETE, newTaskId);
        }

        //前端记录任务map，引导用
        this._taskMap[newTaskId] = changedTask.state;

        // next
        if (oldTaskId !== newTaskId) {
            G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_ID_NEXT, newTaskId);
        }

    }

    /**
     * 获取当前任务 id
     */
    getCurrentTaskId(): number {
        return this._currentTask?.taskId ?? 0;
    }

    getCurrentTask(): TaskData {
        return this._currentTask
    }

    /**
     * 完成后
     * @param taskId
     */
    isPass(taskId: number) {
        if (!this._currentTask) {
            return false;
        }
        return this._currentTask.taskId > taskId;
    }

    /** 前端记录的任务map */
    get taskMap() {
        return this._taskMap;
    }


    /**
     * 是否已完成
     * @param taskId
     */
    isComplete(taskId: number) {
        if (this.isPass(taskId)) {
            return true;
        }
        return this._currentTask.taskId == taskId
            && this._currentTask.state == TaskState.COMPLETED;

    }

}
