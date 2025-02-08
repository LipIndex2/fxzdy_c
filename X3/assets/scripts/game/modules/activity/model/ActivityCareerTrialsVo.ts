import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIActivityKey } from "../const/UIActivityConfig";

/**
 * 职业试炼vo
 */
export class ActivityCareerTrialsVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.CareerTrialVo {
        return this.content as Vo.activity.CareerTrialVo;
    }

    /** 当前活动所有职业的配置表 */
    private _cfgs: table.activity.CareerTrial.CareerTrialConfig[];
    /** 当前选择的职业试炼配置表 */
    private _cfg: table.activity.CareerTrial.CareerTrialConfig;

    /** 当前选择的试炼Id */
    private _trialId: number = 1;

    /** 本次登录有没有打开过主界面 */
    public isFirstOpen = true;

    onInitDone(): void {
        G.GameTimer.once(200, this, this.isShowRedOfUIView);
    }

    /** 当前活动所有职业的配置表 */
    public get cfgs(): table.activity.CareerTrial.CareerTrialConfig[] {
        if (!this._cfgs) {
            this._cfgs = [];
            let allCfgs = TableManager.getAllData(table.activity.CareerTrial.CareerTrialConfig);
            for (let cfg of allCfgs) {
                if (cfg.activityId == this.activityId) {
                    this._cfgs.push(cfg);
                }
            }
        }
        return this._cfgs;
    }

    /** 当前选择的职业的配置表 */
    public get cfg(): table.activity.CareerTrial.CareerTrialConfig {
        if (!this._cfg) {
            this._cfg = TableManager.getDataById(table.activity.CareerTrial.CareerTrialConfig, this._trialId);
        }
        return this._cfg;
    }

    /** 获取对应id的职业的配置表 */
    public getCfgById(id: number): table.activity.CareerTrial.CareerTrialConfig {
        return TableManager.getDataById(table.activity.CareerTrial.CareerTrialConfig, id);
    }

    /** 当前选择的试炼Id */
    public set trialId(id: number) {
        this._trialId = id;
    }
    public get trialId(): number {
        return this._trialId;
    }

    /** 判断是否已领取试玩奖励 */
    public isGetDemoReward(isShowTips: boolean = false, id: number = 0): boolean {
        id = id == 0 ? this.cfg.id : id;
        let b = this.activityVo.trialFightRewardIds && this.activityVo.trialFightRewardIds?.indexOf(id) != -1;
        if (b && isShowTips) GIns.floatingTextMgr.showTips("奖励已领取");
        return b;
    }

    /** 判断是否通关了试玩 */
    public canGetDemoReward(isShowTips: boolean = false, id: number = 0): boolean {
        id = id == 0 ? this.cfg.id : id;
        let b = this.activityVo.passTrialFightIds && this.activityVo.passTrialFightIds.indexOf(id) != -1;
        if (!b && isShowTips) GIns.floatingTextMgr.showTips("试玩阵容后可领取");
        return b;
    }

    /** ================================== 试炼基金部分 ========================================= */

    //试炼基金所有奖励表
    private _fundCfgs: table.activity.Fund.FundTaskConfig[];

    /** 当前试炼基金的所有奖励表 */
    public get fundCfgs(): table.activity.Fund.FundTaskConfig[] {
        if (!this._fundCfgs) {
            this._fundCfgs = [];
            let allCfgs = TableManager.getAllData(table.activity.Fund.FundTaskConfig);
            for (let cfg of allCfgs) {
                if (cfg.fundId == this.cfg.fundId) {
                    this._fundCfgs.push(cfg);
                }
            }
        }
        return this._fundCfgs;
    }

    /** 更新任务 */
    public updateTaskData(): void {
        GIns.activityModel.sendActivity(this.activityId);
    }

    /** 获取基金任务信息 */
    public get fundTaskInfo(): Vo.task.TaskInfoVo {
        return this.activityVo.fundTaskInfoVo;
    }

    /** 根据任务id判断任务状态   0: 未完成，1：已完成，2已领取 */
    public getFundTaskStatusById(taskId: number): number {
        let state = 0;
        if (this.activityVo.fundRewardIds.indexOf(taskId) != -1) {
            state = 2;
        } else {
            for (let i = 0; i < this.fundTaskInfo.currentTasks.length; i++) {
                if (this.fundTaskInfo.currentTasks[i].taskId == taskId) {
                    state = this.fundTaskInfo.currentTasks[i].state == 3 ? 1 : 0;
                    break;
                }
            }
        }
        return state;
    }

    /** 根据礼包id获取礼包购买次数 */
    public getFundBuyTimesById(id: number): number {
        let times = this.activityVo.fundChargeRewardId2Num[id] || 0;
        return times;
    }

    /** ==============================================================================通行证============================== */

    /** 当前通行证的奖励列表配置 */
    private _passRewardList: table.activity.BattlePass.BattlePassRewardConfig[];
    /** 当前通行证配置 */
    private _passCfg: table.activity.BattlePass.BattlePassConfig;
    private _passTaskList: table.activity.BattlePass.BattlePassTaskConfig[];

    /** 经验值 */
    public get allExp() {
        let id = this.passCfg.expItemId;
        let count = ItemModel.ins().getItemCountById(id);
        return count || 0;
    }
    /** 当前等级Max经验值 */
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
    /** 当前经验值 */
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
    /** 当前等级 */
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

    /** 当前通行证配置 */
    public get passCfg() {
        if (!this._passCfg) {
            this._passCfg = TableManager.getDataById(table.activity.BattlePass.BattlePassConfig, this.cfg.battlePassId);
        }
        return this._passCfg;
    }
    /** 任务 */
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

    /** 当前通行证活动奖励列表 */
    public get passAwardList() {
        if (!this._passRewardList) {
            this._passRewardList = [];
            let allCfg = TableManager.getAllData(table.activity.BattlePass.BattlePassRewardConfig);
            for (let i = 0; i < allCfg.length; i++) {
                let cfg = allCfg[i];
                if (cfg.battlePassId == this.cfg.battlePassId) {
                    this._passRewardList.push(cfg);
                }
            }
        }
        return this._passRewardList;
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
        if (cfg && !this.isRewardGetByHigh(id) && cfg.battlePassExp <= this.allExp && this.activityVo.boughtPassIds.indexOf(+this.passCfg.chargeGoodsId) != -1) {
            isCanGet = true;
        }
        return isCanGet;
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

    /** 获取下一个大奖的配置 */
    public getNextAward(index: number) {
        let nextCfg;
        for (let cfg of this.passAwardList) {
            if (cfg && cfg.level >= index && cfg.isBigAward) {
                nextCfg = cfg;
                break;
            }
        }
        return nextCfg;
    }

    /** 任务数据 */
    public getTaskDataById(taskid: number): Vo.task.TaskVo {
        let data: Vo.task.TaskVo;
        for (let vo of this.activityVo.battlePassTaskInfoVo.currentTasks) {
            if (vo && vo.taskId == taskid) {
                data = vo;
            }
        }
        return data;
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
    /** 已完成的任务 */
    public taskIsFinished(taskid: number) {
        let isFinished = false;
        for (let id of this.activityVo.battlePassTaskInfoVo.finishedTaskIds) {
            if (id == taskid) {
                isFinished = true;
            }
        }
        return isFinished;
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

    /** 付费可立即获得的通行证奖励 */
    public get awardPreviewList() {
        let list = [];
        let allCfg = ObjectUtils.copyObjectArr(this.passAwardList);
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            if (cfg.battlePassExp <= this.allExp) {
                for (let reward1 of cfg.chargeRewards) {
                    list.push(reward1);
                }
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

    /** 累计可获得的所有奖励 */
    public get allAwardList() {
        let list = [];
        let allCfg = ObjectUtils.copyObjectArr(this.passAwardList);
        for (let i = 0; i < allCfg.length; i++) {
            let cfg = allCfg[i];
            for (let reward1 of cfg.chargeRewards) {
                list.push(reward1);
            }
            for (let reward1 of cfg.rewards) {
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

    /** =================================================红点===================================================== */

    /** 是否显示红点 */
    public isShowRedOfUIView(UIView?: string) {
        let isShow = false;
        // if (this.isFirstOpen) {
        //     isShow = true;
        //     GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_login, true, [this.activityId]);
        // } else {
        //     GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_login, false, [this.activityId]);
        // }

        if (this.isShowMainRed()) isShow = true;
        // if (!this.activityVo.trialId) return isShow;

        if (UIView == UIActivityKey.CareerTrialsMainView) {
            return this.isShowMainRed();
        } else if (UIView == UIActivityKey.CareerTrialsFundView) {
            return this.isShowFundRed();
        } else if (UIView == UIActivityKey.CareerTrialsBattlePassView) {
            let awardRed = this.isShowPassAwardRed();
            let taskRed = this.isShowPassTaskRed();
            return awardRed || taskRed;
        } else {
            if (this.isShowMainRed()) isShow = true;
            if (this.isShowFundRed()) isShow = true;
            if (this.isShowPassAwardRed()) isShow = true;
            if (this.isShowPassTaskRed()) isShow = true;
        }

        return isShow;
    }

    //职业试炼 -- 主页红点
    public isShowMainRed() {
        GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_login, true, [this.activityId]);
        let b = false;
        for (let i = 0; i < this.cfgs.length; i++) {
            let isShow = !this.isGetDemoReward(false, this._cfgs[i].id) && this.canGetDemoReward(false, this.cfgs[i].id);
            if (isShow) b = true;
            GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_reward, isShow, [this.cfgs[i].id]);
        }
        if (!b) {
            b = GIns.redDotMgr.isHaveRedDot(RedDotKeys.CareerTrials_login, [this.activityId]);
        }
        return b;
    }

    //职业试炼 -- 基金红点
    public isShowFundRed() {
        let isShow = false;

        let allCfgs = this.fundCfgs;
        for (let cfg of allCfgs) {
            let state = this.getFundTaskStatusById(cfg.id);
            if (state == 1) {
                isShow = true;
            }
            GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_fund_item, state == 1, [cfg.id]);
        }

        return isShow;
    }

    //职业试炼 -- 通行证奖励红点
    public isShowPassAwardRed() {
        let isShow = false;
        let allCfgs = this.passAwardList;
        for (let cfg of allCfgs) {
            let state = this.isRewardCanGet(cfg.id);
            if (state) {
                isShow = true;
            }
            let state2 = this.isRewardCanGetByHigh(cfg.id);
            if (state2) {
                isShow = true;
            }
            GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_pass_item_free, state, [cfg.id]);
            GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_pass_item_pay, state2, [cfg.id]);
        }
        return isShow;
    }

    //职业试炼 -- 通行证任务红点
    public isShowPassTaskRed() {
        let isShow = false;
        let allCfgs = this.passTaskList;
        for (let cfg of allCfgs) {
            let taskData = this.getTaskDataById(cfg.id);
            let state = 0;
            if (this.taskIsFinished(cfg.id)) {
                state = 2;
            } else {
                if (taskData && taskData.state == 3) {
                    state = 1;
                    isShow = true;
                }
            }
            GIns.redDotMgr.setRedDot(RedDotKeys.CareerTrials_pass_task_item, state == 1, [cfg.resetType, cfg.id]);
        }
        return isShow;
    }
}
