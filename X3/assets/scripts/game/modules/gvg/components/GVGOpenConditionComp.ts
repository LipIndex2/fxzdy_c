import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { EnumGVGConditionType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGConditionType";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import GIns from "db://assets/scripts/game/GIns";

@bindFguiExtension("ui://gvg/GVGOpenConditionComp")
export class GVGOpenConditionComp extends FGUI.GComponent {


    private get view(): ui.gvg.components.GVGOpenConditionComp {
        return this as any;
    }


    reset(type: EnumGVGConditionType): boolean {
        // 是否开启
        let isOpen = false;

        // 条件 1
        if (type == EnumGVGConditionType.C_1) {

            const needHaveLeaguePersonCount = GVGConfigManager.needHaveLeaguePersonCount;

            isOpen = GIns.LeagueManager.getLeagueHavePersonCount() >= needHaveLeaguePersonCount;
            this.view.labelContent.text = `联盟人数达到 ${needHaveLeaguePersonCount} 人`;
        }
        // 条件 2
        if (type == EnumGVGConditionType.C_2) {
            const needHaveLeaguePersonCount = GVGConfigManager.needLeagueActiveValue;
            const activeValue = GIns.LeagueManager.getActiveValue();
            isOpen = activeValue >= needHaveLeaguePersonCount;

            const colorStr = isOpen ? "#00FF00" : "#FF0000"
            this.view.labelContent.text = `联盟活跃度 ( [color=${colorStr}]${activeValue}[/color]/${needHaveLeaguePersonCount} ) `;
        }

        this.view.getController("isOpen").selectedIndex = isOpen ? 1 : 0;

        return isOpen;
    }
}