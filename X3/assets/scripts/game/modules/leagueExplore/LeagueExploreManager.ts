import { Vec2 } from "cc";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { EnumUtils } from "../../../core/utils/EnumUtils";
import { Handler } from "../../../core/utils/Handler";
import { LocalStorageUtils } from "../../../core/utils/LocalStorageUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { BattleUtils } from "../../comm/battle/BattleUtils";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IMapObject } from "../../tiledMap/IMapObject";
import { IMapEnterOther } from "../../tiledMap/interface/IMapEnterOther";
import { ITransfer } from "../../tiledMap/interface/ITransfer";
import { MapObjectType } from "../../tiledMap/MapEnum";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";
import { EnumConditionType } from "../condition/enum/EnumConditionType";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";
import { PrivilegeAdditionController } from "../vip/PrivilegeAdditionController";
import { LeaugeExploreBuildingOccupyState } from "./const/LeagueExploreEnum";
import { ILeagueExploreBuyAtkTimesOpenArgs, ILeagueExploreExchangeConfirmOpenArgs, LeagueExploreConfirmType, UILeagueExploreConfig } from "./const/UILeagueExploreConfig";
import { ILeagueExploreBuildingVo } from "./model/vo/ILeagueExploreBuildingVo";
import { ILeagueExploreConstCfg } from "./model/vo/ILeagueExploreConstCfg";

