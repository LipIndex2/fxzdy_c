import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { MapModel } from "db://assets/scripts/game/tiledMap/model/MapModule";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 解锁建筑
 */
export class ConditionUnlockBuilding extends ICondition {

    protected _param: string = ''
    private _buildingId: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.MAP_BUILDING_UNLOCK,
    ];

    type(): EnumConditionType {
        return EnumConditionType.UNLOCK_BUILDING;
    }

    param(): string {
        return this._buildingId + ''
    }

    value(): number {
        return this._buildingId
    }

    initParams(params: string, targetCount: number): void {
        this._buildingId = params.toInt();
    }

    check(): boolean {
        // 建筑
        return MapModel.ins().getBuildingUnlockById(this._buildingId);
    }

    getErrorTips(): string {

        return "未解锁建筑";
    }

    getErrorTipsArgs(): (string | number)[] {
        let buildingName: string = G.TableManager.getDataById(table.map.MapBuildingConfig, this._buildingId)?.name || ''
        return [
            buildingName
        ];
    }
}