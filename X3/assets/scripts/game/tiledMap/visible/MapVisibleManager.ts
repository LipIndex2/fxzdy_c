import { director, isValid, IVec2Like, Node, NodeEventType, Rect, Vec3 } from "cc";
import G from "../../../core/comm/G";
import { ScreenAdaptManager } from "../../../core/comm/ScreenAdaptManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { GameTimer } from "../../../core/timer/GameTimer";
import { NodeUtils } from "../../../core/utils/NodeUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { RectQuadtree } from "../../comm/math/RectQuadtree";
import { WorldManager } from "../../comm/world/WorldManager";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MapConfigManager } from "../config/MapConfigManager";
import { MapLayerKey, MapObjectType } from "../MapEnum";
import { MapManager } from "../MapManager";
import { BuildingNode } from "../ui/BuildingNode";
import { GateNode } from "../ui/GateNode";
import { MapDelayCtrNode } from "./MapDelayCtrNode";
import { DEBUG } from "cc/env";

/**可视节点 */
export default class MapVisibleManager extends BaseController {
    /**四叉树 */
    private _tree: RectQuadtree<Node | MapDelayCtrNode>;

    private _found: Node[] = [];
    /**当前活跃 */
    private _curActiveMap: { [uuid: string]: Node } = {};

    /**当前地图是否有节点 */
    private _hasNode: boolean;

    private _tempRect: Rect = new Rect();
    /**记录地图位置 */
    private _mapPos: Vec3 = new Vec3();

    private _mapMoveNode: Node;
    private _mapScaleNode: Node;

    private _isDirty = false;
    private _isHideBuilding: boolean = false;

    protected _offsetSize = 100;

