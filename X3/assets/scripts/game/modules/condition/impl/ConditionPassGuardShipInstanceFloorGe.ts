import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";

/**
 * 守卫母舰通关层数 >= target
 */
export class ConditionPassGuardShipInstanceFloorGe extends ICondition {

    private _floorId: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.PASS_GUARD_SHIP_INSTANCE_FLOOR_GE;
    }

    param(): string {
        return this._floorId + ''
    }

    value(): number {
        return this._floorId
    }

    initParams(params: string, targetCount: number): void {
        this._floorId = params.toInt();
    }

    check(): boolean {
        return GIns.guardShipModel.curFloor >= this._floorId;
    }

    getErrorTipsArgs(): (string | number)[] {
        let cfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, this._floorId)
        let showName: string = cfg ? cfg.name : ''
        return [showName];
    }

}