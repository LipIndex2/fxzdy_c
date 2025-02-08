import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumActivityRespType } from "db://assets/scripts/game/comm/activity/enums/EnumActivityRespType";
import GIns from "db://assets/scripts/game/GIns";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ActivityFlipCardConfigManager } from "db://assets/scripts/game/modules/activity/activityFlipCard/config/ActivityFlipCardConfigManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";

export enum EnumFlipCardState {
    NO = 1,
    FLIP_NO_GAIN = 2,
    FLIP_AND_GAIN = 3,
}

/**
 * 翻牌
 */
export class ActivityFlipCardModelVo extends BaseActivityVo {
    // 轮次
    private _curRoundId = 0;
    // 选择的大奖下标
    private _chooseBigRewardIndex: number = 0;
    // <格子, 状态>
    private _gridIndexToStateMap: Map<number, EnumFlipCardState> = new Map();
    public get gridIndexToStateMap(): Map<number, EnumFlipCardState> {
        return this._gridIndexToStateMap;
    }
    // <格子, 奖励>
    private _gridIndexToFlipConfigIdMap: Map<number, number> = new Map();
    // <轮次, 大奖index>
    private _roundIdToBigRewardIndexMap: Map<number, number> = new Map();

    /** 大奖id, 获得次数 */
    private _jackpotIndex2NumMap = {};

    public get activityVo(): Vo.activity.LotteryVo {
        return this.content as any;
    }

    onServerResp(type: EnumActivityRespType, serverRespObj: any | null, req: ActivitySyncData) {
        if (type == EnumActivityRespType.GAIN_ITEM) {
            // 领奖
            const array = req.itemId.split("_");
            const gridIndex = array[1].toInt();

            this._gridIndexToStateMap.merge(gridIndex, EnumFlipCardState.FLIP_AND_GAIN, (v1, v2) => Math.max(v1, v2));

            FacadeManager.ins().emit(NotificationKey.FLIP_CARD_GAIN, gridIndex);
        }
        if (type == EnumActivityRespType.BUY) {
            // TODO
            if (req.itemId == "JACKPOT") {
                // 选择大奖
                this._roundIdToBigRewardIndexMap.set(this._curRoundId, this._chooseBigRewardIndex);

                FacadeManager.ins().emit(NotificationKey.FLIP_CARD_CHOOSE_BIG_REWARD, this.activityId);
            }

            if (req.itemId == "LOTTERY") {
                const gridIndex = req.otherParams.toInt();

                // 翻牌
                const poolConfigId = serverRespObj as number;
                this._gridIndexToFlipConfigIdMap.set(gridIndex, poolConfigId);
                this._gridIndexToStateMap.merge(gridIndex, EnumFlipCardState.FLIP_NO_GAIN, (v1, v2) => Math.max(v1, v2));

                FacadeManager.ins().emit(NotificationKey.FLIP_CARD_NEW, gridIndex);
            }
        }
        FacadeManager.ins().emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
    }

