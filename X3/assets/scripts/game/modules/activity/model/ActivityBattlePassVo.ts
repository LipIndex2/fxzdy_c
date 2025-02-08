import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";

/**
 * 通行证vo
 */
export class ActivityBattlePassVo extends BaseActivityVo {
    /** 所有通行证配置 */
    private _allPassCfgs: table.activity.BattlePass.BattlePassConfig[];
    /** 当前通行证配置 */
    private _passCfg: table.activity.BattlePass.BattlePassConfig;
    /** 当前通行证的奖励列表配置 */
    private _passRewardList: table.activity.BattlePass.BattlePassRewardConfig[];
    private _passTaskList: table.activity.BattlePass.BattlePassTaskConfig[];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.BattlePassVo {
        return this.content as Vo.activity.BattlePassVo;
    }
    onInitDone() {
        G.GameTimer.once(1000, this, () => {
            this.checkRedDot();
        });
    }

    public get passId() {
        return this.activityId;
    }

    /** 所有通行证配置 */
    public get allPassCfgs() {
        if (!this._allPassCfgs) this._allPassCfgs = TableManager.getAllData(table.activity.BattlePass.BattlePassConfig);
        return this._allPassCfgs;
    }

    public get passTaskList() {
        if (!this._passTaskList) {
            this._passTaskList = [];
            let cfgs = TableManager.getAllData(table.activity.BattlePass.BattlePassTaskConfig);
            for (let i = 0; i < cfgs.length; i++) {
                let cfg = cfgs[i];
                if (cfg.battlePassId == this.passCfg.id) {
                    this._passTaskList.push(cfg);
                }
            }
        }
        return this._passTaskList;
    }

    /** 当前通行证配置 */
    public get passCfg() {
        if (!this._passCfg) {
            this._passCfg = this.allPassCfgs.find((passCfg) => {
                return passCfg.activityId == this.activityId;
            });
        }
        return this._passCfg;
    }

