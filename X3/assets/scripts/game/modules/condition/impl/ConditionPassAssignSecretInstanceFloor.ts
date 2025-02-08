import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { SecretAreaManager } from "../../secretArea/SecretAreaManager";
import { SecretAreaConfigManager } from "../../secretArea/config/SecretAreaConfigManager";

/**
 * 秘境通关层数==target
 */
export class ConditionPassAssignSecretInstanceFloor extends ICondition {

    private _floorId: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.PASS_ASSIGN_SECRET_INSTANCE_FLOOR;
    }

    param(): string {
        return this._floorId + ''
    }

    value(): number {
        return this._floorId
    }

    initParams(params: string, targetCount: number): void {
        this._floorId = targetCount;
    }

    check(): boolean {
        return SecretAreaManager.ins().level == this._floorId;
    }

    getErrorTipsArgs(): (string | number)[] {
        let cfg = SecretAreaConfigManager.getConfigByLevel(this._floorId)
        let showName: string = cfg ? cfg.name : ''
        return [showName];
    }

}