import * as fgui from "fairygui-cc";
import { tween } from "cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { Tween } from "cc";
import { SecretAreaManager } from "../SecretAreaManager";
import G from "../../../../core/comm/G";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { SecretSeasonManager } from "../../season/seasonSecret/SecretSeasonManager";



/**
 * 秘境 - 刷新boss
 */
@bindScript(UISecretAreaKey.SecretAreaBossWin)
export class SecretAreaBossWin extends UIWin {

    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaBossWin";

    private _fightType:ServerEnums.FightType;


    private get view(): ui.secretArea.win.SecretAreaBossWin {
        return this._view as any;
    }

    protected onInit(): void {

    }

    protected onOpen(args: any): void {

        this._fightType = args;

        let tween1 = tween(this.view.text_boss).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 })
        let tween2 = tween(this.view.boss_bg1).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 })
        let tween3 = tween(this.view.boss_bg2).to(0.2, { scaleX: -0.8, scaleY: 0.8 }).to(0.2, { scaleX: -1.2, scaleY: 1.2 })
        let tween4 = tween(this.view.bg).to(0.2, { alpha: 0.8 }).to(0.2, { alpha: 1.2 })

        tween(this.view.text_boss).repeat(5, tween1).start();
        tween(this.view.boss_bg1).repeat(5, tween2).start();
        tween(this.view.boss_bg2).repeat(5, tween3).start();
        tween(this.view.bg).repeat(5, tween4).start();

        G.GameTimer.once(2000, this, () => {
            G.UIManager.close(UISecretAreaKey.SecretAreaBossWin);
        })

        this.cancelAllTouches();
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.text_boss);
        Tween.stopAllByTarget(this.view.boss_bg1);
        Tween.stopAllByTarget(this.view.boss_bg2);
        Tween.stopAllByTarget(this.view.bg);
        G.GameTimer.clearAll(this);

        if(this._fightType == ServerEnums.FightType.SEASON_SECRET){
            SecretSeasonManager.ins().updateBoss();
            return;
        }
        SecretAreaManager.ins().updateBoss();
    }
}