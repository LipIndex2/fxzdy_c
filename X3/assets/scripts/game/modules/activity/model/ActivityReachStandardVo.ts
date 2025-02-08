import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { EventTaskProgressChange } from "db://assets/scripts/game/modules/task/event/EventTaskProgressChange";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ActivityConfigManager } from "db://assets/scripts/game/comm/activity/config/ActivityConfigManager";
import { ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";

/**
 * 达标vo
 */
export class ActivityReachStandardVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.ReachStandardVo {
        return this.content as Vo.activity.ReachStandardVo;
    }

    // private _taskVos: Vo.task.TaskVo[];

    //达标活动配置
    private _reachStandardCfg: table.activity.ReachStandard.ReachStandardConfig;
    //任务列表
    private _taskCfgs: table.activity.Task.ActivityTaskConfig[];
    private _taskCfgs2: table.activity.Task.ActivityTaskConfig[];
    private _allTaskCfgs: table.activity.Task.ActivityTaskConfig[];
    //礼包配置表
    private _giftCfgs: table.activity.Mall.ActivityMallGoodsConfig[];
    //当前轮次
    private _round = 0;
    //是否更新任务列表
    private _isUpdateTask = false;

    onInitDone(): void {
        G.GameTimer.once(100, this, this.isShowRed);
    }

    public get taskVos(): Vo.task.TaskVo[] {
        return this.activityVo.taskInfoVo.currentTasks;
    }

    /** 礼包配置表 */
    public get giftCfgs(): table.activity.Mall.ActivityMallGoodsConfig[] {
        if (!this._giftCfgs) {
            this._giftCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.Mall.ActivityMallGoodsConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId) {
                    this._giftCfgs.push(cfg);
                }
            }
        }

        this._giftCfgs.sort((a: table.activity.Mall.ActivityMallGoodsConfig, b: table.activity.Mall.ActivityMallGoodsConfig) => {
            let isShowA = this.getGoodsBuyCount(a.id) < a.buyLimit || !a.buyLimit;
            let isShowB = this.getGoodsBuyCount(b.id) < b.buyLimit || !b.buyLimit;
            if (isShowA != isShowB) {
                return isShowA ? -1 : 1;
            }
            return a.sort - b.sort;
        });

        return this._giftCfgs;
    }

    /** 更新任务 */
    public updateTaskData(data: Vo.task.TaskVo) {
        //TODO
        if (data) {
            data.state = data.state;

            let oldProgress = 0;
            const newProgress = data.progress;

            for (let taskVo of this.activityVo.taskInfoVo.currentTasks) {
                if (taskVo && taskVo.taskId == data.taskId) {
                    oldProgress = taskVo.progress;
                    taskVo.progress = data.progress;
                    taskVo.state = data.state;
                }
            }

            FacadeManager.ins().emit(NotificationKey.TASK_PROGRESS_CHANGE, EventTaskProgressChange.create(data.taskId, oldProgress, newProgress));
        }

        G.GameTimer.once(99, this, this.isShowRed);
        G.GameTimer.once(100, this, () => {
            FacadeManager.ins().emit(NotificationKey.REACH_ACTIVITY_TASK_UPDATE);
            // this.isShowRed();
            // FacadeManager.ins().emit(NotificationKey.ACTIVITY_RED_DOT_CHANGE, this.activityId);
        });
    }

    /** 达标活动配置 */
    public get reachStandardCfg(): table.activity.ReachStandard.ReachStandardConfig {
        if (!this._reachStandardCfg) {
            this._reachStandardCfg = TableManager.getDataById(table.activity.ReachStandard.ReachStandardConfig, this.activityId);
        }
        return this._reachStandardCfg;
    }

    /** 获取任务配置表 */
    public get taskCfgs(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._taskCfgs || this._isUpdateTask || this._round != this.activityVo.group) {
            this._taskCfgs = [];
            this._taskCfgs2 = [];
            let cfgs = this.allTaskCfgs;
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId && cfg.groupId == this.reachStandardCfg.roundTaskIds[this.round - 1]) {
                    this._taskCfgs.push(cfg);
                    this._taskCfgs2.push(cfg);
                }
            }
            this._isUpdateTask = false;
        }

        this._taskCfgs.sort((a: table.activity.Task.ActivityTaskConfig, b: table.activity.Task.ActivityTaskConfig) => {
            let isShowA = this.getTaskIsDone(a.id);
            let isShowB = this.getTaskIsDone(b.id);

            let taskVo1 = this.getTaskVo(a.id);
            let taskVo2 = this.getTaskVo(b.id);
            let state1 = taskVo1 && taskVo1?.state == 3 && !isShowA;
            let state2 = taskVo2 && taskVo2?.state == 3 && !isShowB;

            if (taskVo1 && taskVo2) {
                if (state1 != state2) {
                    return state1 ? -1 : 1;
                }
            }
            //排序, 已领取的放最后面
            if (isShowA != isShowB) {
                return isShowA ? 1 : -1;
            }
        });

        return this._taskCfgs;
    }

    /** 获取未排序的任务配置表 */
    public get taskCfgsNoSort(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._taskCfgs) {
            this.taskCfgs;
        }
        return this._taskCfgs2;
    }

    /** 获取当前活动的所有任务配置表 */
    public get allTaskCfgs(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._allTaskCfgs) {
            this._allTaskCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.Task.ActivityTaskConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId) {
                    this._allTaskCfgs.push(cfg);
                }
            }
        }
        return this._allTaskCfgs;
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

    /** 判断对应任务是否已完成 */
    public getTaskIsDone(taskId: number): boolean {
        let taskIds = this.activityVo.taskInfoVo.finishedTaskIds;
        for (let id of taskIds) {
            if (id == taskId) {
                return true;
            }
        }
        return false;
    }

    /**获取对应id礼包的购买次数*/
    public getGoodsBuyCount(goodsId: number): number {
        return this.activityVo.mallVo.goodsId2BuyNum[goodsId] || 0;
    }

    /** 广告购买数量*/
    public getAdBuyCount(goodsId: number): number {
        return this.activityVo.mallVo.goodsId2AdvertBuyNum[goodsId] || 0;
    }

    /** 获取当前轮次 */
    public get round(): number {
        if (!this._round || this._round != this.activityVo.group) {
            // if (!this._round) {
            this._isUpdateTask = true;
            // this._taskVos = this.activityVo.taskInfoVo.currentTasks;
            this._round = this.activityVo.group > this.activityVo.totalGroupNum ? this.activityVo.totalGroupNum : this.activityVo.group;
        }
        return this._round;
    }

    /** 获取对应轮次的奖励列表 */
    public getTaskCfgsByRound(round: number): table.activity.Task.ActivityTaskConfig[] {
        let taskCfgs = [];
        let cfgs = this.allTaskCfgs;
        for (let cfg of cfgs) {
            if (cfg && cfg.activityId == this.activityId && cfg.groupId == this.reachStandardCfg.roundTaskIds[round - 1]) {
                taskCfgs.push(cfg);
            }
        }
        return taskCfgs;
    }

    // 最大轮
    public get maxRound(): number {
        return this.activityVo.totalGroupNum;
    }

    public isShowRed(): boolean {
        let isShow = false;
        this.taskRedDot = false;
        this.rewardRedDot = false;
        this.fallRedDot = false;
        //任务
        for (let cfg of this.allTaskCfgs) {
            if (cfg) {
                let taskVo = this.getTaskVo(cfg.id);
                if (taskVo && taskVo.state == 3 && !this.getTaskIsDone(cfg.id)) {
                    isShow = true;
                    if (cfg.type2) {
                        if (cfg.type2 == "TASK") {
                            this.taskRedDot = true;
                        } else if (cfg.type2 == "TASK2") {
                            this.rewardRedDot = true;
                        }
                    }

                    GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_task, true, [this.activityId, cfg.id]);
                } else {
                    GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_task, false, [this.activityId, cfg.id]);
                }
            }
        }

        //礼包
        for (let cfg1 of this.giftCfgs) {
            if (cfg1 && !cfg1.chargeGoodsId) {
                let freeGoodsCfg = TableManager.getDataById(table.activity.Mall.ActivityMallCostRewardConfig, cfg1.id);
                if (freeGoodsCfg?.costs) {
                    let noOwnerItem = NoOwnerItem.createByConfigKv(freeGoodsCfg?.costs[0]);
                    const result = GIns.backpackMgr.isCanPayReturnResult([noOwnerItem]);
                    if (result.isCanPay && (this.getGoodsBuyCount(cfg1.id) < cfg1.buyLimit || cfg1.limitBuyType == "NEVER")) {
                        isShow = true;
                        this.fallRedDot = true;
                        GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_free, true, [this.activityId, cfg1.id]);
                    } else {
                        GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_free, false, [this.activityId, cfg1.id]);
                    }
                } else {
                    if (this.getGoodsBuyCount(cfg1.id) < cfg1.buyLimit && this.getAdBuyCount(cfg1.id) < cfg1.buyLimit) {
                        isShow = true;
                        this.fallRedDot = true;
                        GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_free, true, [this.activityId, cfg1.id]);
                    } else {
                        GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_free, false, [this.activityId, cfg1.id]);
                    }
                }
            }
        }

        GIns.redDotMgr.setRedDot(RedDotKeys.StandardActivity_enter, isShow, [this.activityId]);
        return isShow;
    }

    public isActivityOver(): boolean {
        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        const config = this.activityCfg;
        if (config) {
            if (config.isEndNotShow) {
                // TODO 策划说做完也不用隐藏
                const isDone = this.isDone();
                if (isDone) {
                    return isDone;
                }
            }
        }

        return false;
    }

    getCurrentRoundFirstTaskConfig() {
        return this.taskCfgs[0];
    }

    getCurrentRoundFirstTask(): Vo.task.TaskVo {
        return this.activityVo.taskInfoVo.currentTasks[0];
    }

    // 获取当前轮次的奖励
    getCurrentRoundRewards(): NoOwnerItem[] {
        const rewardKvs = this.getCurrentRoundFirstTaskConfig()?.rewards;
        const items = ItemUtils.parseKvArrayToItemArray(rewardKvs);
        return items;
    }

    // 当前轮 最大进度
    getCurrentRoundMaxProgress(): number {
        const currentRoundFirstTask = this.getCurrentRoundFirstTask();
        if (!currentRoundFirstTask) {
            return 0;
        }
        return this.getCurrentRoundFirstTaskConfig()?.maxProgress || 0;
    }

    // 当前轮 进度
    getCurrentRoundProgress(): number {
        return this.getCurrentRoundFirstTask()?.progress || 0;
    }

    getScoreItemId() {
        return ActivityConfigManager.getScoreItemIdByActivityId(this.activityId);
    }

    // 领取首个任务
    sendGainFirstTask() {
        let data: ActivitySyncData = {
            activityId: this.activityId,
            itemId: "TASK_" + this.getCurrentRoundFirstTaskConfig().id,
            hidePopWin: 2,
        };
        GIns.activityModel.sendDrawItemReward(data);
    }

    // -----------------------------------------终身活动数据-----------------------
    /** 任务红点 */
    public taskRedDot: boolean = false;
    /** 奖励红点 */
    public rewardRedDot: boolean = false;
    /** 免费奖励红点 */
    public fallRedDot: boolean = false;
    //奖励显示项索引
    private _showItemIndex = 0;
    public set showItemIndex(index: number) {
        this._showItemIndex = index;
    }
    public get showItemIndex(): number {
        return this._showItemIndex;
    }

    /** 任务配置列表 */
    private _lifelongTaskCfgs: table.activity.Task.ActivityTaskConfig[];
    /** 奖励配置列表 */
    private _lifelongRewardCfgs: table.activity.Task.ActivityTaskConfig[];

    /** 奖励配置列表 */
    public get lifelongRewardCfgs(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._lifelongRewardCfgs) {
            this._lifelongRewardCfgs = [];
            for (let i = 0; i < this.taskCfgsNoSort.length; i++) {
                let cfg = this.taskCfgsNoSort[i];
                if (cfg.type2 == "TASK2") {
                    this._lifelongRewardCfgs.push(cfg);
                }
            }
            this._lifelongRewardCfgs.reverse();
        }
        return this._lifelongRewardCfgs;
    }

    /** 任务配置列表 */
    public get lifelongTaskCfgs(): table.activity.Task.ActivityTaskConfig[] {
        if (!this._lifelongTaskCfgs) {
            this._lifelongTaskCfgs = [];
            for (let i = 0; i < this.taskCfgsNoSort.length; i++) {
                let cfg = this.taskCfgsNoSort[i];
                if (cfg.type2 == "TASK") {
                    this._lifelongTaskCfgs.push(cfg);
                }
            }
        }

        //排序
        this._lifelongTaskCfgs.sort((a: table.activity.Task.ActivityTaskConfig, b: table.activity.Task.ActivityTaskConfig) => {
            let isShowA = this.getTaskIsDone(a.id);
            let isShowB = this.getTaskIsDone(b.id);

            let taskVo1 = this.getTaskVo(a.id);
            let taskVo2 = this.getTaskVo(b.id);
            let state1 = taskVo1 && taskVo1?.state == 3 && !isShowA;
            let state2 = taskVo2 && taskVo2?.state == 3 && !isShowB;

            if (taskVo1 && taskVo2) {
                if (state1 != state2) {
                    return state1 ? -1 : 1;
                }
            }
            //排序, 已领取的放最后面
            if (isShowA != isShowB) {
                return isShowA ? 1 : -1;
            }
        });

        return this._lifelongTaskCfgs;
    }
}
