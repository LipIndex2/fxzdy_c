import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { BattleForDailyBossData } from "db://assets/scripts/game/modules/common/battle/structs/BattleForDailyBossData";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EnumProgressSide } from "db://assets/scripts/game/modules/common/enum/EnumProgressSide";

/**
 * 每日Boss
 */
export class DailyBossUtils {

    /**
     * 获取剩余时间
     */
    static getRestTimeMs(curTimeMs: number): number {
        // 从表中获取刷新时间配置
        const hour = DailyBossConfigManager.dailyRefreshHour;

        // 获取当前时间的日期对象
        const currentDate = new Date(curTimeMs);
        const currentHour = currentDate.getHours();

        // 创建一个日期对象来表示今日的刷新时间
        const refreshDate = new Date(curTimeMs);
        refreshDate.setHours(hour, 0, 0, 0);

        // 如果当前时间已经过了今日的刷新时间，则计算明天的刷新时间
        if (currentHour >= hour) {
            refreshDate.setDate(refreshDate.getDate() + 1);
        }

        // 计算剩余时间
        return refreshDate.getTime() - curTimeMs;
    }

    /**
     * 获取剩余挑战时间文本
     * @param curTimeMs
     */
    static getRestTimeText(curTimeMs: number = TimeManager.serverNow): string {
        const restTime = DailyBossUtils.getRestTimeMs(curTimeMs);
        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTime);
        return `${timeText}后结算`;
    }

    static getMyBattleTempData():BattleForDailyBossData {
        return DailyBossModel.ins().getMyBattleTempData();
    }


}