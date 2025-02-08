import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 冲榜vo
 */
export class ActivityRushRankVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.RushRankVo {
        return this.content as Vo.activity.RushRankVo;
    }

    //冲榜配置表
    private _rushRankConfig: table.activity.RushRank.RushRankConfig;
    //冲榜奖励配置表
    private _rushRankRewardCfgs: table.activity.RushRank.RushRankRewardConfig[];
    //首通奖励配置表
    private _firstPassCfgs: table.activity.RushRank.RushRankFirstPassTrunkInstanceConfig[];
    //序列校验首通配置map  序列校验配置Id : 首通配置列表
    private _firstPassCfgMap: { [key: string]: table.activity.RushRank.RushRankFirstPassLadderConfig[] };

    //轮次是否变动
    public isRoundChange: boolean = false;
    //当前轮次
    private _round: number = 0;

    onInitDone(): void {
        this.isShowRed();
    }

    /** 冲榜配置表 */
    public get rushRankConfig(): table.activity.RushRank.RushRankConfig {
        if (!this._rushRankConfig) {
            let cfgs = TableManager.getAllData(table.activity.RushRank.RushRankConfig);
            for (let cfg of cfgs) {
                if (cfg.activityId == this.activityId) {
                    this._rushRankConfig = cfg;
                    break;
                }
            }
        }
        return this._rushRankConfig;
    }

    /** 冲榜奖励配置表 */
    public get rushRankRewardCfgs(): table.activity.RushRank.RushRankRewardConfig[] {
        if (!this._rushRankRewardCfgs || this.isRoundChange) {
            this._rushRankRewardCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.RushRank.RushRankRewardConfig);
            for (let cfg of cfgs) {
                if (cfg.rushRankId == this.rushRankConfig.id && cfg.round == this.round) {
                    this._rushRankRewardCfgs.push(cfg);
                }
            }
            this.isRoundChange = false;
        }
        return this._rushRankRewardCfgs;
    }

    /**  首通配置表列表 */
    public get firstPassCfgs(): table.activity.RushRank.RushRankFirstPassTrunkInstanceConfig[] {
        if (!this._firstPassCfgs) {
            this._firstPassCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.RushRank.RushRankFirstPassTrunkInstanceConfig);
            for (let cfg of cfgs) {
                if (cfg.activityId == this.activityId) {
                    this._firstPassCfgs.push(cfg);
                }
            }
        }
        return this._firstPassCfgs;
    }

    /** 获取序列校验首通配置map */
    public get firstPassCfgMap(): { [key: number]: table.activity.RushRank.RushRankFirstPassLadderConfig[] } {
        if (this._firstPassCfgMap) return this._firstPassCfgMap;

        this._firstPassCfgMap = {};
        let allCfg = TableManager.getAllData(table.activity.RushRank.RushRankFirstPassLadderConfig);
        for (let cfg of allCfg) {
            if (cfg.activityId == this.activityId) {
                if (!this._firstPassCfgMap[cfg.career]) {
                    this._firstPassCfgMap[cfg.career] = [];
                }
                this._firstPassCfgMap[cfg.career].push(cfg);
            }
        }
        return this._firstPassCfgMap;
    }

    /** 获取首通信息Vo  null则表示没有首通 */
    public firstPassInfoList(instanceId: number): Vo.trunkinstance.TrunkInstanceFirstPassVo {
        if (!this.activityVo.firstPassVos) return null;
        for (let info of this.activityVo.firstPassVos) {
            if (info.instanceId == instanceId) {
                return info;
            }
        }
        return null;
    }

    /** 获取序列校验首通信息Vo  null则表示没有首通 */
    public firstPassInfoList2(ladderId: number): Vo.ladder.LadderFirstPassVo {
        if (!this.activityVo.ladderFirstPassVos) return null;
        for (let info of this.activityVo.ladderFirstPassVos) {
            if (info.ladderId == ladderId) {
                return info;
            }
        }
        return null;
    }

    /** 判断是否已领取首通奖励 */
    public isHadGetFirstPassReward(cfgId: number): boolean {
        if (!this.activityVo.firstPassTrunkInstanceIds) return false;
        for (let id of this.activityVo.firstPassTrunkInstanceIds) {
            if (id == cfgId) {
                return true;
            }
        }
        return false;
    }

    /** 判断是否已领取序列校验首通奖励 */
    public isHadGetFirstPassReward2(cfgId: number): boolean {
        if (!this.activityVo.firstPassLadderIds) return false;
        for (let id of this.activityVo.firstPassLadderIds) {
            if (id == cfgId) {
                return true;
            }
        }
        return false;
    }

    /** 当前轮次 */
    public get round() {
        this.getNextEndTime();
        if (this._round > this.rushRankConfig.limits.length) this._round = this.rushRankConfig.limits.length;

        return this._round;
    }

    /** 当前轮次上榜要求 */
    public get roundLimit() {
        return this.rushRankConfig.limits[this.round - 1];
    }

    /** 获取下一个展示时间 */
    public getNextEndTime() {
        let round = this._round;
        this._round = 0;
        let leftTime = G.TimeManager.serverNow - this.startTime;
        for (let time of this.rushRankConfig.roundSettleHours) {
            let showTime = time * 60 * 60 * 1000;
            this._round++;
            if (showTime > leftTime) {
                if (round != this._round) this.isRoundChange = true;
                return showTime;
            }
        }
        if (round != this._round) this.isRoundChange = true;
        return null;
    }

    /**获取当前的结算阶段 0代表未进入任何结算*/
    public getCurSettleRound(): number {
        let arr = this.rushRankConfig.roundSettleHours;
        let nowTime: number = G.TimeManager.serverNow;
        let settleRound: number = 0;
        for (let i = arr.length - 1; i >= 0; i--) {
            let settleTime = arr[i] * 3600000 + this.startTime;
            if (nowTime >= settleTime) {
                //代表进入了结算 前端round从1开始
                settleRound = i + 1;
                break;
            }
        }
        return settleRound;
    }

    public isShowRed(): boolean {
        let isShow = false;
        for (let cfg of this.firstPassCfgs) {
            if (cfg && !this.isHadGetFirstPassReward(cfg.id) && this.firstPassInfoList(cfg.instanceId)) {
                GIns.redDotMgr.setRedDot(RedDotKeys.RankActivity_reward_item, true, [cfg.activityId, cfg.id]);
                isShow = true;
            } else {
                GIns.redDotMgr.setRedDot(RedDotKeys.RankActivity_reward_item, false, [cfg.activityId, cfg.id]);
            }
        }

        let keys = Object.keys(this.firstPassCfgMap);
        for (let key of keys) {
            let cfgs = this.firstPassCfgMap[key];
            let tabRed = false;
            for (let cfg of cfgs) {
                if (cfg && !this.isHadGetFirstPassReward2(cfg.id) && this.firstPassInfoList2(cfg.ladderId)) {
                    GIns.redDotMgr.setRedDot(RedDotKeys.RankActivity_reward_item, true, [cfg.activityId, cfg.id]);
                    tabRed = true;
                    isShow = true;
                } else {
                    GIns.redDotMgr.setRedDot(RedDotKeys.RankActivity_reward_item, false, [cfg.activityId, cfg.id]);
                }
            }
            GIns.redDotMgr.setRedDot(RedDotKeys.RankActivity_tab, tabRed, [this.activityId, key]);
        }

        return isShow;
    }
}
