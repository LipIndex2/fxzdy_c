import { Component, _decorator } from "cc";
import { MultiTiledMap } from "./MultiTiledMap";
import { TiledMapAsset } from "cc";
import { UITransform } from "cc";
import { TMXMapInfo, TMXObject } from "./MultiTiledMapTiledType";
import { v2 } from "cc";
import { Rect } from "cc";
import { rect } from "cc";
import { Size } from "cc";
import { Vec2 } from "cc";
import { IVec2Like } from "cc";
import { TiledObjectGroup } from "cc";
import { TiledMap } from "cc";
import { LogBusiness } from "../../../core/log/LogBusiness";
import { MapLayerKey } from "../MapEnum";
import GIns from "../../GIns";
import { Logger } from "../../../core/log/Logger";

const { ccclass, executionOrder } = _decorator;

@ccclass("MultiTiledMapContainer")
@executionOrder(-1) //这个组件要比 MultiTiledMap 生命周期更早
export class MultiTiledMapContainer extends Component {
    private _childMapComps: MultiTiledMap[]

    private _mapNum: number

    //配置起始点
    private _startPos: Vec2;

    //合并后的地图最终尺寸
    private _mapFinalSize: Size;

    get mapNum() {
        return this._mapNum
    }

    get mapFinalSize() {
        return this._mapFinalSize.clone();
    }

    onLoad() {
        this._childMapComps = this.node.getComponents(MultiTiledMap);
    }

    _releaseMapInfo() {
        this._childMapComps.forEach(c => {
            c.tmxAsset = null;
        });
    }

    @LogBusiness("设置tiledMap地图")
    setTmxAssets(assets: TiledMapAsset | TiledMapAsset[]) {
        this.resetDatas();

        if (Array.isArray(assets) == false) {
            assets = [assets];
        }

        this._mapNum = assets.length;

        /**tmx屏幕坐标连接点的累积偏移位置，原点为左上角*/
        let accuOffset = v2();
        /** 地图在屏幕UI上的偏移，坐标原点为左下角，用来累加算最终地图大小*/
        let mapUIOffset = v2();
        /** 地图的出口点，用于连接下张地图的入口点 TMXObject 的x,y原点是左下角*/
        let outObj: TMXObject,
            lastOutObjUIPos = v2(); //上一张地图的out出口连接点算出来的屏幕最终的坐标，原点左下角
        /**  */
        let lastTmxMapOutPos = v2();  //上一张地图的out出口点的tiledMap地图上的地图坐标
        let tmxAccuOffset = v2(); //tiledMap地图坐标累计偏移
        let accuMapRect = rect(), //累加计算地图尺寸
            tempRect = rect()
        assets.forEach((mapAsset, idx) => {
            let comp = this._childMapComps[idx];
            if (!comp) {
                comp = this.node.addComponent(MultiTiledMap);
                this._childMapComps.push(comp)
            }
            comp.isMultiMap = assets.length > 1;

            comp.initData(
                mapAsset,
                idx,
                accuOffset,
                lastOutObjUIPos,
                lastTmxMapOutPos,
                tmxAccuOffset
            );

            if (idx == 0) {
                let startObj = comp.getObjectGroupObj(MapLayerKey.CONNECT_LAYER, "start");
                if (startObj) {
                    this._startPos = v2(startObj.x, startObj.y);
                }
            } else {
                let lastTmxUIOffset = comp.getTmxUIOffset();
                accuOffset.set(lastTmxUIOffset);
                mapUIOffset.set(lastTmxUIOffset.x, -lastTmxUIOffset.y);

                tmxAccuOffset = comp.getTmxMapOffset();
            }
            outObj = comp.getObjectGroupObj(MapLayerKey.CONNECT_LAYER, "out");

            if (outObj) {
                lastOutObjUIPos.set(outObj.x, outObj.y);
                lastTmxMapOutPos.set(outObj.offset.x, outObj.offset.y);
            } else if (idx > 1) {
                let mapIDs = GIns.mapMgr.getMultiMapIDS();
                if(mapIDs.length != idx + 1){
                    debugger
                    Logger.error(`找不到地图 mapId: ${mapIDs[idx]} 出口连接点`);
                }
            }

            //累加计算最终地图尺寸
            let curMapSize = this.node.getComponent(UITransform).contentSize;
            if (idx == 0) {
                tempRect.set(0, 0, curMapSize.width, curMapSize.height);
            } else {
                tempRect.set(mapUIOffset.x, mapUIOffset.y, curMapSize.width, curMapSize.height);
            }
            Rect.union(accuMapRect, accuMapRect, tempRect);
        });

        //设置地图最终尺寸
        this._mapFinalSize = accuMapRect.size;
        this.node.getComponent(UITransform)!.setContentSize(this._mapFinalSize);
        Logger.game("拼接的大地图最终尺寸：", this._mapFinalSize.width, this._mapFinalSize.height);

        let playerLayerNode = this.node.getChildByName(MapLayerKey.ROLE_LAYER);
        let uiLayerNode = this.node.getChildByName(MapLayerKey.UI_LAYER);
        playerLayerNode.getComponent(UITransform).setContentSize(this._mapFinalSize);
        playerLayerNode.setPosition(this._mapFinalSize.width / 2, this._mapFinalSize.height / 2);
        uiLayerNode.getComponent(UITransform).setContentSize(this._mapFinalSize);
        uiLayerNode.setPosition(this._mapFinalSize.width / 2, this._mapFinalSize.height / 2);

        if(assets.length > 1) {
            //todo: 后面按照地图的相对位置，合并后把所有层级排下序
            //UI_LAYER层最顶层，ROLE_LAYER第二层，其他层级现在先不管
            playerLayerNode.setSiblingIndex(this.node.children.length);
            uiLayerNode.setSiblingIndex(this.node.children.length);
        }
    }

