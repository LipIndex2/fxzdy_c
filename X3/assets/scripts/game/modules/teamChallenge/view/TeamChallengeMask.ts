import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import G from "../../../../core/comm/G";

export class TeamChallengeMask extends UIWin {
    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeMask";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private get view(): ui.teamChallenge.components.TeamChallengeMask {
        return this._view as any;
    }

    /**绑定，注册，静态数据获取 （初始化） */
    protected onInit(): void {
        this.view.btnBack.onClick(() => {
            this.closeSelf();
            /** 关闭主界面 */
            G.UIManager.close(TeamChallengeUIKeys.TeamChallengeMainView);
        }, this);
    }

    /**动态数据获取，界面逻辑 （界面打开，可能触发多次）*/
    protected onOpen(): void {
        GameTimer.ins().once(3000, this, this.closeSelf); //最长屏蔽5秒
    }

    /*清理定时器、动画、临时数据 （界面关闭，注意这里不是销毁）*/
    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    /**用于界面清理缓存 （界面销毁）*/
    protected onPreDispose(): void {

    }
}

UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeMask, TeamChallengeMask);