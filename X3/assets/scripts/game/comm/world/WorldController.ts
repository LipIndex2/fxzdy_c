import G from "../../../core/comm/G";
import { LogBusiness } from "../../../core/log/LogBusiness";
import { Logger } from "../../../core/log/Logger";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IBattleEnterData } from "../../modules/battle/vo/IBattleEnterData";
import { IBattleUnitData } from "../../modules/battle/vo/IBattleUnitData";
import { UICommonKey } from "../../modules/common/const/UICommonConfig";
import { IMapEnterOther } from "../../tiledMap/interface/IMapEnterOther";
import { ITransfer } from "../../tiledMap/interface/ITransfer";
import { MapManager } from "../../tiledMap/MapManager";
import { BattleManager } from "../battle/BattleManager";
import { BattleConfigManager } from "../battle/config/BattleConfigManager";
import BattleSetting from "../battle/config/BattleSetting";
import { FightType } from "../battle/enum/FightType";
import { MapType } from "../battle/enum/MapType";
import { ICreateMineralData, ICreateMonsterData } from "../battle/interface/BattleInterface";
import PlayInstance from "./PlayInstance";
import WorldInstance from "./WorldInstance";
import { DEBUG } from "cc/env";

export interface IBattleEnterDataProcesser {
    battleEnterDataProcess(data: Readonly<IBattleEnterData>, out_transferData: ITransfer): void
}
/**地图信息记录*/
interface ILastMapData {
    /**战斗类型*/
    fightType: FightType;
    /**地图id*/
    mapId: number;
    /**在地图上的坐标*/
    pos: { x: number, y: number };
}

export class WorldController extends BaseController {
    private _worldIns: WorldInstance;

    /**记录前面的地图方便返回处理*/
    protected _lastMaps: ILastMapData[] = [];

    private _battleEnterDataProcesser: Record<FightType, IBattleEnterDataProcesser> = {} as any;

