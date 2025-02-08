import { FightManager } from "db://assets/scripts/game/modules/fight/FightManager";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import { RankUtils } from "db://assets/scripts/game/modules/rank/utils/RankUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { StringUtils } from "../../../../core/utils/StringUtils";

export class RankValueForMeUtils {

    // 积分值
    static getRankValue(rankType: ServerEnums.RankingType,
        resp: EventRankDataResp
    ): number {
        let rankValue: number = 0;
        switch (rankType) {
            case ServerEnums.RankingType.PLAYER_FIGHT:
                rankValue = FightManager.ins().getFightByDefault();
                break

            case ServerEnums.RankingType.DAILY_BOSS:
                // 每日boss
                rankValue = resp.dailyBossHurtValue;
                break

            case ServerEnums.RankingType.LADDER:
                // 每日boss
                rankValue = GodSequenceModel.ins().context.getLayerNumByType(resp.subType);
                break

            case ServerEnums.RankingType.TRUNK_INSTANCE:
                rankValue = HangUpModel.ins().getCurrentLevelConfig()?.showLevelId || 0;
                break;
            case ServerEnums.RankingType.ARENA:
                rankValue = PVPModel.ins().getContext().score || 0;
                break;
            default:
                rankValue = resp.myRankValue || 0;
                break;

        }
        return rankValue;
    }

    // 排行榜值文本
    static getRankValueText(
        rankType: ServerEnums.RankingType,
        rankDataResp: EventRankDataResp
    ): string {
        const rankPrefixTips = RankUtils.getRankPrefixTipsByType(rankType);
        const rankSuffix = RankUtils.getRankSuffix(rankType);

        let rankValue: number = this.getRankValue(rankType, rankDataResp);
        if (RankUtils.isFightRankType(rankType)) {
            return rankPrefixTips + StringUtils.getFightStr(rankValue) + rankSuffix;
        }
        return rankPrefixTips + rankValue + rankSuffix;
    }
}