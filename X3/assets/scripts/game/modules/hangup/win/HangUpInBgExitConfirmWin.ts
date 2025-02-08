import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import GIns from "db://assets/scripts/game/GIns";
import { bindScript } from "../../../../core/comm/UIScriptManager";


/**
 * 托管, 确认退出
 */
@bindScript(HangUpUIKeys.HangUpInBgExitConfirmWin)
export class HangUpInBgExitConfirmWin extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpInBgExitConfirmWin";


    private get view(): ui.hangUp.win.HangUpInBgExitConfirmWin {
        return this._view as any;
    }


    protected onInit() {
        super.onInit();

        this.view.btnL.onClick(this.onClickL, this);
        this.view.btnR.onClick(this.onClickR, this);
    }


    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);


        this.reset();
    }


    protected onPreDispose() {

        super.onPreDispose();
    }

    onClickL() {
        this.closeSelf();
    }

    onClickR() {


        // 停止后台挂机
        GIns.battleMgr.stopHideBattle(FightType.TRUNK_INSTANCE);

        const context = HangUpModel.ins().context;
        context.setInBg(false);

        const inBgCache = context.getInBgCache();

        // 后台结算 UI
        UIManager.ins().open(HangUpUIKeys.HangUpInBgResultWin);

        this.closeSelf();
    }

    private reset() {


        const context = HangUpModel.ins().context;

        const bgCache = context.getInBgCache();

        const endLevelName = HangUpConfigManager.getHangUpConfigByLevelId(bgCache.endLevelId)?.showLevelId || 0;

        this.view.labelContent2.text = `当前挂机关卡进度: [color=#41d672]${endLevelName}[/color]`;
    }
}