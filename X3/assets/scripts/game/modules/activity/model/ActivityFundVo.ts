import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { MapUtils } from "../../../../core/utils/MapUtils";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { ItemUtils } from "../../item/utils/ItemUtils";

/**
 * 基金vo
 */
export class ActivityFundVo extends BaseActivityVo {
    private _fundCfg: table.activity.Fund.FundConfig;

    private _fundRewardList: table.activity.Fund.FundTaskConfig[];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.FundVo {
        return this.content as Vo.activity.FundVo;
    }

    /** 当前基金配置 */
    public get fundCfg() {
        if (!this._fundCfg) {
            let cfgs = TableManager.getAllData(table.activity.Fund.FundConfig);
            for (let i = 0; i < cfgs.length; i++) {
                let cfg = cfgs[i];
                if (cfg.activityId == this.activityId) {
                    this._fundCfg = cfg;
                    break;
                }
            }
        }
        return this._fundCfg;
    }

    onInitDone() {
        G.GameTimer.once(1000, this, this.isShowRed);
    }

    public get fundAwardList() {
        if (!this._fundRewardList) {
            this._fundRewardList = [];
            let allCfg = TableManager.getAllData(table.activity.Fund.FundTaskConfig);
            for (let i = 0; i < allCfg.length; i++) {
                let cfg = allCfg[i];
                if (cfg.fundId == this.fundCfg.id) {
                    this._fundRewardList.push(cfg);
                }
            }
        }
        return this._fundRewardList;
    }

    /** 奖励是否已领取 */
    public isRewardGet(id: number): boolean {
        let isGet = false;
        for (let rewardId of this.activityVo.rewardTaskIds) {
            if (rewardId == id) {
                isGet = true;
            }
        }
        return isGet;
    }

    /** 奖励是否已领取 (高级列表) */
    public isRewardGetByHigh(id: number): boolean {
        let isGet = false;
        for (let rewardId of this.activityVo.chargeRewardTaskIds) {
            if (rewardId == id) {
                isGet = true;
            }
        }
        return isGet;
    }

    /** 奖励是否可以领取 */
    public isRewardCanGet(id: number): boolean {
        let isCanGet = false;
        if (!this.isRewardGet(id)) {
            for (let task of this.activityVo.taskInfoVo.currentTasks) {
                if (task.taskId == id && task.state == 3) {
                    isCanGet = true;
                }
            }
        }
        return isCanGet;
    }

    /** 奖励是否可以领取 （高级列表） */
    public isRewardCanGetByHigh(id: number): boolean {
        let isCanGet = false;
        if (!this.isRewardGetByHigh(id) && this.activityVo.boughtFund) {
            for (let task of this.activityVo.taskInfoVo.currentTasks) {
                if (task.taskId == id && task.state == 3) {
                    isCanGet = true;
                }
            }
        }
        return isCanGet;
    }

    /** 是否有可领取的奖励 */
    public get isRewardCanGetList(): boolean {
        let isCanGet = false;
        let allCfg = this.fundAwardList;
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (this.isRewardCanGet(cfg.id) || this.isRewardCanGetByHigh(cfg.id)) {
                isCanGet = true;
            }
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Pass_item, isCanGet, [this.activityId]);
        return isCanGet;
    }

    /** 预览奖励 */
    public get allRewardList() {
        let allRewardList = [];
        let allCfg = this.copyObjectArr(this.fundAwardList);
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            for (let reward of cfg.chargeRewards) {
                allRewardList.push(reward);
            }
        }

        allRewardList = ItemUtils.combineObject1s(allRewardList);

        allRewardList.sort((a, b) => {
            let itemA = ItemUtils.getItemConfigByItemId(a.k);
            let itemB = ItemUtils.getItemConfigByItemId(b.k);

            if (itemB.quality != itemA.quality) {
                return itemB.quality - itemA.quality;
            } else {
                return a.id - b.id;
            }
        });

        return allRewardList;
    }

    /** 购买可获得的奖励 */
    public get buyRewardList() {
        let allRewardList = [];
        let allCfg = this.copyObjectArr(this.fundAwardList);
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            let isCanGet = false;
            for (let task of this.activityVo.taskInfoVo.currentTasks) {
                if (task.taskId == cfg.id && task.state == 3) {
                    isCanGet = true;
                }
            }
            if (isCanGet) {
                for (let reward of cfg.chargeRewards) {
                    allRewardList.push(reward);
                }
            }
        }

        allRewardList = ItemUtils.combineObject1s(allRewardList);
        allRewardList.sort((a, b) => {
            let itemA = ItemUtils.getItemConfigByItemId(a.k);
            let itemB = ItemUtils.getItemConfigByItemId(b.k);

            if (itemB.quality != itemA.quality) {
                return itemB.quality - itemA.quality;
            } else {
                return a.id - b.id;
            }
        });

        return allRewardList;
    }

    //滑动到当前等级处
    public get scrollToCurrentLevel() {
        let index = 0;
        for (let i = 0; i < this.activityVo.taskInfoVo.currentTasks.length; i++) {
            let task = this.activityVo.taskInfoVo.currentTasks[i];
            if (task.state == 3) {
                index = i;
            }
        }
        return index;
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

    /** 浅复制 */
    public copyObjectArr(obj: any) {
        var ret; // = (typeof obj).toLowerCase()==="array" ? [] : {};
        var a = obj.constructor;
        switch (a) {
            case Array:
                ret = [];
                break;
            case Object:
                ret = {};
                break;
        }
        var key;
        for (key in obj) {
            ret[key] = obj[key];
        }
        return ret;
    }

    /** 更新任务 */
    public updateTaskData(data: Vo.task.TaskVo) {
        //TODO
        if (data) {
            for (let taskVo of this.activityVo.taskInfoVo.currentTasks) {
                if (taskVo.taskId == data.taskId) {
                    taskVo.state = data.state;
                    taskVo.progress = data.progress;
                }
            }
        }

        this.isShowRed();
        // G.FacadeManager.emit(NotificationKey.REACH_ACTIVITY_TASK_UPDATE);
    }

    public isShowRed(): boolean {
        let isShow = this.isRewardCanGetList;
        return isShow;
    }
}
