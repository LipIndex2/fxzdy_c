import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { SignInConfigManager } from "db://assets/scripts/game/modules/activity/signIn/config/SignInConfigManager";

/**
 * 签到vo
 */
export class ActivitySignInVo extends BaseActivityVo {
    private _allSignCfgs: table.activity.Sign.SignRewardConfig[];

    public _isFirst: boolean = true;

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.SignVo {
        return this.content as Vo.activity.SignVo;
    }

    onInitDone() {
        G.GameTimer.once(500, this, this.isShowRed);
    }

    /** 签到表所有数据 */
    public get signCfgs(): table.activity.Sign.SignRewardConfig[] {
        if (!this._allSignCfgs) {
            this._allSignCfgs = TableManager.getAllData(table.activity.Sign.SignRewardConfig);
        }
        return this._allSignCfgs;
    }

    /** 签到列表 */
    public get signList(): table.activity.Sign.SignRewardConfig[] {
        let list = [];
        for (let i = 0; i < this.signCfgs.length; i++) {
            let cfg = this.signCfgs[i];
            if (cfg.activityId == this.activityId) {
                list.push(cfg);
            }
        }
        return list;
    }

    /** 累计签到奖励配置 */
    public get totalSignRewardCfgs(): table.activity.Sign.SignRewardConfig[] {
        let list = [];
        for (let i = 0; i < this.signCfgs.length; i++) {
            let cfg = this.signCfgs[i];
            if (cfg.activityId == this.activityId && cfg.totalDropId) {
                list.push(cfg);
            }
        }
        return list;
    }

    private _heroConfigs: table.hero.HeroConfig[];

    /**
     * 获取对应英雄碎片id的英雄id
     */
    public getHeroItemIdToHeroId(id: number): number {
        if (!this._heroConfigs) this._heroConfigs = G.TableManager.getAllData(table.hero.HeroConfig);
        for (let i = 0; i < this._heroConfigs.length; i++) {
            if (this._heroConfigs[i].fragmentItemId === id) {
                return this._heroConfigs[i].id;
            }
        }
        return 0;
    }

    /**
     * 签到送英雄
     * 奖励预览 -- 所有英雄
     */
    public get totalHeroIds() {
        let allHeroByQuality: { [quality: number]: number[] } = {};

        //普通签到
        let allSignCfgs = this.signList;
        for (let i = 0; i < allSignCfgs.length; i++) {
            let cfg = allSignCfgs[i];
            let item = cfg.dailyRewards[0];
            let itemConfig = ItemUtils.getItemConfigByItemId(item.k);
            if (ServerEnums.ItemType[itemConfig.type] == ServerEnums.ItemType.HERO_CARD) {
                if (!allHeroByQuality[itemConfig.quality]) allHeroByQuality[itemConfig.quality] = [];
                let isHas = true;
                for (let id of allHeroByQuality[itemConfig.quality]) {
                    if (id == itemConfig.id) {
                        isHas = false;
                    }
                }
                if (isHas) allHeroByQuality[itemConfig.quality].push(itemConfig.id);
            }
        }
        //随机奖池
        let totalSignRewardCfgs = this.totalSignRewardCfgs;
        for (let i = 0; i < totalSignRewardCfgs.length; i++) {
            let cfg2 = totalSignRewardCfgs[i];
            let id2 = cfg2.totalDropId;
            let dropCfg = TableManager.getDataById(table.reward.RewardDropConfig, id2);
            for (let i = 0; i < dropCfg.rewards.length; i++) {
                let item2 = dropCfg.rewards[i];
                let itemId = item2.k.split(",")[1];
                let itemConfig2 = ItemUtils.getItemConfigByItemId(itemId);
                if (ServerEnums.ItemType[itemConfig2.type] == ServerEnums.ItemType.HERO_CARD) {
                    if (!allHeroByQuality[itemConfig2.quality]) allHeroByQuality[itemConfig2.quality] = [];
                    let isHas2 = true;
                    for (let id of allHeroByQuality[itemConfig2.quality]) {
                        if (id == itemConfig2.id) {
                            isHas2 = false;
                        }
                    }
                    if (isHas2) allHeroByQuality[itemConfig2.quality].push(itemConfig2.id);
                }
            }
        }

        return allHeroByQuality;
    }

