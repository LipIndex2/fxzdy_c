import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";

/**
 * JJC 段位 >=
 */
export class ConditionArenaRankGte extends ICondition {

    protected _param:string = ''
    private _rankId: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.ARENA_MAX_RANK_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._rankId
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._rankId = targetCount;
    }

    check(): boolean {
        // 段位
        const rankId = PVPModel.ins().getContext().getCurrentRankConfigId();
        return rankId >= this._rankId;
    }


    getErrorTipsArgs(): (string | number)[] {
        const rankName = PVPModel.ins().getContext().getCurrentRankConfig()?.name || "";
        return [
            rankName
        ];
    }

}