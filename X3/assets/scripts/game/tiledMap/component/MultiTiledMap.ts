import { _decorator, TiledMap, TiledMapAsset, js, v2, Vec2, Size } from "cc";
import type { TMXMapInfo, TMXObject, TMXObjectGroupInfo } from "./MultiTiledMapTiledType";
import { TiledObjectGroup, UITransform, CCInteger } from "cc";
import { MapLayerKey } from "../MapEnum";
import { IMapObject } from "../IMapObject";
import GIns from "../../GIns";
import { Logger } from "../../../core/log/Logger";

const { ccclass, property } = _decorator;

//从地图数据里面获取指定名字的图层的指定子对象数据
function getObjectGroupObj(map: TMXMapInfo, groupName: MapLayerKey, objName: string): TMXObject | null {
    let layer = map.getObjectGroups().find(g => { return g.name == groupName });
    if (!layer) {
        return null
    }
    let obj = layer.objects.find(o => { return o.name == objName });
    return obj || null
}

//从地图数据里面获取指定名字的图层数据
function getObjectGroup(map: TMXMapInfo, groupName: string): TMXObjectGroupInfo | null {
    let layer = map.getObjectGroups().find(g => { return g.name == groupName });
    return layer;
}

function addOffset(subMap: TMXMapInfo, layerName: MapLayerKey, offsetX: number, offsetY: number) {
    let subLayer = getObjectGroup(subMap, layerName);
    subLayer.objects.forEach(o => {
        o.x += offsetX;
        o.y += offsetY;
    })
}

/**每个地图object设置上其对应的源地图信息 */
function addMapInfo2ObjAndModifyId(map: TMXMapInfo) {
    map.getObjectGroups().forEach(objGroup => {
        objGroup.objects.forEach((o) => {
            let obj = o as unknown as IMapObject;
            // obj.offset.set(offsetX, offsetX);
            obj.sourceMap = map;
        })
    })
}

/** tilemap 45度地图的地图(x，y)坐标转换为原点为左下角的的屏幕坐标 */
function tileMapPos2ScreenPos(x: number, y: number, tileSize: Size, mapSize: Size, out?: Vec2): Vec2 {
    const posIdxX = x / tileSize.height;
    const posIdxY = y / tileSize.height;
    x = tileSize.width * 0.5 * (mapSize.height + posIdxX - posIdxY);
    y = tileSize.height * 0.5 * (mapSize.width + mapSize.height - posIdxX - posIdxY);
    if (out) {
        out.set(x, y);
    } else {
        out = v2(x, y);
    }
    return out;
}

//计算地图尺寸
function calMapSize(mapInfo: TMXMapInfo) {
    const mapSize = mapInfo.mapSize;
    const tileSize = mapInfo.tileSize;
    let width = 0;
    let height = 0;

    if (mapInfo.orientation == TiledMap.Orientation.ISO) {
        const wh = mapSize.width + mapSize.height;
        width = tileSize.width * 0.5 * wh;
        height = tileSize.height * 0.5 * wh;
    } else if (mapInfo.orientation == TiledMap.Orientation.ORTHO) {
        width = mapSize.width * tileSize.width;
        height = mapSize.height * tileSize.height;
    } else {
        console.error("暂时没有")
    }
    return new Size(width, height)
}


@ccclass("MultiTiledMap")
export class MultiTiledMap extends TiledMap {
    /** tiledMap每个层屏幕的的水平跟垂直偏移，原点左上角 */
    protected _tmxUIOffset: Vec2;
    /** 跟当前地图的入口点连接的地图的出口点，屏幕UI坐标，原点左下角 */
    protected lastOutObjPos: Vec2;

    /* 上一张地图的out出口点的tiledMap地图上的地图坐标 */
    protected lastTmxMapOutPos: Vec2;
    /** tiledMap地图坐标累计偏移 */
    protected tmxAccuOffset: Vec2;

    //ui上地图的尺寸
    protected _mapContentSize: Size;

    /** 多地图模式下，这张地图是第几张地图 */
    @property(CCInteger)
    mapIdx: number = 0
    /** 是否多地图模式 */
    isMultiMap: boolean = false

    //优化：角色对象层等在界面显示的时候再创建
    protected _decorationLayerObjects: TMXObject[]
    get decorationLayerObjects(): Readonly<Readonly<TMXObject>[]> {
        return this._decorationLayerObjects;
    }

