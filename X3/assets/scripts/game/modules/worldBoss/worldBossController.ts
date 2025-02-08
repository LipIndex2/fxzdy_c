import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginModel from "../../../main/modules/login/model/LoginModel";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../comm/activity/model/BaseActivityVo";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import { MapModel } from "../../tiledMap/model/MapModule";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ConditionManager } from "../condition/ConditionManager";
import { UIFuilKey } from "../fuli/const/fuliConst";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { WorldBossModel } from "./model/WorldBossModel";
import { WorldBossManager } from "./WorldBossManager";

export class WorldBossController extends BaseController {

    protected _activityIds: number[] = []
    protected _activityConditionMap: Map<number, Array<Array<any>>> = new Map()
    protected _activityIdsForBossMap: Map<number, number[]> = new Map()
    protected _bossTransIdMap: Map<number, number> = new Map()
    protected _waitOpenBossIds: number[] = []

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.EVENT_WORLD_BOSS_INFO_RESP,
            NotificationKey.EVENT_WORLD_BOSS_DRAWSERVERREWARD_COMPLETE,
            NotificationKey.EVENT_WORLD_BOSS_ALL_INFO_RESP,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.MAP_BUILDING_UNLOCK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                this.checkActivityBossRedDotById(args)
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.initActivityIds()
                this.checkActivityBossRedDot()
                break;
            case NotificationKey.EVENT_WORLD_BOSS_INFO_RESP:
            case NotificationKey.EVENT_WORLD_BOSS_DRAWSERVERREWARD_COMPLETE:
                let vo = args as Vo.worldboss.WorldBossVo
                this.updateBossRedDot(vo)
                break
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.WORLD_BOSS) {
                    this.updateSetUpRedDot()
                }
                break
            case NotificationKey.EVENT_WORLD_BOSS_ALL_INFO_RESP:
                this.updateSetUpRedDot()
                break
            case NotificationKey.MAP_BUILDING_UNLOCK:
                if (this._bossTransIdMap.has(args)) {
                    let bossId = this._bossTransIdMap.get(args)
                    let vo = WorldBossManager.ins().getWorldBossInfo(bossId)
                    if (vo) {
                        this.updateBossRedDot(vo)
                    }
                }
                break;
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.startTimer();
                break;
        }
    }

    startTimer(): void {
        G.GameTimer.loop(5000, this, this.onTimer);
    }

    protected onTimer(): void {
        if (this._waitOpenBossIds.length > 0 && LoginModel.ins().isLogined) {
            let arr = this._waitOpenBossIds.concat()
            arr.forEach((bossId: number, index: number) => {
                let cfg = WorldBossManager.ins().getWorldBossInfo(bossId)
                if (cfg == null || cfg.startTime <= G.TimeManager.serverNow) {
                    //boss不存在或者已开启 都要移除
                    this._waitOpenBossIds.splice(index, 1)
                    if (cfg) {
                        //如果不是不存在就再次请求boss信息
                        WorldBossModel.ins().sendWorldBossInfo
                    }
                }
            })
        }
    }

    /**初始化boss活动id*/
    protected initActivityIds(): void {
        if (this._activityIds.length == 0) {
            let activityCfgs = G.TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig)
            activityCfgs.forEach((cfg) => {
                if (cfg.UIView == UIFuilKey.worldBoss) {
                    this._activityIds.push(cfg.typeParam)
                    this._activityConditionMap.set(cfg.typeParam, cfg.conditionText)
                }
            })
            let cfgs = G.TableManager.getAllData(table.activity.WorldBoss.ActivityWorldbossConfig)
            cfgs.forEach((cfg) => {
                let arr = null
                if (this._activityIdsForBossMap.has(cfg.bossId)) {
                    arr = this._activityIdsForBossMap.get(cfg.bossId)
                } else {
                    arr = []
                    this._activityIdsForBossMap.set(cfg.bossId, arr)
                }
                arr.push(cfg.active)
            })
            let cfgs2 = G.TableManager.getAllData(table.worldboss.WorldBossConfig)
            cfgs2.forEach((cfg) => {
                this._bossTransIdMap.set(cfg.portalID, cfg.id)
            })
        }
    }

    public getBossIdByActivityId(activityId: number): number {
        let bossId = 0
        let bossIds = Array.from(this._activityIdsForBossMap.keys())
        for (let i = 0; i < bossIds.length; i++) {
            let activityIds = this._activityIdsForBossMap.get(bossIds[i])
            if (activityIds.indexOf(activityId) != -1) {
                bossId = bossIds[i]
                break
            }
        }
        return bossId
    }

    /**是否有boss对应的活动开启*/
    protected hasActivityShowByBossId(bossId: number): boolean {
        let hasActivity: boolean = false
        if (this._activityIdsForBossMap.has(bossId)) {
            let activityIds = this._activityIdsForBossMap.get(bossId)
            for (let i = 0; i < activityIds.length; i++) {
                if (this.isBossActivityShow(activityIds[i])) {
                    hasActivity = true
                    break
                }
            }
        }
        return hasActivity
    }

    /**是否展示活动*/
    protected isBossActivityShow(activityId: number): boolean {
        if (this._activityIds.indexOf(activityId) != -1) {
            let vo = ActivityModel.ins().getActivityVoById(activityId) as BaseActivityVo
            let isShowActivity = false
            if (vo) {
                let condition = this._activityConditionMap.get(activityId)
                let isOpen = condition == null || ConditionManager.ins().checkCondition(condition)
                isShowActivity = vo.isShowEntrance() && isOpen
            }
            return isShowActivity
        }
        return false
    }

    /**检测单个活动boss红点*/
    protected checkActivityBossRedDotById(activityId: number): void {
        let isShowActivity = this.isBossActivityShow(activityId)
        if (isShowActivity) {
            let bossId = this.getBossIdByActivityId(activityId)
            if (bossId > 0) {
                WorldBossModel.ins().tryToSendByFirstTime(bossId)
                let vo = WorldBossManager.ins().getWorldBossInfo(bossId)
                if (vo) {
                    this.updateBossRedDot(vo)
                }
            }
        }
    }

    /**检测所有活动boss红点*/
    protected checkActivityBossRedDot(): void {
        this._activityIds?.forEach((activityId: number) => {
            this.checkActivityBossRedDotById(activityId)
        })
    }

    protected updateBossRedDot(vo: Vo.worldboss.WorldBossVo): void {
        let leftTime = G.TimeManager.serverNow - vo.startTime
        let canDrawReward = false
        let hasChallengeTimes: boolean = false
        let challengeCount = 0
        let isOpen = ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.WORLD_BOSS)

        if (leftTime < 0 || !isOpen) {
            //boss未出现 或者未开启boss
            if (leftTime < 0) {
                if (this._waitOpenBossIds.indexOf(vo.bossConfigId) == -1) {
                    this._waitOpenBossIds.push(vo.bossConfigId)
                }
            }
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_worldBoss_reward, false, [vo.bossConfigId])
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_worldBoss_challenge, false, [vo.bossConfigId])
            RedDotManager.ins().setRedDot(RedDotKeys.WorldBoss_challenge, false, [vo.bossConfigId])
        } else {
            if (vo.killTime > 0) {
                //已击杀
                if (!vo.playerWorldBossVo.drawServerRewardMap[vo.bossConfigId] && vo.playerWorldBossVo.bossHurtMap[vo.bossConfigId]) {
                    canDrawReward = true
                }
            } else {
                if (vo.playerWorldBossVo?.bossChallengeTimesMap) {
                    challengeCount = vo.playerWorldBossVo?.bossChallengeTimesMap[vo.bossConfigId] || 0
                }
                let cfg = G.TableManager.getDataById(table.worldboss.WorldBossConfig, vo.bossConfigId);
                if (challengeCount < cfg?.dailyChallengeTimes) {
                    //挑战次数不足
                    hasChallengeTimes = true
                }
            }
            let hasActivity = this.hasActivityShowByBossId(vo.bossConfigId)
            let isOpenTrans = true
            let portalID = 0
            let bossCfg = G.TableManager.getDataById(table.worldboss.WorldBossConfig, vo.bossConfigId)
            if (bossCfg) {
                portalID = bossCfg.portalID
                isOpenTrans = MapModel.ins().getBuildingUnlockById(portalID)
            }

            RedDotManager.ins().setRedDot(RedDotKeys.Activity_worldBoss_reward, canDrawReward && hasActivity && isOpenTrans, [vo.bossConfigId])
            RedDotManager.ins().setRedDot(RedDotKeys.Activity_worldBoss_challenge, hasChallengeTimes && hasActivity && isOpenTrans, [vo.bossConfigId])
            RedDotManager.ins().setRedDot(RedDotKeys.WorldBoss_challenge, challengeCount <= 0, [vo.bossConfigId])
        }
    }

    protected updateSetUpRedDot(): void {
        //代表全量
        WorldBossManager.ins().worldBossInfoList?.forEach((vo) => {
            let need = WorldBossModel.ins().isNeedFormation(vo.bossConfigId);
            RedDotManager.ins().setRedDot(RedDotKeys.WorldBoss_setup, need, [vo.bossConfigId])
        })
    }
}

WorldBossController.ins().doInit();