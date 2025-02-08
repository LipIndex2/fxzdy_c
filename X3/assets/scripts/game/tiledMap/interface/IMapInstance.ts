import { IMapObject } from "../IMapObject";
import { IVec2Like } from "cc";
import { Size } from "cc";

/**
 * 地图实例接口
 */
export interface IMapInstance {
    /**
     * 地图Id
     */
    getMapID(): number;

    /**获取地图信息
     * 格子大小和格子数
     * type : TiledMap.Orientation
     */
    getMapInfo(): { type: number };

    /**地图真实宽高 */
    getMapSize(): { width: number, height: number };


    /**获取当前地图资源点信息 */
    getUnitPosObjectByObjectId(id: number): IVec2Like;

    /**
     * 获取安全区域层对象
     */
    getSafeAreaObjects(): IMapObject[];

    /**
     * 获取区域层对象
     */
    getAreaObjects(): IMapObject[];

    /**
     * 获取障碍层对象
     */
    getBlockObjects(): IMapObject[];
}