import { IVec2Like, Vec2 } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import BaseSingleton from '../../core/base/BaseSingleton';
import { UIManager } from '../../core/mvc/UIManager';
import { TableManager } from '../../core/table/TableManager';
import { BattleManager } from '../comm/battle/BattleManager';
import { BattleConfigManager } from '../comm/battle/config/BattleConfigManager';
import { FightType } from '../comm/battle/enum/FightType';
import { MapType } from '../comm/battle/enum/MapType';
import GIns from '../GIns';
import { IMapObject } from './IMapObject';
import { IMapInstance } from './interface/IMapInstance';
import { ITransfer } from './interface/ITransfer';
import { MapInstanceGhost } from './interface/MapInstanceGhost';
import { MapLayerKey, MapObjectType } from './MapEnum';
import { MapInstance } from './MapInstance';
import { MapModel } from './model/MapModule';

export class MapManager extends BaseSingleton {
    // 主城地图id
    private readonly MAIN_CITY_MAP_ID = 1;
    // 新手地图id
    private readonly NEWPLAYER_MAP_ID = 2;

    /***地图的基础默认缩放 */
    public defaultMapScale: number = 0.9;

    private _curMap: MapInstance;

    // 是否可以传送
    private _isCanTransfer: boolean = true;
    // 传输按钮 CD second
    private _transferButtonCdTimeSecond: number = 1;

    constructor() {
        super();
    }

    public get curMap(): MapInstance {
        return this._curMap
    }

    /**获取地图实例 */
    public getMapIns(): IMapInstance {
        if (!this._curMap) {
            this._curMap = new MapInstance();
        }
        return this._curMap;
    }

    /**获取地图实例 备份 */
    public getMapInsGhost(): IMapInstance {
        if (!this.curMap) {
            throw new Error("地图未实例化");
        }
        let ghost = new MapInstanceGhost();
        ghost.initByInstance(this.curMap);
        return ghost;
    }


    /**根据ghostId 获取地图 备份数据 */
    public getMapInsGhostByGhostId(ghostId: number = 10001): IMapInstance {
        let ghost = new MapInstanceGhost();
        ghost.initByGhostConfig(ghostId);
        return ghost;
    }

    /**
     * 加载初始地图
     */
    public loadWorldMap(mapId: number) {
        if (!this._curMap) {
            this._curMap = new MapInstance();
        }
        this._curMap.enterGameMap();
    }

    // /** 获取某一层 */
    public getLayerByType(type: MapLayerKey) {
        if (this._curMap) {
            return this._curMap.getLayerByType(type);
        }
    }

    /**解锁区域 */
    public unlockArea(object_id: number) {
        if (this._curMap) {
            this._curMap.destroyCloud(object_id);
        }
    }

    /**
     * 传送接口
     * @param portalID  传送阵id
     */
    public mapAreaTransfer(data: ITransfer) {
        if (this._curMap) {
            BattleManager.ins().endFight()
            this._curMap.mapAreaTransfer(data);
        }
    }

    /**战队移动 */
    public teamPosUpdate(pos: { x: number, y: number }) {
        if (this._curMap) {
            this._curMap.teamPosUpdate(pos);
        }
    }

    /**
     * 获取对应类型对象数组
     * @param type  MapObjectType类型
     */
    public getObjectsByType(type: MapObjectType) {
        if (this._curMap) {
            return this._curMap.getObjectsByType(type);
        }
    }

    /** 
     * 获取碰撞区域对象
     * @param type  MapObjectType类型
     */
    public getBlockObjects() {
        if (this._curMap) {
            return this._curMap.getBlockObjects();
        }
    }

    /** 
     * 获取安全区对象
     */
    public getSafeAreaObjects() {
        if (this._curMap) {
            return this._curMap.getSafeAreaObjects();
        }
    }

    /** 
     * 获取地图分区域对象
     */
    public getAreaObjects() {
        if (this._curMap) {
            return this._curMap.getAreaObjects();
        }
    }

    /**触发器  */
    public getTriggerObjects() {
        if (this._curMap) {
            return this._curMap.getTriggerObjects();
        }
    }

    // /**获取装饰器节点 */
    // public getDecorationChildren() {
    //     if (this._curMap) {
    //         return this._curMap.getDecorationChildren();
    //     }
    // }

    // 统一用 GIns.mapMgr.curMap.getMapInfo();
    // /** 获取地图信息 */
    // public getMapInfo() {
    //     if (this._curMap) {
    //         return this._curMap.getMapInfo();
    //     }
    // }

    /** 获取当前地图的真实大小 */
    public getMapSize() {
        if (this._curMap) {
            return this._curMap.getMapSize();
        }
    }

    /** 获取当前地图位置 */
    public getMapPos() {
        if (this._curMap) {
            return this._curMap.getMapPos();
        }
    }

    private fieldTransferDoorPos: Vec2;
    private fieldMapId: number;

    /** 设置野外传送门的地图ID 和 位置 */
    public setTransferPos(mapId: number, pos: Vec2) {
        this.fieldMapId = mapId;
        this.fieldTransferDoorPos = pos;
    }

    /** 获取当前野外的传送门地图ID 和 位置 */
    public getTransferPos(): { fieldMapId: number; pos: Vec2; } {
        return this.fieldMapId && { fieldMapId: this.fieldMapId, pos: this.fieldTransferDoorPos };
    }

    /** 获取当前地图id */
    public getMapID() {
        if (this._curMap) {
            return this._curMap.getMapID();
        }
    }
    /**  */
    public getMultiMapIDS() {
        if (this._curMap) {
            return this._curMap.getMultiMapIDS();
        }
    }

