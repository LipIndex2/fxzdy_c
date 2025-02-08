import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { MapModel } from "db://assets/scripts/game/tiledMap/model/MapModule";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

// 是否到过某个星球
export class ConditionHaveSeeMap extends ICondition {

    private _mapId: number = 0;

    public listenNotifications: string[] = [NotificationKey.SEE_NEW_MAP];
    
    type(): EnumConditionType {
        return EnumConditionType.EXPLORE_MAP;
    }

    param(): string {
        return this._mapId + ''
    }

    value(): number {
        return this._mapId
    }

    initParams(params: string, targetCount: number): void {
        this._mapId = params.toInt();
    }

    check(): boolean {
        return MapModel.ins().isHaveSeeMap(this._mapId)
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }
}