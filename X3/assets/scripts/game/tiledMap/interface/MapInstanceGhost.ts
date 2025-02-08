import { math } from "cc";
import { IMapObject } from "../IMapObject";
import { IMapInstance } from "../interface/IMapInstance";
import { MapInstance } from "../MapInstance";
import { IVec2Like } from "cc";
import { ISizeLike } from "cc";
import { TableManager } from "../../../core/table/TableManager";
import { CCFloat } from "cc";
import { Size } from "cc";

export class MapInstanceGhost implements IMapInstance {
    /**地图id */
    private _mapId: number = -1;
    /**ghostId */
    private _ghostId: number = -1;

    /**获取地图信息
     * 格子大小和格子数
     * type : TiledMap.Orientation
     */
    private _mapInfo: { mapSize: Size, tileSize: Size, type: number };
    /**
     * 地图像素尺寸
     */
    private _mapSize: { width: number, height: number };

    /**资源点映射 */
    private _unitPosPointMap: { [id: number]: IVec2Like };

    /**安全区域层对象 */
    private _safeAreaObject: IMapObject[];
    /**区域层对象 */
    private _areaObjects: IMapObject[];
    /**障碍层对象 */
    private _blockObjects: IMapObject[];

    initByInstance(map: MapInstance) {
        this._mapId = map.getMapID();
        let mi = map.getMapInfo();
        this._mapInfo = {type: mi.type, mapSize: null, tileSize: null};
        this._mapSize = map.getMapSize();

        this._safeAreaObject = map.getSafeAreaObjects();
        this._areaObjects = map.getAreaObjects();
        this._blockObjects = map.getBlockObjects();

        this._unitPosPointMap = map.getUnitPosPintMap();
    }

    initByGhostConfig(ghostId: number) {
        let config = TableManager.getDataById(table.map.MapGhostConfig, ghostId);
        if (!config) {
            throw new Error("MapGhostConfig 不存在 id：" + ghostId);
        }
        this._mapId = config.mapId;
        this._ghostId = ghostId;
        this.parseConfig(config);
    }


    getMapID(): number {
        return this._mapId;
    }
    getMapInfo(): { mapSize: Size; tileSize: Size; type: number; } {
        return this._mapInfo;
    }
    getMapSize(): { width: number; height: number; } {
        return this._mapSize;
    }
    getUnitPosObjectByObjectId(id: number): IVec2Like {
        return this._unitPosPointMap[id];
    }
    getSafeAreaObjects(): IMapObject[] {
        return this._safeAreaObject;
    }
    getAreaObjects(): IMapObject[] {
        return this._areaObjects;
    }
    getBlockObjects(): IMapObject[] {
        return this._blockObjects;
    }

    private parseConfig(cfg: table.map.MapGhostConfig) {
        this._mapInfo = { mapSize: this.arrToSize(cfg.tileNum), tileSize: this.arrToSize(cfg.tileSize), type: cfg.type };
        this._mapSize = this.arrToSize(cfg.mapSize);

        this._safeAreaObject = [];
        this._areaObjects = [];
        this._blockObjects = [];

        this._unitPosPointMap = {};
        for (const key in cfg.unitPos) {
            this._unitPosPointMap[key] = this.arrToXY(cfg.unitPos[key]);
        }
    }


    /**数组转xy */
    arrToXY(arr: number[]): IVec2Like {
        return { x: arr[0], y: arr[1] };
    }

    /**数组转size */
    arrToSize(arr: number[]): Size {
        return new Size(arr[0], arr[1]);
    }

    /**输出xy */
    xyToArrStr(v: IVec2Like) {
        return `[${Math.floor(v.x)},${Math.floor(v.y)}]`;
    }
    /**输出size */
    sizeToArrStr(v: ISizeLike) {
        return `[${v.width},${v.height}]`;
    }

    export() {
        console.log("地图Ghost信息 --------------------------------------------------------------------->");
        console.log("当前导出地图ID：" + this._mapId);
        console.log("type：" + this._mapInfo.type);
        console.log("tileNum：" + this.sizeToArrStr(this._mapInfo.mapSize));
        console.log("tileSize：" + this.sizeToArrStr(this._mapInfo.tileSize));
        console.log("mapSize：" + this.sizeToArrStr(this._mapSize));

        let str = ""; //3:[1,2];
        for (const key in this._unitPosPointMap) {
            let data = this._unitPosPointMap[key];
            str += `${key}:${this.xyToArrStr(data)};`;
        }
        console.log("unitPos：" + str);
        console.log("地图Ghost信息 <---------------------------------------------------------------------");

        console.log(this._unitPosPointMap);
    }
}