    /** 获取当前配置 */
    public getMapCfg() {
        if (this._curMap) {
            let mapId = this.getMapID()
            let cfg = TableManager.getDataById(table.map.MapidConfig, mapId);
            return cfg
        }

    }

    /**获取建筑物节点 */
    public getBuildingNode(buildingId: number) {
        if (this._curMap) {
            return this._curMap.getBuildingNode(buildingId);
        }
    }


    /**
     * 建筑使用状态 {@link table.map.MapBuildingConfig.id}
     */
    public getUsingBuilding(buildingId: number) {
        if (this._curMap) {
            this._curMap.getUsingBuilding(buildingId);
        }
    }

    /**
     * get 建筑 by {@link table.map.MapBuildingConfig.id}
     * */
    public getObjectsByIDInBuilding(buildingId: number): IMapObject | null {
        if (this._curMap) {
            return this._curMap.getObjectsByIDInBuilding(buildingId);
        }
        return null;
    }

    public unlockBuilding(buildingID: number) {
        if (this._curMap) {
            this._curMap.unlockBuilding(buildingID);
        }
    }

    /**获取需要聚焦的门 */
    public getFocusGateByBuildingId(buildingId: number) {
        if (this._curMap) {
            return this._curMap?.getFocusGateByBuildingId(buildingId);
        }
        return null;
    }

    /** 更新对应ID建筑的UI */
    // public updateBuildingUIByID(buildingID: number) {
    //     if (this._curMap) {
    //         let ui = this._curMap.getIBuildingUIByID(buildingID);
    //         ui.updateInfo();
    //     }
    // }

    /** 获取当前地图所有建筑信息 */
    // public getObjectUnit() {
    //     if (this._curMap) {
    //         return this._curMap.getObjectUnit();
    //     }
    // }

    /** 获取当前地图资源点信息 */
    public getUnitPosObjectByObjectId(id: number) {
        if (this._curMap) {
            return this._curMap.getUnitPosObjectByObjectId(id);
        }
    }

    /** 根据建筑id查看是否解锁 */
    public getBuildingUnlockById(buildingId: number) {
        return MapModel.ins().getBuildingUnlockById(buildingId);
    }

    /**
     * 是否解锁建筑
     * @param buildingId
     */
    public isHaveUnlockBuilding(buildingId: number) {
        return this._curMap.isHaveUnlockBuilding(buildingId);
    }


    /**
     * 是否在主城
     */
    isInMainCity() {
        const mapID = this.getMapID();
        return this.isMainCityId(mapID);
    }

    private _targetTeleportId;
    /** 记录传送数据 -- 终点传送列表id  */
    set targetTeleportId(targetTeleportId: number) {
        this._targetTeleportId = targetTeleportId;
    }
    get targetTeleportId() {
        return this._targetTeleportId;
    }

    /** 
     * 是否禁止移动
     */
    // isForbidMove(){
    //     if (this._curMap) {
    //         return this._curMap.getIsMovingCamera();
    //     }
    // }

    /** 获取当前聚集的建筑 */
    get focusBuilding() {
        if (this._curMap) {
            return this._curMap.focusBuilding();
        }
    }


    /**
     * 传送到任何位置 with 运输机动画
     * ps: 回城(运输机) 就是走这个动画
     * 
     * @param mapId 目标地图id
     * @param pos 目标位置
     */
    @LogBusiness("[传送] 传送到任何位置 with 运输机动画 ")
    transferToOtherMapPositionWithAnim(mapId: number, pos: IVec2Like) {
        // 自己在主城 + 目的地主城, 不能飞
        const isFromAndToPosIsMainCity = MapManager.ins().isMainCityId(mapId) && MapManager.ins().isInMainCity();
        if (isFromAndToPosIsMainCity) {
            if (MapManager.ins().getTransferPos()) {
                UIManager.ins().open(UICommonKey.TransferAnimByAirshipWin);
            }
            //FloatingTextManager.ins().showTips("飞船内无法使用");
            G.Logger.debug("飞船内无法使用")
            return;
        }

        //G.FacadeManager.emit(NotificationKey.GUIDE_CLICK_BTN, 3);
        if (!this._isCanTransfer) {
            return;
        }

        this._isCanTransfer = false;
        this._transferButtonCdTimeSecond = Number(TableManager.getDataById(table.map.MapConstantConfig, "MAP_TRANSFER_TIME").content);
        GameTimer.ins().once(this._transferButtonCdTimeSecond * 1000, this, () => {
            this._isCanTransfer = true;
        });

        //新手地图不给回去
        let newPlayerMap = TableManager.getDataById(table.map.MapConstantConfig, "MAP:NEW_PLAYER_MAP").content;
        if (mapId !== Number.parseInt(newPlayerMap.trim())) {
            const posClone = new Vec2(pos.x, pos.y);
            MapManager.ins().setTransferPos(mapId, posClone);
        }
        UIManager.ins().open(UICommonKey.TransferAnimByAirshipWin);
    }

    isMainCityId(mapId: number): boolean {
        return mapId == this.MAIN_CITY_MAP_ID;
    }

    isNewPlayerId(mapId: number): boolean {
        return mapId == this.NEWPLAYER_MAP_ID;
    }

    /***播放当前地图的BGM */
    public playMapMusic(): void {
        if (!GIns.battleMgr.checkStkBgm()) {
            GIns.audioMgr.playMusic(this.getMapCfg().bgm)
        }
    }

    /**获取战斗类型对应的地图类型*/
    public getMapType(fightType: FightType): string {
        let setCfg = BattleConfigManager.getBattleSettingConfig(fightType);
        if (setCfg) {
            return setCfg.mapType;
        }
        return MapType.NORMAL;
    }
}

window['MapManager'] = MapManager;