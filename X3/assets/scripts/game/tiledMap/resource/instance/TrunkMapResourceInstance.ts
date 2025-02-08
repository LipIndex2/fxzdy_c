import { MapModel } from "../../model/MapModule";
import NotificationKey from "../../../event/NotificationKey";
import { MapManager } from "../../MapManager";
import { MapObjectType, ResourceType } from "../../MapEnum";
import { ICreateMineralData, ICreateMonsterData } from "../../../comm/battle/interface/BattleInterface";
import ResourcePoint from "../point/ResourcePoint";
import { TableManager } from "../../../../core/table/TableManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import BaseResourceInstance from "./BaseResourceInstance";
import TrunkMapResourcePoint from "../point/TrunkMapResourcePoint";
import { DirctionType, WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { Rect } from "cc";
import { IVec2Like } from "cc";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**主线地图资源 */
export default class TrunkMapResourceInstance extends BaseResourceInstance {

    private _needSendResourceMap: { [resourceId: number]: Array<number> };
    private _survivalResourceMap: { [resourceId: number]: TrunkMapResourcePoint };

    /**清理范围外的怪 */
    private _tempCleanRect: Rect = new Rect();

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_RESOURCE_REFRESH_UPDATE,
            NotificationKey.DRAW_RESOURCE_REWARD,
            NotificationKey.RESOURCE_REFRESH_TIME_UPDATE,
            NotificationKey.RECONNECT_GAME_SERVER,
            NotificationKey.MAP_TEAN_POS_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_RESOURCE_REFRESH_UPDATE:
                this.resourceRefresh(args)
                break;
            case NotificationKey.DRAW_RESOURCE_REWARD:
                this.needDrawResourceReward(args);
                break;
            case NotificationKey.RESOURCE_REFRESH_TIME_UPDATE:
                this.onResourceRefreshTime(args);
                break;
            case NotificationKey.RECONNECT_GAME_SERVER:
                this.resetResourcePoints();
                this.syncResourcePointsToServer(MapManager.ins().getMapPos(), true);
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                this.cleanFartherResources(args);
                break;
        }
    }

    /**主线地图资源点 */
    protected initResourcesInMap() {
        this._survivalResourceMap = {};

        let objects = MapManager.ins().getObjectsByType(MapObjectType.ENEMY);
        objects = objects.concat(MapManager.ins().getObjectsByType(MapObjectType.RESOURCES));

        let resourcePoints: ResourcePoint[] = [];
        let resourcePointMap: { [key: number]: ResourcePoint } = {};

        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            let id = obj.object_id;
            if (!id || resourcePointMap[id]) continue;
            //console.log(` ${id} ${obj.x} ${obj.y} `);

            let cfg = TableManager.getDataById(table.map.MapResourceConfig, id);
            if (!cfg) {
                DebugUtils.isDebugMode() && console.log(" >>>>> 资源点 表里不存在：" + id);
                continue;
            }

            let unit = new TrunkMapResourcePoint();
            unit.id = id;
            unit.cfg = cfg;

            unit.setPosXY(obj.x, obj.y);
            resourcePoints.push(unit);
            resourcePointMap[id] = unit;
        }

        this._resourcePointsMap = resourcePointMap;
        return resourcePoints;
    }

    /**首次刷新 */
    protected initRescourcePoints(resourceIds: number[]) {
        MapModel.ins().sendLoadMapResources(resourceIds); //首次同步
    }

    /**更新刷新 */
    protected updateRescourcePoints(resourceIds: number[]) {
        MapModel.ins().sendLoadChangedMapResources(resourceIds);  //更新
    }

    /**资源刷新时间 */
    public onResourceRefreshTime(timeMap: { [key: number]: number }) {
        for (const key in timeMap) {
            let unit = this._resourcePointsMap[key];
            if (unit && this._survivalResourceMap[key]) {
                unit.refreshTime = timeMap[key];
            }
        }
    }

    /**刷新资源 (主线地图)*/
    public resourceRefresh(vos: Array<Vo.map.MapResourceVo>) {
        let mineralArr: ICreateMineralData[] = [];
        let monsterArr: ICreateMonsterData[] = [];
        let isGuideMonster = false;
        for (let i = 0; i < vos.length; i++) {
            let vo = vos[i];
            let unit = this._resourcePointsMap[vo.mapResourceConfigId] as TrunkMapResourcePoint;
            if (!unit) continue;

            this._survivalResourceMap[unit.id] = unit;

            let cfg = unit.cfg;
            let idxs = vo.survivalResourceIdxs || vo.updateSurvivalResourceIdxs;

            unit.refreshTime = vo.nextRefreshTime;

            let mineraDead = false;
            if (!idxs?.length) {
                if (cfg.type == ResourceType.MINERAL) {
                    idxs = [0];//矿死亡的话还要显示尸体
                    mineraDead = true;
                }
            }

            if (idxs.length) {
                switch (cfg.type) {
                    case ResourceType.MINERAL:
                        if (cfg.mapMineralId) {
                            mineralArr.push({ resourceId: vo.mapResourceConfigId, mineralId: cfg.mapMineralId, pos: unit.pos, idxs: idxs, isDead: mineraDead } as ICreateMineralData);
                        }
                        break;
                    case ResourceType.MONSTER:
                        if (cfg.mapMonsterId) {
                            let monsterCfg = TableManager.getDataById(table.map.MapMonsterConfig, cfg.mapMonsterId)
                            if (monsterCfg) {
                                let dir = monsterCfg.dir == 1 ? DirctionType.Rigth : DirctionType.Left;
                                let createMonsterData = {
                                    resourceId: vo.mapResourceConfigId, monsterId: monsterCfg.monsterId, pos: unit.pos, idxs: idxs, notKilledResourceIdxs: vo.notKilledResourceIdxs, teamId: WorldUnitTeam.Enemy,
                                    dirction: dir
                                } as ICreateMonsterData;
                                if (monsterCfg.bossRewards) {
                                    createMonsterData.drops = []
                                    let rewards = monsterCfg.bossRewards.split(";")
                                    for (let j = 0; j < rewards.length; j++) {
                                        let itemId = rewards[j].substring(0, rewards[j].indexOf(":"))
                                        let itemNum = rewards[j].substring(rewards[j].indexOf(":")) || 0;
                                        if (itemId)
                                            createMonsterData.drops.push({ itemId: +itemId, num: +itemNum })
                                    }
                                }
                                monsterArr.push(createMonsterData);

                                if (cfg.isGuide) {
                                    isGuideMonster = true;
                                }
                            }
                        }
                        break;
                }

                unit.setSurvivalIdxs(idxs);
            }
        }

        if (monsterArr.length) {
            FacadeManager.ins().emit(NotificationKey.CREATE_MONSTER_UNITS, monsterArr);
        }
        if (mineralArr.length) {
            FacadeManager.ins().emit(NotificationKey.CREATE_MINERAL_UNITS, mineralArr);
        }
        if (isGuideMonster) {
            FacadeManager.ins().emit(NotificationKey.CREATE_GUIDE_MONSTERS); //需要晚于创建事件
        }
    }

    /**需要领奖的资源点 (主线地图)*/
    public needDrawResourceReward(drawData: { resourceId: number, resourceIdx: number }) {
        if (!this._needSendResourceMap) {
            this._needSendResourceMap = {};
        }

        let resourceId = drawData.resourceId;

        if (!this._needSendResourceMap[resourceId]) {
            this._needSendResourceMap[resourceId] = [];
        }
        this._needSendResourceMap[resourceId].push(drawData.resourceIdx);

        let point = this._resourcePointsMap[resourceId] as TrunkMapResourcePoint;
        if (point)
            point.removeResoucresIdx(drawData.resourceIdx);
    }


    /**执行资源点领奖 (主线地图)*/
    public doDrawResourceReward() {
        if (this._needSendResourceMap) {
            let arr = [];
            for (const resourceId in this._needSendResourceMap) {
                arr.push({ mapResourceConfigId: +resourceId, resourceIndexes: this._needSendResourceMap[resourceId] } as Vo.map.MapResourceDrawReqVo);
            }

            if (arr.length) {
                MapModel.ins().sendDrawMapResources(arr);
            }
            this._needSendResourceMap = null;
        }
    }

    /**清理较远的资源点 */
    public cleanFartherResources(pos: IVec2Like) {
        let width = this._width + 1000;
        let height = this._height + 1000;
        let rect = this._tempCleanRect;
        rect.set(pos.x - width / 2, pos.y - height / 2, width, height);

        let cleanMap: { [resourceId: number]: Array<number> } = {};
        let hasClean = false;
        for (const key in this._survivalResourceMap) {
            let unit = this._survivalResourceMap[key];
            if (unit && !rect.contains(unit.pos)) {
                //不在显示范围内
                if (unit.survivalIdxs?.length) {
                    cleanMap[key] = unit.survivalIdxs;
                    hasClean = true;
                }
                delete this._survivalResourceMap[key];
                unit.resetState();
            }
        }

        if (hasClean) {
            FacadeManager.ins().emit(NotificationKey.BATTLE_CLEAN_FARTHER_RESOURCES, cleanMap);
        }
    }

    /**找到指定怪物所有资源点 */
    private getAllResourcePointByMapMonsterId(mapMonsterId: number) {
        let arr: TrunkMapResourcePoint[] = [];
        let point: TrunkMapResourcePoint;
        for (const key in this._resourcePointsMap) {
            point = this._resourcePointsMap[key] as TrunkMapResourcePoint;
            if (point.cfg.mapMonsterId === mapMonsterId) {
                arr.push(point);
            }
        }
        return arr;
    }

    /**找到指定矿所有资源点 */
    private getAllResourcePointByMapMineralId(mapMineralId: number) {
        let arr: TrunkMapResourcePoint[] = [];
        let point: TrunkMapResourcePoint;
        for (const key in this._resourcePointsMap) {
            point = this._resourcePointsMap[key] as TrunkMapResourcePoint;
            if (point.cfg.mapMineralId === mapMineralId) {
                arr.push(point);
            }
        }
        return arr;
    }

    /**获取所有于指定点的资源相同的资源点 */
    public getAllSameResourcePoint(resourceId: number) {
        let cfg = TableManager.getDataById(table.map.MapResourceConfig, resourceId);
        if (cfg) {
            switch (cfg.type) {
                case ResourceType.MONSTER:
                    return this.getAllResourcePointByMapMonsterId(cfg.mapMonsterId);
                case ResourceType.MINERAL:
                    return this.getAllResourcePointByMapMineralId(cfg.mapMineralId);
            }
        }
    }

    onUpdate() {
        super.onUpdate();

        this.doDrawResourceReward();
    }

}