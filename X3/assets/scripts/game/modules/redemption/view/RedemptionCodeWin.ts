import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GiftModel } from "db://assets/scripts/game/modules/gift/GiftModel";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { RedemptionUIKeys } from "db://assets/scripts/game/modules/redemption/RedemptionUIKeys";

/**
 * 兑换码
 */
@bindScript(RedemptionUIKeys.RedemptionCodeWin)
export class RedemptionCodeWin extends UICommWin {
    
    static pkgName: string = "redemptionCode";
    static viewName: string = "RedemptionCodeWin";

    get view(): ui.redemptionCode.RedemptionCodeWin {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();

        this.view.btnOk.onClick(() => {

            const content = (this.view.inputCode.text || "").trim();
            GiftModel.ins().sendDraw({
                code: content
            });

            this.view.inputCode.text = "";
        }, this);
    }

    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.view.inputCode.text = "";
    }
}