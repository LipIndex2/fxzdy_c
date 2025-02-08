import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { ConditionUtils } from "../condition/ConditionUtils";
import { FormationMainViewOpenArgs, FormationMainViewOpenArgsExcludeParam, UIFormationKey } from "../formation/const/UIFormationConfig";
import { UIFactoryConfig } from "./const/UIFactoryConfig";
import { FactoryUtils } from "./FactoryUtils";

export class FactoryManager extends BaseController {
    protected _powerTimerKey: string = null
    protected _isOpenFactory: boolean = false
    protected _isInit: boolean = false
    public occupyTip: string = ''

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.FACTORY_UPDATE_INFO,
            NotificationKey.FACTORY_BUY_POWER_COMPLETE,
            NotificationKey.BATTLE_START,
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.FACTORY_OCCUPY_COMPLETE,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInit = true
                this.occupyTip = ''
                this.loadFactoryInfo()
                GIns.factoryModel.updateMaxSameTimeOccupyCount()
                break
            case NotificationKey.SYSTEM_NEW_DAY:
                this.loadFactoryInfo()
                break
            case NotificationKey.FACTORY_UPDATE_INFO:
                this.resetPowerTimer()
                break
            case NotificationKey.FACTORY_BUY_POWER_COMPLETE:
                this.resetPowerTimer()
                break
            case NotificationKey.BATTLE_START:
                if (GIns?.battleMgr?.battleLogic?.fightType == FightType.FACTORY) {
                    G.UIManager.close(UIFactoryConfig.FactoryProductLineWin)
                }
            case NotificationKey.HERO_UP_LEVEL:
                GIns.factoryModel.updateMaxSameTimeOccupyCount()
                break
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.handleOccupyResult(this.occupyTip)
                this.occupyTip = ''
            case NotificationKey.FACTORY_OCCUPY_COMPLETE:
                this.handleOccupyResult(args ? '占领成功' : '')
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            if (this._isOpenFactory == false && this._isInit) {
                //实时检测是否开启了星际工厂
                this.loadFactoryInfo()
            }
        }
    }

    protected handleOccupyResult(occupyTip: string = ''): void {
        if (occupyTip) {
            G.UIManager.close(UIFactoryConfig.FactoryProductLineWin)
            GIns.floatingTextMgr.showTips(occupyTip)
        }
    }

    protected loadFactoryInfo(): void {
        this._isOpenFactory = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FACTORY)
        if (this._isOpenFactory) {
            GIns.factoryModel.sendLoadFactoryInfo()
            GIns.factoryModel.sendLoadFactoryRecord()
        }
    }

    protected resetPowerTimer(): void {
        if (!this._powerTimerKey) {
            G.GameTimer.clearByKey(this._powerTimerKey)
            this._powerTimerKey = null
        }
        if (GIns.factoryModel.myVo.powerVo.power >= GIns.factoryModel.constCfg.maxPower) {
            //体力已满
            return
        }
        let interval: number = GIns.factoryModel.constCfg.powerRecoverInterval * 1000
        let nextRecoverTime: number = GIns.factoryModel.myVo.powerVo.lastRecoverTime + interval
        let remainTime: number = Math.max(0, nextRecoverTime - G.TimeManager.serverNow)
        this._powerTimerKey = G.GameTimer.once(remainTime, this, this.onRecoverPowerComplete)
    }

    protected onRecoverPowerComplete(): void {
        GIns.factoryModel.myVo.powerVo.power++
        GIns.factoryModel.myVo.powerVo.lastRecoverTime = G.TimeManager.serverNow
        this.emit(NotificationKey.FACTORY_POWER_UPDATE)
        this._powerTimerKey = null
        this.resetPowerTimer()
    }

    /**占领生产线*/
    public occupyProductLine(vo: Vo.factory.ProductLineVo): void {
        if (GIns.factoryModel.isMyOccupyListFull()) {
            //占领队列已达上限
            GIns.floatingTextMgr.showTips('生产线占领队列已满')
            return
        }
        if (GIns.factoryModel.myVo.todayOccupyRewardTimes >= GIns.factoryModel.constCfg.dailyOccupyRewardTimes) {
            //占领数量已达上限
            GIns.floatingTextMgr.showTips('今日占领数量已达上限')
            return
        }
        if (GIns.factoryModel.myVo.powerVo.power < GIns.factoryModel.constCfg.occupyCostPower) {
            //体力不足
            GIns.floatingTextMgr.showTips('体力不足')
            G.UIManager.open(UIFactoryConfig.FactoryBuyPowerWin)
            return
        }
        this.openFormationForProductLine(vo, (setUpVo: Vo.formation.SetupFormationReqVo) => {
            let c2s: Vo.factory.OccupyProductLineC2S = {
                productLineId: vo.productLineId,
                formationReqVo: {
                    collectiblesId: setUpVo.collectiblesId,
                    petBaseId: setUpVo.petBaseId,
                    positionVos: setUpVo.positionVos.filter(value => value.heroBaseId)
                }
            }
            GIns.factoryModel.sendOccupyProductLine(c2s)
        })
    }

    /**为生产线打开布阵界面*/
    public openFormationForProductLine(vo: Vo.factory.ProductLineVo, okFunc: (vo: Vo.formation.SetupFormationReqVo) => void = null): void {
        let myVo = GIns.factoryModel.myVo
        let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, vo.productLineConfigId)
        let type: FightType = FightType.FACTORY
        let subType: string = vo.belongPlayerBaseVo.id + ''
        let title: string = cfg ? cfg.name : ''
        let excludes: Map<number, FormationMainViewOpenArgsExcludeParam> = new Map<number, FormationMainViewOpenArgsExcludeParam>()
        let excludeCollectionsIds: number[] = []
        let excludePetIds: number[] = []
        for (let key in myVo.occupyHeroBaseIdMap) {
            let heroId = Number(key)
            let productLineConfigId = Number(myVo.occupyHeroBaseIdMap[key])
            let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, productLineConfigId)
            let quality: number = 1
            let name: string = ''
            if (cfg) {
                name = cfg.name
                quality = cfg.quality
            }
            let data: FormationMainViewOpenArgsExcludeParam = {
                tip: name,
                tipColor: FactoryUtils.getTextColor(quality)
            }
            excludes.set(heroId, data)
        }
        for (let key in myVo.occupyCollectiblesIdMap) {
            let collectionsId = Number(key)
            excludeCollectionsIds.push(collectionsId)
        }
        for (let key in myVo.occupyPetBaseIdMap) {
            let petId = Number(key)
            excludePetIds.push(petId)
        }
        //移除旧数据
        GIns.formationMgr.deleteFormationVoByType(type, 0, subType)
        let args: FormationMainViewOpenArgs = FormationMainViewOpenArgs.create(type, subType, null, excludes, excludeCollectionsIds, excludePetIds, title, okFunc, true)
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, args)
    }

    onInit(): void {

    }
}
FactoryManager.ins().doInit()