import { BaseController } from '../../core/mvc/controller/BaseController';
import GIns from '../GIns';
import BattleSettingMgr from '../comm/battle/BattleSettingMgr';
import NotificationKey from '../event/NotificationKey';
import { MapManager } from './MapManager';
import { ITransfer } from './interface/ITransfer';
import { MapModel } from './model/MapModule';

export class MapController extends BaseController {
    protected _curMapId: number = 0;
    protected _isReturnMainCityFirst: boolean = false

    listenNotifications(): string[] {
        return [
            NotificationKey.LOAD_WORLD,
            NotificationKey.MAP_AREA_TRANSFER_START,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.TRIGGER_LOCK_CAMERA,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LOAD_WORLD:
                this.loadWorldMap(args);
                break;
            case NotificationKey.MAP_AREA_TRANSFER_START:
                this.mapAreaTransfer(args);
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                this.teamPosUpdate(args);
                break;
            case NotificationKey.MAP_MIST_UNLOCKED:
                this.mistUnlocked(args);
                break;
            case NotificationKey.MAP_BUILDING_UNLOCK:
                this.buildingUnlock(args);
                break;
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.tryFirstUnlockMap();
                this.checkChangeMap();
                break;
            case NotificationKey.TRIGGER_LOCK_CAMERA:
                this.lockCamera(args[0]);
                break;
        }
    }

    private tryFirstUnlockMap() {
        const mapID = MapManager.ins().getMapID();
        if (MapModel.ins().isHaveSeeMap(mapID)) {
            return;
        }
        MapModel.ins().sendFirstExploreMap({
            mapId: mapID
        });
    }

    protected checkChangeMap(): void {
        const mapID = MapManager.ins().getMapID();
        if (this._curMapId != mapID) {
            let oldMapId = this._curMapId
            this._curMapId = mapID
            if (oldMapId > 0 && GIns.mapMgr.isMainCityId(mapID)) {
                //返回主城
                if (this._isReturnMainCityFirst == false) {
                    GIns.mapModel.sendFirstReturnMainCity()
                    this._isReturnMainCityFirst = true
                }

            }
        }
    }

    onInit(): void {
    }

    /**
     * 加载初始地图
     */
    private loadWorldMap(mapId: number) {
        MapManager.ins().loadWorldMap(mapId);
    }

    /**
     * 传送到指定区域
     */
    private mapAreaTransfer(data: ITransfer) {
        MapManager.ins().mapAreaTransfer(data);
    }

    /** 战队移动 */
    private teamPosUpdate(pos: { x: number, y: number }) {
        MapManager.ins().teamPosUpdate(pos);
    }

    /** 解锁迷雾 */
    private mistUnlocked(buildingID: number) {
        MapManager.ins().unlockArea(buildingID);
        this.buildingUnlock(buildingID);
    }

    /** 解锁建筑 */
    private buildingUnlock(buildingID: number) {
        MapManager.ins().unlockBuilding(buildingID);
    }

    /**锁定镜头不跟随 */
    private lockCamera(isStop: boolean) {
        if (GIns.battleMgr) {
            GIns.battleMgr.battleLogic.battleSetting.isCameraStopFollow = !!isStop;
        }
    }

}

MapController.ins().doInit();


