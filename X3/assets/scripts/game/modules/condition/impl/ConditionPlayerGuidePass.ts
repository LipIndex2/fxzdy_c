import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { GuideModel } from "../../guide/model/GuideModel";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 新手引导条件
 */
export class ConditionPlayerGuidePass extends ICondition {

    private _guideId: number = 0;

    public listenNotifications: string[] = [
            NotificationKey.GUIDE_NEXT,
            NotificationKey.GUIDE_END
        ];

    type(): EnumConditionType {
        return EnumConditionType.FINISH_ASSIGN_GUIDE;
    }

    param(): string {
        return this._guideId + ''
    }

    value(): number {
        return this._guideId
    }


    initParams(params: string, targetCount: number): void {
        this._guideId = params.toInt();
    }

    check(): boolean {
        return GuideModel.ins().isCompleted(this._guideId);
    }

    getErrorTips(): string {
        return "未完成新手引导!";
    }

    getErrorTipsArgs(): (string | number)[] {
        return [

        ];
    }

}