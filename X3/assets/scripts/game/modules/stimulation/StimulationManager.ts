import { BaseController } from "../../../core/mvc/controller/BaseController"
import { StringUtils } from "../../../core/utils/StringUtils"
import { ServerEnums } from "../../../libs/extras/ServerEnums"
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey"
import NotificationKey from "../../event/NotificationKey"
import GIns from "../../GIns"
import { RedDotKeys } from "../common/redDot/RedDotKeys"
import { HeroVo } from "../hero/HeroVo"
import { IStimulationAddition } from "./model/vo/IStimulationAddition"
import { IStimulationData } from "./model/vo/IStimulationData"

export class StimulationManager extends BaseController {
    /**一小时毫秒数*/
    public oneHourSecondTime: number = 3600;
    /**一小时毫秒数*/
    public oneHourMsTime: number = 3600000;

    protected _lastLv:number = 0;
    protected _lastSpeed: number = 0;
    protected _lastCapacity: number = 0;
    
    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.STIMULATION_DEVICE_UPDATE,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.updateRedDot();
                break
                case NotificationKey.STIMULATION_DEVICE_UPDATE:
                    this.updateRedDot();
                    break;
        }
    }

    protected updateRedDot(): void {
        let totalAdTimes:number = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.STIMULATION_DEVICE_UP_LEVEL);
        GIns.stimulationModel.deviceMap?.forEach((data) => {
            if (data.vo && data.vo.nextLevel > 0 && data.vo.nextLevelAdTimes < totalAdTimes) {
                //正在升级 并且有广告次数
                GIns.redDotMgr.setRedDot(RedDotKeys.Stimulation_Ad, true, [data.cfg.cfg.id]);
            } else {
                GIns.redDotMgr.setRedDot(RedDotKeys.Stimulation_Ad, false, [data.cfg.cfg.id]);
            }
        })
    }

    /**获取设备的总加成数据(算上英雄加成)*/
    public getAdditionMap(data: IStimulationData, lv: number = 1, includeHeroVos: HeroVo[] = null, excludeHeroVos: HeroVo[] = null): IStimulationAddition {
        if (data && data.vo) {
            let lvCfg = GIns.stimulationModel.getLvCfg(data.vo.id, lv);
            if (lvCfg) {
                let heroVos: HeroVo[] = [];
                let moreHeroVos: HeroVo[] = includeHeroVos ? includeHeroVos.concat() : null;
                for (let key in data.vo.dispatchIndex2HeroBaseId) {
                    let heroVo = GIns.heroMgr.getHeroVoByID(data.vo.dispatchIndex2HeroBaseId[key]);
                    if (excludeHeroVos && excludeHeroVos.indexOf(heroVo) != -1) {
                        continue;
                    }
                    if (heroVo) {
                        if (moreHeroVos) {
                            let moreIndex: number = moreHeroVos.indexOf(heroVo);
                            moreHeroVos.splice(moreIndex, 1);
                        }
                        heroVos.push(heroVo);
                    }
                }
                if (moreHeroVos && moreHeroVos.length > 0) {
                    heroVos = heroVos.concat(moreHeroVos);
                }

                let baseItemAmountPerHour: number = 0;
                if (lvCfg.itemAmountPerHour) {
                    baseItemAmountPerHour = lvCfg.itemAmountPerHour;
                } else {
                    baseItemAmountPerHour = this.oneHourSecondTime / lvCfg.intervalSeconds;
                }
                let itemAmountPerHour: number = baseItemAmountPerHour;
                let capacity: number = lvCfg.capacity;
                heroVos?.forEach((heroVo) => {
                    let addition = this.getHeroAdditionValue(heroVo, data.cfg.cfg.itemId);
                    switch (addition.type) {
                        case ServerEnums.StimulationAdditionType.SPEED:
                            itemAmountPerHour += addition.value;
                            // if (lvCfg.itemAmountPerHour) {
                            //     itemAmountPerHour += addition.value;
                            // } else {
                            //     itemAmountPerHour += this.oneHourSecondTime / (lvCfg.intervalSeconds - addition.value) - baseItemAmountPerHour;
                            // }
                            break;
                        case ServerEnums.StimulationAdditionType.SPEED_RATIO:
                            itemAmountPerHour += baseItemAmountPerHour * addition.value / 10000;
                            break;
                        case ServerEnums.StimulationAdditionType.CAPACITY:
                            capacity += addition.value;
                            break;
                        case ServerEnums.StimulationAdditionType.CAPACITY_RATIO:
                            capacity += capacity * addition.value / 10000;
                            break;
                    }
                })
                let intervalMillis: number = this.oneHourMsTime / itemAmountPerHour;
                intervalMillis = Math.floor(intervalMillis);
                capacity = Math.round(capacity);
                return { intervalMillis: intervalMillis, capacity: capacity, itemAmountPerHour: itemAmountPerHour };
            }
        }
        return null;
    }

    /**获取效率描述*/
    public getSpeedShowStr(data: IStimulationData, itemAmountPerHour: number, withUnit: boolean = true): string {
        if (data?.cfg?.cfg) {
            let value = itemAmountPerHour * data.cfg.cfg.speedShowTime / this.oneHourSecondTime;
            if (withUnit) {
                return StringUtils.numToStr(value, 1) + '/' + data.cfg.cfg.speedUnit;
            }
            return StringUtils.numToStr(value, 1);
        }
        return ''
    }

    public getAdditionDesForHero(heroVo: HeroVo, itemId: number): string {
        let des: string = '';
        if (heroVo != null && itemId > 0) {
            let data = this.getHeroAdditionValue(heroVo, itemId);
            let value = data.value;
            switch (data.type) {
                case ServerEnums.StimulationAdditionType.SPEED:
                    let deviceData = GIns.stimulationModel.getDeviceDataByItem(itemId);
                    value = value * deviceData.cfg.cfg.speedShowTime / this.oneHourSecondTime;
                    // let lvCfg = GIns.stimulationModel.getLvCfg(deviceData?.vo?.id, deviceData?.vo.level);
                    // if (lvCfg) {
                    //     if (lvCfg.itemAmountPerHour) {
                    //         value = value * deviceData.cfg.cfg.speedShowTime / this.oneHourSecondTime
                    //     } else if (lvCfg.intervalSeconds) {
                    //         value = this.oneHourSecondTime / (lvCfg.intervalSeconds - data.value) - this.oneHourSecondTime / lvCfg.intervalSeconds;
                    //         value = value * deviceData.cfg.cfg.speedShowTime / this.oneHourSecondTime
                    //     }
                    // }
                    des = `效率+${StringUtils.numToStr(value, 1)}`;
                    break;
                case ServerEnums.StimulationAdditionType.SPEED_RATIO:
                    des = `效率+${StringUtils.numToStr(value / 100, 1)}%`;
                    break;
                case ServerEnums.StimulationAdditionType.CAPACITY:
                    des = `储量+${Math.round(value)}`;
                    break;
                case ServerEnums.StimulationAdditionType.CAPACITY_RATIO:
                    des = `储量+${StringUtils.numToStr(value / 100, 1)}%`;
                    break;
            }
        }
        return des;
    }

    /**获取解锁提示*/
    public getUnlockTipForLv(deviceId: number, needLv: number): string {
        let arr = [['STIMULATION_ASSIGN_DEVICE_LEVEL_GE', deviceId, needLv]]
        return GIns.conditionMgr.getOpenConditionTips(arr);
    }

    /**获取英雄加成数值*/
    public getHeroAdditionValue(heroVo: HeroVo, itemId: number): { type: ServerEnums.StimulationAdditionType, value: number } {
        let addCfgValue: number = 0
        let type: ServerEnums.StimulationAdditionType = ServerEnums.StimulationAdditionType[heroVo.heroCfg.stimulationAdditionType];
        if (heroVo.heroCfg.stimulationAdditionItemId == itemId) {
            let addStar = heroVo.star - heroVo.heroCfg.initStar;
            if (type == ServerEnums.StimulationAdditionType.SPEED) {
                //速度固定值加成根据加成设备的计算方式不同 加成计算公式不一样
                let deviceData = GIns.stimulationModel.getDeviceDataByItem(itemId);
                let lvCfg = GIns.stimulationModel.getLvCfg(deviceData?.vo?.id, deviceData?.vo.level);
                if (lvCfg?.intervalSeconds) {
                    addCfgValue = this.oneHourSecondTime / (heroVo.heroCfg.stimulationAdditionValue - addStar * heroVo.heroCfg.stimulationAdditionUpStarIncrement);
                } else {
                    addCfgValue = heroVo.heroCfg.stimulationAdditionValue + addStar * heroVo.heroCfg.stimulationAdditionUpStarIncrement;
                }
            } else {
                addCfgValue = heroVo.heroCfg.stimulationAdditionValue + addStar * heroVo.heroCfg.stimulationAdditionUpStarIncrement;
            }
        }
        return { type: type, value: addCfgValue };
    }

    /**获取英雄排序*/
    protected getHeroAdditionSortValue(deviceId: number, heroVo: HeroVo): { type: number, sortValue: number } {
        let deviceData = GIns.stimulationModel.getDeviceData(deviceId);
        let itemId: number = deviceData?.cfg?.cfg?.itemId;
        let baseSpeed: number = 0;
        let baseCapacity: number = 0;
        let type: number = 0;
        let sortValue: number = 0;
        if (deviceData.vo) {
            let lvCfg = GIns.stimulationModel.getLvCfg(deviceData.vo.id, deviceData.vo.level);
            baseCapacity = lvCfg ? lvCfg.capacity : 0;
            if (lvCfg.itemAmountPerHour) {
                baseSpeed = lvCfg.itemAmountPerHour;
            } else {
                baseSpeed = this.oneHourSecondTime / lvCfg.intervalSeconds;
            }
            let heroAddition = this.getHeroAdditionValue(heroVo, itemId);
            switch (heroAddition.type) {
                case ServerEnums.StimulationAdditionType.SPEED:
                    type = 1;
                    sortValue = heroAddition.value / baseSpeed;
                    break;
                case ServerEnums.StimulationAdditionType.SPEED_RATIO:
                    type = 1;
                    sortValue = heroAddition.value / 10000;
                    break;
                case ServerEnums.StimulationAdditionType.CAPACITY:
                    type = 2;
                    sortValue = heroAddition.value / baseCapacity;
                    break;
                case ServerEnums.StimulationAdditionType.CAPACITY_RATIO:
                    type = 2;
                    sortValue = heroAddition.value / 10000;
                    break;
            }
        }
        return { type: type, sortValue: sortValue };
    }

    /**派遣英雄列表*/
    public getHeroListForDispatch(deviceId: number): HeroVo[] {
        let deviceData = GIns.stimulationModel.getDeviceData(deviceId);
        let heroList: HeroVo[] = [];
        let allHeros = GIns.heroMgr.getAllHeroVo();
        allHeros?.forEach((vo) => {
            if (vo?.heroVoData?.isActivate && vo.heroCfg?.stimulationAdditionItemId == deviceData.cfg.cfg.itemId) {
                //筛选出加成的英雄
                heroList.push(vo);
            }
        });
        heroList?.sort((a, b) => {
            let sortA: { type: number, sortValue: number } = this.getHeroAdditionSortValue(deviceId, a);
            let sortB: { type: number, sortValue: number } = this.getHeroAdditionSortValue(deviceId, b);
            if (a.heroCfg.quality != b.heroCfg.quality) {
                return b.heroCfg.quality - a.heroCfg.quality;
            }
            if (a.star != b.star) {
                return b.star - a.star;
            }
            if (sortA.type != sortB.type) {
                return sortA.type - sortB.type;
            }
            if (sortA.sortValue != sortB.sortValue) {
                return sortB.sortValue - sortA.sortValue;
            }
            return 0
        });
        return heroList;
    }

    /**一键派遣英雄列表*/
    public getHeroListForAutoDispatch(deviceId: number): HeroVo[] {
        let deviceData = GIns.stimulationModel.getDeviceData(deviceId);
        let heroList: HeroVo[] = [];
        let allHeros = GIns.heroMgr.getAllHeroVo();
        allHeros?.forEach((vo) => {
            if (vo?.heroVoData?.isActivate && vo.heroCfg?.stimulationAdditionItemId == deviceData.cfg.cfg.itemId) {
                //筛选出加成的英雄
                heroList.push(vo);
            }
        });
        heroList?.sort((a, b) => {
            let sortA: { type: number, sortValue: number } = this.getHeroAdditionSortValue(deviceId, a);
            let sortB: { type: number, sortValue: number } = this.getHeroAdditionSortValue(deviceId, b);
            if (sortA.type != sortB.type) {
                return sortA.type - sortB.type;
            }
            if (sortA.sortValue != sortB.sortValue) {
                return sortB.sortValue - sortA.sortValue;
            }
            if (a.heroCfg.quality != b.heroCfg.quality) {
                return b.heroCfg.quality - a.heroCfg.quality;
            }
            if (a.star != b.star) {
                return a.star - b.star;
            }
            return 0
        });
        return heroList;
    }

    onInit() {

    }
}

StimulationManager.ins().doInit()