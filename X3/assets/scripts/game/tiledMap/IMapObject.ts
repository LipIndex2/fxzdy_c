import { Vec2 } from "cc"
import { TMXMapInfo } from "./component/MultiTiledMapTiledType";

/**
 * 地图对象
 */
export interface IMapObject {
    id: string | number,
    x: number,
    y: number,
    width: number,
    height: number,
    // name: string, 目前这个属性也没看到地方用，导出工具先去掉这个
    rotation: number,
    type: number,
    visible: boolean,
    /**建筑物类型 @see MapObjectType*/
    building_type?: string,
    /**对象id */
    object_id?: number,
    /**碰撞体 解除ID */
    unlock_id?: number,
    // object_name?: string, 目前这个属性没用，导出工具先去掉这个
    /**Tiled编辑器上显示的地图坐标 */
    offset?: Vec2,
    points?: Array<{ x: number, y: number }>;
    /** 装饰物图片名 */
    icon?: string,
    /** 区域id */
    area_id?: number,
    gid?: number,

    /** 地图对象所属地图，多地图合并用的 */
    sourceMap?: TMXMapInfo,
    /** 调试用，如果有改id的话，保存原本的id */
    id_$ori?: string | number,

    factory_id?:number
}

/**
 * 门对象
 */
export interface IGateObject extends IMapObject {
    /**表现id @see table.map.BuildingGateConfig.id */
    gate_id: number,
    /**绑定的建筑id */
    building_id: number,
    /**是否翻转 */
    filp: boolean,
    /**解锁动画延迟时间 */
    delay: number,
}

/**
 * 触发器对象
 */
export interface ITriggerObject extends IMapObject {
    /**用于引导的触发事件挂钩 */
    triggerId: number,
}