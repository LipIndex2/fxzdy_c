import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import {
    LeagueBargainConfigManager
} from "db://assets/scripts/game/modules/leagueBargain/config/LeagueBargainConfigManager";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";

// 砍价
export class LeagueBargainContext {

    private _lastBuyBargainGiftTimeMs: number = 0;
    private _lastBargainTimeMs: number = 0;
    private _isBuy: boolean = false;
    private _data: Vo.league.LeagueBargainVo;
    // 砍价CD时间限制
    private _cdAtTimeMs: number = 0;
    // 倒计时
    private _sid: any;

    private _comparator = ComparatorBuilder.create<Vo.league.LeagueBargainMemberVo>()
        .addComparator((a, b) => {
            return b.bargainDiscount - a.bargainDiscount;
        })
        .addComparator((a, b) => {
            return b.id - a.id;
        })
        .build();


    onLoginData(vo: Vo.league.PlayerLeagueLoginVo) {

        const lastBargainTimeMs = vo.lastBargainTime;
        const lastBuyBargainGiftTimeMs = vo.lastBuyBargainGiftTime;
        const bargainLimitTime = vo.bargainLimitTime;

        this._lastBuyBargainGiftTimeMs = lastBuyBargainGiftTimeMs || 0;
        this._lastBargainTimeMs = lastBargainTimeMs || 0;
        this._cdAtTimeMs = bargainLimitTime || 0;

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    reset(data: Vo.league.LeagueBargainVo) {
        this._data = data;
        const playerId = PlayerModel.ins().playerId;
        this._isBuy = data?.memberVos
            .find(it => it.id == playerId)
            ?.buy || false;

        const startT = DateUtils.dateTimeFormat(data.startTime);
        const endTimeMs = data.endTime;
        const endT = DateUtils.dateTimeFormat(endTimeMs);
        const cdT = DateUtils.dateTimeFormat(this._cdAtTimeMs);
        Logger.game(`[LeagueBargain] 开始时间 = ${startT}, 结束时间 = ${endT}, cd时间 = ${cdT},  giftId = ${this._data.bargainGiftId}`);

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);

        const restTimeMs = Math.max(endTimeMs - TimeManager.serverNow, 0);
        clearTimeout(this._sid);
        this._sid = setTimeout(() => {
            FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
            FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_CLOSE);
        }, restTimeMs);
    }

    get data(): Vo.league.LeagueBargainVo {
        return this._data;
    }

    getGiftId(): number {
        return this._data?.bargainGiftId || 0;
    }

    getHaveDiscountMemberInfoArray(): Vo.league.LeagueBargainMemberVo[] {
        return (this._data?.memberVos || [])
            .filter(it => it.bargainDiscount > 0)
            .sort(this._comparator)
    }

    get lastBuyBargainGiftTimeMs(): number {
        return this._lastBuyBargainGiftTimeMs;
    }

    get lastBargainTimeMs(): number {
        return this._lastBargainTimeMs;
    }

    isOpen(): boolean {
        const curTimeMs = TimeManager.serverNow;
        const data1 = this._data;
        if (!data1) {
            return false;
        }
        if (data1.bargainGiftId == 0) {
            return false;
        }

        const st = data1.startTime;
        const et = data1.endTime;
        if (st == et) {
            return false;
        }

        const ct = curTimeMs;
        return ct >= st && ct <= et;
    }

    updateLastBargainTime(lastBargainTimeMs: number) {
        this._lastBargainTimeMs = lastBargainTimeMs;

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }


    onBuy(vo: Vo.league.LeagueBargainGiftBuyVo) {
        this._lastBuyBargainGiftTimeMs = vo.lastBuyBargainGiftTime || 0;
        const playerId = PlayerModel.ins().playerId;

        this._data.memberVos
            .map(it => {
                if (it.id == playerId) {
                    it.buy = true;
                }
                return it;
            });
        this._isBuy = true;

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    onUpdateBargainInfo(content: Vo.league.LeagueBargainMemberVo[]) {
        if (!this._data) {
            Logger.warn("联盟砍价数据还未初始化");
            return;
        }
        this._data.memberVos = content || [];


        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    getNoBuyMemberArray(): Vo.league.LeagueBargainMemberVo[] {
        return this._data?.memberVos?.filter(x => x.buy == false) || [];
    }

    getNoBargainMemberArray(): Vo.league.LeagueBargainMemberVo[] {
        const array = this._data?.memberVos || [];
        return array.filter(x => x.bargainDiscount <= 0)
            .sort((v1, v2) => {
                if (v1.offlineTime <= 0 && v2.offlineTime > 0) {
                    return -1;
                }
                if (v1.offlineTime > 0 && v2.offlineTime <= 0) {
                    return 1;
                }

                return v2.offlineTime - v1.offlineTime;
            });
    }

    isBuy(): boolean {
        return this._isBuy;
    }

    isHaveKill(): boolean {
        const playerId = PlayerModel.ins().playerId;

        const haveDiscountRate10000 = this.getHaveDiscountRate10000();
        // 已经到了最低价
        if (haveDiscountRate10000 <= LeagueBargainConfigManager.minDiscount10000) {
            return true;
        }

        const myDiscount = this._data?.memberVos?.find(x => x.id == playerId)?.bargainDiscount || 0;
        return myDiscount > 0;
    }

    onRespStart(resp: Vo.league.LeagueBargainStartVo) {
        if (!this._data) {
            return;
        }

        this._data.bargainGiftId = resp.bargainGiftId;
        this._data.startTime = resp.startTime;
        this._data.endTime = resp.endTime;


        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    onUpdate(resp: Vo.league.LeagueBargainGiftUpdateVo) {
        if (!this._data) {
            return;
        }

        const memberId = resp.memberId;
        const bargainDiscount = resp.bargainDiscount;

        const maxPrice = this.getMaxPrice()

        const changeDiscount = bargainDiscount;
        if (!this._data.memberVos) {
            this._data.memberVos = [];
        }
        let isOld = false;
        this._data?.memberVos.map(it => {
            if (it.id != memberId) {
                return;
            }
            isOld = true;
            it.bargainDiscount = bargainDiscount;
        });

        const minusPrice = Math.floor(maxPrice * changeDiscount / 10000);

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_NEW, minusPrice);
    }

    onOtherBuy(memberId: number) {
        this._data.memberVos.map(it => {
            if (it.id != memberId) {
                return;
            }
            it.buy = true;
        })

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    onUpdateLimitTimeMs(limitTimeMs: number) {
        this._cdAtTimeMs = limitTimeMs;

        FacadeManager.ins().emit(NotificationKey.LEAGUE_BARGAIN_UPDATE);
    }

    getDiffTimeMs(): number {
        const diffTimeMs = Math.max(0, this._data.endTime - TimeManager.serverNow);

        return diffTimeMs;
    }

    getRestTimeText(): string {
        const diffTimeMs = this.getDiffTimeMs();
        return TimeUtils.formatTimeMsToPositiveTimeText(diffTimeMs);
    }


    getMoneyNew(): number {
        const maxPrice = this.getMaxPrice();
        if (maxPrice <= 0) {
            return maxPrice;
        }
        return maxPrice - this.getHaveDiscountMoney();
    }

    /**
     * 折扣比例
     * 10000 = 原价
     */
    getHaveDiscountRate10000(): number {
        const value = this._data.memberVos
            .toDataStream()
            .map(it => it.bargainDiscount)
            .reduce((acc, cur) => {
                if (cur == 0) {
                    return acc;
                }
                return acc + cur;
            }, 0);
        return 10000 - value;
    }

    // 省的钱
    getHaveDiscountMoney(): number {
        const lessPayMoney = this._data.memberVos
            .toDataStream()
            .map(it => it.bargainDiscount)
            .reduce((acc, cur) => {
                if (cur == 0) {
                    return acc;
                }
                const subPrice = Math.floor(this.getMaxPrice() * (cur / 10000));
                return acc + subPrice;
            }, 0);
        return lessPayMoney;
    }

    getDiscountPersonCount(): number {
        return this._data
            ?.memberVos
            ?.filter(x => x.bargainDiscount > 0)
            ?.length || 0;
    }

    getMaxPersonCount(): number {
        return this._data
            ?.memberVos
            ?.length || 0;
    }

    getMaxPrice(): number {
        const giftId = this.getGiftId();
        return LeagueBargainConfigManager.getGiftConfigById(giftId)?.initPrice || 0;
    }

    getCostItemId(): number {
        return 1;
    }

    getCostItemNum(): number {
        if (!this._data) {
            return this.getMaxPrice();
        }

        const haveDiscountMoney = this.getHaveDiscountMoney();
        return this.getMaxPrice() - haveDiscountMoney;
    }

    getCostItem() {
        return NoOwnerItem.create(this.getCostItemId(), this.getCostItemNum());
    }

    getRestCdTimeMs(): number {
        return Math.max(0, this._cdAtTimeMs - TimeManager.serverNow);
    }
}