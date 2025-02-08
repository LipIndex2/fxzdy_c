import { RankUtils } from "db://assets/scripts/game/modules/rank/utils/RankUtils";
import { EnumRankScoreType } from "db://assets/scripts/game/modules/rank/enums/EnumRankScoreType";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import {
    CommonPVPRankSmallLogoComp
} from "db://assets/scripts/game/modules/common/pvp/components/CommonPVPRankSmallLogoComp";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import * as fgui from "fairygui-cc"
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RankValueWithLogoComp } from "db://assets/scripts/game/modules/common/item/RankValueWithLogoComp";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { LeagueFlagComp } from "../../league/comp/LeagueFlagComp";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import G from "../../../../core/comm/G";
import { UILeagueKey } from "../../league/const/UILeagueConst";
import GIns from "../../../GIns";
import { LeagueCenterViewOpenArgs } from "../../league/structs/LeagueCenterViewOpenArgs";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";


export class RankOneRowComp extends fgui.GComponent {

    protected _leagueId:number = 0;
    private get view(): ui.rank.components.RankOneRowComp {
        return this as any;
    }

    protected onInit():void {
        this.view.leagueFlag.onClick(this.onClickLeagueFlag, this);
    }

    protected onClickLeagueFlag():void {
        if (this._leagueId > 0 && this._leagueId != GIns.LeagueModel.getLeagueId()) {
            G.UIManager.open(UILeagueKey.LeagueCenterView, LeagueCenterViewOpenArgs.createForReq(this._leagueId));
        }
    }

    reset(rankType: ServerEnums.RankingType,
          rankNum: number,
          rankCommonData: RankCommonData | null
    ) {

        // rank num
        this.view.labelRankNum.text = rankNum.toString();

        let isNotExists = rankCommonData == null;
        if (rankType != ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            if (rankCommonData?.baseVo == null) {
                isNotExists = true;
            }
        }
        // is have rank
        this.view.getController("haveFlag").selectedIndex = isNotExists ? 0 : 1;
        if (isNotExists) {
            return;
        }
        
        // rank value
        let rankValue = 0;
        if (rankCommonData) {
            rankValue = rankCommonData.rankValue;
        }

        // player info
        const playerBaseVo = rankCommonData.baseVo;
        if (rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            this.view.labelPlayerName.text = rankCommonData.leagueName;
            FguiScriptUtils.toMyScriptClass(this.view.leagueFlag, LeagueFlagComp)
                    .change(rankCommonData.iconFlag, rankCommonData.banner);
                    this._leagueId = rankCommonData.leagueId;
        } else {
            if (playerBaseVo) {
                this.view.labelPlayerName.text = playerBaseVo.name;
            }
            // 形象
            const avatar = FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
            avatar.resetByPlayerInfo(playerBaseVo);

            // 称号
            FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp).resetByTitleId(playerBaseVo.title);
        }

        const rankValueText = RankUtils.getRankShowTextByRankType(rankType, rankCommonData);
        let scoreType = EnumRankScoreType.COMMON;

        switch (rankType) {
            case ServerEnums.RankingType.ARENA: {
                scoreType = EnumRankScoreType.PVP;

                const pvpRankConfigId = rankCommonData.pvpRankConfigId;
                const rankScoreComp = FguiScriptUtils.toMyScriptClass(this.view.pvpScoreComp.pvpRankComp, CommonPVPRankSmallLogoComp)
                rankScoreComp.reset(rankNum, pvpRankConfigId);
                this.view.pvpScoreComp.labelRankValue.text = rankValueText;

                break;
            }
            case ServerEnums.RankingType.DAILY_BOSS: {
                // 每日boss
                scoreType = EnumRankScoreType.RANK_VALUE_WITH_LOGO;

                FguiScriptUtils.toMyScriptClass(this.view.rankValueWithLogoComp, RankValueWithLogoComp)
                    .resetByDailyBoss(rankValueText, rankCommonData.dailyBossDifficulty);
                break;
            }
            case ServerEnums.RankingType.LADDER: {
                // 神之序列
                scoreType = EnumRankScoreType.GOD_SEQUENCE;

                this.view.labelGodLayerNum.text = rankValueText;
                break;
            }
            case ServerEnums.RankingType.GUARD_SHIP: {
                // 守卫母舰
                scoreType = EnumRankScoreType.GUARD_SHIP;
                this.view.lbGuardShip.text = `难度${rankCommonData.instanceName} 波次${rankCommonData.roundId}`;
                break;
            }
            case ServerEnums.RankingType.TEAM_INSTANCE:{
                // 组队副本
                scoreType = EnumRankScoreType.TEAM_CHALLENGE;
                this.view.lbTeam.text = rankValueText;
                break;
            }
            case ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE: {
                scoreType = EnumRankScoreType.LEAGUE_EXPLORE;
                this.view.labelRankValue.text = rankValueText;
                break;
            }
            case ServerEnums.RankingType.SECRET_INSTANCE: {
                scoreType = EnumRankScoreType.SECRET_INSTANCE;
                this.view.lblSIFloor.text = rankValueText;
                this.view.lblSITime.text = TimeUtils.formatTimeMsToDayHourMinuteSecond(rankCommonData.addition * 1000);
                break;
            }
            case ServerEnums.RankingType.COLLECTIBLES_DUNGEON: {
                scoreType = EnumRankScoreType.COLLECTIBLES_DUNGEON;
                this.view.lbCDStar.text = rankValueText;
                break;
            }
            default: {
                // 纯文本
                this.view.labelRankValue.text = rankValueText;
                break;
            }
        }
        this.view.getController("scoreType").selectedIndex = scoreType;
    }
}