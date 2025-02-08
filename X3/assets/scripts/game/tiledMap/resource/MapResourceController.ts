import { Vec2 } from "cc";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { GameTimer } from "../../../core/timer/GameTimer";
import { BattleManager } from "../../comm/battle/BattleManager";
import { MapType } from "../../comm/battle/enum/MapType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MapManager } from "../MapManager";
import BaseResourceInstance from "./instance/BaseResourceInstance";
import PlayResourceInstance from "./instance/PlayResourceInstance";
import TrunkMapResourceInstance from "./instance/TrunkMapResourceInstance";
import { FightType } from "../../comm/battle/enum/FightType";
import SecretAreaResourceInstance from "./instance/SecretAreaResourceInstance";
import ResourcePoint from "./point/ResourcePoint";
import GuardShipResourceInstance from "./instance/GuardShipResourceInstance";

/**地图资源控制器 */
export default class MapResourceController extends BaseController {
    private _resourceInstance: BaseResourceInstance;

    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_BUILDING_UNLOCK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH:
                this.enterNewWorld(args);
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                this.syncResourcePointsToServer(args);
                break;
            case NotificationKey.MAP_MIST_UNLOCKED:
            case NotificationKey.MAP_BUILDING_UNLOCK:
                this.syncResourcePointsToServer(MapManager.ins().getMapPos(), true);
                break;
        }
    }

    constructor() {
        super();
    }

    public enterNewWorld(pos: { x: number, y: number }) {
        if (this._resourceInstance) {
            this._resourceInstance.destroy();
            this._resourceInstance = null;
        }

        let curPlayingMethod = BattleManager.ins().playingMethod;
        if (curPlayingMethod == FightType.SECRET_INSTANCE ||
            curPlayingMethod == FightType.SEASON_SECRET
        ) {
            this._resourceInstance = new SecretAreaResourceInstance()
        } else if (curPlayingMethod == FightType.GUARD_SHIP) {
            this._resourceInstance = new GuardShipResourceInstance();
        } else {
            if (GIns.mapMgr.getMapType(curPlayingMethod) == MapType.BATTLE) {
                this._resourceInstance = new PlayResourceInstance();
            } else {
                this._resourceInstance = new TrunkMapResourceInstance();
            }
        }

        this._resourceInstance.enterNewWorld(pos);
        GameTimer.ins().loop(1200, this, this.onUpdate);
    }

    /**同步怪物点到后端
     * @param x 屏幕中心的map_x
     * @param y 屏幕中心的map_y
     * @param force 是否强制同步
     */
    private syncResourcePointsToServer(pos: { x: number, y: number }, force = false) {
        if (!pos || !this._resourceInstance) return;
        this._resourceInstance.syncResourcePointsToServer(pos, force);
    }



    onUpdate() {
        if (!this._resourceInstance) return;

        try {
            let pos = MapManager.ins().getMapPos();
            this.syncResourcePointsToServer(pos);
        } catch (error) {
        }

        this._resourceInstance.onUpdate();
    }

    /**
     * 世界玩法当前地图资源点坐标 (仅世界玩法)
     * @param {number} configId @see table.map.MapResourceConfig.id
     * @returns {Vec2 | null} 资源点坐标 
     */
    public getWorldResourcePosByResoucreId(configId: number): Vec2 | null {
        if (this._resourceInstance instanceof TrunkMapResourceInstance) {
            return this._resourceInstance?.getResourcePointByResourceId(configId)?.pos;
        }
        return null;
    }

    /**
     * 获取资源点
     * @param resourceId 资源id  {@type table.map.MapResourceConfig.id}
     * @returns 资源点
     */
    getResourcePointByResourceId(resourceId: number): ResourcePoint | null {
        return this._resourceInstance?.getResourcePointByResourceId(resourceId);
    }

    /**获取所有于指定点的相同资源的资源点
     * @param resourceId 资源id  {@type table.map.MapResourceConfig.id}
     */
    getAllSameResourcePoint(resourceId: number): ResourcePoint[] | null {
        if (this._resourceInstance instanceof TrunkMapResourceInstance) {
            return this._resourceInstance.getAllSameResourcePoint(resourceId);
        }
        return null;
    }


}

MapResourceController.ins().doInit();