export class LeagueExploreManager extends BaseController {
    protected _isInit: boolean = false;
    /**是否解锁资源勘探*/
    protected _isUnlock: boolean = false;
    protected _unlockTip: string = '';
    protected _unlockTime: number = -1;
    protected _nextRedDotRefreshTimeKey: string = null;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.EVENT_HAVE_LEAGUE,
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE,
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_KICKED_OUT_STAR,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInit = true;
                this.loadExploreInfo();
                break;
            case NotificationKey.EVENT_HAVE_LEAGUE:
                this.loadExploreInfo();
                break;
            case NotificationKey.EVENT_EXIT_LEAGUE:
                //退出联盟 还在勘探玩法中
                this.checkActivityExist();
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                let curMapFightType: FightType = GIns.battleMgr?.battleLogic?.fightType
                if (curMapFightType == FightType.TRUNK_MAP) {
                    //返回主线要退出星球
                    let starId: number = GIns.leagueExploreModel.curStarId
                    if (starId > 0) {
                        GIns.leagueExploreModel.sendExitStar({ starConfigId: starId });
                        GIns.leagueExploreModel.curStarId = 0;
                    }
                } else {
                    this.checkActivityExist();
                    this.handleEnterExploreMap();
                }
                break;
            case NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE:
                this.handleExploreTimeChange();
                this.updateRedDot();
                break;
            case NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE:
                this.handleMyExploreInfoChange();
                this.updateRedDot();
                break;
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this.handleMyExploreInfoChange();
                break;
            case NotificationKey.LEAGUE_EXPLORE_KICKED_OUT_STAR:
                if (GIns.battleMgr?.battleLogic?.fightType == FightType.LEAGUE_EXPLORE_MAP) {
                    //被踢出星球
                    GIns.floatingTextMgr.showTips('建筑占领状态清空！');
                    //返回主界面
                    G.FacadeManager.emitNow(NotificationKey.MAP_EXIT_OTHER);
                }
                break;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            if (this._isInit && this._isUnlock == false) {
                this.loadExploreInfo();
            }
        }
    }

    /**勘探时间变更*/
    protected _timerKey: string = null;
    protected handleExploreTimeChange(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
        let nowTime: number = G.TimeManager.serverNow;
        let activityInfo = GIns.leagueExploreModel.activityinfo;
        if (activityInfo && activityInfo.startTime <= nowTime && activityInfo.endTime >= nowTime) {
            //活动开启
            this._timerKey = G.GameTimer.once(activityInfo.endTime - nowTime, this, this.handleExploreTimeChange);
        }
        this.checkActivityExist();
    }

    /**我的勘探信息变更*/
    protected _infoTimerKey: string = null;
    protected handleMyExploreInfoChange(): void {
        if (this._infoTimerKey) {
            G.GameTimer.clearByKey(this._infoTimerKey);
            this._infoTimerKey = null;
        }
        let activityInfo = GIns.leagueExploreModel.activityinfo;
        if (activityInfo && activityInfo.playerInfoVo.occupyBuildingConfigId > 0) {
            //当前有占领建筑
            let nowTime: number = G.TimeManager.serverNow;
            let totalTime: number = this.getIncomeTotalTime();
            let remainTime: number = activityInfo.playerInfoVo.hangUpStartTime + totalTime - nowTime;
            if (remainTime > 0) {
                this._infoTimerKey = G.GameTimer.once(remainTime, this, this.handleMyExploreInfoChange);
            }
        }
    }

    protected checkActivityExist(): void {
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.LEAGUE_EXPLORE_MAP) {
            if (GIns.LeagueModel.getLeagueId() <= 0) {
                //我退出联盟了
                GIns.floatingTextMgr.showTips('未加入联盟');
                //返回主界面
                G.FacadeManager.emitNow(NotificationKey.MAP_EXIT_OTHER);
                G.UIManager.open(UIMainKey.MAIN_PAGE);
            } else if (this.isActive() == false) {
                //活动结束
                GIns.floatingTextMgr.showTips('活动已结束!');
                //返回主界面
                G.FacadeManager.emitNow(NotificationKey.MAP_EXIT_OTHER);
                G.UIManager.open(UIMainKey.MAIN_PAGE);
            }
        }
    }

    protected handleEnterExploreMap(): void {
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.LEAGUE_EXPLORE_MAP) {
            let starId: number = GIns.leagueExploreModel.curStarId
            if (starId == GIns.leagueExploreModel.constCfg.initStarConfigId) {
                //初始星球传送
                let myInfo = GIns.leagueExploreModel.activityinfo?.playerInfoVo;
                if (myInfo?.occupyBuildingConfigId > 0) {
                    let buildingVo = GIns.leagueExploreModel.getBuildingVo(myInfo.occupyBuildingConfigId);
                    if (buildingVo && buildingVo.cfg.starConfigId == starId) {
                        let buildingNode = GIns.mapMgr.curMap.getBuildingNode(buildingVo.cfg.id);
                        if (buildingNode) {
                            let endPos: Vec2 = new Vec2(buildingNode.mapObject.x, buildingNode.mapObject.y);
                            endPos = BattleUtils.setPosNotBlockPos(FightType.LEAGUE_EXPLORE_MAP, endPos);
                            this.enterPlanet(starId, 0, endPos);
                            return;
                        }
                    }
                }
            }
        }
    }

    /**更新红点*/
    protected updateRedDot(): void {
        let activityInfo = GIns.leagueExploreModel.activityinfo;
        let nowTime: number = G.TimeManager.serverNow;
        let isActive: boolean = this.isActive();
        let isNightTime: boolean = this.isNightTime();//当前是否是夜间时间
        let nextRefreshTime: number = this.getNextNightChangeTime();
        if (isActive && activityInfo && activityInfo.playerInfoVo.occupyBuildingConfigId > 0) {
            //当前有占领建筑
            let totalTime: number = this.getIncomeTotalTime();
            let remainTime: number = activityInfo.playerInfoVo.hangUpStartTime + totalTime - nowTime;
            GIns.redDotMgr.setRedDot(RedDotKeys.LeagueExplore_Income, remainTime <= 0);
            GIns.redDotMgr.setRedDot(RedDotKeys.LeagueExplore_occupy, false);
        } else {
            GIns.redDotMgr.setRedDot(RedDotKeys.LeagueExplore_Income, false);
            GIns.redDotMgr.setRedDot(RedDotKeys.LeagueExplore_occupy, isActive && isNightTime == false);
        }

        if (isActive && nextRefreshTime > nowTime) {
            let delay = nextRefreshTime - nowTime;
            G.GameTimer.once(delay, this, this.updateRedDot);
        }
    }

    /**是否解锁*/
    public isUnlock(): boolean {
        let unlockTime:number = this.getModuleUnlockTime();
        if (unlockTime > 0) {
            let nowTime = G.TimeManager.serverNow;
            if (unlockTime > nowTime) {
                return false;
            }
        }
        return this._isUnlock;
    }

    /**获取解锁提示*/
    public unlockTip(): string {
        return this._unlockTip;
    }

    /**功能是否开启*/
    public isActive(): boolean {
        let nowTime: number = G.TimeManager.serverNow;
        let activityInfo = GIns.leagueExploreModel.activityinfo;
        if (activityInfo && activityInfo.startTime <= nowTime && activityInfo.endTime >= nowTime) {
            return true;
        }
        return false;
    }

    /**当前是否是夜间模式*/
    public isNightTime(): boolean {
        let constCfg = GIns.leagueExploreModel.constCfg;
        let nowTime: number = G.TimeManager.serverNow;
        let todayZero: number = G.TimeManager.todayZero;
        let curMs: number = nowTime - todayZero;
        let curHour: number = Math.floor(curMs / 3600000);
        if (curHour < constCfg.dailyWarStartHour || curHour >= constCfg.dailyWarEndHour) {
            return true;
        }
        return false;
    }

    /**获取下一次夜间模式切换时间 夜间-白天 或者 白天-夜间*/
    public getNextNightChangeTime(): number {
        let nextRefreshTime: number = 0;
        let constCfg = GIns.leagueExploreModel.constCfg;
        let nowTime: number = G.TimeManager.serverNow;
        let todayZero: number = G.TimeManager.todayZero;
        let curMs: number = nowTime - todayZero;
        let curHour: number = Math.floor(curMs / 3600000);
        if (curHour < constCfg.dailyWarStartHour || curHour >= constCfg.dailyWarEndHour) {
            nextRefreshTime = todayZero + constCfg.dailyWarStartHour * 3600000;
        } else {
            nextRefreshTime = todayZero + constCfg.dailyWarEndHour * 3600000;
        }
        if (nextRefreshTime <= nowTime) {
            //代表是下一天
            nextRefreshTime += 24 * 3600000;
        }
        return nextRefreshTime;
    }

    /**是否占领建筑*/
    public hasOccupyBuilding(): boolean {
        if (this.isActive()) {
            let activityInfo = GIns.leagueExploreModel.activityinfo;
            if (activityInfo && activityInfo.playerInfoVo.occupyBuildingConfigId > 0) {
                return true;
            }
        }
        return false;
    }

    /**加载勘探信息*/
    protected loadExploreInfo(): void {
        this._isUnlock = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.LEAGUE_EXPLORE);
        if (this._isUnlock) {
            //结算还需要额外判断解锁时间
            let myLeagueId = GIns.LeagueModel.getLeagueId();
            if (myLeagueId > 0) {
                GIns.leagueExploreModel.sendLoadLeagueExploreInfo();
            }
        } else {
            this._unlockTip = GIns.moduleOpenMgr.getModuleLockTips(ServerEnums.SystemType.LEAGUE_EXPLORE);
        }
    }

    /**收益总时间*/
    public getIncomeTotalTime(): number {
        let baseTime = GIns.leagueExploreModel.constCfg.continueMinuets * 60000;
        baseTime += PrivilegeAdditionController.ins().getLeagueExploreHangUpTime();
        return baseTime;
    }

    public gotoBuildingByMapObject(mapObj: IMapObject, radius: number = 10, onComplete: Handler = null): void {
        let myPos: Vec2 = GIns.battleMgr.mainScene.getHeroTeam().pos;
        let endPos: Vec2 = new Vec2(mapObj.x, mapObj.y);
        let distance = Vec2.distance(myPos, endPos);
        if (distance > radius) {
            //寻路到附近
            let t = (distance - radius) / distance;
            endPos = Vec2.lerp(endPos, myPos, endPos, t);
        }
        endPos = BattleUtils.setPosNotBlockPos(FightType.LEAGUE_EXPLORE_MAP, endPos);
        GIns.battleMgr.mainScene.getHeroTeam().setMoveTarget(endPos, onComplete);
    }

    /**去往最近的工厂*/
    public gotoNearFactory(radius: number = 5, onComplete: Handler = null): boolean {
        let factoryObjs: IMapObject[] = GIns.mapMgr.curMap.getObjectsByType(MapObjectType.factories);
        if (!factoryObjs || factoryObjs.length <= 0) {
            GIns.floatingTextMgr.showTips('附近没有工厂');
            return false;
        }
        let minDistance: number = -1;
        let minFactory: IMapObject = null;
        let myPos: Vec2 = GIns.battleMgr.mainScene.getHeroTeam().pos;
        let factoryPos: Vec2 = new Vec2();
        factoryObjs?.forEach((mapObj) => {
            factoryPos.set(mapObj.x, mapObj.y);
            let distance = Vec2.distance(myPos, factoryPos);
            if (minDistance == -1 || minDistance > distance) {
                minDistance = distance;
                minFactory = mapObj;
            }
        })
        if (minFactory) {
            this.gotoBuildingByMapObject(minFactory, radius, onComplete);
            return true;
        }
    }

    /**前往建筑*/
    public gotoBuilding(buildingId: number, radius: number = 5, onComplete: Handler = null): boolean {
        let buildingNode = GIns.mapMgr.curMap.getBuildingNode(buildingId);
        if (buildingNode) {
            this.gotoBuildingByMapObject(buildingNode.mapObject, radius, onComplete);
            return true;
        } else {
            let starName: string = '未知星球';
            let buildingVo = GIns.leagueExploreModel.getBuildingVo(buildingId);
            if (buildingVo) {
                let starCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarConfig, buildingVo.cfg.starConfigId);
                if (starCfg) {
                    starName = starCfg.name;
                }
            }
            GIns.floatingTextMgr.showTips(`建筑在${starName}，请自行前往`);
            return false;
        }
    }

    /**分享建筑*/
    public shareBuilding(buildingId: number, channelIds: number[], pos: Vec2): void {
        if (!channelIds || channelIds.length <= 0) {
            GIns.floatingTextMgr.showTips('需先勾选待分享频道');
            return;
        }
        //计算cd
        let channelShareTimeMap = GIns.leagueExploreModel.activityinfo?.playerInfoVo?.channelShareTimeMap;
        if (channelShareTimeMap) {
            let nowTime: number = G.TimeManager.serverNow;
            let constCfg = GIns.leagueExploreModel.constCfg;
            for (let i = 0; i < channelIds.length; i++) {
                let channelStr: string = ServerEnums.ChannelType[channelIds[i]]
                let shareTime: number = constCfg.shareChannelTypeMap.get(channelStr);
                let intervalTime: number = shareTime * 1000;
                let lastSendTime: number = channelShareTimeMap[channelIds[i]];
                if (lastSendTime > 0 && nowTime - lastSendTime < intervalTime) {
                    //时间未到
                    let remainSecond = Math.ceil((intervalTime - nowTime + lastSendTime) / 1000);
                    let cfg = G.TableManager.getDataById(table.chat.ChatChannelConfig, channelStr);
                    let channelName: string = cfg ? G.I18nManager.lang(cfg.name) : '';
                    GIns.floatingTextMgr.showTips(`${channelName}${remainSecond}秒后可再次发言`);
                    return;
                }
            }
        }
        GIns.leagueExploreModel.sendShareBuilding({
            buildingConfigId: buildingId, channelIds: channelIds, point: {
                x: pos.x, y: pos.y
            }, targetId: 0
        })
    }

    /**进入星球*/
    public enterPlanet(starId: number, buildingId?: number, pos?: { x: number, y: number }): void {
        let myLeagueId = GIns.LeagueModel.getLeagueId();
        if (myLeagueId <= 0) {
            GIns.floatingTextMgr.showTips('您尚未加入联盟');
            return;
        }
        if (this.isActive() == false) {
            GIns.floatingTextMgr.showTips('活动尚未开启');
            return;
        }
        let starCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarConfig, starId);
        if (starCfg == null) {
            GIns.floatingTextMgr.showTips('星球不存在!')
            return;
        }
        let myInfo = GIns.leagueExploreModel.activityinfo?.playerInfoVo;
        let oldStar: number = GIns.leagueExploreModel.curStarId;
        if (oldStar > 0 && oldStar != starId) {
            //退出旧星球
            GIns.leagueExploreModel.sendExitStar({ starConfigId: oldStar });
        }
        GIns.leagueExploreModel.curStarId = starId;

        if (oldStar != starId) {
            //进入星球
            if (!pos) {
                //没有坐标位置 就随机一个
                let cfgs = GIns.leagueExploreModel.getTeleportPoints(starId);
                if (cfgs?.length > 0) {
                    let randomIdx = Math.floor(Math.random() * cfgs.length);
                    let cfg = cfgs[randomIdx];
                    if (cfg.transferPos) {
                        pos = { x: cfg.transferPos[0], y: cfg.transferPos[1] };
                    }
                }
            }
            GIns.leagueExploreModel.sendEnterStar({ starConfigId: starId });
            let enterDatas: IMapEnterOther = {
                fightType: FightType.LEAGUE_EXPLORE_MAP,
                mapId: starCfg.id,
                buildingId: buildingId,
                pos: pos
            }
            this.emit(NotificationKey.MAP_ENTER_OTHER, enterDatas)
            G.UIManager.open(UILeagueExploreConfig.LeagueExploreMapView);

            GIns.leagueExploreModel.sendLoadStarBuildingList({ starConfigId: starId });
            if (myInfo?.occupyBuildingConfigId > 0) {
                //如果自己有占领建筑 需要请求一次建筑信息 操作时需要判断自己的建筑状态
                G.GameTimer.once(200, this, () => {
                    GIns.leagueExploreModel.sendLoadBuildingInfo({ buildingConfigId: myInfo?.occupyBuildingConfigId });
                })
            }
        } else {
            //同一个星球直接传送
            let transfarData: ITransfer = { mapId: starId, buildingId: buildingId, pos: pos };
            this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transfarData);
            //同地图需要延时开启战斗
            G.GameTimer.once(200, this, () => {
                G.FacadeManager.emit(NotificationKey.BATTLE_START);
            })
        }

    }

    /**操作建筑*/
    public handleOperBuilding(buildingId: number): void {
        let vo = GIns.leagueExploreModel.getBuildingVo(buildingId);
        if (vo) {
            this.handleOperBuildingByVo(vo);
        }
    }

    protected handlePerBuildingComplete(buildingVo: ILeagueExploreBuildingVo, state: LeaugeExploreBuildingOccupyState): void {
        let myInfo = GIns.leagueExploreModel.activityinfo?.playerInfoVo;
        let isMine: boolean = ServerEnums.LeagueExploreBuildingType[buildingVo.cfg.buildingType] == ServerEnums.LeagueExploreBuildingType.MINE
        if (isMine && state != LeaugeExploreBuildingOccupyState.MyLeagueCanExchange && state != LeaugeExploreBuildingOccupyState.MyLeagueNoExchange) {
            let enemy = GIns.leagueExploreModel.getAssistDefendTargetForMine(buildingVo);
            if (enemy) {
                //攻击协助的对象
                GIns.leagueExploreModel.sendAttackBuilding({ buildingConfigId: buildingVo.cfg.id });
                return;
            }
        }

        switch (state) {
            case LeaugeExploreBuildingOccupyState.Idle:
                if (buildingVo.vo.buildingState != ServerEnums.LeagueExploreBuildingState.IDLE) {
                    //不是空闲状态 走进攻接口
                    GIns.leagueExploreModel.sendAttackBuilding({ buildingConfigId: buildingVo.cfg.id });
                } else {
                    if (isMine) {
                        //矿场无人时 判断所属工厂 
                        let factoryVo: ILeagueExploreBuildingVo = null
                        if (buildingVo.cfg.parentBuildingId > 0) {
                            factoryVo = GIns.leagueExploreModel.getBuildingVo(buildingVo.cfg.parentBuildingId);
                        }
                        if (factoryVo == null || GIns.leagueExploreModel.getBuildingOccupyLeagueId(factoryVo) == GIns.LeagueModel.getLeagueId()) {
                            //如果没有所属工厂或者所属工厂是自己联盟的 直接驻守
                            GIns.leagueExploreModel.sendDefendBuilding({ buildingConfigId: buildingVo.cfg.id });
                        } else {
                            GIns.leagueExploreModel.sendOccupyBuilding({ buildingConfigId: buildingVo.cfg.id });
                        }
                    } else {
                        GIns.leagueExploreModel.sendOccupyBuilding({ buildingConfigId: buildingVo.cfg.id });
                    }
                }
                break;
            case LeaugeExploreBuildingOccupyState.Me:
                G.UIManager.open(UILeagueExploreConfig.LeagueExploreExchangeConfirmWin, {
                    buildingId: buildingVo.cfg.id,
                    type: LeagueExploreConfirmType.CancelOccupy,
                    // 点击确认回调
                    okFunc: () => {
                        GIns.leagueExploreModel.sendCancelOccupy();
                    },
                } as ILeagueExploreExchangeConfirmOpenArgs);
                break;
            case LeaugeExploreBuildingOccupyState.MyLeagueNoFull:
                GIns.leagueExploreModel.sendDefendBuilding({ buildingConfigId: buildingVo.cfg.id });
                break;
            case LeaugeExploreBuildingOccupyState.MyLeagueCanExchange:
            case LeaugeExploreBuildingOccupyState.MyLeagueNoExchange:
                let myOccupyBuildingVo = GIns.leagueExploreModel.getBuildingVo(myInfo.occupyBuildingConfigId);
                if (myOccupyBuildingVo) {
                    if (Math.abs(myOccupyBuildingVo.cfg.level - buildingVo.cfg.level) > GIns.leagueExploreModel.constCfg.exchangeBuildingLevelDiff) {
                        GIns.floatingTextMgr.showTips(`交换建筑等级差不可超过${GIns.leagueExploreModel.constCfg.exchangeBuildingLevelDiff}级`);
                    } else {
                        GIns.leagueExploreModel.sendExchangeBuilding({ buildingConfigId: buildingVo.cfg.id, seatIndex: 1 });
                    }
                } else {
                    //我没有占领
                    GIns.leagueExploreModel.sendExchangeBuilding({ buildingConfigId: buildingVo.cfg.id, seatIndex: 1 });
                }
                break;
            case LeaugeExploreBuildingOccupyState.Enemy:
                GIns.leagueExploreModel.sendAttackBuilding({ buildingConfigId: buildingVo.cfg.id });
                break;
        }
    }

    /**根据vo操作建筑*/
    public handleOperBuildingByVo(buildingVo: ILeagueExploreBuildingVo): void {
        if (!buildingVo || buildingVo.vo == null) {
            //buildingVo不存在
            return;
        }
        let myInfo = GIns.leagueExploreModel.activityinfo.playerInfoVo;
        let myLeagueId: number = GIns.LeagueModel.getLeagueId();
        let state: LeaugeExploreBuildingOccupyState = GIns.leagueExploreModel.getBuildingOccupyState(buildingVo);
        let constCfg: ILeagueExploreConstCfg = GIns.leagueExploreModel.constCfg;
        let todayZero: number = G.TimeManager.todayZero;
        let nowTime: number = G.TimeManager.serverNow;
        let curMs: number = nowTime - todayZero;
        let curHour: number = Math.floor(curMs / 3600000);

        let activityInfo = GIns.leagueExploreModel.activityinfo;
        let curTime: number = G.TimeManager.serverNow;
        let endFightTime: number = activityInfo.startTime + GIns.leagueExploreModel.constCfg.fightContinueMinutes * 60000;
        if (curTime >= endFightTime) {
            //已过了战斗时间不可战斗
            GIns.floatingTextMgr.showTips('进入结算阶段，不可发起战斗！');
            return;
        }

        if (curHour < constCfg.dailyWarStartHour || curHour >= constCfg.dailyWarEndHour) {
            //非战斗时间
            let isMine: boolean = ServerEnums.LeagueExploreBuildingType[buildingVo.cfg.buildingType] == ServerEnums.LeagueExploreBuildingType.MINE
            if (isMine || state != LeaugeExploreBuildingOccupyState.MyLeagueNoFull) {
                //有位置的工厂还是可以驻守 其他情况就夜间保护
                GIns.floatingTextMgr.showTips('当前处于夜间保护时间');
                return;
            }
        }

        if (GIns.leagueExploreModel.getBuildingOccupyLeagueId(buildingVo) != myLeagueId
            || state == LeaugeExploreBuildingOccupyState.MyLeagueCanExchange
            || state == LeaugeExploreBuildingOccupyState.MyLeagueNoExchange) {
            //当前非我方建筑
            if (myInfo.attackLimitTime > 0) {
                //判断战败时间
                let remainTime = myInfo.attackLimitTime - nowTime;
                if (remainTime > 0) {
                    if (myInfo.attackLimitResetTimes >= GIns.leagueExploreModel.maxBuyAtkTimes) {
                        //已达购买次数上限
                        let remainMin: number = Math.ceil(remainTime / 60000);
                        GIns.floatingTextMgr.showTips(`还需等待${remainMin}分钟后才能进攻`);
                        return;
                    }
                    this.openBuyAtkTimesUI(() => {
                        GIns.leagueExploreModel.sendResetAttackLimit(buildingVo.cfg.id);
                    });
                    return;
                }
            }
            if (buildingVo.vo.buildingState == ServerEnums.LeagueExploreBuildingState.PROTECTED) {
                //判断受保护时间
                let remainTime = buildingVo.vo.stateEndTime - nowTime;
                if (remainTime > 0) {
                    let remainMin: number = Math.ceil(remainTime / 60000);
                    GIns.floatingTextMgr.showTips(`建筑处于保护状态`);
                    return;
                }
            }
        }

        if (myInfo.occupyBuildingConfigId > 0) {
            //我当前有占领建筑
            let myBuildingVo = GIns.leagueExploreModel.getBuildingVo(myInfo.occupyBuildingConfigId);
            if (myBuildingVo.vo.beAttacking) {
                GIns.floatingTextMgr.showTips('您正在被他人攻打，请稍后再试');
                return;
            }
        }

        if (buildingVo.vo.attacking) {
            GIns.floatingTextMgr.showTips('当前驻守玩家正在进攻其他建筑');
            return;
        }
        if (state != LeaugeExploreBuildingOccupyState.Me
            && buildingVo.vo.beAttackPlayerId > 0
            && buildingVo.vo.beAttackPlayerId != GIns.playerModel.playerId) {
            //不是自己的建筑需要判断攻击时间配置
            let isSameLeauge: boolean = myLeagueId == buildingVo.vo.beAttackLeagueId;
            if (isSameLeauge) {
                if (nowTime - buildingVo.vo.beAttackStartTime < constCfg.sameLeagueFightWaitSeconds * 1000) {
                    GIns.floatingTextMgr.showTips('当前建筑正在被其他玩家攻击');
                    return;
                }
            } else {
                if (nowTime - buildingVo.vo.beAttackStartTime < constCfg.otherLeagueFightWaitSeconds * 1000) {
                    GIns.floatingTextMgr.showTips('当前建筑正在被其他联盟攻击');
                    return;
                }
            }
        }

        let formationVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.LEAGUE_EXPLORE);
        if (!formationVo || formationVo.isEmptyFormation()) {
            GIns.floatingTextMgr.showTips('请先布置阵容');
            G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(FightType.LEAGUE_EXPLORE));
            // G.UIManager.open(UIFormationKey.FormationDefendView, ServerEnums.FightType.LEAGUE_EXPLORE);
            return;
        }
        if (myInfo.occupyBuildingConfigId > 0 && buildingVo.cfg.id != myInfo.occupyBuildingConfigId) {
            //我已经占领了一个地方 并且当前在攻击的玩家不是我
            let hasFightThisBuilding: boolean = false;
            for (let i = 0; i < buildingVo.briefVo.occupyPlayerBaseVos.length; i++) {
                if (GIns.leagueExploreModel.activityinfo.playerInfoVo?.defeatPlayerIds?.indexOf(buildingVo.briefVo.occupyPlayerBaseVos[i].id) != -1) {
                    hasFightThisBuilding = true;
                    break;
                }
            }
            if (!hasFightThisBuilding) {
                //二次确认是否切换
                G.UIManager.open(UILeagueExploreConfig.LeagueExploreExchangeConfirmWin, {
                    buildingId: buildingVo.cfg.id,
                    type: LeagueExploreConfirmType.Exchange,
                    // 点击确认回调
                    okFunc: () => {
                        this.handlePerBuildingComplete(buildingVo, state);
                    },
                } as ILeagueExploreExchangeConfirmOpenArgs);
                return;
            }
        }
        this.handlePerBuildingComplete(buildingVo, state);

    }


    /**获取星球解锁时间 没有就返回0*/
    public getStarUnlockTime(starId: number): number {
        let cfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarConfig, starId);
        let endTime: number = 0;
        if (cfg) {
            if (GIns.conditionMgr.checkCondition(cfg.unlockConditions) == false) {
                let conditonValue = GIns.conditionMgr.getConditionValue(cfg.unlockConditions, EnumConditionType.SYSTEM_OPEN_HOUR_GE);
                if (conditonValue > 0) {
                    //开服小时数
                    let openZero: number = G.TimeManager.openDayZero;
                    let openServerTime = G.TimeManager.openServerTime;
                    let startHourTime: number = openZero + Math.floor((openServerTime - openZero) / 3600000) * 3600000
                    endTime = startHourTime + (conditonValue - 1) * 3600000;
                } else {
                    conditonValue = GIns.conditionMgr.getConditionValue(cfg.unlockConditions, EnumConditionType.SYSTEM_OPEN_DAY_GE);
                    if (conditonValue > 0) {
                        //开服天数
                        let openZero: number = G.TimeManager.openDayZero;
                        endTime = openZero + (conditonValue - 1) * 24 * 3600000;
                    } else {
                        endTime = 0;
                    }
                }
            }
        }
        return endTime;
    }

    /**获取功能开启时间 没有就返回0*/
    public getModuleUnlockTime(): number {
        if (this._unlockTime == -1) {
            const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, ServerEnums.SystemType.LEAGUE_EXPLORE);
            let cfg = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
            let endTime: number = 0;
            if (cfg.serverOpenDays > 0) {
                let openZero: number = G.TimeManager.openDayZero;
                endTime = openZero + (cfg.serverOpenDays - 1) * 24 * 3600000;
                endTime += GIns.leagueExploreModel.constCfg.dailyWarStartHour * 3600000;
            }
            this._unlockTime = endTime;
        }
        return this._unlockTime;
    }

    /**打开今日只显示一次的提示*/
    public openBuyAtkTimesUI(callback: () => void): void {
        let args: ILeagueExploreBuyAtkTimesOpenArgs = {
            localKey: 'leagueExplore_buyAtkTimes_' + GIns.playerModel.playerId,
            onClickConfirm: callback
        }
        if (args.localKey) {
            let localKey: Number = LocalStorageUtils.get(args.localKey, Number);
            let localTime: number = 0;
            if (localKey) {
                localTime = localKey.toInt();
            }
            if (localTime > 0) {
                let todayZero: number = G.TimeManager.todayZero;
                if (localTime == todayZero) {
                    //代表还没过记录时间 不弹提示 直接确认
                    if (args.onClickConfirm) {
                        args.onClickConfirm();
                        return
                    }
                }
            }
        }
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreBuyAtkTimesWin, args);
    }

    onInit(): void {

    }
}
LeagueExploreManager.ins().doInit()