import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { TalentModel } from "../../talent/model/TalentModel";
import { EnumConditionType } from "../enum/EnumConditionType";
import { ICondition } from "../ICondition";

/**
 * 激活对应天赋
 */
export class ConditionTalentActivity extends ICondition {

    private _talentId: number = 0;

    public listenNotifications: string[] = [NotificationKey.TALENT_CHANGE];
    
    type(): EnumConditionType {
        return EnumConditionType.ACTIVE_ASSIGN_TALENT;
    }

    param(): string {
        return this._talentId + ''
    }

    value(): number {
        return this._talentId
    }

    initParams(params: string, targetCount: number): void {
        this._talentId = +params
    }

    check(): boolean {
        return TalentModel.ins().isHaveLvUpTalent(+this._talentId)
    }


    getErrorTipsArgs(): (string | number)[] {
        const cfg = TableManager.getDataById(table.talent.TalentConfig, this._talentId)
        return [
            cfg.title,
        ];
    }

}