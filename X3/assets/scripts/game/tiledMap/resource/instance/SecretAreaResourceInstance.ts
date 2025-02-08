import NotificationKey from "../../../event/NotificationKey";
import { MapManager } from "../../MapManager";
import ResourcePoint from "../point/ResourcePoint";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleManager } from "../../../comm/battle/BattleManager";
import BaseResourceInstance from "./BaseResourceInstance";
import { BattleModel } from "../../../modules/battle/model/BattleModel";
import BattleSetting from "../../../comm/battle/config/BattleSetting";
import { IMapObject } from "../../IMapObject";

/**秘境副本地图资源 */
export default class SecretAreaResourceInstance extends BaseResourceInstance {
    private _battleConfigId: number;
    /**资源点Id 转 怪物表数组 */
    private _resoucreToMonsterIdsMap: { [resourceId: number]: number[] } = [];

    listenNotifications(): string[] {
        return [
            NotificationKey.PLAY_RESOURCE_REFRESH_UPDATE,
            NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PLAY_RESOURCE_REFRESH_UPDATE:
                this.resourceRefresh(args);
                break;
            case NotificationKey.BATTLE_CLEAN_DEFENDER_UNITS:
                this.cleanAllResource();
                break;
        }
    }

    /**玩法地图资源点 */
    protected initResourcesInMap() {
        let battleConfigId = BattleManager.ins().battleConfigId;
        let battleCfg = TableManager.getDataById(table.battle.BattleConfig, battleConfigId);
        if (!battleCfg) return [];

        let resourcePoints: ResourcePoint[] = [];
        this._resourcePointsMap = {}

        if (BattleSetting.isDynamicsCreate) {
            let bossResourceIds = battleCfg.monsterResourceIds; //这个只配置boss，小怪配置在 table.secretinstance.SecretInstanceRoomConfig monsterResourceIds
            this.add2PointMap(bossResourceIds, resourcePoints);

            //获取随机出来的拼接地图对应的怪物id
            let modulePlayInfo = BattleManager.ins().mainScene.battleData.modulePlayInfo as Vo.secretinstance.SecretInstanceBattleInfo;
            let SecretInstanceFloorVo = modulePlayInfo.floorMap[modulePlayInfo.currentFloor] as Vo.secretinstance.SecretInstanceFloorVo;
            SecretInstanceFloorVo.roomIds.forEach(roomId => {
                let roomCfg = TableManager.getDataById(table.secretinstance.SecretInstanceRoomConfig, roomId);
                //起点跟终点不会有怪物
                if (roomCfg.monsterResourceIds && roomCfg.monsterResourceIds.length > 0) {
                    this.add2PointMap(roomCfg.monsterResourceIds, resourcePoints);
                }
            });
        }

        return resourcePoints;
    }

    /**首次刷新 */
    protected initRescourcePoints(resourceIds: number[]) {
        let cfgIds = [];
        for (let i = 0; i < resourceIds.length; i++) {
            cfgIds.push(...this._resoucreToMonsterIdsMap[resourceIds[i]]);
        }

        //这种玩法必定是不能隐藏
        BattleModel.ins().sendLoadBattleMonster(cfgIds, BattleManager.ins().battleConfigId); //首次同步
    }

    protected resourceRefresh(resourceCfgIds: number[]) {
        for (let i = 0, len = resourceCfgIds.length; i < len; i++) {
            let resourceCfgId = resourceCfgIds[i];
            let cfg = TableManager.getDataById(table.battle.MonsterResourceConfig, resourceCfgId);
            if (!this._resourcePointsMap[cfg.resourceId]) continue;
            this._resourcePointsMap[cfg.resourceId].refreshTime = 0;
        }
    }

    /**清理掉所有刷新点 （目前应用于boss出现后，清理小怪）*/
    private cleanAllResource() {
        this._resourcePointsMap = {};
        this._resourcePointTree.reset();
    }


    private add2PointMap(cfgResourcesIds: number[], out_resourcePoints: ResourcePoint[], isBoss?: boolean) {
        for (let i = 0, len = cfgResourcesIds.length; i < len; i++) {
            let cfg = TableManager.getDataById(table.battle.MonsterResourceConfig, cfgResourcesIds[i]);
            if (!cfg || cfg.isManual) continue; //没有配置或手动刷新
            let resourceId = cfg.resourceId;
            let obj: IMapObject;
            if (!isBoss) {
                obj = MapManager.ins().getUnitPosObjectByObjectId(resourceId); // -1 这里没有的 所以不会自然刷新！！
                if (!obj) continue;
            }

            let unit = new ResourcePoint();
            unit.id = resourceId;
            unit.setPosXY(obj.x, obj.y);
            this._resourcePointsMap[resourceId] = unit;
            out_resourcePoints.push(unit);

            if (!this._resoucreToMonsterIdsMap[resourceId]) {
                this._resoucreToMonsterIdsMap[resourceId] = [];
            }
            this._resoucreToMonsterIdsMap[resourceId].push(cfg.id);
        }
    }
}