    //以左上角为原点，当前地图相对于拼完后的地图的偏移
    getTmxUIOffset() {
        return v2(this._tmxUIOffset);
    }

    //以左下角为原点，当前地图相对于拼完后的地图的偏移
    getUIOffset() {
        return v2(this._tmxUIOffset.x, -this._tmxUIOffset.y);
    }

    getTmxMapOffset() {
        return v2(this.tmxAccuOffset);
    }

    /**
     * @param mapAsset 
     * @param mapIdx 
     * @param mapTmxUIOffset  tmx屏幕坐标连接点的累积偏移位置，原点为左上角
     * @param lastOutObjPos 跟当前地图的入口点连接的地图的出口点(上一个地图）的最终屏幕UI坐标，原点左下角
     * @param tmxAccuOffset tiledMap地图坐标累计偏移
     * @param lastTmxMapOutPos  上一张地图的out出口点的tiledMap地图上的地图坐标
     */
    initData(mapAsset: TiledMapAsset, mapIdx: number, mapTmxUIOffset: Vec2, lastOutObjPos: Vec2, lastTmxMapOutPos: Vec2, tmxAccuOffset: Vec2) {
        this.mapIdx = mapIdx;
        this._tmxUIOffset = v2(mapTmxUIOffset.x, mapTmxUIOffset.y);
        this.lastOutObjPos = v2(lastOutObjPos.x, lastOutObjPos.y);
        this.lastTmxMapOutPos = v2(lastTmxMapOutPos);
        this.tmxAccuOffset = v2(tmxAccuOffset);
        this.tmxAsset = mapAsset;
    }

    _releaseMapInfo() {
        this._decorationLayerObjects = [];
        super._releaseMapInfo();
    }

    protected _buildWithMapInfo(mapInfo: TMXMapInfo) {
        addMapInfo2ObjAndModifyId(mapInfo);
        mapInfo.mapIndex = this.mapIdx;
        if (this.mapIdx > 0) {
            let inTmxObj = getObjectGroupObj(mapInfo, MapLayerKey.CONNECT_LAYER, "in");
            if (!inTmxObj) {
                let mapsId = GIns.mapMgr.getMultiMapIDS();
                Logger.error(`找不到当前地图的拼接入口点，mapId：${mapsId[this.mapIdx]}`);
            }
            let inUIPos = tileMapPos2ScreenPos(inTmxObj.x, inTmxObj.y, mapInfo.tileSize, mapInfo.mapSize);
            //偏移位置再跟上个地图的outPos修正后才是正确的原点为左上角的地图UI偏移offset
            this._tmxUIOffset.set(this.lastOutObjPos.x - inUIPos.x, -this.lastOutObjPos.y - (-inUIPos.y));

            //设置当前地图各个层的偏移
            mapInfo.getLayers().forEach(l => {
                l.offset.set(this._tmxUIOffset);
            })
            mapInfo.mapUIOffset = v2(this._tmxUIOffset.x, -this._tmxUIOffset.y);

            //计算地图偏移
            this.lastOutObjPos.subtract2f(inTmxObj.x, inTmxObj.y).add(this.tmxAccuOffset);

            //优化：初始化的时候，强制 装饰物对象层， 角色对象层 隐藏
            mapInfo.getAllChildren().forEach(subLayer => {
                switch (subLayer.name) {
                    case MapLayerKey.DECORATION_LAYER: {
                        //修正装饰物偏移
                        addOffset(mapInfo, subLayer.name, this.tmxAccuOffset.x, this.tmxAccuOffset.y);
                        subLayer.visible = false; //有大量对象的装饰物对象层强制隐藏
                        break;
                    }
                    case MapLayerKey.PLAYER_LAYER: {
                        subLayer.visible = false; //有大量对象的角色对象层强制隐藏
                        break;
                    }
                }

                //修改部分地图层的名字
                let modifyName = this.toKeyName(subLayer.name);
                if (modifyName != subLayer.name) {
                    subLayer.name = modifyName;
                }
            });

            //优化：装饰物对象层等在界面显示的时候再创建
            let playerLayerInfo = getObjectGroup(mapInfo, this.toKeyName(MapLayerKey.DECORATION_LAYER));
            if(playerLayerInfo?.objects){
                this._decorationLayerObjects = playerLayerInfo.objects.concat();
                playerLayerInfo.objects.length = 0;
            } else {
                this._decorationLayerObjects = [];
            }

            Logger.startTime("yhma$_ MultiTiledMap.ts MultiTiledMap _buildWithMapInfo 创建tiledMap地图元素");
            super._buildWithMapInfo(mapInfo);
            Logger.endTime("yhma$_ MultiTiledMap.ts MultiTiledMap _buildWithMapInfo 创建tiledMap地图元素");


            this.calAndSetFinalXY(mapInfo, MapLayerKey.PLAYER_LAYER);
            this.calAndSetFinalXY(mapInfo, MapLayerKey.CONNECT_LAYER);
        } else {
            mapInfo.getAllChildren().forEach(subLayer => {
                switch (subLayer.name) {
                    case MapLayerKey.DECORATION_LAYER: //有大量对象的装饰物对象层强制隐藏
                    case MapLayerKey.PLAYER_LAYER: //有大量对象的角色对象层强制隐藏
                        subLayer.visible = false;
                        break;
                }
            });

            //优化：装饰物对象层等在界面显示的时候再创建
            let playerLayerInfo = getObjectGroup(mapInfo, this.toKeyName(MapLayerKey.DECORATION_LAYER));
            if(playerLayerInfo?.objects) {
                this._decorationLayerObjects = playerLayerInfo.objects.concat();
                playerLayerInfo.objects.length = 0;
            } else {
                this._decorationLayerObjects = [];
            }
            Logger.startTime("yhma$_ MultiTiledMap.ts MultiTiledMap _buildWithMapInfo 创建tiledMap地图元素");
            super._buildWithMapInfo(mapInfo);
            Logger.endTime("yhma$_ MultiTiledMap.ts MultiTiledMap _buildWithMapInfo 创建tiledMap地图元素");
        }
        this._mapContentSize = this.node.getComponent(UITransform).contentSize.clone();

    }

