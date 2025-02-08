import { Node, Rect } from "cc"
import { IRect } from "../../comm/math/ICollision";
import { IMapObject } from "../IMapObject";
import { TiledMap } from "cc";
import { DEBUG } from "cc/env";
import { TiledObjectGroup } from "cc";
import GIns from "../../GIns";
import { TMXObject } from "../component/MultiTiledMapTiledType";

type GID = number;

let UUID = 0;

export class MapDelayCtrNode implements IRect {
    private _tmxObj: Readonly<TMXObject>
    private _tmxParentLayer: Readonly<TiledObjectGroup>
    private _node: Node

    private _active = false
    private _rect: Rect
    private _setNodeanchorY: number
    private _offsetH: number

    static create(tmxObj: Readonly<TMXObject>, tmxParentLayer: TiledObjectGroup) {
        let obj = new MapDelayCtrNode();
        obj._tmxObj = tmxObj;
        obj._tmxParentLayer = tmxParentLayer;
        return obj;
    }

    get active() {
        if (this._node) {
            this._node.active;
        }
        return false;
    }
    set active(v: boolean) {
        this._active = v;
        if (this._node) {
            this._node.active = v;
        }
    }

    get parent() {
        if (this._node) {
            return this._node.parent;
        }
        return null;
    }
    set parent(v: Node) {
        if (this._node) {
            this._node.parent = v;
            return
        }
        if (v.activeInHierarchy) {
            this.createNode(v);
        }
    }

    get rect(): Rect {
        if (!this._rect) {
            this.initRectAndPos();
        }

        return this._rect;
    }

    private _uuid: string
    get uuid() {
        if (!this._uuid) {
            this._uuid = `MapDelayCtrNode_${++UUID}`
        }

        return this._uuid;
    }

    private createNode(parent: Node) {
        if (this._node) {
            throw new Error("应该为空");
        }
        let objects = this._tmxParentLayer.getObjects();
        objects.push(this._tmxObj);
        let mapObj = this._tmxObj as IMapObject;
        let mapInfo = mapObj.sourceMap;
        let _texGrids = (this._tmxParentLayer as any)._texGrids;
        let groupInfo = mapInfo.getObjectGroups().find(v => { return v.name == this._tmxParentLayer.getGroupName(); });
        this._tmxParentLayer._init(groupInfo, mapInfo, _texGrids);
        objects.length = 0;
        this._node = this._tmxParentLayer.node.children[0]
        if (this._node) {
            let rect = this.rect;
            let uiTransformComp = this._node._uiProps.uiTransformComp;
            uiTransformComp.anchorY = this._setNodeanchorY;
            this._node.setPosition(rect.x + rect.width / 2, rect.y + this._offsetH);


            this._node.parent = parent;

            if (DEBUG) {
                if (this._tmxParentLayer.node.children.length > 0) {
                    throw ("这个不该大于0");
                }
            }
        }
    }


    private initRectAndPos() {
        const object = this._tmxObj;
        let mapObj = object as IMapObject;
        let mapInfo = mapObj.sourceMap;
        const { width, height } = mapInfo.mapSize;
        const tileSize = mapInfo.tileSize;
        const iso = TiledMap.Orientation.ISO === mapInfo.orientation;
        let curMapWidth = 0;
        let curMapHeight = 0;

        if (mapInfo.orientation === TiledMap.Orientation.HEX) {
            if (DEBUG) {
                throw new Error("游戏没有六边形地图");
            }
        } else if (iso) {
            const wh = width + height;
            curMapWidth = tileSize.width * 0.5 * wh;
            curMapHeight = tileSize.height * 0.5 * wh;
        } else {
            curMapWidth = width * tileSize.width;
            curMapHeight = height * tileSize.height;
        }

        let objUIX = 0, objUIY = 0, objWidth = object.width, objHeight = object.height;
        if (iso) {
            const posIdxX = object.x / tileSize.height;
            const posIdxY = object.y / tileSize.height;
            objUIX = tileSize.width * 0.5 * (height + posIdxX - posIdxY);
            objUIY = tileSize.height * 0.5 * (width + height - posIdxX - posIdxY);
        } else {
            objUIX = object.x;
            objUIY = curMapHeight - object.y;
        }


        const objType = object.type;
        if (objType === TiledMap.TMXObjectType.TEXT) {
            throw new Error("不应该有这种类型");
        } else if (objType === TiledMap.TMXObjectType.IMAGE) {
            if (DEBUG) {
                if (!object.width || !object.height) {
                    throw new Error("不应该为空");
                }
            }
        }
        let transComp = this._tmxParentLayer.node._uiProps.uiTransformComp;
        const leftTopX = curMapWidth * transComp.anchorX;
        const leftTopY = curMapHeight * (1 - transComp.anchorY);

        this._offsetH = objWidth * 0.4;
        this._setNodeanchorY = this._offsetH / objHeight; //调高锚点

        let UIOffset = GIns.mapMgr.curMap.getUIOffset(mapInfo.mapIndex);

        this._rect = new Rect(objUIX - leftTopX + curMapWidth / 2 + UIOffset.x - objWidth / 2, objUIY - leftTopY + curMapHeight / 2 + UIOffset.y, objWidth, objHeight);
    }
}