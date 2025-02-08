import { Rect, Vec2, Node, IVec2 } from "cc";
import { IRect } from "../../math/ICollision";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { Graphics } from "cc";
import { Color } from "cc";
import { WorldManager } from "../../world/WorldManager";
import { IMapObject } from "../../../tiledMap/IMapObject";
import { TiledMap } from "cc";
import { Size } from "cc";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { Constructor } from "cc";
import { IPool } from "../../../../core/pool/IPoolInstance";

/**区域单位 */
export class AreaUnit implements IRect, IPool {

    /**创建区域单位 */
    static createUnit<T extends AreaUnit>(this: Constructor<T>, data: IMapObject): T {
        if (!data.points?.length) return null;
        let unit = PoolManager.getItem(this);

        if (data.sourceMap.orientation == TiledMap.Orientation.ISO) {
            unit.init((this as any).praseIsoAreaPoints(data), data);
        } else {
            unit.init((this as any).praseOrthoAreaPoints(data), data);
        }
        return unit;
    }

    /**创建区域单元 等距斜视地图（斜45°地图）*/
    private static praseIsoAreaPoints(data: IMapObject): IVec2[] {
        let mapInfo = data.sourceMap;
        let mapOffset = mapInfo.mapUIOffset; //多地图拼接模式下，需要加上拼接后的偏移
        let tiledW = mapInfo.tileSize.width;
        let tiledH = mapInfo.tileSize.height;
        let mapOffsetX = 0, mapOffsetY = 0;
        if (mapOffset) {
            mapOffsetX = mapOffset.x;
            mapOffsetY = mapOffset.y;
        }

        let halfTileW = tiledW * 0.5;
        let halfTileH = tiledH * 0.5;
        let mapH = mapInfo.mapSize.height;
        let mapWH = mapInfo.mapSize.width + mapH;

        let points = [];
        let offsetX = data.offset.x;
        let offsetY = data.offset.y;

        /**地图坐标转渲染坐标 */
        for (let i = 0; i < data.points.length; i++) {
            const point = data.points[i];
            let x = offsetX + point.x;
            let y = offsetY - point.y;

            let posIdxX = x / tiledH;
            let posIdxY = y / tiledH;
            x = halfTileW * (mapH + posIdxX - posIdxY) + mapOffsetX;
            y = halfTileH * (mapWH - posIdxX - posIdxY) + mapOffsetY;
            points.push({ x, y });
        }
        return points;
    }

    /**创建区域单元 直角鸟瞰地图（90°地图）*/
    private static praseOrthoAreaPoints(data: IMapObject): IVec2[] {
        if (!data.points?.length) return null;
        let points = [];
        let offsetX = data.x;
        let offsetY = data.y;
        /**地图坐标转渲染坐标 */
        for (let i = 0; i < data.points.length; i++) {
            const point = data.points[i];
            let x = offsetX + point.x;
            let y = offsetY + point.y;
            points.push({ x, y });
        }

        return points;
    }

    private _rect = new Rect();
    private _points: Array<{ x: number, y: number }>;
    private _unlockId: number;
    private _areaId: number;
    private _mapObject: IMapObject;

    get mapObject() {
        return this._mapObject;
    }

    get unlockId() {
        return this._unlockId;
    }

    /**是否是固定单位 */
    get isFixed() {
        return !this._unlockId;
    }

    get areaId() {
        return this._areaId;
    }

    get rect() {
        return this._rect;
    }

    get points() {
        return this._points;
    }

    init(points: Array<{ x: number, y: number }>, mapObject: IMapObject) {
        this._unlockId = mapObject.unlock_id || 0;
        this._areaId = mapObject.area_id || 0;
        this._mapObject = mapObject;

        this._points = [];
        let minx = 1e9; let miny = 1e9; let maxx = -1e9; let maxy = -1e9;

        for (let i = 0, l = points.length; i < l; i++) {
            let point = points[i];
            let x = point.x;
            let y = point.y;

            this._points.push({ x, y });

            if (x > maxx) maxx = x;
            if (x < minx) minx = x;
            if (y > maxy) maxy = y;
            if (y < miny) miny = y;
        }
        this._rect.set(minx, miny, maxx - minx, maxy - miny);
        //this.debugGraphice();
    }


    /**是否包含该点 */
    isInside(target: Vec2): boolean {
        if (!this._points?.length) return false;
        return MathUtils.pointInPolygon(target, this._points, this._points.length);
    }

    debugGraphice() {
        let node = new Node();
        let graphics = node.addComponent(Graphics);

        this["node"] = node;

        graphics.lineWidth = 20;
        graphics.color = Color.BLUE;
        graphics.clear();

        let len = this._points.length;
        for (let index = 0; index < len; index++) {
            let nextIdx = (index + 1) % len;
            let pointA = this._points[index];
            let pointB = this._points[nextIdx];
            graphics.moveTo(pointA.x, pointA.y);
            graphics.lineTo(pointB.x, pointB.y);

            // console.log(pointA.x + " / " + pointA.y);
            graphics.stroke();
        }

        graphics.fill();
        WorldManager.ins().floatLayer.addChild(node);
    }

    onRecovery(): void {
        this._points = undefined;
        this._unlockId = undefined;
        this._areaId = undefined;
        this._mapObject = undefined;
    }

}