    //普通档位金额
    public get chargeGoodsText() {
        let cfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this.passCfg.chargeGoodsId);
        return cfg.price;
    }

    //高级档位金额
    public get superChargeGoodsText() {
        let cfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this.passCfg.superChargeGoodsId);
        return cfg.price;
    }

    //差价档位金额
    public get replaceChargeGoodsText() {
        let cfg = TableManager.getDataById(table.order.ChargeGoodsConfig, this.passCfg.replaceChargeGoodsId);
        return cfg.price;
    }

    /** 当前可领取奖励的下标 */
    public get curAwardIndex() {
        let index = 0;
        let allCfg = this.passAwardList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            // if(this.isRewardCanGet(cfg.id) || this.isRewardCanGetByHigh(cfg.id) || cfg.battlePassExp >= this.allExp){
            //     return i;
            // }
            if (cfg.battlePassExp >= this.allExp) {
                return i;
            }
        }
        return index;
    }

    /** 当前通行证活动奖励列表 */
    public get passAwardList() {
        if (!this._passRewardList) {
            this._passRewardList = [];
            let allCfg = TableManager.getAllData(table.activity.BattlePass.BattlePassRewardConfig);
            for (let i = 0; i < allCfg.length; i++) {
                let cfg = allCfg[i];
                if (cfg.battlePassId == this.passCfg.id) {
                    this._passRewardList.push(cfg);
                }
            }
        }
        return this._passRewardList;
    }

    /** 获取下一个大奖的配置 */
    public getNextAward(index: number) {
        let nextCfg;
        for (let cfg of this.passAwardList) {
            if (cfg && cfg.id >= index && cfg.isBigAward) {
                nextCfg = cfg;
                break;
            }
        }
        return nextCfg;
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }
        if (this.isDone()) {
            return true;
        }
        return false;
    }

    /** 任务类型Map */
    public get taskTypeMap() {
        let map = {};
        let allCfg = this.passTaskList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (map[cfg.resetType]) {
                map[cfg.resetType].push(cfg);
            } else {
                map[cfg.resetType] = [cfg];
            }
        }

        //排序
        let keys = Object.keys(map);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            map[key].sort((a, b) => {
                let stateA = this.getTaskState(a.id);
                let stateB = this.getTaskState(b.id);
                return stateB - stateA;
            });
        }
        return map;
    }
    //排序用
    private getTaskState(id: number) {
        let state = 1;
        let taskData = this.getTaskDataById(id);
        if (this.taskIsFinished(id)) {
            state = 0;
        } else {
            if (taskData && taskData.state == 3) {
                state = 2;
            }
        }
        return state;
    }

    public get level() {
        let level = 0;
        let allCfg = this.passAwardList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (cfg.battlePassExp <= this.allExp) {
                level = cfg.level;
            }
        }
        return level;
    }

    public get allExp() {
        let id = this.passCfg.expItemId;
        let count = ItemModel.ins().getItemCountById(id);
        return count || 0;
    }

    public get exp() {
        let exp = this.allExp;
        let allCfg = this.passAwardList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (cfg.battlePassExp <= this.allExp) {
                exp = this.allExp - cfg.battlePassExp;
            }
        }
        return exp;
    }

    public get maxExp() {
        let allCfg = this.passAwardList;
        let exp = allCfg[0].battlePassExp;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (cfg.battlePassExp <= this.allExp && allCfg[i + 1]) {
                exp = allCfg[i + 1].battlePassExp - cfg.battlePassExp;
            }
        }
        return exp;
    }

    /** 奖励是否已领取 (普通列表) */
    public isRewardGet(id: number): boolean {
        let isGet = false;
        for (let rewardId of this.activityVo.rewardIds) {
            if (rewardId == id) {
                isGet = true;
            }
        }
        return isGet;
    }

    /** 奖励是否已领取 (高级列表) */
    public isRewardGetByHigh(id: number): boolean {
        let isGet = false;
        for (let rewardId of this.activityVo.chargeRewardIds) {
            if (rewardId == id) {
                isGet = true;
            }
        }
        return isGet;
    }

    /** 奖励是否可以领取 （普通列表） */
    public isRewardCanGet(id: number): boolean {
        let isCanGet = false;
        let cfg = TableManager.getDataById(table.activity.BattlePass.BattlePassRewardConfig, id);
        if (cfg && !this.isRewardGet(id) && cfg.battlePassExp <= this.allExp) {
            isCanGet = true;
        }
        return isCanGet;
    }
    /** 奖励是否可以领取 （高级列表） */
    public isRewardCanGetByHigh(id: number): boolean {
        let isCanGet = false;
        let cfg = TableManager.getDataById(table.activity.BattlePass.BattlePassRewardConfig, id);
        if (cfg && !this.isRewardGetByHigh(id) && cfg.battlePassExp <= this.allExp && (this.activityVo.boughtPass || this.activityVo.boughtSuperPass)) {
            isCanGet = true;
        }
        return isCanGet;
    }

    /** 是否有可领取的奖励 */
    public get isRewardCanGetList(): boolean {
        let isCanGet = false;
        let allCfg = this.passAwardList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (this.isRewardCanGet(cfg.id) || this.isRewardCanGetByHigh(cfg.id)) {
                return true;
            }
        }
        return isCanGet;
    }

    /** 任务数据 */
    public getTaskDataById(taskid: number): Vo.task.TaskVo {
        let data: Vo.task.TaskVo;
        for (let vo of this.activityVo.taskInfoVo.currentTasks) {
            if (vo && vo.taskId == taskid) {
                data = vo;
            }
        }
        return data;
    }

    /** 已完成的任务 */
    public taskIsFinished(taskid: number) {
        let isFinished = false;
        for (let id of this.activityVo.taskInfoVo.finishedTaskIds) {
            if (id == taskid) {
                isFinished = true;
            }
        }
        return isFinished;
    }

    public get awardPreviewList() {
        let list = [];
        let allCfg = ObjectUtils.copyObjectArr(this.passAwardList);
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            for (let reward1 of cfg.chargeRewards) {
                list.push(reward1);
            }
        }

        list = ItemUtils.combineObject1s(list);

        list.sort((a, b) => {
            let itemA = ItemUtils.getItemConfigByItemId(a.k);
            let itemB = ItemUtils.getItemConfigByItemId(b.k);

            if (itemB.quality != itemA.quality) {
                return itemB.quality - itemA.quality;
            } else if (a.v != b.v) {
                return b.v - a.v;
            }
        });

        return list;
    }

    //检查红点
    public checkRedDot() {
        this.updateRedDot();
        this.checkTaskRedDot();
        this.checkTaskTabRedDot();
    }

    //任务Tab红点
    public checkTaskTabRedDot() {
        let allTask = this.taskTypeMap;
        for (let key in allTask) {
            let taskList = allTask[key];
            let isShow = false;
            for (let i = 0; i < taskList.length; i++) {
                let cfg = taskList[i];
                let taskData = this.getTaskDataById(cfg.id);
                if (!this.taskIsFinished(cfg.id)) {
                    if (taskData && taskData.state == 3) {
                        isShow = true;
                        break;
                    }
                }
            }
            RedDotManager.ins().setRedDot(RedDotKeys.StarPass_taskTab, isShow, [key]);
        }
    }

    //任务列表红点
    public checkTaskRedDot() {
        let allCfg = this.passTaskList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            let isShow = false;
            let taskData = this.getTaskDataById(cfg.id);
            if (!this.taskIsFinished(cfg.id)) {
                if (taskData && taskData.state == 3) {
                    isShow = true;
                }
            }
            RedDotManager.ins().setRedDot(RedDotKeys.StarPass_task, isShow, [cfg.id]);
        }
    }

    //奖励列表
    public updateRedDot() {
        for (let i = 0; i < this.passAwardList.length; i++) {
            let cfg = this.passAwardList[i];
            if (cfg) {
                RedDotManager.ins().setRedDot(RedDotKeys.StarPass_item, this.isRewardCanGet(cfg.id), [cfg.id]);
                RedDotManager.ins().setRedDot(RedDotKeys.StarPass_pay, this.isRewardCanGetByHigh(cfg.id), [cfg.id]);
            }
        }
    }

    /** 更新任务 */
    public updateTaskData(): void {
        GIns.activityModel.sendActivity(this.activityId);
    }
}
