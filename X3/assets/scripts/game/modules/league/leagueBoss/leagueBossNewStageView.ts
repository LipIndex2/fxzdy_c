import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { UILeagueKey } from "../const/UILeagueConst";
/**
 * 新阶段弹窗
 */
@bindScript(UILeagueKey.LeagueNewStageView)
export class LeagueNewStageView extends UICommWin {
    static pkgName: string = "leagueBoss";

    static viewName: string = "leagueBossNewStageView";

    private get view(): ui.leagueBoss.leagueBossNewStageView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.EVENT_LEAGUE_BOSS_RANK_RESP:
              
                break;
        }
    }

    protected onOpen(stage:number): void {

        this.view.stageTxt.text = `第${stage}阶段`
        
    }









}