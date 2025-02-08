import { tween, Tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { UICommonKey } from "../const/UICommonConfig";

export class CommonBattleBossCommingArgs {
    closeFunc: () => void

    static create(closeFunc: () => void): CommonBattleBossCommingArgs {
        let args = new CommonBattleBossCommingArgs()
        args.closeFunc = closeFunc
        return args
    }
}

/**boss来袭提示页面*/
@bindScript(UICommonKey.CommonBattleBossComming)
export class CommonBattleBossComming extends UIWin {

    static pkgName: string = "commBattle";
    static viewName: string = "CommonBattleBossComming";
    protected _args: CommonBattleBossCommingArgs = null

    private get view(): ui.commBattle.battleView.CommonBattleBossComming {
        return this._view as any;
    }

    protected onInit(): void {

    }

    protected onOpen(args: any): void {
        this._args = args
        let tween1 = tween(this.view.text_boss).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 })
        let tween2 = tween(this.view.boss_bg1).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 })
        let tween3 = tween(this.view.boss_bg2).to(0.2, { scaleX: -0.8, scaleY: 0.8 }).to(0.2, { scaleX: -1.2, scaleY: 1.2 })
        let tween4 = tween(this.view.bg).to(0.2, { alpha: 0.8 }).to(0.2, { alpha: 1.2 })

        tween(this.view.text_boss).repeat(2, tween1).start();
        tween(this.view.boss_bg1).repeat(2, tween2).start();
        tween(this.view.boss_bg2).repeat(2, tween3).start();
        tween(this.view.bg).repeat(2, tween4).start();

        G.GameTimer.once(500, this, () => {
            this.closeSelf()
        })

        this.cancelAllTouches();
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view.text_boss);
        Tween.stopAllByTarget(this.view.boss_bg1);
        Tween.stopAllByTarget(this.view.boss_bg2);
        Tween.stopAllByTarget(this.view.bg);

        if (this._args?.closeFunc) {
            this._args.closeFunc()
        }
    }
}