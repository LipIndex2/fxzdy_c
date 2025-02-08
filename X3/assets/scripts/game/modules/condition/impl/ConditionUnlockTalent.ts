import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 天赋解锁
 */
export class ConditionUnlockTalent extends ICondition {

    private _needCount: number = 0;
    private _type: ServerEnums.TalentType;

    public listenNotifications: string[] = [NotificationKey.TALENT_CHANGE];


    type(): EnumConditionType {
        return EnumConditionType.ACTIVE_TALENT_AMT_GE;
    }

    param(): string {
        return ServerEnums.TalentType[this._type]
    }

    value(): number {
        return this._needCount;
    }

    initParams(params: string, targetCount: number): void {
        this._type = ServerEnums.TalentType[params] || ServerEnums.TalentType.NORMAL;
        this._needCount = targetCount;
    }

    check(): boolean {
        // 共鸣等级
        const context = TalentModel.ins().context;
        const lvUpCount = context.getLvUpTalentCountByType(this._type);
        return lvUpCount >= this._needCount;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [
            this._needCount
        ];
    }

}