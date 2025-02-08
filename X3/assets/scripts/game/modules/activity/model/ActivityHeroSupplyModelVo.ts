import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import {
    HeroSupplyConfigManager
} from "db://assets/scripts/game/modules/activity/heroSupply/config/HeroSupplyConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";


/**
 * 英雄补给
 */
export class ActivityHeroSupplyModelVo extends BaseActivityVo {
    private _allRewards: NoOwnerItem[] = [];


    public get activityVo(): Vo.activity.HeroSupplyVo {
        return this.content as any;
    }

    onInitDone() {
        // init
        if (!this.activityVo.rewardIds) {
            this.activityVo.rewardIds = [];
        }


        Logger.game(`[英雄补给] 初始化完成. activityId=${this.activityId} | startTimeMs = ${this.startTime}, endTime = ${this.endTime}`);

    }


    isBuy(): boolean {
        return this.activityVo.buySupply;
    }

    getRewardIdArray(): number[] {
        return this.activityVo.rewardIds || [];
    }

    /**
     * 是否领取
     * @param rewardId
     */
    isHaveGainRewardId(rewardId: number): boolean {
        return this.getRewardIdArray().indexOf(rewardId) >= 0;
    }

    updateInfo(info: Vo.activity.HeroSupplyVo) {
        super.updateInfo(info);

        FacadeManager.ins().emit(NotificationKey.HERO_SUPPLY_UPDATE);
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {
        if (this.isGainAllRewards()) {
            return true;
        }
        const isDone = this.isDone();
        if (isDone) {
            return true;
        }
        if (this.visibleEndTime == 0) {
            return false;
        }
        if (!(this.endTime > TimeManager.serverNow)) {
            return true;
        }

        return isDone;


    }

    // red dot
    public isShowRed(): boolean {
        return !this.isGainAllWhichICan() && this.isBuy();
    }


    getAllRewardItemArray(): NoOwnerItem[] {
        if (ArrayUtils.isNotEmpty(this._allRewards)) {
            return this._allRewards;
        }
        const configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(this.activityId);
        if (ArrayUtils.isEmpty(configs)) {
            return []
        }
        this._allRewards = configs.toDataStream()
            .flatMap(it => {
                return ItemUtils.parseKvArrayToItemArray(it.rewards);
            })
            .filterNotNull()
            .toArray();
        return this._allRewards;
    }


    getCanGainItems(): NoOwnerItem[] {
        const configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(this.activityId);
        if (ArrayUtils.isEmpty(configs)) {
            return []
        }
        const serverHaveOpenDay = TimeManager.serverHaveOpenDay;
        const canGainRewards = configs.toDataStream()
            .filter(it => {
                const openDay = it.openDay;
                if (serverHaveOpenDay < openDay) {
                    return false;
                }
                const isNotHave = !this.activityVo.rewardIds.contains(it.id);
                return isNotHave;
            })
            .flatMap(it => {
                return ItemUtils.parseKvArrayToItemArray(it.rewards);
            })
            .filterNotNull()
            .toArray();
        return canGainRewards;
    }

    sendOneKeyGain() {
        // 领取奖励
        ActivityModel.ins().sendDrawItemReward({
            activityId: this.activityId,
            itemId: "all",
            hidePopWin: 2
        } as ActivitySyncData);
    }

    isGainAllWhichICan() {
        const haveGainLength = this.activityVo.rewardIds?.length || 0;
        const canGainDayArray = this.getCanGainDayArray();
        return haveGainLength == canGainDayArray.length;
    }

    isGainAllRewards() {
        const haveGainLength = this.activityVo.rewardIds?.length || 0;
        const configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(this.activityId);
        const allLength = configs?.length || 0;
        return haveGainLength == allLength;
    }

    isCanGainAll() {
        const maxDay = HeroSupplyConfigManager.getMaxDayByActivityId(this.activityId);
        const serverHaveOpenDay = TimeManager.serverHaveOpenDay;
        return serverHaveOpenDay >= maxDay;
    }

    /**
     * 是否可以获得的天数[]
     */
    getDayToIsCanGainMap(isIgnoredHaveGainDay: boolean): Map<number, boolean> {
        const configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(this.activityId);
        const map = new Map<number, boolean>();
        for (let config of configs) {
            const openDay = config.openDay;
            const serverHaveOpenDay = TimeManager.serverHaveOpenDay;

            if (isIgnoredHaveGainDay) {
                const isHaveGain = this.activityVo.rewardIds?.contains(config.id);
                if (isHaveGain) {
                    map.set(openDay, false);
                    continue;
                }
            }
            const isCanGain = serverHaveOpenDay >= openDay;
            map.set(openDay, isCanGain);
        }

        return map;
    }

    getCanGainDayArray(): number[] {
        return this.getDayToIsCanGainMap(false)
            .toDataStream()
            .filter(it => it.value == true)
            .map(it => it.key)
            .toArray();
    }

    // 是否获得
    isGain(day: number): boolean {
        const rewardId = HeroSupplyConfigManager.getRewardIdByActivityIdAndDay(this.activityId, day)
        return this.activityVo.rewardIds?.contains(rewardId) || false;
    }


    onGetRewardIds(gainRewardIds: number[]) {

        Logger.game("获得的奖励 id[]", gainRewardIds);

        if (!this.activityVo.rewardIds) {
            this.activityVo.rewardIds = [];
        }

        this.activityVo.rewardIds.push(...gainRewardIds);

        FacadeManager.ins().emit(NotificationKey.HERO_SUPPLY_UPDATE);
    }

    isCanGain(day: number) {
        const serverHaveOpenDay = TimeManager.serverHaveOpenDay;
        return serverHaveOpenDay >= day;
    }

}