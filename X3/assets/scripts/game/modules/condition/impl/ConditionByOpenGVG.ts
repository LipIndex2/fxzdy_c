import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";

/**
 * 开启 GVG
 */
export class ConditionByOpenGVG extends ICondition {


    type(): EnumConditionType {
        return EnumConditionType.PLAYER_JOIN_LEAGUE_WAR;
    }

    param(): string {
        return '';
    }

    value(): number {
        return 0
    }

    initParams(params: string, targetCount: number): void {
    }

    check(): boolean {
        return GVGModel.ins().context.isJoin();
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}