import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";

export class RankInfoUtils {


    static isHaveLogo(_rankType: ServerEnums.RankingType) {
        if (_rankType === ServerEnums.RankingType.ARENA) {
            return true;
        }
        return false;
    }

    // rank logo
    static getLogoByRankTypeAndValue(rankType: ServerEnums.RankingType, rankValue: number) {
        if (rankType === ServerEnums.RankingType.ARENA) {
            const configByScore = PVPUtils.getConfigByScore(rankValue);
            return configByScore?.logoSmallAssetPath || "";
        }
        return "";
    }
}