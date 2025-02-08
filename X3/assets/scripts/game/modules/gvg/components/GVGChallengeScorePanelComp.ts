import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";


@bindFguiExtension("ui://gvg/GVGChallengeScorePanelComp")
export class GVGChallengeScorePanelComp extends FGUI.GComponent {


    private get view(): ui.gvg.components.GVGChallengeScorePanelComp {
        return this as any;
    }


    protected onConstruct(): void {
        this.view.onClick(this.onClick0, this)
    }

    onClick0() {


    }

    reset(layerNum: number) {

        const context = GVGModel.ins().context;
        const oppoLeagueLv = context.getLeagueLv(EnumGVGTeamType.OPPO);
        
        const config = GVGConfigManager.getLayerConfig(oppoLeagueLv, layerNum)
        const winGainStarCount = config?.star || 0;

        const restChallengeCount = context.getRestChallengeCount();
        const maxChallengeTimesPerDay = GVGConfigManager.maxChallengeTimesPerWar;
        const myGainStarCount = context.getLeagueStarCount(EnumGVGTeamType.MY);
        
        this.view.labelChallengeCount.text = `挑战次数：${restChallengeCount}/${maxChallengeTimesPerDay}`;

        // 层数胜利获得的星星
        this.view.labelStarCount.text = `${winGainStarCount}`;
    }
}