import { TableManager } from "../../../../core/table/TableManager";
import { SeasonManager } from "../../season/SeasonManager";
import { ConditionManager } from "../ConditionManager";
import { EnumConditionType } from "../enum/EnumConditionType";
import { ICondition } from "../ICondition";

/**
 * 赛季活动是否开启
 */
export class ConditionSeasonActivity extends ICondition {

    type(): EnumConditionType {
        return EnumConditionType.SEASON_ACTIVITY_OPEN;
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
        const id = SeasonManager.ins().curSeasonActId;
        if(id){
            const cfg = TableManager.getDataById(table.seasonactivity.Constant.SeasonActivityConfig, id);
            if(cfg?.openConditions){
                if (ConditionManager.ins().checkCondition(cfg?.openConditions)) {
                    return true;
                }
            }
        }
        return false;
    }


    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}