    listenNotifications(): string[] {
        return [
            NotificationKey.START_BATTLE,
            NotificationKey.ENTER_WORLD,
            NotificationKey.EXIT_BATTLE,
            NotificationKey.HIDE_BATTLE,
            NotificationKey.JOYSTICK_CHANGED,
            NotificationKey.JOYSTICK_END,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.CREATE_ENEMY_UNITS_BY_PLAY,
            NotificationKey.CREATE_MINERAL_UNITS,
            NotificationKey.CREATE_MONSTER_UNITS,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.BATTLE_FORMATION_CHANGED,
            // NotificationKey.BATTLE_ATTR_CHANGED,
            NotificationKey.TEAM_REBIRTH,
            NotificationKey.BATTLE_SET_PLAY_ENDTIME,
            NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS,
            NotificationKey.LOADING_VIEW_COMPLETE,
            NotificationKey.MAP_TRANSFER_END,
            NotificationKey.REMOVE_HIDE_BATTLE,
            NotificationKey.STOP_HIDE_BATTLE,
            NotificationKey.NEXT_HIDE_BATTLE,
            NotificationKey.SKIP_BATTLE,
            NotificationKey.BATTLE_CLEAN_FARTHER_RESOURCES,
            NotificationKey.BATTLE_SKIN_CHANGED,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.FIGHT_UPDATE_ALL_HERO,
            NotificationKey.PET_SKILL_CHANGED,
            NotificationKey.FIGHT_RECALCULATE_ALL_HERO,
            NotificationKey.PLAYER_INFO_CHANGE,
            NotificationKey.MAP_SET_LAST_BY_FIGHT_TYPE,
            NotificationKey.MAP_ENTER_OTHER,
            NotificationKey.MAP_EXIT_OTHER,
            NotificationKey.CAPTAIN_SKILL_CHANGE,
            NotificationKey.COLLECTIONS_EQUIP_COLL_CHG,
            NotificationKey.BATTLE_CHECK_END,
            NotificationKey.SKIP_NOW_BATTLE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.START_BATTLE:
                this.startBattle(args);
                break;
            case NotificationKey.EXIT_BATTLE:
                this.exitBattle();
                break;
            case NotificationKey.SKIP_BATTLE:
                this.skipBattle(args);
                break;
            case NotificationKey.SKIP_NOW_BATTLE:
                this.skipNowBattle(args);
                break
            case NotificationKey.HIDE_BATTLE:
                this.hideBattle();
                break;
            case NotificationKey.STOP_HIDE_BATTLE:
                this.onStopHideBattle(args);
                break;
            case NotificationKey.NEXT_HIDE_BATTLE:
                this.nextHideBattle(args);
                break;
            case NotificationKey.REMOVE_HIDE_BATTLE:
                this.removeHideBattle(args);
                break;
            case NotificationKey.ENTER_WORLD:
                this.enterWorld(args[0], args[1]);
                break;
            case NotificationKey.JOYSTICK_CHANGED:
                this.onJoyStickChanged(args);
                break;
            case NotificationKey.JOYSTICK_END:
                this.onJoyStickChanged(null);
                break;
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.onTransfer(args);
                break;
            case NotificationKey.CREATE_ENEMY_UNITS_BY_PLAY:
                this.createEnemyUnitsByPlay(args);
                break;
            case NotificationKey.CREATE_MINERAL_UNITS:
                this.createMineralUnits(args);
                break;
            case NotificationKey.CREATE_MONSTER_UNITS:
                this.createMonsterUnits(args);
                break;
            case NotificationKey.MAP_MIST_UNLOCKED:
                this.removeMistBlock(args);
                break;
            case NotificationKey.BATTLE_FORMATION_CHANGED:
                this.formationChanged();
                break;
            // case NotificationKey.BATTLE_ATTR_CHANGED:
            //     this.heroAttrChanged(args);
            //     break;
            case NotificationKey.BATTLE_SKIN_CHANGED:
                this.heroSkinChanged(args);
                break;
            case NotificationKey.CAPTAIN_SKILL_CHANGE:
                this.leaderSkillChange();
                break;
            case NotificationKey.COLLECTIONS_EQUIP_COLL_CHG:
                this.collectSkillChange();
                break;
            case NotificationKey.PET_SKILL_CHANGED:
                this.petSkillChanged();
                break;
            case NotificationKey.TEAM_REBIRTH:
                this.onTeamRebirth();
                break;
            case NotificationKey.BATTLE_SET_PLAY_ENDTIME:
                this.setPlayEndTime(args);
                break;
            case NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS:
                this.cleanDefenderUnits();
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                this.onLoadingComplete();
                break;
            case NotificationKey.MAP_TRANSFER_END:
                this.onMapTransferComplete();
                break;
            case NotificationKey.BATTLE_CLEAN_FARTHER_RESOURCES:
                this.onClearFartherResources(args);
                break;
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
                this.updateHeroFight(args);
                break;
            case NotificationKey.FIGHT_UPDATE_ALL_HERO:
                this.updateAllHeroFight();
                break;
            case NotificationKey.FIGHT_RECALCULATE_ALL_HERO:
                this.updateAllFight();
                break;
            case NotificationKey.PLAYER_INFO_CHANGE:
                if (this._worldIns?.playingMethod == FightType.LEAGUE_EXPLORE_MAP || this._worldIns?.playingMethod == FightType.PET_DUNGEON_MAP) {
                    this.formationChanged();
                }
                break;
            case NotificationKey.MAP_SET_LAST_BY_FIGHT_TYPE:
                this.setLastMap(args);
                break;
            case NotificationKey.MAP_ENTER_OTHER:
                this.handleEnterOtherMap(args);
                break;
            case NotificationKey.MAP_EXIT_OTHER:
                this.handleExitOtherMap();
                break;
            case NotificationKey.BATTLE_CHECK_END:
                this.onBattleCheckEnd(args)
                break
        }
    }

