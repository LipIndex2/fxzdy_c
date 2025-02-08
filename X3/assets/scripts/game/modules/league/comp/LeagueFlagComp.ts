import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";

@bindFguiExtension("ui://comm1/LeagueFlagComp")
export class LeagueFlagComp extends FGUI.GComponent {


    get view(): ui.comm1.league.LeagueFlagComp {
        return this as any;
    }

    change(iconId: number, bannerId: number) {
        let iconUrl = LeagueModel.ins().getLeagueIconUrl(iconId);
        let flagUrl = LeagueModel.ins().getLeagueBannerUrl(bannerId);

        this.view.iconLoader.icon = iconUrl;
        this.view.flagLoader.icon = flagUrl;

    }

}