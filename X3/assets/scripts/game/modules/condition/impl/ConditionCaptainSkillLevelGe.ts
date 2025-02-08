import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import { CaptainSkillUtils } from "../../captainSkill/utils/CaptainSkillUtils";

/**
 * 战队科技等级
 * CAPTAIN_SKILL_LEVEL_GE,${活动id},0
 */
export class ConditionCaptainSkillLevelGe extends ICondition {

    protected _captainId: number = 0;
    private _level: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.CAPTAIN_SKILL_LV_UPDATE,
    ];

    type(): EnumConditionType {
        return EnumConditionType.CAPTAIN_SKILL_LEVEL_GE;
    }

    param(): string {
        return this._captainId.toString();
    }

    value(): number {
        return this._level
    }


    initParams(params: string, targetCount: number): void {
        this._captainId = params.toInt();
        this._level = targetCount;
    }

    check(): boolean {
        if (this._captainId > 0) {
            //检测单个
            let lv = GIns.captainSkillModel.context.getLvBySkillId(this._captainId);
            return lv >= this._level;
        } else {
            //检测所有
            let result: boolean = false;
            let skillCfgs = CaptainSkillUtils.getCaptainSkillConfigArray() || [];
            for (let i = 0; i < skillCfgs?.length; i++) {
                let lv = GIns.captainSkillModel.context.getLvBySkillId(skillCfgs[i].id);
                if (lv >= this._level) {
                    result = true;
                    break;
                }
            }
            return result;
        }
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}