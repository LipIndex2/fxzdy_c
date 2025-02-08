import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { MathUtils } from "db://assets/scripts/core/utils/MathUtils";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";


@bindFguiExtension("ui://gvg/GVGMyRankNumComp")
export class GVGMyRankNumComp extends FGUI.GComponent {
    private _vo: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo;


    private get view(): ui.gvg.components.GVGMyRankNumComp {
        return this as any;
    }


    protected onConstruct(): void {
    }


    resetMe(rankNum: number) {
        const context = GVGModel.ins().context;

        let topN = 0;
        if (MathUtils.isInRange(rankNum, 1, 3)) {
            topN = rankNum;
        }
        this.view.getController("topN").selectedIndex = topN;
        if (topN == 0) {
            this.view.labelRankNum.text = `未上榜`;
        } else {
            this.view.labelRankNum.text = `${topN}`;
        }

        const playerName = PlayerModel.ins().playerName;
        const gainStarCount = context.getMyGainStarCount() || 0;
        const haveChallengeCount = context.getHaveChallengeCount() || 0;
        const titleId = SettingsModel.ins().context.getTitleId();

        this.view.labelPlayerName.text = playerName;
        this.view.labelHaveChallengeCount.text = `${haveChallengeCount}次`;
        this.view.labelStarCount.text = gainStarCount?.toString();
        FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp).resetByTitleId(titleId);
        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar)
            .resetMe();
    }

    reset(rankNum: number,
          vo: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo
    ) {
        if (!vo) {
            return;
        }
        this._vo = vo;


        const haveChallengeCount = vo.challengeCount;
        const playerName = vo.name;
        const titleId = vo.title;
        const gainStarCount = vo.score;


        let topN = 0;
        if (MathUtils.isInRange(rankNum, 1, 3)) {
            topN = rankNum;
        }
        this.view.getController("topN").selectedIndex = topN;
        if (rankNum <= 0) {
            this.view.labelRankNum.text = `未上榜`;
        } else {
            this.view.labelRankNum.text = `${rankNum}`;

        }


        this.view.labelPlayerName.text = playerName;
        this.view.labelHaveChallengeCount.text = `${haveChallengeCount}次`;
        this.view.labelStarCount.text = gainStarCount?.toString();
        FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp).resetByTitleId(titleId);
        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar)
            .reset(
                vo.playerId,
                vo.headIcon,
                vo.headFrame,
                0,
            );
    }
}