    /**
     * 获取指定层的指定名字的 object
     * @param layerName 
     * @param objName 
     * @returns 
     */
    getObjectGroupObj(layerName: string, objName: string) {
        let groupName = this.toKeyName(layerName);
        let layer = this._mapInfo.getObjectGroups().find(g => { return g.name == groupName });
        if (!layer) {
            return null
        }
        let obj = layer.objects.find(o => { return o.name == objName });
        return obj || null
    }

    getObjectGroup(groupName: string): TiledObjectGroup | null {
        let name = this.toKeyName(groupName);
        return super.getObjectGroup(name);
    }

    getMapContentSize() {
        return this._mapContentSize.clone()
    }

    /**
     * 有些地方直接用mapObject的，所以要创建完后修改好他们最终UI上的x，y
     */
    calAndSetFinalXY(map: TMXMapInfo, objLayerName: MapLayerKey) {
        const iso = TiledMap.Orientation.ISO === map.orientation;
        let tileSize = map.tileSize, height = 0;
        if (!iso) {
            height = this.getComponent(UITransform).contentSize.height;
        }
        let layerName = this.toKeyName(objLayerName);
        getObjectGroup(map, layerName).objects.forEach(o => {
            let obj = o as unknown as IMapObject;
            let objX = obj.offset.x, objY = obj.offset.y;
            if (iso) {
                let mapSize = obj.sourceMap.mapSize;
                const posIdxX = objX / tileSize.height;
                const posIdxY = objY / tileSize.height;
                obj.x = tileSize.width * 0.5 * (mapSize.height + posIdxX - posIdxY);
                obj.y = tileSize.height * 0.5 * (mapSize.width + mapSize.height - posIdxX - posIdxY);
            } else {
                obj.y = height - objY;
            }

            let mapUIOffset = obj.sourceMap.mapUIOffset;
            obj.x += mapUIOffset.x;
            obj.y += mapUIOffset.y;
        })
    }

    private toKeyName(layerName: string) {
        let name: string;
        if (this.mapIdx > 0) {
            switch (layerName) {
                case MapLayerKey.ROLE_LAYER:
                case MapLayerKey.UNDER_LAYER:
                case MapLayerKey.UI_LAYER: {
                    name = layerName;
                    break;
                }
                default: {
                    break;
                }
            }
            name = `${layerName}_$${this.mapIdx}`;
        } else {
            name = layerName;
        }
        return name;
    }
}