    getTiledMap(idx: number) {
        return this._childMapComps[idx];
    }

    /** 获取当前生效的tiledMap */
    getAllTiledMap(){
        return this._childMapComps.slice(0, this.mapNum);
    }

    getObjectGroup(name: MapLayerKey): TiledObjectGroup {
        for (let i = 0; i < this.mapNum; ++i) {
            let og = this._childMapComps[i].getObjectGroup(name);
            if (og) {
                return og;
            }
        }
        return null;
    }

    getObjectGroupByNameAndMapIdx(name: MapLayerKey, mapIdx: number): TiledObjectGroup {
        if (mapIdx >= this.mapNum) {
            Logger.error("错误的地图下标");
            return;
        }

        return this._childMapComps[mapIdx].getObjectGroup(name);
    }

    // getAllPlayerLayerObjects(){
    //     //优化：角色对象层等在界面显示的时候再创建
    //     let objs: Readonly<Readonly<TMXObject>[]>[] = [];
    //     for(let i = 0; i < this._mapNum; ++i){
    //         objs.push(this._childMapComps[i].playerLayerObjects);
    //     }
    //     return objs;
    // }

    /**
     * 获取指定某块地图的尺寸
     * @param mapIdx 
     */
    getMapContentSize(mapIdx: number) {
        if (mapIdx >= this.mapNum) {
            Logger.error("错误的地图下标");
            return;
        }
        return this._childMapComps[mapIdx].getMapContentSize();
    }

    getUIOffset(mapIdx: number) {
        if (mapIdx >= this.mapNum) {
            Logger.error("错误的地图下标");
            return;
        }
        return this._childMapComps[mapIdx].getUIOffset();
    }

    getLayer(name: string) {
        let len = this._childMapComps.length;
        for (let i = 0; i < len; ++i) {
            let layer = this._childMapComps[i].getLayer(name);
            if (layer) {
                return layer;
            }
        }
        return null;
    }

    getMapOrientation() {
        return this._childMapComps[0].getMapOrientation()
    }

    /** 获取起始标记点的坐标 */
    getStartPos() {
        return this._startPos;
    }

    resetDatas() {
        this._startPos = null;
        this._mapNum = 1;
    }
}