import { TableManager } from "../../../../core/table/TableManager";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { EnumConditionType } from "../enum/EnumConditionType";
import { ICondition } from "../ICondition";

/**
 * 是否有组队队伍
 */
export class ConditionTeamInstance extends ICondition {

    type(): EnumConditionType {
        return EnumConditionType.TEAM_INSTANCE_IN;
    }

    param(): string {
        return ''
    }

    value(): number {
        return 0
    }

    initParams(params: string, targetCount: number): void {

    }

    check(): boolean {
        return TeamChallengeModel.ins().inTeam();
    }


    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}