    constructor () {
        super();
        Logger.game("WorldController");
    }

    onDestroy(): void {
        super.onDestroy();
        this._battleEnterDataProcesser = {} as any;
    }

    setEnterBattleProc(fightType: FightType, processer: IBattleEnterDataProcesser): void {
        if (DEBUG) {
            if (this._battleEnterDataProcesser[fightType]) {
                Logger.error(`重复设置进战斗数据处理${fightType}`, processer);
            }
        }
        this._battleEnterDataProcesser[fightType] = processer;
    }

    /**开始战斗 */
    private startBattle(data: IBattleEnterData) {
        if (data.fightType) {
            //战斗地图 看看战斗配置在不在
            let cfg = TableManager.getDataById(table.battle.BattleConfig, data.battleConfigId);
            if (!cfg) {
                Logger.warn(`BattleConfig配置信息不存在 battleConfigId:${data.battleConfigId}`)
                return
            }
            let mapId: number = cfg.mapId;
            this.recordLastMap();
            this._worldIns = new PlayInstance();
            this._worldIns.setPlayingMethodParams(data.fightType, data);

            let transferData: ITransfer = { isNextLevel: this.isClickNextLevel };
            let processer = this._battleEnterDataProcesser[data.fightType];
            if (processer) {
                processer.battleEnterDataProcess(data, transferData);
            } else {
                transferData.mapId = mapId;
            }

            if (!BattleSetting.getShowTransferAnimByType(data.fightType)) {
                this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transferData);
            } else {
                let param: NCommon.ITransferAnimToPointWin_param = {
                    // mapId: transferData.mapId? transferData.mapId : transferData.mapIds[0],
                    transferData: transferData,
                };
                G.UIManager.open(UICommonKey.TransferAnimToPointWin, param);
            }
        }
    }

    public isExitBattle: boolean = false;
    /**开始战斗 恢复主线场景 */
    private exitBattle() {
        if (this._worldIns && this._worldIns.battleLogic.isBackBattle()) {
            return;
        }

        this.isExitBattle = true;
        let curFightType: FightType = FightType.TRUNK_MAP;
        BattleManager.ins().lockCamera(false);
        if (this._worldIns) {
            if (this._worldIns.playingMethod == FightType.TRUNK_MAP) {
                return;
            }
            curFightType = this._worldIns.playingMethod;
            this._worldIns.battleEnd();
            this._worldIns = null;
            GIns.battleMgr.clearSaveHeroHpByFightType(curFightType)
        };
        this.backToLastMap(true);
    }

    private otherWorldInsMap: { [key: number]: WorldInstance } = {};
    /***是否点击了下一关 */
    public isClickNextLevel: boolean = false;
    /**隐藏战斗 恢复主线场景 */
    private hideBattle() {
        BattleManager.ins().lockCamera(false);
        let curFightType: FightType = FightType.TRUNK_MAP;
        if (this._worldIns) {
            if (this._worldIns.playingMethod == FightType.TRUNK_MAP) {
                return;
            }
            curFightType = this._worldIns.playingMethod;
            this.otherWorldInsMap[this._worldIns.playingMethod] = this._worldIns;
            this._worldIns.mapIns = MapManager.ins().getMapInsGhost();
            this._worldIns.hide();
            this._worldIns = null;
        }
        this.backToLastMap(true);
    }

    /**跳过战斗 */
    private skipBattle(data: IBattleEnterData) {
        if (data.fightType) {
            let cfg = TableManager.getDataById(table.battle.BattleConfig, data.battleConfigId);
            if (cfg) {
                //开始隐藏战斗
                let worldIns = this.otherWorldInsMap[FightType[cfg.fightType]] = new PlayInstance();
                worldIns.setPlayingMethodParams(data.fightType, data);
                let setttingCfg = BattleConfigManager.getBattleSettingConfigByKey(cfg.fightType);
                worldIns.mapIns = MapManager.ins().getMapInsGhostByGhostId(setttingCfg.hideMapId);
                worldIns.enterWorldBySkipStart(TableManager.getDataById(table.map.MapidConfig, worldIns.mapIns.getMapID()), worldIns.mapIns.getMapSize().width, worldIns.mapIns.getMapSize().height);
                let transferPosArr = worldIns.battleLogic.mapCfg.transferPos;
                worldIns.transfer({ x: +transferPosArr[0], y: +transferPosArr[1] });
            }
        }
    }

    /**跳过当前战斗 */
    private skipNowBattle(fightType: FightType) {
        //开始隐藏战斗
        if (this._worldIns?.playingMethod == fightType) {
            this._worldIns.skipNowBattle()
        }
    }

    /**记录上一张地图*/
    protected recordLastMap(): void {
        if (this._worldIns) {
            //记录旧的地图信息
            let mapType = GIns.mapMgr.getMapType(this._worldIns.playingMethod);
            if (mapType == MapType.NORMAL) {
                //只记录非战斗地图
                this._lastMaps.push({
                    fightType: this._worldIns.playingMethod,
                    mapId: MapManager.ins().getMapID(),
                    pos: MapManager.ins().getMapPos()
                })
            }
            this._worldIns.battleEnd();
        }
    }

    /**返回上一张地图*/
    public backToLastMap(isExitBattle: boolean = false): void {
        if (this._lastMaps?.length > 0) {
            let mapData = this._lastMaps.pop();
            this._worldIns = new WorldInstance();
            this._worldIns.setPlayingMethodParams(mapData.fightType, null);
            let pos = mapData.pos;
            if (mapData.fightType == FightType.PET_DUNGEON_MAP) {
                //宠物副本返回的位置需要根据通关关卡变化
                let realPos = GIns.petDungeonMgr.getBackPos();
                if (realPos) {
                    pos = realPos;
                }
            }
            this.emit(NotificationKey.MAP_AREA_TRANSFER_START, { mapId: mapData.mapId, pos: pos, isExitBattle: isExitBattle } as ITransfer);
        } else {
            //返回默认地图位置
            this.emit(NotificationKey.MAP_AREA_TRANSFER_START, { portalID: 1002, isExitBattle: true } as ITransfer);
        }
    }

    /**设置返回的地图 将移除该地图上层的所有地图缓存数据*/
    protected setLastMap(fightType: FightType): void {
        let index = this._lastMaps.findIndex(value => value.fightType == fightType);
        if (index != -1) {
            while (this._lastMaps.length > index + 1) {
                let mapData = this._lastMaps.pop();
                this.emitNow(NotificationKey.MAP_REMOVE_CACHE_BY_FIGHT_TYPE, mapData.fightType);
            }
        }
    }

    protected handleEnterOtherMap(data: IMapEnterOther): void {
        if (data.fightType) {
            //普通场景
            if (this._worldIns && this._worldIns.playingMethod == data.fightType) {
                //同一种地图 就不记录 直接替换了
                if (this._worldIns) {
                    this._worldIns.battleEnd();
                }
            } else {
                this.recordLastMap();
            }
            this._worldIns = new WorldInstance();
            this._worldIns.setPlayingMethodParams(data.fightType, null);

            let transfarData: ITransfer = { mapId: data.mapId, buildingId: data.buildingId, pos: data.pos };
            if (GIns.mapMgr.curMap?.getMapID() != data.mapId) {
                //不同地图才需要显示加载
                this.emit(NotificationKey.LOADING_VIEW_SHOW);
            }
            this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transfarData);
        }
    }

    protected handleExitOtherMap(): void {
        if (this._worldIns && this._worldIns.battleLogic?.isBackBattle()) {
            return;
        }

        this.isExitBattle = true;
        let curFightType: FightType = FightType.TRUNK_MAP;
        BattleManager.ins().lockCamera(false);
        if (this._worldIns) {
            if (this._worldIns.playingMethod == FightType.TRUNK_MAP) {
                return;
            }
            curFightType = this._worldIns.playingMethod;
            this._worldIns.battleEnd();
            this._worldIns = null;
        };
        this.backToLastMap(true);
    }

    private onStopHideBattle(fightType: FightType): void {
        if (this.otherWorldInsMap[fightType]) {
            this.otherWorldInsMap[fightType].pause();
        }
    }

    private removeHideBattle(fightType: FightType): void {
        if (this.otherWorldInsMap[fightType]) {
            this.otherWorldInsMap[fightType].battleEnd();
            delete this.otherWorldInsMap[fightType];
        }
    }

    /**下1场隐藏战斗开始 */
    private nextHideBattle(data: IBattleEnterData) {
        if (data.fightType) {
            let cfg = TableManager.getDataById(table.battle.BattleConfig, data.battleConfigId);
            let worldIns = this.otherWorldInsMap[data.fightType];
            if (worldIns) {
                //下一场隐藏战斗
                worldIns.setPlayingMethodParams(data.fightType, data);
                worldIns.enterWorldByHideNext();
                let transferPosArr = worldIns.battleLogic.mapCfg.transferPos;
                worldIns.transfer({ x: +transferPosArr[0], y: +transferPosArr[1] });
                return;
            } else if (cfg) {
                //开始隐藏战斗
                worldIns = this.otherWorldInsMap[FightType[cfg.fightType]] = new PlayInstance();
                worldIns.setPlayingMethodParams(data.fightType, data);
                let setttingCfg = BattleConfigManager.getBattleSettingConfigByKey(cfg.fightType);
                worldIns.mapIns = MapManager.ins().getMapInsGhostByGhostId(setttingCfg.hideMapId);
                worldIns.enterWorldByHideStart(TableManager.getDataById(table.map.MapidConfig, worldIns.mapIns.getMapID()), worldIns.mapIns.getMapSize().width, worldIns.mapIns.getMapSize().height);
                let transferPosArr = worldIns.battleLogic.mapCfg.transferPos;
                worldIns.transfer({ x: +transferPosArr[0], y: +transferPosArr[1] });
                return;
            }
            BattleManager.ins().stopHideBattle(data.fightType);
        }
    }

    /**进入玩法世界 */
    @LogBusiness("enterWorld")
    private enterWorld(pos: { x: number; y: number }, data: ITransfer) {
        this.isClickNextLevel = false;
        if (!this._worldIns) {
            this._worldIns = new WorldInstance();
        } else {
            this._worldIns.battleEnd();
        }

        this._worldIns.mapIns = MapManager.ins().getMapIns();
        this._worldIns.enterWorld(MapManager.ins().getMapCfg(), MapManager.ins().getMapSize().width, MapManager.ins().getMapSize().height);

        this._worldIns.initAStarMap(pos);

        //this._worldIns.transfer(pos);
        this.emit(NotificationKey.ENTER_WORLD_COMPLETE);
        if (data.isExitBattle || data.emitBattleStar === true) {
            this.emit(NotificationKey.BATTLE_START);
        }
    }

    /***loading界面结束 */
    protected onLoadingComplete() {
        if (this._worldIns) {
            this._worldIns.battleReadyHandler();
            this._worldIns.isReadyEnter = false;
        }
    }

    /***地图传送结束 */
    protected onMapTransferComplete(): void {
        if (this._worldIns && BattleSetting.showTransferAnim) {
            G.FacadeManager.emit(NotificationKey.BATTLE_START);
        }
    }

    /**摇杆控制*/
    private onJoyStickChanged(angle: number) {
        if (this._worldIns) {
            this._worldIns.teamMoveByAngle(angle);
        }
    }

    /**传送*/
    private onTransfer(pos: { x: number; y: number }) {
        Logger.debug("onTransfer");
        if (this._worldIns) {
            this._worldIns.transfer(pos);
            this._worldIns.initAStarMap(pos);
        }
    }

    /**创建单位 （其他玩法） */
    private createEnemyUnitsByPlay(arr: IBattleUnitData[]) {
        if (this._worldIns && this._worldIns instanceof PlayInstance) {
            this._worldIns.createEnemyUnitsByPlay(arr);
        }
    }

    /**创建矿 （大地图玩法） */
    private createMineralUnits(arr: ICreateMineralData[]) {
        if (this._worldIns) {
            this._worldIns.createMineralUnits(arr);
        }
    }

    /**创建怪物 （大地图玩法） */
    private createMonsterUnits(arr: ICreateMonsterData[]) {
        if (this._worldIns) {
            this._worldIns.createMonsterUnits(arr);
        }
    }

    /**移除雾障碍 */
    private removeMistBlock(unlockId: number) {
        if (this._worldIns) {
            this._worldIns.removeMistBlock(unlockId);
        }
    }

    /**布阵变更 */
    private formationChanged() {
        if (this._worldIns) {
            this._worldIns.formationChanged();
        }
    }

    /**单个战力变更重新计算属性和技能 */
    private updateHeroFight(heroId: number) {
        if (this._worldIns) {
            this._worldIns.heroAttrChanged(heroId);
        }
    }

    /**全部战力变更重新计算属性和技能 */
    private updateAllHeroFight() {
        if (this._worldIns) {
            let heros = this._worldIns.getHeros();
            for (let i = 0; i < heros.length; i++) {
                this.updateHeroFight(heros[i].heroId);
            }
        }
    }

    /** 刷新默认阵容总战力 */
    public updateAllFight() {
        GIns.fightMgr.getFightByDefault();
    }

    /**属性变更 */
    // private heroAttrChanged(heroId: number) {
    //     if (this._worldIns) {
    //         this._worldIns.heroAttrChanged(heroId);
    //     }
    // }

    /**宠物技能变更 */
    private petSkillChanged() {
        if (this._worldIns) {
            this._worldIns.petSkillChanged();
        }
    }

    /**皮肤变更 */
    private heroSkinChanged(heroId: number) {
        if (this._worldIns) {
            this._worldIns.heroSkinChanged(heroId);
        }
    }

    private leaderSkillChange(): void {
        if (this._worldIns) {
            this._worldIns.leaderSkillChange();
        }
    }

    private collectSkillChange(): void {
        if (this._worldIns) {
            this._worldIns.collectSkillChange();
        }
    }

    /**团队复活 */
    private onTeamRebirth() {
        let scene = BattleManager.ins().mainScene;
        scene?.rebirth();
    }

    /**设置玩法结束时间 */
    private setPlayEndTime(endTime: number) {
        if (this._worldIns && this._worldIns instanceof PlayInstance) {
            this._worldIns.setBattleEndTime(endTime);
        }
    }

    private onClearFartherResources(cleanMap: { [resourceId: number]: Array<number> }): void {
        if (this._worldIns && this._worldIns instanceof WorldInstance) {
            this._worldIns.clearFartherResources(cleanMap);
        }
    }

    /**战斗结束检查*/
    public onBattleCheckEnd(isWin: boolean): void {
        if (this._worldIns && this._worldIns instanceof PlayInstance) {
            this._worldIns.onBattleCheckEnd(isWin);
        }
    }

    /**战斗结束*/
    public onBattleEnd(battleResult: ServerEnums.BattleResult): void {
        if (this._worldIns && this._worldIns instanceof PlayInstance) {
            this._worldIns.onBattleEnd(battleResult);
        }
    }

    /**清理敌方单位 */
    cleanDefenderUnits() {
        if (this._worldIns && this._worldIns instanceof PlayInstance) {
            this._worldIns.cleanDefenders();
        }
    }
}

WorldController.ins().doInit();
