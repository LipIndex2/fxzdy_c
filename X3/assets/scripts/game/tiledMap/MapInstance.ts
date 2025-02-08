import { director, IVec2Like, Node, Rect, TiledMapAsset, Tween, UITransform, v2, Vec2, Vec3 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "../../core/log/Logger";
import FacadeManager from "../../core/mvc/FacadeManager";
import { UIManager } from "../../core/mvc/UIManager";
import { AssetBundleKeys } from "../../core/res/AssetBundleKeys";
import { Res } from "../../core/res/Res";
import { ResRef } from "../../core/res/ResRef";
import { TableManager } from "../../core/table/TableManager";
import { GameTimer } from "../../core/timer/GameTimer";
import ArrayUtils from "../../core/utils/ArrayUtils";
import { FightType } from "../comm/battle/enum/FightType";
import { WorldLocationManager } from "../comm/battleEx/WorldLocationManager";
import { RectQuadtree } from "../comm/math/RectQuadtree";
import { AudioManager } from "../comm/mgr/AudioManager";
import { WorldManager } from "../comm/world/WorldManager";
import NotificationKey from "../event/NotificationKey";
import GIns from "../GIns";
import { GuideModel } from "../modules/guide/model/GuideModel";
import { UIMapKey } from "../modules/map/const/UIMapConfig";
import { IGateObject, IMapObject, ITriggerObject } from "./IMapObject";
import { IMapInstance } from "./interface/IMapInstance";
import { ITransfer } from "./interface/ITransfer";
import { MapLayerKey, MapObjectType, ObjectVisibleType } from "./MapEnum";
import { MapModel } from "./model/MapModule";
import { BuildingAreaNode } from "./ui/BuildingAreaNode";
import { BuildingNode } from "./ui/BuildingNode";
import { BuildingNodeWithUI } from "./ui/BuildingNodeWithUI";
import { GateNode } from "./ui/GateNode";
import MapVisibleManager from "./visible/MapVisibleManager";
import { BuildingNodeForPetDungeon } from "./ui/BuildingNodeForPetDungeon";
import { MultiTiledMapContainer } from "./component/MultiTiledMapContainer";
import { MultiTiledMap } from "./component/MultiTiledMap";
import { DebugUtils } from "../../core/utils/DebugUtils";

export class MapInstance implements IMapInstance {
    /**资源引用 */
    protected _curRefs: ResRef[] = [];
    /**
     * 当前地图Id
     * 多地图拼接的话就是第一张地图的id
     * */
    private _map1Id: number;
    /** 地图节点 */
    private _mapNode: Node;
    /** TiledMap */
    private _tiledMapContainer: MultiTiledMapContainer;
    /** 当前加载的地图id */
    private loadMaps: number[];
    /** 保存地图的起始位置 */
    private _mapStartPos: Vec2;

    /**建筑物四叉树 */
    private _buildingTree: RectQuadtree<BuildingNode>;
    private _found: BuildingNode[] = [];
    private _tempV2: Vec2 = new Vec2();
    private _tempV3: Vec3 = new Vec3();

    /**聚集的建筑 */
    private _focusBuilding: BuildingNode;
    /**是否有建筑物 */
    private _hasBuilding = false;
    //建筑对象
    private _buildingMap: { [key: number]: BuildingNode } = {};
    /**建筑物Id映射门列表 */
    private _buildingIdToGatesMap: { [key: number]: GateNode[] };
    /**资源点映射 */
    private _unitPosPointMap: { [id: number]: IMapObject };

    /**
     * 加载初始地图
     */
    public enterGameMap() {
        this._mapNode = director.getScene().getChildByPath("Canvas/MapRoot/Map");
        this._tiledMapContainer = this._mapNode.getComponent(MultiTiledMapContainer);
        if (!this._tiledMapContainer) {
            this._tiledMapContainer = this._mapNode.addComponent(MultiTiledMapContainer);
        }

        let multiTiledMap = this._mapNode.getComponent(MultiTiledMap);
        if (!multiTiledMap) {
            this._mapNode.addComponent(MultiTiledMap);
        }

        let guideId = TableManager.getDataById(table.guide.GuideConstantConfig, "JUDGE_GUIDE_DONE_ID").content;

        let locationData = WorldLocationManager.ins().getOfflineWorldLocation();
        if (locationData) {
            //上次离线位置
            this.mapAreaTransfer({ mapId: locationData.mapId, pos: locationData.pos });
            return;
        }

        if (!GuideModel.ins().isCompleted(Number.parseInt(guideId))) {
            //未完成某一步引导 -- 进入 新手地图
            let cfg = TableManager.getDataById(table.map.MapConstantConfig, "MAP:NEW_PLAYER_MAP_TP").content;
            let pos = cfg.split(";");
            this.mapAreaTransfer({
                mapId: Number.parseInt(pos[0].trim()),
                pos: { x: Number.parseInt(pos[1].trim()), y: Number.parseInt(pos[2].trim()) },
            });
        } else {
            this.mapAreaTransfer({ portalID: 1002 });
        }
    }

    /***是否需要加载地图资源 */
    public isNeedLoadMapResources: boolean = false;

    /**
     * 切换地图
     * 在初始地图上做地图资源替换
     * mapId 地图资源路径id
     *
     * @param maps 地图资源路径id
     * @param portalID 传送门id | null = 直接飞过去 pos
     * @param pos 传送门位置
     */
    @LogBusiness("切换地图/传送点")
    public switchMap(maps: number | number[], portalID: number | null, pos: IVec2Like, data: ITransfer) {
        FacadeManager.ins().emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);
        let map1Id: number, isSameMap: boolean;
        if (Array.isArray(maps)) {
            isSameMap = ArrayUtils.equal(this.loadMaps, maps);
            this.loadMaps = maps.concat();
            map1Id = maps[0];
        } else {
            isSameMap = this._map1Id == maps;
            this.loadMaps = [maps];
            map1Id = maps;
        }
        if (isSameMap == false) {
            this.isNeedLoadMapResources = true;
            this._map1Id = map1Id;
            let mapPaths = this.loadMaps
                .map((d) => {
                    let mapPath = TableManager.getDataById(table.map.MapidConfig, d);
                    if (mapPath) {
                        return mapPath.name;
                    } else {
                        Logger.error(`error table.map.MapidConfig 找不到地图配置:${d}`);
                    }
                })
                .filter((v) => {
                    return v;
                });
            this.load(mapPaths, pos, portalID, data);
        } else {
            let startPos = pos || this._mapStartPos;
            // 同一张地图
            if (data.isNextLevel && GIns.battleMgr.battleLogic.fightType != FightType.TRUNK_MAP) {
                this.isNeedLoadMapResources = false;
                this.onMapLoadComplete(startPos, portalID, data);
            } else this.transferEnd(portalID, startPos);
        }
    }

    /**释放地图 */
    protected releaseMap() {
        this._tiledMapContainer._releaseMapInfo();
        if (this._curRefs?.length) {
            this._curRefs.forEach((ref) => {
                ref.dispose();
            });
        }
        this._curRefs = null;
    }

    protected load(url: string[], pos: IVec2Like, portalID: number | null, data: ITransfer): void {
        Res.getResRefByUrls(url, AssetBundleKeys.MAP, TiledMapAsset, null, (resRefs?: ResRef[]) => {
            Logger.startTime("yhma$_ MapInstance.ts MapInstance load 总耗时");
            if (resRefs) {
                this._mapNode.active = true;
                this.releaseMap();

                this._curRefs = resRefs;
                let mapAssetArr = [];
                resRefs.forEach((ref) => {
                    let asset = ref.content;
                    if (asset.tsxFileNames.length) {
                        //cocos bug 文件路径错了
                        for (let i = 0; i < asset.tsxFileNames.length; i++) {
                            let fileName = asset.tsxFileNames[i];
                            if (fileName.endsWith(".tsx") && fileName.indexOf("/") == -1) {
                                asset.tsxFileNames[i] = "../mapTilesets/" + fileName;
                            }
                        }
                    }
                    mapAssetArr.push(asset);
                });

                Logger.startTime("yhma$_ MapInstance.ts MapInstance load forEach 地图实例化耗时");
                this._tiledMapContainer.setTmxAssets(mapAssetArr);
                Logger.endTime("yhma$_ MapInstance.ts MapInstance load forEach 地图实例化耗时");

                Tween.stopAllByTarget(this._mapNode);

                this.initObjectLayers();

                let startPos = pos;
                if (data.useStartObj) {
                    let tileStartPos = this._tiledMapContainer.getStartPos();
                    if (tileStartPos) {
                        startPos = tileStartPos;
                    }
                }
                this._mapStartPos = v2(startPos.x, startPos.y);
                Logger.game(`设置起始位置, useStartObj:${data.useStartObj} startPos: ${JSON.stringify(startPos)}, pos: ${JSON.stringify(pos)}`);

                this.onMapLoadComplete(startPos, portalID, data);

                Logger.endTime("yhma$_ MapInstance.ts MapInstance load 总耗时");
            } else {
                // console.error(err);
                console.error("未加载到地图资源");

                GIns.mapMgr.targetTeleportId = null;
            }
        });
    }

    protected onMapLoadComplete(pos: IVec2Like, portalID: number | null, data: ITransfer): void {
        DebugUtils.isDebugMode() && console.log("地图加载成功！！！");
        if (GIns.mapMgr.getMapCfg().bgm) {
            GIns.mapMgr.playMapMusic();
        } else {
            AudioManager.ins().stopBgm();
        }
        FacadeManager.ins().emitNow(NotificationKey.ENTER_WORLD, [pos, data]);
        FacadeManager.ins().emitNow(NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH, pos);

        if (data.buildingId > 0) {
            let buildingNode = this.getBuildingNode(data.buildingId);
            if (buildingNode) {
                //传送到指定为止
                pos = {
                    x:buildingNode.mapObject.x,
                    y:buildingNode.mapObject.y
                }
            }
        }
        this.transferEnd(portalID, pos);

        //加载地图背景
        this.setMapBG();
    }

    /** 设置地图背景 */
    private setMapBG() {
        //坐标偏移
        UIManager.ins().open(UIMapKey.MAP_BG_POPUP, { id: this._map1Id });
    }

    /**
     * 在这里开始处理对象层
     */
    private initObjectLayers() {
        let mapSize = this._mapNode.getComponent(UITransform).contentSize;
        const roleObj = this._tiledMapContainer.getObjectGroup(MapLayerKey.ROLE_LAYER);
        const underObj = this._tiledMapContainer.getObjectGroup(MapLayerKey.UNDER_LAYER);
        const UIObj = this._tiledMapContainer.getObjectGroup(MapLayerKey.UI_LAYER);

        if (!roleObj || !UIObj) {
            GameTimer.ins().pause();
            throw new Error(`未找到 '${!roleObj ? MapLayerKey.ROLE_LAYER : MapLayerKey.UI_LAYER}'`);
        }

        let offsetX = -mapSize.width / 2;
        let offsetY = -mapSize.height / 2;
        let layer = new Node("layer");
        layer.setPosition(offsetX, offsetY);
        roleObj.node.addChild(layer);

        let upperLayer = new Node("upperLayer");
        upperLayer.setPosition(offsetX, offsetY);
        UIObj.node.addChild(upperLayer);

        let underLayer = null;
        if (underObj) {
            underLayer = new Node("underLayer");
            underLayer.setPosition(offsetX, offsetY);
            underObj.node.addChild(underLayer);
        }

        WorldManager.ins().initWorldLayer(layer, upperLayer, underLayer);

        //设置对象层node
        this._buildingTree = new RectQuadtree(new Rect(0, 0, mapSize.width, mapSize.height), null, 3);
        this._hasBuilding = false;
        this._focusBuilding = null;

        this._buildingMap = {};
        this._buildingIdToGatesMap = {};

        this._unitPosPointMap = null;

        Logger.startTime("yhma$_ MapInstance.ts MapInstance initObjectLayers initBuildings 创建对象层中的对象");
        this.initBuildings();
        Logger.endTime("yhma$_ MapInstance.ts MapInstance initObjectLayers initBuildings 创建对象层中的对象");
    }

    private initBuildings() {
        // 遍历并处理对象层中的对象
        const objects = this.getObjectsByLayerKey(MapLayerKey.PLAYER_LAYER);
        for (const object of objects.values()) {
            this.createBuilding(object);
        }

        //优化：初始化的时候，装饰层的对象不移动到 hidelayer
        // this.addToDynamicsPool();
    }

    //优化：初始化的时候，装饰层的对象不移动到 hidelayer
    // /**
    //  * 添加到节点动态池
    //  *
    //  *将装饰物node加到对象层
    //  */
    // private addToDynamicsPool() {
    //     let layer = WorldManager.ins().hideLayer;
    //     let mapNum = this._tiledMapContainer.mapNum;
    //     let offsetX = 0, offsetY = 0;
    //     for (let mapIdx = 0; mapIdx < mapNum; ++mapIdx) {
    //         let decoratorLayer = this._tiledMapContainer.getObjectGroupByNameAndMapIdx(MapLayerKey.DECORATION_LAYER, mapIdx);
    //         if (!decoratorLayer)
    //             continue;
    //         const nodes = decoratorLayer.node.children;
    //         let UIOffset = this._tiledMapContainer.getUIOffset(mapIdx);
    //         let mapSize = this._tiledMapContainer.getMapContentSize(mapIdx);
    //         offsetX = -mapSize.width / 2;
    //         offsetY = -mapSize.height / 2;
    //         for (let index = nodes.length - 1; index >= 0; index--) {
    //             let node = nodes[index];
    //             let uiTransformComp = node._uiProps.uiTransformComp;
    //             let width = uiTransformComp.width;
    //             let height = uiTransformComp.height;
    //             let offsetH = width * 0.4;
    //             let anchorY = offsetH / height; //调高锚点
    //             uiTransformComp.anchorY = anchorY;
    //             node.setPosition(node.position.x - offsetX + UIOffset.x, node.position.y - offsetY + offsetH + UIOffset.y);
    //             node.parent = layer;
    //         }
    //     }
    // }

    getDecorationLayers(): Node[] {
        //优化：初始化的时候，装饰层的对象不移动到 hidelayer
        let mapNum = this._tiledMapContainer.mapNum;
        let layers: Node[] = [];
        for (let mapIdx = 0; mapIdx < mapNum; ++mapIdx) {
            let decoratorLayer = this._tiledMapContainer.getObjectGroupByNameAndMapIdx(MapLayerKey.DECORATION_LAYER, mapIdx);
            if (decoratorLayer) {
                layers.push(decoratorLayer.node);
            }
        }
        return layers;
    }

    // getPlayerLayers(): Node[] {
    //     //优化：初始化的时候，角色对象层的对象不移动到 hidelayer
    //     let mapNum = this._tiledMapContainer.mapNum;
    //     let layers: Node[] = [];
    //     for (let mapIdx = 0; mapIdx < mapNum; ++mapIdx) {
    //         let decoratorLayer = this._tiledMapContainer.getObjectGroupByNameAndMapIdx(MapLayerKey.PLAYER_LAYER, mapIdx);
    //         if(decoratorLayer) {
    //             layers.push(decoratorLayer.node);
    //         }
    //     }
    //     return layers;
    // }

    /**
     * 处理单个对象
     */
    private createBuilding(object: IMapObject) {
        // 获取对象
        if (!object) {
            console.warn(`找不到对象'TargetObjectName'的节点.`);
            return;
        }
        if (!ObjectVisibleType[object.building_type]) {
            //不是可视化对象
            return;
        }
        switch (object.building_type) {
            case ObjectVisibleType.gate:
                this.createGateNode(object as IGateObject);
                break;
            case ObjectVisibleType.factories_area:
                this.createAreaNode(object);
                break;
            default:
                this.createBuildingNode(object);
                break;
        }
    }

    /**是否有附带UI*/
    protected isBuildingWithUI(objectType: string): boolean {
        if (objectType == MapObjectType.factories || objectType == MapObjectType.mine || objectType == MapObjectType.stimulation) {
            return true;
        }
        return false;
    }

    /**建筑物节点 */
    createBuildingNode(object: IMapObject) {
        let cfg: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, object.object_id);
        if (!cfg) return;
        if (cfg.disappear) {
            if (MapModel.ins().getBuildingUnlockById(cfg.id)) {
                this.destroyCloud(cfg.id); //解锁的迷雾 隐藏
                return;
            }
        }
        let fcom: BuildingNode = null;
        //根据建筑类型不同构件不同的建筑
        if (object.building_type == MapObjectType.petinstance) {
            fcom = BuildingNodeForPetDungeon.create();
        } else if (this.isBuildingWithUI(object.building_type)) {
            fcom = BuildingNodeWithUI.create();
        } else {
            fcom = BuildingNode.create();
        }
        fcom.setData(cfg, object);

        WorldManager.ins().hideLayer.addChild(fcom.node);

        this._buildingMap[cfg.id] = fcom;
        this._buildingTree.insert(fcom);
        this._hasBuilding = true;
    }

    /**门节点 */
    private createGateNode(object: IGateObject) {
        let cfg: table.map.BuildingGateConfig = TableManager.getDataById(table.map.BuildingGateConfig, object.gate_id);
        if (!cfg) return;
        let isUnlock = GIns.mapMgr.getBuildingUnlockById(object.building_id);

        let fcom = GateNode.create();
        fcom.setData(cfg, object);

        // if (cfg.isPlane || isUnlock) {
        //     WorldManager.ins().bgLayer.addChild(fcom.node);
        //     fcom.setActive(true);
        // } else {
        //WorldManager.ins().roleLayer.addChild(fcom.node);
        WorldManager.ins().hideLayer.addChild(fcom.node);
        //}

        if (!isUnlock) {
            //未解锁
            if (!this._buildingIdToGatesMap[object.building_id]) {
                this._buildingIdToGatesMap[object.building_id] = [];
            }
            this._buildingIdToGatesMap[object.building_id].push(fcom);
        }
    }

    /**区域节点 */
    private createAreaNode(object: IMapObject) {
        let fcom = BuildingAreaNode.create();
        fcom.setData(object);
        WorldManager.ins().shadowLayer.addChild(fcom.node);
    }

    /**
     * 消除云层
     * @param strName 是需要消除的云层区域名
     */
    public destroyCloud(object_id: number) {
        let cfg: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, object_id);
        if (cfg && cfg.area_name) {
            let cloudLayer = this._tiledMapContainer.getLayer(cfg.area_name + "cloud_layer"); //云层
            let cloudShadowLayer = this._tiledMapContainer.getLayer(cfg.area_name + "cloudShadow_layer"); //云层阴影

            if (cloudLayer) {
                cloudLayer.enabled = false;
            }
            if (cloudShadowLayer) {
                cloudShadowLayer.enabled = false;
            }
        }
    }

    /**
     * 传送接口
     * @param data 传输位置
     */
    @LogBusiness("[地图] 传送")
    public mapAreaTransfer(data: ITransfer) {
        let mapId = data.mapId;
        let mapIds = data.mapIds;
        let buildingId = data.portalID;
        let pos = data.pos;

        // 地图传送
        // 有 pos 的时候, 则为 mapId + pos 传送
        if (mapId) {
            if (!pos) {
                let cfg = TableManager.getDataById(table.map.MapidConfig, mapId);
                if (!cfg?.transferPos) {
                    G.Logger.warn("地图坐标错误", { mapId });
                    return;
                }
                pos = new Vec2(cfg.transferPos[0], cfg.transferPos[1]);
            }

            this.switchMap(mapId, null, v2(pos.x, pos.y), data);
            return;
        }

        if (mapIds) {
            this.switchMap(mapIds, null, null, data);
            return;
        }

        if (!buildingId) {
            G.Logger.warn("传送阵ID错误", { buildingId: buildingId, mapId: mapId, pos: pos });
            return;
        }

        // 传送阵 id
        let buildingConfig: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        //获取传送阵的配置表
        if (!buildingConfig) {
            G.Logger.error("传送阵配置表不存在", { buildingId: buildingId });
            return;
        }
        if (!buildingConfig.transferPos) {
            G.Logger.error("[传送] 建筑的传送阵坐标不存在", { buildingId: buildingId });
            return;
        }

        //不在同一场景中
        this.switchMap(buildingConfig.map_id, buildingId, v2(buildingConfig.transferPos[0], buildingConfig.transferPos[1]), data);
    }

    /** 传送结束 */
    private transferEnd(portalID: number | null, pos: { x: number; y: number }) {
        let x: number;
        let y: number;

        if (portalID) {
            let buildingCfg: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, portalID);
            //获取传送阵的配置表
            if (!buildingCfg) return;

            x = buildingCfg.transferPos[0];
            y = buildingCfg.transferPos[1];
        } else {
            x = pos.x;
            y = pos.y;
        }

        let guideId = TableManager.getDataById(table.map.MapConstantConfig, "MAP:NEW_PLAYER_MAP_GUIDEID").content;
        let posStr = TableManager.getDataById(table.map.MapConstantConfig, "MAP:NEW_PLAYER_MAP_GUIDEID_TP").content;
        let posArray = posStr.split(";");
        if (!GuideModel.ins().isCompleted(Number.parseInt(guideId.trim())) && GIns.mapMgr.getMapID() == Number.parseInt(posArray[0].trim())) {
            x = Number.parseInt(posArray[1].trim());
            y = Number.parseInt(posArray[2].trim());
        }

        this.setMapPosition(x, y);
        this.checkFocusBuilding(x, y);

        FacadeManager.ins().emit(NotificationKey.MAP_AREA_TRANSFER_END, { x, y });
    }

    /**移动地图 坐标显示在屏幕中心 */
    private setMapPosition(x: number, y: number) {
        this._mapNode.setPosition(-x, -y);
    }

    /**
     * 队伍移动更新 | 地图镜头移动
     * */
    public teamPosUpdate(pos: { x: number; y: number }) {
        // 直接更新位置
        if (!GIns.battleMgr.battleLogic.battleSetting.isCameraStopFollow) {
            this.setMapPosition(pos.x, pos.y);
        }
        this.checkFocusBuilding(pos.x, pos.y);
    }

    /**
     * 获取屏幕内的资源点
     * @param x 屏幕中心的map_x
     * @param y 屏幕中心的map_y
     * @returns 返回范围内的所有资源点
     */
    private checkFocusBuilding(x: number, y: number) {
        this._tempV2.set(x, y);
        this.refreshFocusBuilding();
        return;
    }

    protected setCurFocusBuilding(focusBuilding: BuildingNode): void {
        if (focusBuilding) {
            if (focusBuilding === this._focusBuilding) {
                return;
            }
            if (this._focusBuilding) {
                this._focusBuilding.focus = false;
            }

            this._focusBuilding = focusBuilding;
            this._focusBuilding.focus = true;
            FacadeManager.ins().emit(NotificationKey.MAP_ACTIVE_BUILDING, focusBuilding.buildingId);
            return;
        }
        if (this._focusBuilding) {
            FacadeManager.ins().emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING, this._focusBuilding.buildingId);
            this._focusBuilding.focus = false;
            this._focusBuilding = null;
        }
    }

    /**刷新当前焦点建筑*/
    public refreshFocusBuilding(): void {
        if (!this._hasBuilding) return;
        this._found.length = 0;
        this._buildingTree.queryByPoint(this._tempV2, this._found);

        if (this._found.length) {
            let focusBuilding: BuildingNode;
            let max = -1;
            for (let i = 0, len = this._found.length; i < len; i++) {
                let cur = this._found[i].focusPriority(this._tempV2);
                if (cur >= 0 && cur > max) {
                    focusBuilding = this._found[i];
                    max = cur;
                }
            }
            this.setCurFocusBuilding(focusBuilding);
        } else {
            this.setCurFocusBuilding(null);
        }
    }

    /**取消焦点*/
    public cancelFocus(): void {
        this.setCurFocusBuilding(null);
    }

    /** 获取某一层 */
    public getLayerByType(type: MapLayerKey) {
        return this._tiledMapContainer.getObjectGroup(type);
    }

    // /** 获取所有地图的 角色对象层 数据 */
    // public getAllPlayerLayerObjects() {
    //     return this._tiledMapContainer.getAllPlayerLayerObjects();
    // }

    getAllTiledMap() {
        return this._tiledMapContainer.getAllTiledMap();
    }

    private getObjectsByLayerKey(objectGroupName: MapLayerKey): IMapObject[] {
        let arr = [];
        let mapNum = this._tiledMapContainer.mapNum;
        for (let i = 0; i < mapNum; ++i) {
            let objectGroup = this._tiledMapContainer.getObjectGroupByNameAndMapIdx(objectGroupName, i);
            if (!objectGroup) {
                console.warn(`未找到 '${objectGroupName}' ${i}`);
            } else {
                arr = arr.concat(objectGroup.getObjects());
            }
        }
        return arr;
    }

    // private getChildrenByLayerKey(objectGroupName: MapLayerKey) {
    //     const objectGroup = this._tiledMapContainer.getObjectGroup(objectGroupName);
    //     if (!objectGroup) {
    //         console.warn(`未找到 '${objectGroupName}'`);
    //         return [];
    //     }
    //     return objectGroup.node.children;
    // }

    /**
     * 获取对应类型对象数组
     * @param type  MapObjectType类型
     */
    public getObjectsByType(type: MapObjectType): IMapObject[] {
        let objectArr = [];
        // 遍历并处理对象层中的对象,获取同类型的对象
        const objects = this.getObjectsByLayerKey(MapLayerKey.PLAYER_LAYER);
        for (const object of objects.values()) {
            if (object.building_type == type) {
                objectArr.push(object);
            }
        }
        return objectArr;
    }

    /**
     * 获取区域层对象
     */
    public getAreaObjects(): IMapObject[] {
        const objects = this.getObjectsByLayerKey(MapLayerKey.AREA_LAYER);

        let arr = [];
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i] as IMapObject;
            if (obj.area_id) {
                arr.push(obj);
            } else {
                DebugUtils.isDebugMode() && console.log(obj.id + "区域没有area_id");
            }
        }
        return arr;
    }

    /**
     * 获取障碍层对象
     */
    public getBlockObjects(): IMapObject[] {
        const objects = this.getObjectsByLayerKey(MapLayerKey.BLOCK_OBJECT_LAYER);
        let unlockMap = MapModel.ins().MapVo;
        if (!unlockMap) return objects;

        let arr = [];
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i] as IMapObject;
            if (obj.unlock_id && unlockMap[obj.unlock_id]) {
                continue;
            }
            arr.push(obj);
        }

        return arr;
    }

    // /**
    //  * 获取装饰层对象
    //  */
    // public getDecorationObjects(): IMapObject[] {
    //     const objects = this.getObjectsByLayerKey(MapLayerKey.DECORATION_LAYER);
    //     let arr = [];
    //     for (let i = 0; i < objects.length; i++) {
    //         const obj = objects[i] as IMapObject;
    //         let icon = this._tiledMap.getPropertiesForGID(obj.gid & 0xFFFFFFF)?.icon;
    //         if (obj.icon || icon) {
    //             arr.push(obj);
    //         } else {
    //             console.log(obj.id + "装饰物没有icon属性");
    //         }
    //     }
    //     return arr;
    // }

    /** 获取触发器 */
    public getTriggerObjects(): ITriggerObject[] {
        return this.getObjectsByLayerKey(MapLayerKey.TRIGGER_LAYER) as any;
    }

    // /** 获取装饰物 */
    // public getDecorationChildren() {
    //     return this.getChildrenByLayerKey(MapLayerKey.DECORATION_LAYER);
    // }

    /**
     * 获取安全区对象
     */
    public getSafeAreaObjects(): IMapObject[] {
        return this.getObjectsByLayerKey(MapLayerKey.SAFEAREA_LAYER);
    }

    /** 获取对应ID建筑 播放使用 */
    public getBuildingNode(buildingId: number): BuildingNode {
        return this._buildingMap[buildingId];
    }

    /** 获取对应ID建筑 播放使用 */
    public getUsingBuilding(buildingId: number) {
        return this._buildingMap[buildingId]?.using(true);
    }

    /** 获取对应ID建筑 */
    public getObjectsByIDInBuilding(buildingId: number): IMapObject | null {
        return this._buildingMap[buildingId]?.mapObject || null;
    }

    /** 解锁建筑物 */
    public unlockBuilding(buildingId: number) {
        let buildingNode = this._buildingMap[buildingId];
        if (buildingNode) {
            let isFoucs = this._focusBuilding && this._focusBuilding.buildingId == buildingId;
            buildingNode.unlock(isFoucs);

            if (isFoucs) {
                if (buildingNode.cfg.disappear) {
                    FacadeManager.ins().emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING, buildingId);
                    this._focusBuilding = null;
                } else {
                    FacadeManager.ins().emit(NotificationKey.MAP_ACTIVE_BUILDING, buildingId);
                }
            }

            if (buildingNode.cfg.disappear) {
                //解锁后消失
                this._buildingTree.remove(buildingNode);
                MapVisibleManager.ins().removeBuiding(buildingNode.node);
                buildingNode.dispose();
                delete this._buildingMap[buildingId];
            }

            if (this._buildingIdToGatesMap[buildingId]) {
                let gates = this._buildingIdToGatesMap[buildingId];
                for (let i = 0; i < gates.length; i++) {
                    const node = gates[i];
                    node.unlock();
                }
                delete this._buildingIdToGatesMap[buildingId];
            }
        }
    }

    /**获取需要聚焦的门 */
    public getFocusGateByBuildingId(buildingId: number) {
        if (this._buildingIdToGatesMap[buildingId]) {
            let gates = this._buildingIdToGatesMap[buildingId];
            for (let i = 0; i < gates.length; i++) {
                const node = gates[i];
                if (node.isNeedFocus()) {
                    return node.mapObject;
                }
            }
        }
        return null;
    }

    /**初始化资源点信息 */
    public getUnitPosPintMap() {
        if (!this._unitPosPointMap) {
            let unitPosPointMap = {};
            let objects = this.getObjectsByType(MapObjectType.UNIT_POS);

            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                let id = obj.object_id;
                if (!id || unitPosPointMap[id]) continue;
                unitPosPointMap[id] = obj;
            }
            this._unitPosPointMap = unitPosPointMap;
        }
        return this._unitPosPointMap;
    }

    /**获取当前地图资源点信息 */
    public getUnitPosObjectByObjectId(id: number) {
        if (!this._unitPosPointMap) {
            this.getUnitPosPintMap();
        }
        return this._unitPosPointMap[id];
    }

    /**获取地图信息
     * 格子大小和格子数
     */
    public getMapInfo() {
        if (this.isMultiMap()) {
            return { type: this._tiledMapContainer.getMapOrientation() };
        } else {
            let _tiledMap = this._tiledMapContainer.getTiledMap(0);
            return {
                mapSize: _tiledMap.getMapSize(),
                tileSize: _tiledMap.getTileSize(),
                type: _tiledMap.getMapOrientation(),
            };
        }
    }

    public getMapSize() {
        let UiCom = this._mapNode.getComponent(UITransform);
        return { width: UiCom.contentSize.width, height: UiCom.contentSize.height };
    }

    public getMapPos() {
        this._mapNode?.getPosition(this._tempV3);
        return { x: -this._tempV3.x, y: -this._tempV3.y };
    }

    /**
     * 是否多地图拼接
     * @returns
     */
    public isMultiMap() {
        return this.loadMaps.length > 1;
    }

    public getMapID() {
        return this._map1Id;
    }

    public getMultiMapIDS() {
        return this.loadMaps.concat();
    }

    public getUIOffset(mapIdx: number) {
        return this._tiledMapContainer.getUIOffset(mapIdx);
    }

    public getMapCfg() {
        return TableManager.getDataById(table.map.MapidConfig, this._map1Id);
    }

    destroy() {
        this.releaseMap();
    }

    // 是否解锁建筑
    isHaveUnlockBuilding(buildingId: number) {
        return this._buildingMap[buildingId] != null;
    }

    //获取当前聚集的建筑
    focusBuilding() {
        return this._focusBuilding;
    }

    //获取地图的父节点
    mapNode() {
        return this._mapNode;
    }

    /**显示建筑 只是修改透明度 不影响active逻辑*/
    showBuildings() {
        for (let key in this._buildingMap) {
            this._buildingMap[key]?.setAlpha(1);
        }
    }

    /**隐藏建筑 只是修改透明度 不影响active逻辑*/
    hideBuildings() {
        for (let key in this._buildingMap) {
            this._buildingMap[key]?.setAlpha(0);
        }
    }
}