    protected _isShowAd: boolean = false
    protected _isOpenAdBox: boolean = false


    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH,
            //NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_AD_BOX_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH:
                this.init(); //初始化
                break;
            //case NotificationKey.MAP_TEAN_POS_UPDATE:
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.updateActive();
                break;
            case NotificationKey.MAP_AD_BOX_REFRESH:
                this.refreshAdBox();
                break
        }
    }

    initMapInfo(): void {
        if (!this._mapMoveNode) {
            this._mapScaleNode = director.getScene().getChildByPath("Canvas/MapRoot");
            this._mapMoveNode = GIns.mapMgr.curMap.mapNode();
            this._mapScaleNode.on(NodeEventType.TRANSFORM_CHANGED, this.onMoveMap, this);
            this._mapMoveNode.on(NodeEventType.TRANSFORM_CHANGED, this.onMoveMap, this);

            GameTimer.ins().frameLoop(5, this, this.onUpdate);
        }
    }

    onMoveMap() {
        this._isDirty = true;
    }

    init() {
        this._offsetSize = MapManager.ins().isInMainCity() ? 200 : 100;

        this.initMapInfo();
        this._hasNode = false;
        let mapSize = MapManager.ins().getMapSize();
        this._tree = new RectQuadtree(new Rect(0, 0, mapSize?.width || 1000, mapSize?.height || 1000), null, 4);
        this._curActiveMap = {};

        let children = WorldManager.ins().hideLayer.children;
        // @ts-expect-error 看看能不能优化到lengh为0
        // if(DEBUG) {
        //     if (children.length > 0) {
        //         console.error("yhma$_ 看看能不能优化到lengh为0", children.length);
        //     }
        // }
        if (children?.length) {
            for (let i = children.length - 1; i >= 0; i--) {
                let node = children[i];
                node.active = false;
                this._tree.insert(node);
            }
            this._hasNode = true;
        }

        // //优化：初始化的时候，装饰层的对象不移动到 hidelayer
        // let decoratorLayers = GIns.mapMgr.curMap.getDecorationLayers();
        // decoratorLayers.forEach(layer => {
        //     let children = layer.children
        //     for (let i = children.length - 1; i >= 0; i--) {
        //         let node = children[i];
        //         node.active = false;
        //         this._tree.insert(node);
        //     }
        // });
        // this._hasNode = this._hasNode || decoratorLayers.length > 0;

        //优化：装饰物对象层等在界面显示的时候再创建
        let allTiledMap = GIns.mapMgr.curMap.getAllTiledMap()
        // if (DEBUG) {
        //     if (allTiledMap.length > 1) {
        //         throw new Error("未处理多地图的情况");
        //     }
        // }
        let _hasNode = false;
        allTiledMap.forEach(v => {
            _hasNode = _hasNode || v.decorationLayerObjects.length > 0;
            let playerLayer = v.getObjectGroup(MapLayerKey.DECORATION_LAYER);
            v.decorationLayerObjects.forEach(o => {
                this._tree.insert(MapDelayCtrNode.create(o, playerLayer));
            });
        });
        this._hasNode = this._hasNode || _hasNode;


        this.refreshAdBox();
        this._isDirty = true;
    }

    onUpdate() {
        if (this._isDirty && this._isHideBuilding == false) {
            this._isDirty = false;
            this.updateActive();
        }
    }

    getViewRect(pos: IVec2Like) {
        let scale = GIns.cameraAnimUtils.getCameraScale();
        let w = ScreenAdaptManager.viewWidth / scale + this._offsetSize;
        let h = ScreenAdaptManager.viewHeight / scale + this._offsetSize;

        this._tempRect.set(pos.x - w / 2, pos.y - h / 2, w, h);

        return this._tempRect;
    }


    /**点所在的触发器 */
    inAreas(pos: IVec2Like): (Node | MapDelayCtrNode)[] {
        this._found.length = 0;
        if (this._hasNode) {
            this._tree?.query(this.getViewRect(pos), this._found);
        }

        return this._found;
    }

    updateActive() {
        if (NodeUtils.isNotValidNode(this._mapMoveNode, true)) return;
        let pos = this._mapMoveNode.getPosition(this._mapPos);
        let found = this.inAreas(pos.set(-pos.x, -pos.y));
        let bgLayer = WorldManager.ins().bgLayer;
        let activeLayer = WorldManager.ins().roleLayer;
        let unActiveLayer = WorldManager.ins().hideLayer;
        let newActiveMap = {};
        if (found?.length) {
            let isActive = true;
            for (let i = 0; i < found.length; i++) {
                const node = found[i];
                if (isValid(node, true)) {
                    if (!node.active) {
                        node.active = true;
                        let gcom = node["$gobj"] as fgui.GComponent;
                        if (gcom) {
                            if (gcom instanceof BuildingNode) {
                                isActive = this.isBuildingActive(gcom)
                                gcom.setActive(isActive);
                                node.parent = isActive ? activeLayer : unActiveLayer;
                            } else if (gcom instanceof GateNode) {
                                gcom.setActive(true);
                                if (gcom.isInBg()) {
                                    node.parent = bgLayer;
                                } else {
                                    node.parent = activeLayer;
                                }
                            }
                        } else {
                            node.parent = activeLayer;
                        }
                    }

                    newActiveMap[node.uuid] = node;

                    if (this._curActiveMap[node.uuid]) {
                        delete this._curActiveMap[node.uuid]; //还在范围
                    }
                }
            }
        }

        for (const key in this._curActiveMap) {
            let node = this._curActiveMap[key];
            this._curActiveMap[key].active = false;
            this._curActiveMap[key].parent = unActiveLayer;

            if (isValid(node, true)) {
                let gcom = node["$gobj"] as fgui.GComponent;
                if (gcom && (gcom instanceof BuildingNode || gcom instanceof GateNode)) {
                    gcom.setActive(false);
                }
            }
        }

        this._curActiveMap = newActiveMap;
    }

    /**恢复所有建筑*/
    showAllBuildings(): void {
        this._isHideBuilding = false;
        this.updateActive();
    }

    /**隐藏所有建筑*/
    hideAllBuildings(excludeIds: number[]): void {
        this._isHideBuilding = true;
        let buildNode: Node = null
        let buildComp: BuildingNode = null
        for (let key in this._curActiveMap) {
            const node = this._curActiveMap[key]
            if (isValid(node, true)) {
                let gcom = node["$gobj"] as fgui.GComponent;
                if (gcom && gcom instanceof BuildingNode) {
                    buildNode = node
                    buildComp = gcom as BuildingNode
                    if (excludeIds && excludeIds.indexOf(buildComp.mapObject.object_id) != -1) {
                        continue;
                    }
                    if (buildNode && buildComp) {
                        let unActiveLayer = WorldManager.ins().hideLayer;
                        buildNode.active = false;
                        buildNode.parent = unActiveLayer;
                        buildComp.setActive(false);
                        let focusBuilding = GIns.mapMgr.curMap.focusBuilding()
                        if (focusBuilding && focusBuilding.mapObject.id == buildComp.mapObject.id) {
                            GIns.mapMgr.curMap.cancelFocus()
                        }
                    }
                }
            }
        }
    }

    /**建筑是否可见*/
    isBuildingActive(node: BuildingNode): boolean {
        if (node.mapObject.building_type == MapObjectType.Raccoon) {
            return this.isAdvertBoxShow()
        }
        return true
    }

    /**设置当前已展示的建筑隐藏或者展示*/
    setCurBuildingActive(buildingType: string, isActive: boolean): void {
        let buildNode: Node = null
        let buildComp: BuildingNode = null
        for (let key in this._curActiveMap) {
            const node = this._curActiveMap[key]
            if (isValid(node, true)) {
                let gcom = node["$gobj"] as fgui.GComponent;
                if (gcom && gcom instanceof BuildingNode) {
                    if (gcom.mapObject.building_type == buildingType) {
                        buildNode = node
                        buildComp = gcom as BuildingNode
                        break
                    }
                }
            }
        }
        if (buildNode && buildComp) {
            let activeLayer = WorldManager.ins().roleLayer;
            let unActiveLayer = WorldManager.ins().hideLayer;
            buildNode.active = isActive;
            buildNode.parent = isActive ? activeLayer : unActiveLayer;
            buildComp.setActive(isActive);
            if (!isActive) {
                let focusBuilding = GIns.mapMgr.curMap.focusBuilding()
                if (focusBuilding && focusBuilding.mapObject.id == buildComp.mapObject.id) {
                    GIns.mapMgr.curMap.cancelFocus()
                }
            }
        }
    }

    removeBuiding(node: Node) {
        this._tree.remove(node);
        if (this._curActiveMap[node.uuid]) {
            delete this._curActiveMap[node.uuid];
        }
    }

    protected _adBoxTimerKey: string = null;
    protected removeAdBoxTimer(): void {
        if (this._adBoxTimerKey) {
            G.GameTimer.clearByKey(this._adBoxTimerKey)
            this._adBoxTimerKey = null
        }
    }

    protected refreshAdBox(): void {
        this.removeAdBoxTimer()
        if (GIns.mapMgr.isInMainCity()) {
            //在主城 实时检测是否广告过期
            let isShowAd = this.isAdvertBoxShow()
            if (this._isShowAd != isShowAd) {
                this._isShowAd = isShowAd
                this.setCurBuildingActive(MapObjectType.Raccoon, isShowAd)
                if (isShowAd) {
                    // let nextTime = this.getNextAdBoxRefreshTime()
                    // if (nextTime > 0) {
                    //     this._adBoxTimerKey = G.GameTimer.once(nextTime, this, this.refreshAdBox)
                    // }
                }
            }
        }
    }

    protected getNextAdBoxRefreshTime(): number {
        let advertBoxVo = GIns.mapModel.advertBoxVo
        if (advertBoxVo) {
            let nowTime: number = G.TimeManager.serverNow
            let activeTime = MapConfigManager.getAdCfg().activeTime
            let nextTime: number = nowTime - advertBoxVo.refreshTime - activeTime
            return nextTime
        }
        return 0
    }

    /**是否展示火箭浣熊*/
    public isAdvertBoxShow(): boolean {
        let isShow: boolean = false
        let advertBoxVo = GIns.mapModel.advertBoxVo
        if (advertBoxVo) {
            // let nowTime: number = G.TimeManager.serverNow
            // let activeTime = MapConfigManager.getAdCfg().activeTime
            // let isTimeout: boolean = nowTime - advertBoxVo.refreshTime >= activeTime
            let isDraw: boolean = advertBoxVo.lastDrawTime > advertBoxVo.refreshTime
            isShow = !isDraw;
            if (isShow && this._isOpenAdBox == false) {
                //当前是展示阶段 就继续判断是否满足开启条件
                this._isOpenAdBox = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.DAILY_AD)
                return this._isOpenAdBox
            }
        }
        return isShow
    }

    onDestroy(): void {
        GameTimer.ins().clearAll(this);
    }
}

MapVisibleManager.ins().doInit();

