import { Rect, view } from "cc";
import { V2Quadtree } from "../../../comm/math/V2Quadtree";
import { MapManager } from "../../MapManager";
import ResourcePoint from "../point/ResourcePoint";
import { TimeManager } from "../../../../core/time/TimeManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";

/**主线地图资源 */
export default class BaseResourceInstance implements INotification {
    /**资源点四叉树 */
    protected _resourcePointTree: V2Quadtree<ResourcePoint>;

    protected _width: number;
    protected _height: number;
    protected _tempRect: Rect;
    protected _found: ResourcePoint[] = [];

    protected _resourcePointsMap: { [resourceId: number]: ResourcePoint };

    protected _getTimeout = 0;
    protected _count = 0;

    protected _refreshInterval = 1000;

    listenNotifications(): string[] {
        return;
    }

    notificationHandler(event: string, args?: any): void {
    }

    constructor() {
        this._width = ScreenAdaptManager.viewWidth + 700;
        this._height = ScreenAdaptManager.viewHeight + 500;
        this._tempRect = new Rect(0, 0, this._width, this._height);

        FacadeManager.ins().registerNotification(this);
    }

    destroy() {
        FacadeManager.ins().removeNotification(this);
    }

    /**重置资源状态 */
    protected resetResourcePoints() {
        if (!this._resourcePointsMap) return;
        for (const key in this._resourcePointsMap) {
            this._resourcePointsMap[key].resetState();
        }
    }

    /**资源点 (具体玩法实现)*/
    protected initResourcesInMap(): ResourcePoint[] {
        return;
    }

    public enterNewWorld(pos: { x: number, y: number }) {
        let resourcePoints = this.initResourcesInMap();
        let mapSize = MapManager.ins().getMapSize();
        this.updateResourcePointUnits(resourcePoints, mapSize.width, mapSize.height);
        this.syncResourcePointsToServer(pos);
    }

    /**更新地图资源点，切换地图时调用 */
    protected updateResourcePointUnits(units: ResourcePoint[], width: number, height: number) {
        this._resourcePointTree = new V2Quadtree(new Rect(0, 0, width, height), null, 4);
        for (let i = units.length - 1; i >= 0; i--) {
            this._resourcePointTree.insert(units[i]);
        }
    }

    /**
     * 获取屏幕内的资源点
     * @param x 屏幕中心的map_x
     * @param y 屏幕中心的map_y
     * @returns 返回范围内的所有资源点
     */
    protected _getInScreenUnits(x: number, y: number): ResourcePoint[] {
        this._tempRect.x = x - this._width / 2;
        this._tempRect.y = y - this._height / 2;
        this._found.length = 0;
        this._resourcePointTree.query(this._tempRect, this._found);
        return this._found;
    }

    /**首次刷新 (具体玩法实现)*/
    protected initRescourcePoints(resourceIds: number[]) {
        //MapModel.ins().sendLoadMapResources(resourceIds); //首次同步
    }

    /**更新刷新 (具体玩法实现)*/
    protected updateRescourcePoints(resourceIds: number[]) {
        //MapModel.ins().sendLoadChangedMapResources(resourceIds);  //更新
    }


    /**同步怪物点到后端
     * @param x 屏幕中心的map_x
     * @param y 屏幕中心的map_y
     * @param force 是否强制同步
     */
    public syncResourcePointsToServer(pos: { x: number, y: number }, force = false) {
        if (!pos) return;

        let now = TimeManager.serverNow;
        if (this._getTimeout < now || force) {
            let found = this._getInScreenUnits(pos.x, pos.y);
            if (found?.length) {
                let ids: number[] = [];
                let updateIds = [];
                for (let i = 0; i < found.length; i++) {
                    let point = found[i];
                    if (point.isLock) continue;

                    if (!point.isLoaded) {
                        ids.push(point.id);
                    } else if (point.refreshTime && point.refreshTime < now) {
                        updateIds.push(point.id);
                    }
                }

                if (ids.length) {
                    this.initRescourcePoints(ids);
                }

                if (updateIds.length) {
                    this.updateRescourcePoints(updateIds)
                }
            }
            this._getTimeout = now + this._refreshInterval;
        }
    }

    /**
     * 获取资源点
     * @param resourceId 资源id  {@type table.map.MapResourceConfig.id}
     * @returns 资源点
     */
    getResourcePointByResourceId(resourceId: number): ResourcePoint | null {
        return this._resourcePointsMap[resourceId];
    }

    /**刷新 （处理移动后出现资源）*/
    onUpdate() {

    }

}