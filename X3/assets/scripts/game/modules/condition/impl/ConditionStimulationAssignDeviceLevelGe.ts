import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import GIns from "../../../GIns";

/**
 * 经营设备解锁等级
 */
export class ConditionStimulationAssignDeviceLevelGe extends ICondition {

    private _deviceId: number = 0;
    private _level: number = 0;

    type(): EnumConditionType {
        return EnumConditionType.STIMULATION_ASSIGN_DEVICE_LEVEL_GE;
    }

    param(): string {
        return this._deviceId + ''
    }

    value(): number {
        return this._level
    }

    initParams(params: string, targetCount: number): void {
        this._deviceId = params.toInt();
        this._level = targetCount
    }

    check(): boolean {
        let deviceData = GIns.stimulationModel.getDeviceData(this._deviceId);
        return deviceData.vo != null && deviceData.vo.level >= this._level;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [this._level];
    }

}