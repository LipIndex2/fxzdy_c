import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { BattleManager } from "db://assets/scripts/game/comm/battle/BattleManager";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import GIns from "../../../GIns";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";


/**
 * 托管, 确认框
 */
@bindScript(HangUpUIKeys.HangUpInBgConfirmWin)
export class HangUpInBgConfirmWin extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpInBgConfirmWin";


    private get view(): ui.hangUp.win.HangUpInBgConfirmWin {
        return this._view as any;
    }


    protected onInit() {
        super.onInit();

        this.view.btnL.onClick(this.onClickCancel0, this);
        this.view.btnR.onClick(this.onClickOk, this);
    }

    onClickCancel0() {
        this.closeSelf();
    }

    onClickOk() {
        const context = HangUpModel.ins().context;

        context.setInBg(true);

        // // net 发起挑战
        const nextLevelId = HangUpModel.ins().getMyNextLevelId();

        // HangUpModel.ins().sendChallengeTrunkInstance({
        //     instanceId: nextLevelId
        // });
        //

        const config = HangUpConfigManager.getHangUpConfigByLevelId(nextLevelId);
        if (!config) {
            this.closeSelf();
            return; 
        }
        // inBg battle
        GIns.battleMgr.beginHideBattle(config.battleConfigId);

        // tips
        GIns.floatingTextMgr.showTips("挂机托管已开启");

        this.closeSelf();
    }

    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);
    }
}