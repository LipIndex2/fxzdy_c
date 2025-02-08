import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GodSequenceOneGridComp } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceOneGridComp";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class GodSequenceLeftRightComp extends FGUI.GComponent {

    private _config1: table.ladder.LadderConfig;
    private _config2: table.ladder.LadderConfig;


    private get view(): ui.godSequence.components.GodSequenceLeftRightComp {
        return this as any;
    }


    protected onConstruct(): void {
    }


    reset(configL: table.ladder.LadderConfig,
          configR: table.ladder.LadderConfig
    ) {


        this._config1 = configL;
        this._config2 = configR;


        let type = 0;
        this.view.left.visible = configL != null;
        if (configL) {
            let compL = FguiScriptUtils.toMyScriptClass(this.view.left, GodSequenceOneGridComp);
            compL.reset(configL, true);

            type = ServerEnums.Career[configL.type];
        }


        this.view.right.visible = configR != null;
        if (configR) {
            let compR = FguiScriptUtils.toMyScriptClass(this.view.right, GodSequenceOneGridComp);
            compR.reset(configR, false);
        }


        let typeConfig = GodSequenceConfigManager.getTypeConfigByType(type);
        if (typeConfig == null) {
            return;
        }


        // 进度条
        this.view.barProgress.bg.icon = typeConfig.bg;
        this.view.barProgress.bar.icon = typeConfig.fg;

        let context = GodSequenceModel.ins().context;

        let isPass1 = context.isPass(configL);
        let isPass2 = context.isPass(configR);

        // pass %
        let p = 0;
        if (isPass1) {
            p += 50;
        }
        if (isPass2) {
            p += 50;
        }
        this.view.barProgress.value = p;
    }
}