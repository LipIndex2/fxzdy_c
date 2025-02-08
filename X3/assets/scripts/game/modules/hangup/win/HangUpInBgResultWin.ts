import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";


/**
 * 托管, 确认退出
 */
@bindScript(HangUpUIKeys.HangUpInBgResultWin)
export class HangUpInBgResultWin extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpInBgResultWin";


    private get view(): ui.hangUp.win.HangUpInBgResultWin {
        return this._view as any;
    }


    protected onInit() {
        super.onInit();

        this.view.btnOk.onClick(this.onClickOk, this);
    }


    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.reset();

    }


    protected onPreDispose() {

        const context = HangUpModel.ins().context;


        context.clearInBgCache();

        super.onPreDispose();
    }

    onClickOk() {


        const model = HangUpModel.ins();

        model.sendCloseHangUp();
        // 进入没挂机
        model.context.getInBgCache().setState(ServerEnums.HangUpState.NO_HANG_UP);
        model.context.setInBg(false);
        
        this.closeSelf();
    }

    private reset() {
        const context = HangUpModel.ins().context;

        const bgCache = context.getInBgCache();

        const addCount = bgCache.passCount;
        const startLevelName = HangUpConfigManager.getHangUpConfigByLevelId(bgCache.startLevelId)?.showLevelId || 0;
        const endLevelName = HangUpConfigManager.getHangUpConfigByLevelId(bgCache.endLevelId)?.showLevelId || 0;

        this.view.label1.text = `本次托管成功通过 [color=#ffcc41]${addCount}[/color] 关`;
        this.view.label2.text = `关卡进度  [color=#41d672]${startLevelName} >> ${endLevelName}[/color]`;
        
        
    }
}