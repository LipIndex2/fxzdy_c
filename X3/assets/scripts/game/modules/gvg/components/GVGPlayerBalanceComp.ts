import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { GVGUtils } from "db://assets/scripts/game/modules/gvg/utils/GVGUtils";


@bindFguiExtension("ui://gvg/GVGPlayerBalanceComp")
export class GVGPlayerBalanceComp extends FGUI.GComponent {


    private get view(): ui.gvg.components.GVGPlayerBalanceComp {
        return this as any;
    }


    protected onConstruct(): void {
    }

    resetMe() {
        const context = GVGModel.ins().context;

        const hp = context.getHp()

        this.view.bar.value = GVGUtils.calcHpPercent(hp);
        this.view.bar.max = 10000;

        this.view.labelChangeHp.visible = false;
    }


    resetHp(curHp: number, changeHp: number) {

        const hpCount = GVGUtils.calcHpCount(curHp);
        const hpPercent = GVGUtils.calcHpPercent(curHp);

        if (changeHp > 0 && hpPercent % 10000 == 0) {
            this.view.bar.value = 0;
        } else {
            this.view.bar.value = hpPercent;
        }
        this.view.bar.max = 10000;

        this.view.labelChangeHp.visible = changeHp != 0;
        if (changeHp != 0) {
            const changeHpp = Math.floor(changeHp / 100);
            this.view.labelChangeHp.text = "-" + changeHpp + "%";
        }

    }
}