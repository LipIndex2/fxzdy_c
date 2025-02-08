import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 抽奖组活动3
 * 召唤英雄vo
 */
export class ActivitySummonHeroVo extends BaseActivityVo {
    public get activityVo(): Vo.activity.CallHeroVo {
        return this.content as any;
    }

    // 所有招募活动配置表
    private _allCfgs: table.activity.Recruit.ActivityRecruitConfig[];
    // 当前活动配置表
    private _cfg: table.activity.Recruit.ActivityRecruitConfig;

    //当前活动所有层的配置表
    private _roundCfgs: table.activity.Recruit.ActivityRecruitRoundConfig[];
    //当前层活动配置表
    private _roundCfg: table.activity.Recruit.ActivityRecruitRoundConfig;

    /** 当前轮次, 从1开始 */
    private _round: number = 1;
    /** 当前选择的大奖id */
    private _bigRewardId: number;
    /** 二等奖id map  {大奖id： 二等奖id} */
    private _secondRewardIdMap: { [key: number]: number };

    /** 大奖Id-获得次数 */
    private _jackpotGetCountMap = {};

    /** 玩家获得大奖记录 */
    private _recordVos;

    /** 是否跳过动画 */
    public skipAnimation: boolean = false;
    // 保底次数
    private _miniCount: number;

    //是否所有轮次都抽完了？
    public isAllRoundFinish: boolean = false;

    //大奖可选次数map
    public jackpotId2NumMap: { [key: number]: number };

    //标题
    public title: string;

    onInitDone(): void {
        if (this._round != this.activityVo.round) {
            //兼容最后一层，后端是无限加的，会超出表的层数
            if (this.activityVo.round > this.roundCfgs[this.roundCfgs.length - 1].endRound) {
                this._round = this.roundCfgs[this.roundCfgs.length - 1].endRound;
                this.isAllRoundFinish = true;
            } else {
                this._round = this.activityVo.round;
                this.isAllRoundFinish = false;
            }
        }

        this._jackpotGetCountMap = this.activityVo.jackpotId2Num || {};
        // this._recordVos = this.activityVo.recordVos || [];
        this._bigRewardId = this.activityVo.round2JackpotId[this.round];
    }

    public get allCfgs(): table.activity.Recruit.ActivityRecruitConfig[] {
        if (!this._allCfgs) {
            this._allCfgs = TableManager.getAllData(table.activity.Recruit.ActivityRecruitConfig);
        }
        return this._allCfgs;
    }

    /** 当前活动所有层的配置表 */
    public get roundCfgs(): table.activity.Recruit.ActivityRecruitRoundConfig[] {
        if (!this._roundCfgs) {
            this._roundCfgs = [];
            let allCfg = TableManager.getAllData(table.activity.Recruit.ActivityRecruitRoundConfig);
            for (let cfg of allCfg) {
                if (cfg.activityId == this.activityId) {
                    this._roundCfgs.push(cfg);
                }
            }
        }
        return this._roundCfgs;
    }

    /** 当前活动配置表 */
    public get cfg(): table.activity.Recruit.ActivityRecruitConfig {
        if (!this._cfg) {
            let allCfgs = this.allCfgs;
            for (let cfg of allCfgs) {
                if (cfg.activityId == this.activityId) {
                    this._cfg = cfg;
                    break;
                }
            }
        }
        return this._cfg;
    }

    /** 当前层活动配置表 */
    public get roundCfg(): table.activity.Recruit.ActivityRecruitRoundConfig {
        if (!this._roundCfg) {
            let allCfgs = this.roundCfgs;
            for (let cfg of allCfgs) {
                if (cfg.startRound <= this.round && cfg.endRound >= this.round) {
                    this._roundCfg = cfg;
                    break;
                }
            }
        }
        return this._roundCfg;
    }

    /** 当前轮次, 从1开始 */
    public get round(): number {
        return this._round;
    }

    /** 当前选择的大奖id */
    public set bigRewardId(id: number) {
        this._bigRewardId = id;
    }
    public get bigRewardId(): number {
        return this._bigRewardId;
    }
    /** 当前选择的二等奖id */
    public get secondRewardId(): number {
        if (!this._secondRewardIdMap) this.setSecondMap();
        return this._secondRewardIdMap[this.bigRewardId];
    }

    private setSecondMap() {
        this._secondRewardIdMap = {};
        for (let i = 0; i < this.roundCfg.jackpots.length; i++) {
            let id = this.roundCfg.jackpots[i];
            this._secondRewardIdMap[id] = this.roundCfg.seconds[i];
        }
    }

    /** 保底次数 */
    public set miniCount(value: number) {
        this.activityVo.guaranteedTimes = value;
    }
    public get miniCount(): number {
        if (!this._miniCount) {
            this._miniCount = +TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:RECRUIT_JACKPOT_GUARANTEE_TIMES").content;
        }
        return this._miniCount - this.activityVo.guaranteedTimes;
    }

    /** 获奖记录 */
    public set record(value: Vo.activity.CallHeroJackpotRecordVo) {
        if (this._recordVos) {
            if (this._recordVos.length >= 20) {
                this._recordVos.shift();
            }
        } else {
            this._recordVos = [];
        }
        this._recordVos.push(value);
        G.FacadeManager.emit(NotificationKey.LOTTERY_GROUP_NEW_BIG_REWARD);
    }
    public get record(): Vo.activity.CallHeroJackpotRecordVo[] {
        if (!this._recordVos) {
            this._recordVos = this.activityVo.recordVos;
            this._recordVos.reverse();
        }
        return this._recordVos;
    }

    /** 当前奖励还有多少轮解锁 */
    getBigRewardUnlockRound(itemid: any): number {
        let num = 0;
        // let cfg = this.allCfg[this._curRoundId];
        for (let cfg of this.roundCfgs) {
            for (let id of cfg.jackpots) {
                if (id == itemid) {
                    return cfg.startRound - this.round;
                }
            }
        }
        return num;
    }

    /** 根据id获取当前大奖剩余可选次数 */
    getBigRewardLeftChooseCount(id: number): number {
        if (!this.cfg.jackpotLimitInfo) return -1;

        if (!this.jackpotId2NumMap) {
            this.jackpotId2NumMap = {};
            for (let item of this.cfg.jackpotLimitInfo) {
                if (!this.jackpotId2NumMap[item.k]) {
                    this.jackpotId2NumMap[item.k] = item.v;
                }
            }
        }

        let count = -1;
        if (this.jackpotId2NumMap[id]) {
            count = this.jackpotId2NumMap[id] - (this._jackpotGetCountMap[id] || 0);
        }

        return count;
    }

    public isShowRed(): boolean {
        if (this.activityVo.passTrial && !this.activityVo.receivedTrialReward) {
            return true;
        }
        return false;
    }
}
