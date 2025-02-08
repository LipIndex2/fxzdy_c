import NotificationKey from "../../../event/NotificationKey";
import { MapManager } from "../../MapManager";
import ResourcePoint from "../point/ResourcePoint";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleManager } from "../../../comm/battle/BattleManager";
import BaseResourceInstance from "./BaseResourceInstance";
import { BattleModel } from "../../../modules/battle/model/BattleModel";
import BattleSetting from "../../../comm/battle/config/BattleSetting";
import { IMapObject } from "../../IMapObject";

/**守卫母舰地图资源 */
export default class GuardShipResourceInstance extends BaseResourceInstance {
    private _battleConfigId: number;
    /**资源点Id 转 怪物表数组 */
    private _resoucreToMonsterIdsMap: { [resourceId: number]: number[] } = [];

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {
       
    }

    /**玩法地图资源点 */
    protected initResourcesInMap() {
        return [];
    }

    /**首次刷新 */
    protected initRescourcePoints(resourceIds: number[]) {
        
    }
}