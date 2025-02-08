import FGUI from "db://assets/scripts/core/fgui/FGUI";
import G from "../../../../core/comm/G";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";

export class RaceLogoComp extends FGUI.GComponent {

    private get view(): ui.comm1.race.RaceLogoComp {
        return this as any
    }

    reset(career: string) {
        this.view.imageLogo.icon = ItemUtils.getCareerIcon(ServerEnums.Career[career]);
    }

}