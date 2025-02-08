import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

/**
 * 挂机每小时收益
 */
@bindFguiExtension("ui://hangUp/HangUpPerHourIconComp")
export class HangUpPerHourIconComp extends FGUI.GComponent {


    get view(): ui.hangUp.components.HangUpPerHourIconComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    reset(data: HangUpPerHourData) {
        if (!data) {
            return;
        }
        let config = data.getItemConfig();
        if (!config) {
            return;
        }

        // 挂机收益 text
        this.view.imageItem.icon = config.iconPath;
        const text = data.getShowLevelAddHangUpCountPerHourText();
        this.view.labelTitle.text = text;

        // 宽度问题
        // if (text.length > 12) {
        //     this.view.width = 240;
        // } else {
        //     this.view.width = 180;
        // }
    }
}