    /**
     * 判断该物品id是否在当前活动领取过
     */
    public getHadDrawRewardIds(id: number) {
        //签到奖励
        for (let i = 0; i < this.activityVo.dailyRewardIds.length; i++) {
            let cfgId = this.activityVo.dailyRewardIds[i];
            let rewardId = TableManager.getDataById(table.activity.Sign.SignRewardConfig, cfgId);
            if (rewardId.dailyRewards[0].k == id) {
                return true;
            }
        }
        //累计奖励
        let keys = Object.keys(this.activityVo.totalRewardId2ItemIdMap);
        for (let key of keys) {
            let rewardId = this.activityVo.totalRewardId2ItemIdMap[key];
            if (rewardId == id) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取当前奖励的状态
     * 0：待领取
     * 1：可领取
     * 2：已领取
     */
    public isCanGetAwardById(id: number) {
        let state = 0;
        if (this.isCanDrawReward(id)) {
            state = 1;
        }
        if (this.isHadDrawReward(id)) {
            state = 2;
        }
        return state;
    }

    /**
     * 奖励是否可领取
     * @param id
     */
    public isCanDrawReward(id: string | number): boolean {
        let cfg = TableManager.getDataById(table.activity.Sign.SignRewardConfig, id);
        return this.activityVo.totalLoginDays >= cfg.condition;
    }

    /**签到奖励是否被领取
     * @param rewardId 各个活动模块对应配置的奖励id
     */
    public isHadDrawReward(rewardId: string | number): boolean {
        let state = false;
        //已领取的奖励Id列表
        for (let id of this.activityVo.dailyRewardIds) {
            if (rewardId == id) {
                state = true;
            }
        }
        return state;
    }

    /**
     * 累计奖励是否被领取
     */
    public isHadGetTotalReward(rewardId: string | number): boolean {
        let state = false;
        //已领取的奖励Id列表
        // for(let id of this.activityVo.totalRewardId2ItemIdMap){
        //     if(rewardId == id){
        //         state = true;
        //     }
        // }
        if (this.activityVo.totalRewardId2ItemIdMap[rewardId]) state = true;
        return state;
    }

    /**更新奖励获取数据
     * @param rewardId 各个活动模块对应配置的奖励id
     */
    public updateRewardInfo(rewardId: number): void {
        this.activityVo.dailyRewardIds.push(rewardId);
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        // 没有奖励了
        // if (!this.hasAward()) {
        //     return true;
        // }

        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        if (this.isDone()) {
            return true;
        }

        // 全部奖励领完
        if (this.isDayRewardAllGain()) {
            return true;
        }

        return false;
    }

    /**
     * 所有天数奖励领取 ？
     * @private
     */
    private isDayRewardAllGain() {
        const configs = SignInConfigManager.getConfigArrayByActivityId(this.activityId);
        const length = this.activityVo.dailyRewardIds?.length || 0;
        return length == configs.length;
    }

    /** 是否有可以领取的奖励 */
    public hasAward() {
        for (let i = 0; i < this.signCfgs.length; i++) {
            let cfg = this.signCfgs[i];
            if (cfg.activityId == this.activityId) {
                if (this.isCanGetAwardById(cfg.id) == 1) {
                    return true;
                }
            }
        }
        return false;
    }

    /** 红点 */
    public isShowRed(): boolean {
        //写入对应活动的红点判断方法
        if (this.isDone()) return false;

        if (this.isActivityOver()) return false;

        let hasRedDot = this.hasAward();
        if (hasRedDot) {
            return hasRedDot;
        }
        let totalCfg = this.totalSignRewardCfgs;
        for (let i = 0; i < totalCfg.length; i++) {
            if (this.activityVo.dailyRewardIds.length >= totalCfg[i].condition) {
                if (this.isHadGetTotalReward(totalCfg[i].id) == false) {
                    hasRedDot = true;
                    break;
                }
            }
        }
        return hasRedDot;
    }

    private _activityClientCfg: table.activity.ActivityConstant.ActivityClientConfig;
    public get activityClientCfg() {
        if (!this._activityClientCfg) {
            let allcfg = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
            for (let cfg of allcfg) {
                if (cfg && cfg.typeParam == this.activityId) {
                    this._activityClientCfg = cfg;
                }
            }
        }
        return this._activityClientCfg;
    }
}
