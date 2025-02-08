import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { RankValueForMeUtils } from "db://assets/scripts/game/modules/rank/utils/RankValueForMeUtils";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { EnumRankScoreType } from "db://assets/scripts/game/modules/rank/enums/EnumRankScoreType";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import {
    CommonPVPRankSmallLogoComp
} from "db://assets/scripts/game/modules/common/pvp/components/CommonPVPRankSmallLogoComp";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { RankValueWithLogoComp } from "db://assets/scripts/game/modules/common/item/RankValueWithLogoComp";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import { PlayerTitleSmallComp } from "db://assets/scripts/game/modules/common/playerInfo/PlayerTitleSmallComp";
import { RankUtils } from "../utils/RankUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import GIns from "../../../GIns";
import { LeagueFlagComp } from "../../league/comp/LeagueFlagComp";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import G from "../../../../core/comm/G";

/**
 * 我的排行榜
 */
export class RankForMeComp extends FGUI.GComponent {

    private get view(): ui.rank.components.RankForMeComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);

    }

    onClick0() {
    }

    reset(rankDataResp: EventRankDataResp) {
        const rankType = rankDataResp.rankType;
        let rankNum = rankDataResp.myRankNum;
        // const rankValue = event.myRankValue;

        // 自己的 rank 用 client 的
        const rankValueText = RankValueForMeUtils.getRankValueText(rankType, rankDataResp);

        this.view.labelPlayerName.text = PlayerModel.ins().Vo.name;
        const isInRank = rankNum > 0;

        this.view.labelRankValue.text = rankValueText;
        // this.view.rankNum.labelRankValue.visible = isInRank;

        if (isInRank) {
            this.view.labelRankNum.text = rankNum.toString();
        } else {
            this.view.labelRankNum.text = "未上榜";
        }

        // 头像
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        avatar.resetMe();
        avatar.touchable = false;

        // title
        const titleId = SettingsModel.ins().context.getTitleId();
        FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp)
            .resetByTitleId(titleId);


        // 不同类型
        if (rankType == ServerEnums.RankingType.ARENA) {
            // JJC
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.PVP;
            const rankScoreComp = FguiScriptUtils.toMyScriptClass(this.view.pvpScoreComp.pvpRankComp, CommonPVPRankSmallLogoComp);
            const myRankConfigId = PVPModel.ins().getMyRankConfigId();
            rankScoreComp.reset(rankNum, myRankConfigId);
            this.view.pvpScoreComp.labelRankValue.text = rankValueText;

        } else if (rankType == ServerEnums.RankingType.DAILY_BOSS) {
            // 每日boss
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.RANK_VALUE_WITH_LOGO;
            const comp = FguiScriptUtils.toMyScriptClass(this.view.rankValueWithLogoComp, RankValueWithLogoComp);

            const difficulty = rankDataResp.dailyBossDifficulty;


            const rankValueByBossType = rankDataResp.myRankValue;
            comp.resetByDailyBoss(rankValueText, difficulty);
        } else if (rankType == ServerEnums.RankingType.LADDER) {
            // 每日boss
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.GOD_SEQUENCE;

            this.view.labelGodLayerNum.text = rankValueText;

        } else if (rankType == ServerEnums.RankingType.GUARD_SHIP) {
            // 守卫母舰
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.GUARD_SHIP;

            this.view.lbGuardShip.text = isInRank ? `难度${rankDataResp.instanceName} 波次${rankDataResp.roundId}` : '';

        } else if (rankType == ServerEnums.RankingType.TEAM_INSTANCE) {
            // 组队副本
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.TEAM_CHALLENGE;

            let str;
            if (!rankDataResp.myRankValue) {
                str = '无进度';
            } else {
                let info = TeamChallengeModel.ins().getFloorInfo(rankDataResp.myRankValue);
                let cfg = TeamChallengeConfigManager.getChapterCfg(rankDataResp.myRankValue);
                str = cfg.chapterName + `第${info?.cur}关`;
            }

            this.view.lbTeam.text = str;
        } else if (rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            // 勘探
            let vo = GIns.LeagueManager.mLeagueVo;
            if (GIns.LeagueManager.mPlayerLeagueLoginVo && GIns.LeagueManager.mPlayerLeagueLoginVo.leagueId && vo) {
                FguiScriptUtils.toMyScriptClass(this.view.leagueFlag, LeagueFlagComp)
                    .change(vo.icon, vo.banner);
                this.view.labelPlayerName.text = vo.name;
            }
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.LEAGUE_EXPLORE;
            this.view.pvpScoreComp.labelRankValue.text = rankValueText;
        } else if (rankType == ServerEnums.RankingType.SECRET_INSTANCE) {
            //秘境副本
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.SECRET_INSTANCE;
            this.view.lblSIFloor.text = isInRank? rankValueText : "";
            this.view.lblSITime.text = isInRank? TimeUtils.formatTimeMsToDayHourMinuteSecond(rankDataResp.addition * 1000) : "";
        }  else if (rankType == ServerEnums.RankingType.PET_DUNGEON) {
            //宠物副本
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.PET_DUNGEON;
            let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, rankDataResp.myRankValue);
            this.view.labelRankValue.text = cfg ? cfg.name : '';
        }  else if (rankType == ServerEnums.RankingType.COLLECTIBLES_DUNGEON) {
            //收藏品副本
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.COLLECTIBLES_DUNGEON;
            this.view.lbCDStar.text = rankValueText;
        } else {
            // 纯文本
            this.view.getController("scoreType").selectedIndex = EnumRankScoreType.COMMON;
            this.view.pvpScoreComp.labelRankValue.text = rankValueText;
        }
    }
}