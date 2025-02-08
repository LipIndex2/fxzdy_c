import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import G from "../../../../core/comm/G";
import { UILeagueKey } from "../const/UILeagueConst";


@bindFguiExtension("ui://league/leagueGameBtn")
export class LeagueGameBtn extends FGUI.GButton {

    private get view(): ui.league.leagueMain.btn.leagueGameBtn {
        return this as any;
    }

    protected onInit() {
        this.view.getController("lock").selectedIndex = 0;
        this.view.labelTips.visible = false;
        RedDotUtils.castComp(this.view.redDot)
            .listenRedDotByPathArray([
                RedDotKeys.gvg,
                RedDotKeys.LeagueExplore
            ]);

        this.view.onClick(this.openUIForGVG, this);
    }


    protected onPreDispose() {

    }

    openUIForGVG() {
        G.UIManager.open(UILeagueKey.LeagueGameModeWin);
        // GVGManager.ins().tryOpenGVG();
    }
}