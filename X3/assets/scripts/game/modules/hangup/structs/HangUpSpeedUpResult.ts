import {NoOwnerItem} from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";

export class HangUpSpeedUpResult {
    // 是否可以加速
    canSpeedUp: boolean;
    // 是否达到最大次数
    isMaxTimesFlag: boolean;
    // 加速所需时间（单位：毫秒）
    speedUpTimeMs: number;
    // 加速所需的道具
    costItem: NoOwnerItem;
    // 是否免费
    freeFlag: boolean;
    // 错误原因
    errorReason: string;

    static create(canSpeedUp: boolean,
                  isMaxTimesFlag: boolean,
                  speedUpTimeMs: number,
                  costItem: NoOwnerItem,
                  errorReason: string = ""
    ): HangUpSpeedUpResult {
        const result = new HangUpSpeedUpResult();
        result.canSpeedUp = canSpeedUp;
        result.isMaxTimesFlag = isMaxTimesFlag;
        result.speedUpTimeMs = speedUpTimeMs;
        result.costItem = costItem;
        result.freeFlag = !(costItem != null);
        result.errorReason = errorReason;
        return result;
    }

    static fail() {
        return HangUpSpeedUpResult.create(false, true,0, null, "配置不存在");
    }
}