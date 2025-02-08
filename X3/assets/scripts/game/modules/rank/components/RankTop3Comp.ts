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
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "db://assets/scripts/game/modules/player/structs/PlayerInfoMainViewOpenArgs";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { PlayerTitleSmallComp } from "db://assets/scripts/game/modules/common/playerInfo/PlayerTitleSmallComp";
import GIns from "../../../GIns";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { LeagueFlagComp } from "../../league/comp/LeagueFlagComp";
import { LeagueCenterViewOpenArgs } from "../../league/structs/LeagueCenterViewOpenArgs";
import { UILeagueKey } from "../../league/const/UILeagueConst";


export class RankTop3Comp extends fgui.GComponent {
    private _rankType: ServerEnums.RankingType;
    // 玩家id
    private _playerId: number = 0;

    protected _leagueId:number = 0;

    private get view(): ui.comm.rank.RankTop3Comp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.modelNode.touchable = false;
        this.view.onClick(this.onClickPlayer, this);

    }

    onClickPlayer() {
        if (this._rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            if (this._leagueId > 0 && this._leagueId != GIns.LeagueModel.getLeagueId()) {
                UIManager.ins().open(UILeagueKey.LeagueCenterView, LeagueCenterViewOpenArgs.createForReq(this._leagueId));
            }
            return;
        }
        // 机器人
        if (this._playerId <= 0) {
            return;
        }
        if (this._playerId == GIns.playerModel.playerId) {
            return
        }
        UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(
            this._playerId
        ));
    }

    protected isLeagueRank():boolean {
        return this._rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE;
    }

    reset(rankType: ServerEnums.RankingType,
          rankNum: number,
          rankCommonData: RankCommonData
    ) {
        this._rankType = rankType;
        this._playerId = rankCommonData?.baseVo?.id || 0;

        let isNotHaveRank = rankCommonData == null;
        if (rankType != ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            if (rankCommonData?.baseVo == null) {
                isNotHaveRank = true;
            }
        }
        this.view.modelNode.visible = this.isLeagueRank() == false;
        this.view.leagueFlag.visible = this.isLeagueRank() == true;
        // 虚位以待
        if (isNotHaveRank) {
            // 没有这个排名
            this.view.getController("havePersonFlag").selectedIndex = 0;
            return;
        }
        this.view.getController("havePersonFlag").selectedIndex = 1;


        this.view.getController("top3").selectedIndex = rankNum;

        const playerBaseVo = rankCommonData.baseVo;
        if (rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            FguiScriptUtils.toMyScriptClass(this.view.leagueFlag, LeagueFlagComp)
                .change(rankCommonData.iconFlag, rankCommonData.banner);
            // text
            this.view.labelPlayerName.text = rankCommonData.leagueName;
            this._leagueId = rankCommonData.leagueId;
        } else {
            if (playerBaseVo) {
                const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo)
    
                const modelNode = FguiScriptUtils.toMyScriptClass(this.view.modelNode, ModelNode);
                modelNode.setScale(2, 2);
                modelNode.loadByModelId(modelId);
    
                // text
                this.view.labelPlayerName.text = playerBaseVo.name;
    
                // title
                FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp)
                    .resetByTitleId(playerBaseVo.title);
            }
        }
        

        // rank value
        let rankValue = 0;
        if (rankCommonData) {
            rankValue = rankCommonData.rankValue;
        }

        // 排行榜文本内容
        const rankValueText = RankUtils.getRankShowTextByRankType(this._rankType, rankCommonData);

        // top3 积分
        let scoreType = EnumRankScoreType.COMMON;
        if (this._rankType == ServerEnums.RankingType.ARENA) {
            // 竞技场
            scoreType = EnumRankScoreType.PVP;
            const rankScoreComp = FguiScriptUtils.toMyScriptClass(this.view.pvpScoreComp, CommonPVPRankSmallLogoComp);
            rankScoreComp.reset(rankNum, rankCommonData.pvpRankConfigId);
            this.view.labelPVPScore.text = rankValueText;
        } else if (this._rankType == ServerEnums.RankingType.LADDER) {
            // 神之序列
            scoreType = EnumRankScoreType.GOD_SEQUENCE;

            this.view.labelGodLayerNum.text = rankValueText;

        } else if (this._rankType == ServerEnums.RankingType.DAILY_BOSS) {
            // 每日boss
            scoreType = EnumRankScoreType.RANK_VALUE_WITH_LOGO;
            const comp = FguiScriptUtils.toMyScriptClass(this.view.rankValueWithLogoComp, RankValueWithLogoComp);
            // 难度logo
            const difficulty = rankCommonData.dailyBossDifficulty || 1;
            comp.resetByDailyBoss(rankValueText, difficulty);
        } else if (this._rankType == ServerEnums.RankingType.GUARD_SHIP) {
            // 守卫母舰
            scoreType = EnumRankScoreType.GUARD_SHIP;
            this.view.lbGuardShip.text = rankValueText;
        } else if(this._rankType == ServerEnums.RankingType.TEAM_INSTANCE){
            //组队副本
            scoreType = EnumRankScoreType.TEAM_CHALLENGE;
            let str;
            if(!rankCommonData.rankValue){
                str = '无进度';
            }else{
                let info =  TeamChallengeModel.ins().getFloorInfo(rankCommonData.rankValue);
                let cfg = TeamChallengeConfigManager.getChapterCfg(rankCommonData.rankValue);
                str = cfg.chapterName+`第${info?.cur}关`;
            }

            this.view.lbTeam.text = str;
        } else if(this._rankType == ServerEnums.RankingType.SECRET_INSTANCE) {
            scoreType = EnumRankScoreType.SECRET_INSTANCE;
            this.view.lblSIFloor.text = RankUtils.getRankShowTextByRankType(rankType, rankCommonData);
            this.view.lblSITime.text = TimeUtils.formatTimeMsToDayHourMinuteSecond(rankCommonData.addition * 1000);
        }  else if(this._rankType == ServerEnums.RankingType.COLLECTIBLES_DUNGEON) {
            scoreType = EnumRankScoreType.COLLECTIBLES_DUNGEON;
            this.view.lbCDStar.text = RankUtils.getRankShowTextByRankType(rankType, rankCommonData);
        } else {
            // 纯文本
            this.view.labelRankValue.text = rankValueText;
        }
        this.view.getController("scoreType").selectedIndex = scoreType;
    }

    resetNoBody() {
        this.view.getController("havePersonFlag").selectedIndex = 0;
    }
}