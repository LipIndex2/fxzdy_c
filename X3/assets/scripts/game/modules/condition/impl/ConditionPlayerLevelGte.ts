import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 玩家共鸣等级 >= 
 */
export class ConditionPlayerLevelGte extends ICondition {

    protected _param: string = ''
    private _level: number = 0;

    public listenNotifications: string[] = [NotificationKey.HERO_UP_COMMON_LV];
    

    type(): EnumConditionType {
        return EnumConditionType.PLAYER_LEVEL_GE;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._level
    }

    initParams(params: string, targetCount: number): void {
        this._param = params
        this._level = targetCount;
    }

    check(): boolean {
        // 共鸣等级
        return FormationManager.ins().getCommonLevel() >= this._level;
    }

    getErrorTips(): string {
        return `共鸣等级需要达到${this._level}级`;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [
            this._level
        ];
    }

}