import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { StringUtils } from "../../../../core/utils/StringUtils";
import GIns from "../../../GIns";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";

/**
 * 排行榜
 */
export class RankUtils {

    static readonly Top3Num = 3;
    /** 一页排行榜有多少条数据 */
    static readonly SERVER_ONE_PAGE_COUNT = 8;

    /**
     * 排行榜前缀描述文本
     * @param rankType
     */
    static getRankPrefixTipsByType(rankType: ServerEnums.RankingType): string {
        const config = this.getRankTypeConfigByRankType(rankType);
        if (!config) {
            return "";
        }
        return I18nManager.ins().translateOrBlank(config.rankValuePrefixText);
    }

    /**
     * 排行榜后缀
     * @param rankType
     */
    static getRankSuffix(rankType: ServerEnums.RankingType): string {
        const config = this.getRankTypeConfigByRankType(rankType);
        if (!config) {
            return "";
        }
        return I18nManager.ins().translateOrBlank(config.rankSuffixText);
    }

    /**
     * 获取排行榜类型配置
     */
    static getRankTypeConfigs(): table.rank.RankingConfig[] {
        return G.TableManager.getAllData(table.rank.RankingConfig)
    }

    // get 配置 by rankType
    static getRankTypeConfigByRankType(rankType: ServerEnums.RankingType): table.rank.RankingConfig {
        const rankTypeName = ServerEnums.RankingType[rankType];
        return G.TableManager.getDataById(table.rank.RankingConfig, rankTypeName);
    }

    static isFightRankType(rankType: ServerEnums.RankingType): boolean {
        return rankType == ServerEnums.RankingType.PLAYER_FIGHT || rankType == ServerEnums.RankingType.LEAGUE_FIGHT
    }
    // rankValue 显示的文本
    static getRankShowTextByRankType(rankType: ServerEnums.RankingType, rankCommonData: RankCommonData): string {

        const rankValue = rankCommonData.rankValue;

        const rankPrefixTips = RankUtils.getRankPrefixTipsByType(rankType);
        let rankValueText = rankValue?.toString() || "0";
        if (this.isFightRankType(rankType)) {
            rankValueText = StringUtils.getFightStr(rankValue)
        }

        switch (rankType) {
            case ServerEnums.RankingType.TRUNK_INSTANCE: {

                const config = HangUpUtils.getHangUpConfigByLevelId(rankValue);
                if (config) {
                    rankValueText = config.showLevelId.toString();
                }
                break;
            }
            case ServerEnums.RankingType.LADDER: {
                // 神之序列
                rankValueText = rankValue + "层";
                break;
            }
            case ServerEnums.RankingType.DAILY_BOSS: {
                // TODO 数字格式化
                rankValueText = NumberFormatter.formatNumberToString(rankValue);
                break;
            }
            case ServerEnums.RankingType.GUARD_SHIP: {
                //守卫母舰
                rankValueText = `难度${rankCommonData.instanceName} 波次${rankCommonData.roundId}`;
                break;
            }
            case ServerEnums.RankingType.TEAM_INSTANCE: {
                //组队副本
                if (!rankCommonData.rankValue) {
                    rankValueText = '无进度';
                } else {
                    let info = TeamChallengeModel.ins().getFloorInfo(rankCommonData.rankValue);
                    let cfg = TeamChallengeConfigManager.getChapterCfg(rankCommonData.rankValue);
                    rankValueText = cfg.chapterName + `第${info?.cur}关`;
                }

                break;
            }
            case ServerEnums.RankingType.SECRET_INSTANCE: {
                //秘境副本
                rankValueText = rankValue + "层";
                break;
            }
            case ServerEnums.RankingType.PET_DUNGEON: {
                //宠物副本
                let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, rankValue);
                rankValueText = cfg ? cfg.name : '';
                break;
            }

        }

        return rankPrefixTips + rankValueText;
    }
}