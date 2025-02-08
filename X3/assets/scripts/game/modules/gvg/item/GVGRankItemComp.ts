import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { MathUtils } from "db://assets/scripts/core/utils/MathUtils";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";

@bindFguiExtension("ui://gvg/GVGRankItemComp")
export class GVGRankItemComp extends FGUI.GComponent {


    private get view(): ui.gvg.item.GVGRankItemComp {
        return this as any;
    }


    protected onConstruct(): void {
    }


    reset(
        index: number,
        gvgRankData: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo
    ) {

        const haveChallengeCount = gvgRankData.challengeCount;
        const playerName = gvgRankData.name;
        const titleId = gvgRankData.title;
        const headIconId = gvgRankData.headIcon;
        const headFrameId = gvgRankData.headFrame;
        const gainStarCount = gvgRankData.score;

        // 排名
        const rankNum = index + 1;

        let topN = 0;
        if (MathUtils.isInRange(rankNum, 1, 3)) {
            topN = rankNum;
        }

        this.view.getController("topN").selectedIndex = topN;

        this.view.labelRankNum.text = rankNum + '';
        this.view.labelPlayerName.text = playerName;
        // 挑战次数
        this.view.labelHaveChallengeCount.text = `${haveChallengeCount}次`;
        this.view.labelStarCount.text = gainStarCount?.toString();
        FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp).resetByTitleId(titleId);
        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar)
            .reset(
                gvgRankData.playerId,
                headIconId,
                headFrameId,
                0,
            );
    }
}