import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";

/**
 * 每日boss 难度
 */
export class ConditionDailyBossDifficultyGte extends ICondition {

    private _hardId: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.DAILY_BOSS_UNLOCK_DIFFICULTY_GE;
    }

    param(): string {
        return this._hardId + ''
    }

    value(): number {
        return this._hardId
    }

    initParams(params: string, targetCount: number): void {
        this._hardId = params.toInt();
    }

    check(): boolean {
        return DailyBossModel.ins().context.isPassDifficult(this._hardId);
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}