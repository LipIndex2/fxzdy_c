import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import { ViewBlackBgComp } from "db://assets/scripts/core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { Handler } from "db://assets/scripts/core/utils/Handler";
import { UICommonKey } from "../const/UICommonConfig";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ModelNode } from "../node/ModelNode";

/**
 * 通用战斗界面
 */
export class CommonSkipBattleView extends UICommWin {
    static pkgName: string = "commBattle";
    static viewName: string = "CommonSkipBattleView";

    private get view(): ui.commBattle.battleView.CommonSkipBattleView {
        return this._view as any;
    }

    protected onOpen(arg: table.verify.PlayerSystemOpenConfig): void {
        let blackBgComp = this.getComp(ViewBlackBgComp) as ViewBlackBgComp;
        if (blackBgComp) {
            blackBgComp.clickCallBack = new Handler(this, this.onClickClose)
        }
        GameTimer.ins().loop(200, this, this.onUpdateLabel)

        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByModelId(6030);
        modelNode.play("idle", true);
    }

    private dotNum: number = 0
    private onUpdateLabel(): void {
        let dotNumStr = "";
        for (let i = 0; i < this.dotNum; i++) {
            dotNumStr += ".";
        }
        this.view.titleLab.setVar("dot", dotNumStr).flushVars();
        this.dotNum++;
        if (this.dotNum > 5)
            this.dotNum = 0;
    }

    private onClickClose(): void {

    }

    protected onPreDispose(): void {
        GameTimer.ins().clearAll(this)
        super.onPreDispose();
    }
}
UIScriptManager.bindScript(UICommonKey.CommonSkipBattleView, CommonSkipBattleView);