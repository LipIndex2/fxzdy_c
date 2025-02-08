import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ViewEffectComp } from "../../../../core/mvc/view/comp/ViewEffectComp";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import GIns from "../../../GIns";
import G from "../../../../core/comm/G";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";


/**
 * 新解锁提示
 */
@bindScript(UISecretAreaKey.SecretAreaUnlockWin)
export class SecretAreaUnlockWin extends UICommWin {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaUnlockWin";

    private get view(): ui.secretArea.win.SecretAreaUnlockWin {
        return this._view as any;
    }

    public onOpen(data:{type:number, closeCllBack:Function}): void {
        let level = GIns.secretAreaMgr.level + 1;
        let cfg = G.TableManager.getDataById(table.secretinstance.SecretInstanceConfig, level);
        this.view.T_levelDesc.text = 
            ServerEnums.SecretInstanceType[cfg.type] == ServerEnums.SecretInstanceType.NORMAL ? `普通难度${level}` : `地狱难度${level}`;
    }
}