    onInitDone() {
        const vo = this.activityVo;
        if (!vo) {
            return;
        }
        this._gridIndexToStateMap = new Map();
        this._gridIndexToFlipConfigIdMap = new Map();
        this._roundIdToBigRewardIndexMap = new Map();

        const curRoundId = vo.round;
        this._curRoundId = curRoundId;

        // 第X轮-<已抽取格子，奖池配置Id>
        const o1 = vo.round2GridPoolConfigId || {};
        for (let string of Object.keys(o1)) {
            const gridIndexToFlipConfigIdObj = o1[string] || {};
            const tempRoundId = string.toInt();
            if (tempRoundId == curRoundId) {
                for (let gridIndexStr in gridIndexToFlipConfigIdObj) {
                    const gridIndex = gridIndexStr.toInt();
                    const value = gridIndexToFlipConfigIdObj[gridIndexStr];
                    const flipConfigId = value as number;

                    this._gridIndexToStateMap.set(gridIndex, EnumFlipCardState.FLIP_NO_GAIN);
                    this._gridIndexToFlipConfigIdMap.set(gridIndex, flipConfigId);
                }
            }
        }

        // 第X轮-已领取格子列表
        const o2 = vo.round2ReceivedGrids || {};
        for (let string of Object.keys(o2)) {
            const gainGridIds = o2[string] || [];
            const tempRoundId = string.toInt();
            if (tempRoundId == curRoundId) {
                for (let id of gainGridIds) {
                    this._gridIndexToStateMap.set(id, EnumFlipCardState.FLIP_AND_GAIN);
                }
            }
        }

        // 第X轮-选择大奖下标
        const o3 = vo.round2JackpotIndex || {};
        for (let string of Object.keys(o3)) {
            const bigRewardIndex: number = o3[string] || 0;
            const roundId = string.toInt();

            this._roundIdToBigRewardIndexMap.set(roundId, bigRewardIndex);
        }

        this._chooseBigRewardIndex = this._roundIdToBigRewardIndexMap.getOrDefault(this._curRoundId, 0);

        //大奖获得次数
        this._jackpotIndex2NumMap = vo.jackpotIndex2Num || {};
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }
        return false;
    }

    public isShowRed(): boolean {
        let isShowRed = false;
        const flipCardCount = this.getFlipCardCount();
        for (let i = 0; i < flipCardCount; i++) {
            const gridState = this._gridIndexToStateMap.getOrDefault(i, EnumFlipCardState.NO);
            if (gridState == EnumFlipCardState.FLIP_NO_GAIN) {
                RedDotManager.ins().setRedDot(RedDotKeys.ActivityFlipCard_grid, true, [i]);

                isShowRed = true;
            } else {
                RedDotManager.ins().setRedDot(RedDotKeys.ActivityFlipCard_grid, false, [i]);
            }
        }

        return isShowRed;
    }

    // 领奖
    sendGainCard(gridIndex: number) {
        // TODO
        ActivityModel.ins().sendDrawItemReward({
            activityId: this.activityId,
            itemId: `${this._curRoundId}_${gridIndex}`,
            times: 1,
            hidePopWin: 2,
        } as ActivitySyncData);
    }

    // 翻牌
    sendFlipCard(gridIndex: number) {
        // TODO
        ActivityModel.ins().sendBuyGoods({
            activityId: this.activityId,
            itemId: `LOTTERY`,
            times: 1,
            hidePopWin: 1,
            otherParams: `${gridIndex}`,
        } as ActivitySyncData);
    }

    // 选择大奖
    sendChooseBigReward(index: number) {
        this._chooseBigRewardIndex = index;
        // TODO
        ActivityModel.ins().sendBuyGoods({
            activityId: this.activityId,
            itemId: `JACKPOT`,
            times: 1,
            otherParams: `${this._curRoundId}_${index}`,
            hidePopWin: 1,
        } as ActivitySyncData);
    }

    /**
     * 是否翻拍
     * @param gridIndex
     */
    isFlipCard(gridIndex: number): boolean {
        return this._gridIndexToStateMap.getOrDefault(gridIndex, EnumFlipCardState.NO) >= EnumFlipCardState.FLIP_NO_GAIN;
    }

    isGain(gridIndex: number): boolean {
        return this._gridIndexToStateMap.getOrDefault(gridIndex, EnumFlipCardState.NO) >= EnumFlipCardState.FLIP_AND_GAIN;
    }

    getCurrentRoundId(): number {
        return this._curRoundId;
    }

    getBigRewardArray(): NoOwnerItem[] {
        return ActivityFlipCardConfigManager.getBigRewardArray(this.activityId, this._curRoundId);
    }

    private _bigAwards;
    //获取所有大奖列表
    getBigRewards() {
        if (!this._bigAwards) {
            this._bigAwards = this.allCfg[this.allCfg.length - 1].bigRewardArray;
        }
        return this._bigAwards;
    }

    /** 当前奖励还有多少轮解锁 */
    getBigRewardUnlockRound(itemdata: any): number {
        let num = 0;
        // let cfg = this.allCfg[this._curRoundId];
        for (let cfg of this.allCfg) {
            for (let item of cfg.bigRewardArray) {
                if (item.k == itemdata.k) {
                    return cfg.startRound - this._curRoundId;
                }
            }
        }
        return num;
    }

    private _allCfg: table.activity.Lottery.LotteryConfig[];
    get allCfg() {
        if (!this._allCfg) {
            let all = TableManager.getAllData(table.activity.Lottery.LotteryConfig);
            this._allCfg = [];
            for (let cfg of all) {
                if (cfg.activityId == this.activityId) {
                    this._allCfg.push(cfg);
                }
            }
            // this._allCfg = TableManager.getAllData(table.activity.Lottery.LotteryConfig);
        }
        return this._allCfg;
    }

    getMyChooseBigReward(): NoOwnerItem | null {
        return this.getBigRewardArray()[this._chooseBigRewardIndex];
    }

    getGainReward(gridIndex: number): NoOwnerItem {
        if (this.isBigRewardGrid(gridIndex)) {
            if (this.isFlipCard(gridIndex)) {
                // 翻牌 + 大奖
                return this.getBigRewardArray()[this._chooseBigRewardIndex];
            }
        }
        const cid = this._gridIndexToFlipConfigIdMap.get(gridIndex);
        if (!cid) {
            // Logger.game(`后端还没告诉你拿到了什么奖励. gridIndex = ${gridIndex}`);
            return null;
        }
        const itemKvArray = ActivityFlipCardConfigManager.getPoolConfigById(cid)?.rewards || [];
        return ItemUtils.parseKvArrayToOnlyOneItem(itemKvArray);
    }

    isChooseBigReward(): boolean {
        return this._chooseBigRewardIndex >= 0;
    }

    getMyChooseBigRewardIndex(): number {
        return this._chooseBigRewardIndex;
    }

    private _costItem: NoOwnerItem;
    getFlipCardCostItem(): NoOwnerItem {
        if (!this._costItem) {
            this._costItem = NoOwnerItem.create(this.lotteryNormalConfig.costItems[0].k, this.lotteryNormalConfig.costItems[0].v);
        }
        return this._costItem;

        // const cs = ActivityFlipCardConfigManager.getCostItemByActivityId(this.activityId) || [];
        // return cs[0];
    }

    /**
     * 是否大奖格子
     * @param gridIndex
     */
    isBigRewardGrid(gridIndex: number): boolean {
        const cid = this._gridIndexToFlipConfigIdMap.get(gridIndex);
        if (!cid) {
            return false;
        }
        const poolC = ActivityFlipCardConfigManager.getPoolConfigById(cid);
        if (!poolC) {
            return false;
        }
        return poolC.rewardType == "JACKPOT";
    }

    // 是否有翻拍大奖格子
    isHaveFlipBigReward(): boolean {
        let isHave = false;
        this._gridIndexToFlipConfigIdMap.forEach((value, key) => {
            const poolC = ActivityFlipCardConfigManager.getPoolConfigById(value);
            if (poolC?.rewardType == "JACKPOT") {
                isHave = true;
            }
        });
        return isHave;
    }

    getOneLineGridCount(): number {
        const c = this.getConfig();
        return c?.oneLineGridCount || 5;
    }

    getConfig() {
        return ActivityFlipCardConfigManager.getConfigByActivityIdAndRoundId(this.activityId, this._curRoundId);
    }

    isHaveNextRound(): boolean {
        const nextRoundId = this._curRoundId + 1;
        const nextConfig = ActivityFlipCardConfigManager.getConfigByActivityIdAndRoundId(this.activityId, nextRoundId);
        // 最大轮次
        return nextConfig != null;
    }

    goToNextRound() {
        const nextRoundId = this._curRoundId + 1;
        const nextConfig = ActivityFlipCardConfigManager.getConfigByActivityIdAndRoundId(this.activityId, nextRoundId);
        // 最大轮次
        if (!nextConfig) {
            Logger.game(`[翻牌活动] 已到到最大轮次. round = ${this._curRoundId}`);
            // FacadeManager.ins().emit(NotificationKey.FLIP_CARD_NEXT_ROUND);
            return;
        }

        // 下一轮
        this._curRoundId += 1;

        this._chooseBigRewardIndex = 0;
        this._gridIndexToFlipConfigIdMap = new Map();
        this._roundIdToBigRewardIndexMap = new Map();
        this._gridIndexToStateMap = new Map();

        // choose big reward
        this.sendChooseBigReward(nextConfig.defaultBigAwardIndex);

        // FacadeManager.ins().emit(NotificationKey.FLIP_CARD_NEXT_ROUND);
    }

    isCanSeeOneKey(): boolean {
        const flipCardCostItem = this.getFlipCardCostItem();
        let maxCanPayCount = BackpackManager.ins().getMaxCanPayCount(flipCardCostItem);

        // 30+ 才能看到
        if (maxCanPayCount < 30) {
            return false;
        }

        // 如果翻过任何一个, 就
        let isCanSee = true;
        for (let [gridIndex, state] of this._gridIndexToFlipConfigIdMap) {
            if (state >= EnumFlipCardState.FLIP_NO_GAIN) {
                isCanSee = false;
                break;
            }
        }

        return isCanSee;
    }

    isCanUseOneKey(): boolean {
        const flipCardCostItem = this.getFlipCardCostItem();
        const maxCanPayCount = BackpackManager.ins().getMaxCanPayCount(flipCardCostItem);
        return maxCanPayCount >= 1;
    }

    getFlipCardCount(): number {
        const c = ActivityFlipCardConfigManager.getConfigByActivityIdAndRoundId(this.activityId, this._curRoundId);
        if (!c) {
            return 0;
        }
        return c.oneLineGridCount * c.oneLineGridCount;
    }

    sendOneKeyFlipCard(doneCb: Function) {
        const flipCardCostItem = this.getFlipCardCostItem();
        let maxCanPayCount = BackpackManager.ins().getMaxCanPayCount(flipCardCostItem);
        if (maxCanPayCount <= 0) {
            doneCb();
            Logger.game("无法支付发牌");
            return;
        }

        let tempCount = maxCanPayCount;
        const toSendArray = [];

        const flipCardCount = this.getFlipCardCount();
        for (let i = 0; i < flipCardCount; i++) {
            const gridState = this._gridIndexToStateMap.getOrDefault(i, EnumFlipCardState.NO);
            if (gridState < EnumFlipCardState.FLIP_NO_GAIN) {
                if (tempCount > 0) {
                    tempCount -= 1;
                    toSendArray.push(i);
                } else {
                    break;
                }
            }
        }

        if (ArrayUtils.isEmpty(toSendArray)) {
            Logger.game("没有任何一个格子能翻");
            doneCb();
            return;
        }

        const oldRoundId = this._curRoundId;

        for (let gridIndex of toSendArray) {
            setTimeout(() => {
                if (this.isHaveFlipBigReward()) {
                    Logger.game("已经翻到了大奖");
                    return;
                }

                if (this.isFlipCard(gridIndex)) {
                    Logger.game(`格子已经翻了. index = ${gridIndex}`);
                    return;
                }

                if (this._curRoundId != oldRoundId) {
                    Logger.game("下一轮了");
                    return;
                }

                this.sendFlipCard(gridIndex);
            }, 400 * gridIndex + 200);
        }

        setTimeout(() => {
            doneCb();
        }, 200 * toSendArray.length + 200);
    }

    sendChooseBigRewardIfNull(index: number) {
        if (this._chooseBigRewardIndex > 0 || this.isHaveFlipBigReward()) {
            return;
        }
        this.sendChooseBigReward(index);
    }

    private _lotteryNormalConfig: table.activity.Lottery.LotteryNormalConfig;
    /** 获取LotteryNormalConfig 配置 */
    public get lotteryNormalConfig(): table.activity.Lottery.LotteryNormalConfig {
        if (!this._lotteryNormalConfig) {
            this._lotteryNormalConfig = TableManager.getDataById(table.activity.Lottery.LotteryNormalConfig, this.activityId);
        }
        return this._lotteryNormalConfig;
    }

    /** 根据index获取当前大奖剩余可选次数 */
    getBigRewardLeftChooseCount(index: number): number {
        if (this.lotteryNormalConfig.jackpotLimits[index] > 0) {
            const num = this.lotteryNormalConfig.jackpotLimits[index] - (this._jackpotIndex2NumMap[index] || 0);
            return num;
        }
        return -1;
    }

    /** 添加大奖选择次数 */
    addBigRewardChooseCount(index: number) {
        const num = this._jackpotIndex2NumMap[index];
        if (num > 0) {
            this._jackpotIndex2NumMap[index]++;
        } else {
            this._jackpotIndex2NumMap[index] = 1;
        }
    }

    //是否进入下一轮
    private _isEnterNextRound: boolean = false;
    /** 是否进入下一轮 */
    public set isEnterNextRound(value: boolean) {
        if (typeof value === "boolean") {
            this._isEnterNextRound = value;
            this.allReceived();
        }
    }
    public get isEnterNextRound(): boolean {
        return this._isEnterNextRound;
    }

    //设置所有已领取
    private allReceived() {
        // let keys = Object.keys(this._gridIndexToStateMap);
        for (let map of this._gridIndexToStateMap) {
            let key = map[0];
            // let gridIndex = parseInt(key);
            this._gridIndexToStateMap.set(key, EnumFlipCardState.FLIP_AND_GAIN);
        }
    }
}
