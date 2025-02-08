import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";
import { LotteryConfigDatas } from "../../../table/activity/rouletteLottery/LotteryConfigDatas";
import { LotteryPoolConfigDatas } from "../../../table/activity/rouletteLottery/LotteryPoolConfigDatas";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { IBtnConfirmViewOnceTodayOpenArgs } from "../../common/confirm/IBtnConfirmViewOnceTodayOpenArgs";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";

/**
 * 抽奖组活动2
 * 转盘抽奖vo
 */
export class ActivityRouletteLotteryVo extends BaseActivityVo {
    public get activityVo(): Vo.activity.RouletteLotteryVo {
        return this.content as any;
    }

    //当前活动配置表
    private _cfg: table.activity.Lottery.LotteryNormalConfig;
    //当前活动所有轮次的配置表
    private _roundCfgs: table.activity.Lottery.LotteryConfig[];
    //当前轮次的配置表
    private _roundCfg: table.activity.Lottery.LotteryConfig;
    //大奖配置表
    private _jackpotPoolCfg: table.activity.Lottery.LotteryPoolConfig;

    /** 当前轮次, 从1开始 */
    private _round: number = 1;
    /** 当前轮次的奖励获得map <奖池配置id, 已获得的数量> */
    public _poolGetCountMap = {};
    /** 当前选择的大奖下标 */
    private _bigRewardIndex: number;
    /** 大奖id, 获得次数 */
    private _jackpotGetCountMap = {};
    /** 所有大奖列表 */
    private _bigAwards;

    /** 当前轮次大奖已抽取个数 */
    public bigRewardChooseCount: number = 0;
    /** 是否跳过动画 */
    public skipAnimation: boolean = false;
    /** 本层是否还弹出提示 */
    public isShowTip: boolean = true;

    //是否所有轮次都抽完了？
    public isAllRoundFinish: boolean = false;

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
            this.isShowTip = true;
        }
        // this._round = this.activityVo.round;
        this._poolGetCountMap = this.activityVo.round2PoolConfigIdNum[this.round] || {};
        this._bigRewardIndex = this.activityVo.round2JackpotIndex[this.round];
        this._jackpotGetCountMap = this.activityVo.jackpotIndex2Num || {};
    }

    /** 当前轮次, 从1开始 */
    public get round(): number {
        return this._round;
    }

    /** 当前选择的大奖下标 */
    public set bigRewardIndex(index: number) {
        this._bigRewardIndex = index;
    }
    public get bigRewardIndex(): number {
        return this._bigRewardIndex;
    }

    /** 当前活动配置表 */
    public get cfg(): table.activity.Lottery.LotteryNormalConfig {
        if (!this._cfg) {
            this._cfg = TableManager.getDataById(table.activity.Lottery.LotteryNormalConfig, this.activityId);
        }
        return this._cfg;
    }
    /** 当前活动所有轮次的配置表 */
    public get roundCfgs(): table.activity.Lottery.LotteryConfig[] {
        if (!this._roundCfgs) {
            this._roundCfgs = LotteryConfigDatas.ins().getConfigsByPoolId(this.activityId);
        }
        return this._roundCfgs;
    }
    /** 当前轮次的配置表 */
    public get roundCfg(): table.activity.Lottery.LotteryConfig {
        if (!this._roundCfg || !(this._roundCfg.startRound >= this.round && this._roundCfg.endRound <= this.round)) {
            for (let cfg of this.roundCfgs) {
                if (cfg.startRound <= this.round && cfg.endRound >= this.round) {
                    this._roundCfg = cfg;
                    break;
                }
            }
        }
        return this._roundCfg;
    }

    /** 根据poolId获取对应的奖池配置 */
    public getPoolCfg(poolId: number): table.activity.Lottery.LotteryPoolConfig[] {
        return LotteryPoolConfigDatas.ins().getConfigsByPoolId(poolId);
    }

    /** 获取大奖奖池配置表 */
    public get jackpotPoolCfg(): table.activity.Lottery.LotteryPoolConfig {
        if (!this._jackpotPoolCfg) {
            for (let cfg of this.getPoolCfg(this.roundCfg.poolId)) {
                if (cfg.rewardType == "JACKPOT") {
                    this._jackpotPoolCfg = cfg;
                    break;
                }
            }
        }

        return this._jackpotPoolCfg;
    }

    /** 根据奖池配置唯一id 获取奖励可获得剩余次数 */
    public getPoolLeftGetCount(poolId: number): number {
        const poolCfg = LotteryPoolConfigDatas.ins().getConfigById(poolId);
        if (poolCfg) {
            if (this._poolGetCountMap && this._poolGetCountMap[poolId]) {
                return poolCfg.amount - this._poolGetCountMap[poolId];
            }
            return poolCfg.amount;
        }
        return 0;
    }

    /** 添加已抽奖励次数 */
    public addPoolGetCount(poolId: number) {
        if (this._poolGetCountMap && this._poolGetCountMap[poolId]) {
            this._poolGetCountMap[poolId]++;
        } else {
            this._poolGetCountMap[poolId] = 1;
        }
    }

    /** 根据index获取当前大奖剩余可选次数 */
    public getBigRewardLeftChooseCount(index: number): number {
        if (this._cfg.jackpotLimits[index] > 0) {
            const num = this._cfg.jackpotLimits[index] - (this._jackpotGetCountMap[index] || 0);
            return num;
        }
        return -1;
    }

    /** 添加大奖选择次数 */
    public addBigRewardChooseCount(index: number) {
        const num = this._jackpotGetCountMap[index];
        if (num > 0) {
            this._jackpotGetCountMap[index]++;
        } else {
            this._jackpotGetCountMap[index] = 1;
        }
    }

    //获取所有大奖列表
    public getBigRewards() {
        if (!this._bigAwards) {
            this._bigAwards = this.roundCfgs[this.roundCfgs.length - 1].bigRewardArray;
        }
        return this._bigAwards;
    }

    /** 当前奖励还有多少轮解锁 */
    getBigRewardUnlockRound(itemdata: any): number {
        let num = 0;
        for (let cfg of this.roundCfgs) {
            for (let item of cfg.bigRewardArray) {
                if (item.k == itemdata.k) {
                    return cfg.startRound - this.round;
                }
            }
        }
        return num;
    }

    //打开是否进入下一关的提示弹窗
    public openNextWin() {
        let uiParam: IBtnConfirmViewOnceTodayOpenArgs = {
            title: CommonI18nKeys.tipsForConfirm,
            content: `您已获得本层星元大奖，\n是否要直接进入下一层？\n当前所在层数：第[color=#6AFF63]${this.round}[/color]层`,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            localKey: null,
            lbTip: "本层不再提示",
            onClickConfirm: () => {
                this.openTtial();
            },
            onSelectedFun: () => {
                this.isShowTip = false;
            },
        };
        G.UIManager.open(UICommonKey.BtnConfirmOnceTodayWin, uiParam);
    }

    //进入下一层
    private openTtial() {
        let syncData = {
            activityId: this.activityId,
            itemId: "NEXT_ROUND",
            key: "NEXT_ROUND",
            hidePopWin: 1,
        } as ActivitySyncData;
        GIns.activityModel.sendActionByKey(syncData);
    }
}
