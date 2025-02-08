import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { HeroManager } from "../../hero/HeroManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * x 个英雄星星 >= y 
 */
export class ConditionHeroStarGte extends ICondition {

    private _starCount: number = 0;
    private _count: number = 0;

    public listenNotifications: string[] = [NotificationKey.HERO_UP_STAR];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVE_ASSIGN_STAR_HERO_COUNT_GE;
    }

    param(): string {
        return this._starCount + ''
    }

    value(): number {
        return this._count
    }


    initParams(params: string, targetCount: number): void {
        this._starCount = params.toInt();
        this._count = targetCount;
    }

    check(): boolean {
        return HeroManager.ins().getHeroNumByStar(this._starCount) >= this._count;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [this._count, this._starCount];
    }

}