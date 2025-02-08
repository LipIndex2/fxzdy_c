import { Vec2 } from "cc";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { LocalStorageUtils } from "../../../core/utils/LocalStorageUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IMapEnterOther } from "../../tiledMap/interface/IMapEnterOther";
import { ITransfer } from "../../tiledMap/interface/ITransfer";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { IBtnConfirmViewOnceTodayOpenArgs } from "../common/confirm/IBtnConfirmViewOnceTodayOpenArgs";
import { CommonI18nKeys } from "../common/i18n/CommonI18nKeys";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";
import { HeroVo } from "../hero/HeroVo";
import { EventRankDataResp } from "../rank/event/EventRankData";
import { IPetDungeonToyDelOpenArgs, UIPetDungeonConfig } from "./const/UIPetDungeonConfig";

export class PetDungeonManager extends BaseController {
    protected _isInit: boolean = false;
    /**是否解锁资源勘探*/
    protected _isUnlock: boolean = false;
    protected _unlockTip: string = '';
    /**跨天等待返回主界面*/
    protected _waitBackFromNewDay: boolean = false;
    /**最后一个宝箱id用于判断是否刷新红点*/
    protected _lastToyBoxId: number = 0;
    /**是否勾选自动下一关*/
    public isSelectAutoNext: boolean = false;
    /**当前地图记录的关卡id用于判断是否播放动画*/
    public curMapViewFloorId: number = 0;


    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.PET_DUNGEON_TIME_CHANGE,
            NotificationKey.RANK_ON_DATA_RESP,
            NotificationKey.PET_DUNGEON_FLOOR_CHANGE,
            NotificationKey.PET_DUNGEON_RESET_COMPLETE,
            NotificationKey.PET_DUNGEON_SWEEP_COMPLETE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.PET_DUNGEON_TOY_UPDATE,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInit = true;
                //登录重置记录
                this._lastToyBoxId = 0;
                this.loadPetDungeonInfo();
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.checkActivityExist();
                if (GIns.petDungeonModel.sweepRewards) {
                    G.GameTimer.once(1200, this, () => {
                        this.checkAndShowSweepRewards();
                    })
                }
                if (this._waitBackFromNewDay) {
                    this.checkBackToMainWhileNewDay();
                    this._waitBackFromNewDay = false;
                }
                break;
            case NotificationKey.PET_DUNGEON_TIME_CHANGE:
                this.handleActivityTimeChange();
                break;
            case NotificationKey.RANK_ON_DATA_RESP:
                let data = args as EventRankDataResp;
                if (data?.rankType == ServerEnums.RankingType.PET_DUNGEON) {
                    GIns.petDungeonModel.myRank = data.myRankNum;
                }
                break;
            case NotificationKey.PET_DUNGEON_FLOOR_CHANGE:
                GIns.rankModel.sendRankList({ type: ServerEnums.RankingType.PET_DUNGEON, page: 1, subRankParam: null });
                break;
            case NotificationKey.PET_DUNGEON_RESET_COMPLETE:
                this.onResetComplete();
                break;
            case NotificationKey.PET_DUNGEON_SWEEP_COMPLETE:
                this.onSweepComplete();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天刷新数据
                this.loadPetDungeonInfo();
                this.onNewDayHandler();
                if (GIns.petDungeonModel.curMaxFloorId == 0) {
                    //代表跨天不会触发关卡变更 所以就在这里请求一次排行
                    GIns.rankModel.sendRankList({ type: ServerEnums.RankingType.PET_DUNGEON, page: 1, subRankParam: null });
                }
                break;
            case NotificationKey.PET_DUNGEON_TOY_UPDATE:
                this.updateRedDot();
                break;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            if (this._isInit && this._isUnlock == false) {
                this.loadPetDungeonInfo();
            }
        }
    }

    protected onNewDayHandler(): void {
        //跨天处理
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.PET_DUNGEON) {
            //正在战斗中 等待返回
            this._waitBackFromNewDay = true;
        } else {
            this.checkBackToMainWhileNewDay();
        }
    }

    protected checkBackToMainWhileNewDay(): void {
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.PET_DUNGEON_MAP) {
            //跨天返回
            GIns.floatingTextMgr.showTips('进度已重置，请重新挑战！');
            this.backToMainView();
        }
    }

    protected onResetComplete(): void {
        GIns.floatingTextMgr.showTips('重置完成!');
        this.backToMainView();
    }

    protected onSweepComplete(): void {
        GIns.floatingTextMgr.showTips('扫荡完成!');
        let result: boolean = this.enterPetDungeon();
        if (result == false) {
            //进入失败直接弹出奖励
            this.checkAndShowSweepRewards(true);
        } else {
            //等待进入地图后才弹出奖励
        }
    }

    /**检测弹出扫荡奖励*/
    protected checkAndShowSweepRewards(force: boolean = false): void {
        if (GIns.petDungeonModel.sweepRewards) {
            let rewards = GIns.petDungeonModel.sweepRewards;
            if (GIns.battleMgr?.battleLogic?.fightType == FightType.PET_DUNGEON_MAP || force) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, rewards);
            } else {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewards);
            }
            GIns.petDungeonModel.sweepRewards = null;
        }

    }

    /**时间变更*/
    protected _timerKey: string = null;
    protected handleActivityTimeChange(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
        let nowTime: number = G.TimeManager.serverNow;
        let activityInfo = GIns.petDungeonModel.activityInfo;
        if (activityInfo && activityInfo.startTime <= nowTime && activityInfo.endTime >= nowTime) {
            //活动开启 到时间后需要重新刷新一次数据
            this._timerKey = G.GameTimer.once(activityInfo.endTime - nowTime, this, this.onActivityTimerEndComplete);
        }
        this.checkActivityExist();
    }

    /**活动计时结束处理*/
    protected onActivityTimerEndComplete(): void {
        this.loadPetDungeonInfo();
        this.handleActivityTimeChange();
    }

    /*检测活动是否结束*/
    protected checkActivityExist(): void {
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.PET_DUNGEON_MAP) {
            if (this.isActive() == false) {
                //活动结束
                GIns.floatingTextMgr.showTips('活动已结束!');
                //返回主界面
                G.FacadeManager.emitNow(NotificationKey.MAP_EXIT_OTHER);
                G.UIManager.open(UIMainKey.MAIN_PAGE);
            }
        }
    }

    /**红点刷新*/
    protected updateRedDot(): void {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        let lastId: number = 0;
        if (myInfo?.toyBoxList?.length > 0) {
            lastId = myInfo.toyBoxList[myInfo.toyBoxList.length - 1].id;
        }
        if (this._lastToyBoxId != lastId) {
            //代表获得了新的玩具宝箱
            this._lastToyBoxId = lastId;
            GIns.redDotMgr.setRedDot(RedDotKeys.PetDungeon_newToy, lastId > 0);
        }
    }

    /**从地图界面返回主界面*/
    public backToMainView(): void {
        if (GIns.battleMgr?.battleLogic?.fightType == FightType.PET_DUNGEON_MAP) {
            G.FacadeManager.emitNow(NotificationKey.MAP_EXIT_OTHER);
            G.UIManager.close(UIPetDungeonConfig.PetDungeonMapView);
            if (G.UIManager.isOpened(UIPetDungeonConfig.PetDungeonMainView) == false) {
                G.UIManager.open(UIPetDungeonConfig.PetDungeonMainView);
            }
        }
    }

    /**是否解锁*/
    public isUnlock(): boolean {
        return this._isUnlock;
    }

    /**获取解锁提示*/
    public unlockTip(): string {
        return this._unlockTip;
    }

    /**功能是否开启*/
    public isActive(): boolean {
        let nowTime: number = G.TimeManager.serverNow;
        let activityInfo = GIns.petDungeonModel.activityInfo;
        if (activityInfo && activityInfo.startTime <= nowTime && activityInfo.endTime >= nowTime) {
            return true;
        }
        return false;
    }

    /**加载勘探信息*/
    protected loadPetDungeonInfo(): void {
        this._isUnlock = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.PET_DUNGEON);
        if (this._isUnlock) {
            GIns.petDungeonModel.sendLoadPetDungeonInfo();
        } else {
            this._unlockTip = GIns.moduleOpenMgr.getModuleLockTips(ServerEnums.SystemType.PET_DUNGEON);
        }
    }

    protected handleResetFloor(): boolean {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        let constCfg = GIns.petDungeonModel.constCfg;
        if (myInfo.todayResetTimes <= 0) {
            //首次重置
            if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(constCfg.dailyResetCosts, true) == false) {
                return false;
            }
        } else {
            if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(constCfg.repeatResetCosts, true) == false) {
                return false;
            }
        }
        GIns.petDungeonModel.sendReset();
        return true;
    }

    /**获取下一关建筑配置信息*/
    public getNextFloorBuildingCfg(): table.petdungeon.PetDungeonBuildingConfig {
        let myInfo: Vo.petdungeon.PetDungeonPlayerInfoVo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return null;
        }
        let nextCfg = GIns.petDungeonModel.nextFloorCfg;
        if (!nextCfg) {
            return;
        }
        let buiildingId = nextCfg.buildingConfigId;
        let petBuildingCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonBuildingConfig, buiildingId);
        return petBuildingCfg;
    }

    /**获取当前进入地图的传送点*/
    public getEnterPos(): Vec2 {
        let petBuildingCfg = this.getNextFloorBuildingCfg();
        if (petBuildingCfg) {
            if (petBuildingCfg.startTransId > 0) {
                let pointCfg = null;
                if (GIns.petDungeonModel.isFloorMax) {
                    //已通关
                    pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, petBuildingCfg.endTransId);
                } else {
                    pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, petBuildingCfg.startTransId);
                }
                if (pointCfg && pointCfg.transferPos && pointCfg.transferPos.length >= 2) {
                    return new Vec2(pointCfg.transferPos[0], pointCfg.transferPos[1]);
                }
            }
        }
        return null
    }

    /**获取当前进入地图的最终停留点位置*/
    public getEndPos(): Vec2 {
        let petBuildingCfg = this.getNextFloorBuildingCfg();
        if (petBuildingCfg) {
            if (petBuildingCfg.endTransId > 0) {
                let pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, petBuildingCfg.endTransId);
                if (pointCfg && pointCfg.transferPos && pointCfg.transferPos.length >= 2) {
                    return new Vec2(pointCfg.transferPos[0], pointCfg.transferPos[1]);
                }
            }
        }
        return null
    }

    /**获取从战斗返回时进入地图的坐标*/
    public getBackPos(): Vec2 {
        let curFloorId = GIns.petDungeonModel.curMaxFloorId;
        let lastFloorId = GIns.petDungeonMgr.curMapViewFloorId;
        let posFloorId: number = curFloorId + 1;
        let hasMoveAni: boolean = false;
        if (GIns.petDungeonModel.isFloorMax) {
            //已通关 也只能停留在最后一关的位置
            posFloorId = curFloorId;
        } else if (lastFloorId < curFloorId) {
            //代表是在前进需要显示前进动画 所以停留位置就是在前一关的位置
            if (curFloorId > GIns.petDungeonModel.firstFloorId) {
                hasMoveAni = true;
            }
        }
        let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, posFloorId);
        if (cfg) {
            let petBuildingCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonBuildingConfig, cfg.buildingConfigId);
            if (petBuildingCfg) {
                let pointCfg = null;
                if (hasMoveAni == false) {
                    //没有动画直接停留在结束位置
                    pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, petBuildingCfg.endTransId);
                } else if (petBuildingCfg.backTransIds?.length > 0) {
                    //有动画停留在返回位置 然后动画移动到结束位置
                    pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, petBuildingCfg.backTransIds[0]);
                }
                if (pointCfg && pointCfg.transferPos && pointCfg.transferPos.length >= 2) {
                    return new Vec2(pointCfg.transferPos[0], pointCfg.transferPos[1]);
                }
            }
        }
        return null;
    }

    /**进入宠物副本*/
    public enterPetDungeon(): boolean {
        if (this.isActive() == false) {
            GIns.floatingTextMgr.showTips('活动尚未开启');
            return false;
        }
        let myInfo: Vo.petdungeon.PetDungeonPlayerInfoVo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return false;
        }

        let enterPos = this.getEnterPos();
        let mapId: number = GIns.petDungeonModel.constCfg.mapId;
        if (GIns.mapMgr.curMap?.getMapID() != mapId) {
            //进入副本
            let enterDatas: IMapEnterOther = {
                fightType: FightType.PET_DUNGEON_MAP,
                mapId: mapId,
                pos: enterPos
            }
            this.emit(NotificationKey.MAP_ENTER_OTHER, enterDatas)
            G.UIManager.open(UIPetDungeonConfig.PetDungeonMapView);
        } else {
            //同一个地图直接传送
            let transfarData: ITransfer = { mapId: mapId, pos: enterPos };
            this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transfarData);
            //同地图需要延时开启战斗
            G.GameTimer.once(200, this, () => {
                G.FacadeManager.emit(NotificationKey.BATTLE_START);
            })
        }
        return true;
    }

    /**挑战*/
    public challenge(floorId: number): boolean {
        if (this.isActive() == false) {
            GIns.floatingTextMgr.showTips('活动尚未开启');
            return false;
        }
        let formationVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.PET_DUNGEON);
        if (!formationVo || formationVo.isEmptyFormation()) {
            GIns.floatingTextMgr.showTips('请先布置阵容');
            G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(FightType.PET_DUNGEON));
            return false;
        }
        let activityInfo = GIns.petDungeonModel.activityInfo;
        let curTime: number = G.TimeManager.serverNow;
        let endFightTime: number = activityInfo.startTime + GIns.petDungeonModel.constCfg.fightContinueMinutes * 60000;
        if (curTime >= endFightTime) {
            //已过了战斗时间不可战斗
            GIns.floatingTextMgr.showTips('进入结算阶段，不可发起战斗！');
            return false;
        }
        GIns.petDungeonModel.sendChallenge({ petDungeonConfigId: floorId });
        return true;
    }

    /**重置*/
    public resetFloor(): void {
        let chapterName: string = '无';
        if (GIns.petDungeonModel.isFloorMax) {
            //已通关
            chapterName = '已完成';
        } else if (GIns.petDungeonModel.nextFloorCfg) {
            chapterName = GIns.petDungeonModel.nextFloorCfg.name;
        }
        let content = `是否重置当前挑战进度<br/>当前进度：<color=#5dff59>${chapterName}</color>`;
        let args: IBtnConfirmViewOnceTodayOpenArgs = {
            /**标题*/
            title: '重置确认',
            /**取消 (不设置 则为 仅可确认弹窗)*/
            titleCancel: CommonI18nKeys.cancel,
            /**确认*/
            titleConfirm: CommonI18nKeys.confirm,
            /**内容*/
            content: content,
            /**本地记录的key值*/
            localKey: 'onceTodayResetPetDungeonFloor_' + GIns.playerModel.playerId,
            /**点击确认回调*/
            onClickConfirm: () => {
                this.handleResetFloor();
            }
        }
        GIns.uiCommonMgr.openConfirmViewTodayOnce(args);
    }


    /** 获取一键布阵的data */
    public getFormationDatas(): Vo.formation.PositionVo[] {
        let heroVoArr: HeroVo[] = [];
        let map = GIns.petDungeonModel.prepareHeroMap;
        map.forEach((value) => {
            if (value.hpRatio > 0) {
                let heroVo = GIns.heroMgr.getHeroVoByID(value.heroId);
                if (heroVo) {
                    heroVoArr.push(heroVo);
                }
            }
        })
        heroVoArr.sort((a, b) => {
            return b.getHeroFight - a.getHeroFight;
        });


        let positionVos: Vo.formation.PositionVo[] = [];
        let posCfg = G.TableManager.getAllData(table.formation.FormationPositionConfig);
        posCfg?.forEach((cfg, index) => {
            let heroBaseId: number = 0;
            if (index < heroVoArr.length) {
                heroBaseId = heroVoArr[index].baseId;
            }
            let vo: Vo.formation.PositionVo = {
                position: cfg.id,
                heroBaseId: heroBaseId,
            }
            positionVos.push(vo);
        })

        return positionVos;
    }

    /**删除玩具*/
    public deleteToy(id: number, configId: number, cancelFunc: () => void = null): void {
        let args: IPetDungeonToyDelOpenArgs = {
            toyId: id,
            toyConfigId: configId,
            /**本地记录的key值*/
            localKey: 'onceTodayDelToy_' + GIns.playerModel.playerId,
            okFunc: () => {
                GIns.petDungeonModel.sendDiscardToy({ id: id }, configId);
            },
            cancelFunc: cancelFunc
        }
        GIns.petDungeonMgr.openConfirmDelToyViewTodayOnce(args);
    }

    /**打开删除玩具确认框*/
    public openConfirmDelToyViewTodayOnce(args: IPetDungeonToyDelOpenArgs): void {
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
                    if (args.okFunc) {
                        args.okFunc();
                        return
                    }
                }
            }
        }
        G.UIManager.open(UIPetDungeonConfig.PetDungeonToyDelWin, args);
    }


    onInit(): void {

    }
}

PetDungeonManager.ins().doInit();