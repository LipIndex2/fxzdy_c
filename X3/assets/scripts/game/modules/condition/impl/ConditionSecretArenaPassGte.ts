import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { SecretAreaManager } from "db://assets/scripts/game/modules/secretArea/SecretAreaManager";
import { SecretAreaConfigManager } from "db://assets/scripts/game/modules/secretArea/config/SecretAreaConfigManager";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";

/**
 * 秘境层数
 */
export class ConditionSecretArenaPassGte extends ICondition {

    protected _param:string = ''
    private _id: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.PASS_SECRET_INSTANCE_FLOOR_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._id
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._id = targetCount;
    }

    check(): boolean {
        const level = SecretAreaManager.ins().level;
        return level >= this._id;
    }


    getErrorTipsArgs(): (string | number)[] {
        const name = SecretAreaConfigManager.getConfigByLevel(this._id)?.name || "";
        return [
            name,
        ];
    }

}