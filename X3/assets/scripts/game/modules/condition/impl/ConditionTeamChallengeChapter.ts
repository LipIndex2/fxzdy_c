import { TableManager } from "../../../../core/table/TableManager";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { EnumConditionType } from "../enum/EnumConditionType";
import { ICondition } from "../ICondition";

/**
 * 通关对应章节
 */
export class ConditionTeamChallengeChapter extends ICondition {

    private _ChpterId: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.TEAM_INSTANCE_IN;
    }

    param(): string {
        return this._ChpterId +''
    }

    value(): number {
        return this._ChpterId
    }

    initParams(params: string, targetCount: number): void {
        this._ChpterId = +params
    }

    check(): boolean {
        const cfg = TeamChallengeConfigManager.getCurChapterCfg();
        if(!cfg){
            return true;
        }
        return this._ChpterId <= cfg.id;
    }


    getErrorTipsArgs(): (string | number)[] {
        const cfg = TableManager.getDataById(table.teaminstance.TeamInstanceChapterConfig, this._ChpterId)
        return [
            cfg.chapterName,
        ];
    }

}