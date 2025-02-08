import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";

/**
 * 联盟等级 + 是否参与联盟
 * LEAGUE_LEVEL_GE,0,${lv}
 */
export class ConditionIsLeagueJoin extends ICondition {

    protected _param:string = ''
    private _lvForLeague: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.LEAGUE_LEVEL_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._lvForLeague
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._lvForLeague = targetCount;
    }

    check(): boolean {
        const myLeagueLv = LeagueModel.ins().getLevel();
        return myLeagueLv >= this._lvForLeague;
    }


    getErrorTipsArgs(): (string | number)[] {
        return [this._lvForLeague];
    }

}