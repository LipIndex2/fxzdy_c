import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 主线
 */
export class ConditionUnderTrunkInstance extends ICondition {

    private _levelId: number = 0;

    public listenNotifications: string[] = [NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE];

    type(): EnumConditionType {
        return EnumConditionType.UNDER_TRUNK_INSTANCE;
    }

    param(): string {
        return this._levelId + ''
    }

    value(): number {
        return this._levelId
    }

    initParams(params: string, targetCount: number): void {
        this._levelId = params.toInt();
    }

    check(): boolean {
        // 通过?
        return !HangUpModel.ins().isPass(this._levelId);
    }

    getErrorTipsArgs(): (string | number)[] {
        const showName = HangUpUtils.getHangUpConfigByLevelId(this._levelId)?.title || "";
        return [
            showName
        ];
    }

}