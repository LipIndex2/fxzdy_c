import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UILeagueKey } from "../const/UILeagueConst";


@bindFguiExtension("ui://league/build_game")
export class LeagueBuildGame extends FGUI.GButton implements INotification {

    listenNotifications() {
        return [
            NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE:
            case NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE:
                this.updateUI();
                break;
        }
    }

    private get view(): ui.league.leagueMain.btn.build_game {
        return this as any;
    }

    protected onInit() {
        G.FacadeManager.registerNotification(this);
        this.view.starBtn.getController("lock").selectedIndex = 0
        this.view.labelTips.visible = false;
        // 屏蔽历史的时间字
        this.view.starBtn.timeLb.visible = false;

        RedDotUtils.castComp(this.view.starBtn.redDot)
            .listenRedDotByPathArray([
                RedDotKeys.gvg,
                RedDotKeys.LeagueExplore
            ]);

        this.view.onClick(this.openUIForGVG, this);
        this.updateUI();
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
        G.FacadeManager.removeNotification(this);
    }

    protected updateUI(): void {
        let isActive: boolean = GIns.leagueExploreMgr.isActive();
        let isShowBubble: boolean = isActive && GIns.leagueExploreMgr.hasOccupyBuilding() == false && GIns.leagueExploreMgr.isNightTime() == false;
        if (this.view.exploreTip.visible != isShowBubble) {
            this.view.exploreTip.visible = isShowBubble;
            if (isShowBubble) {
                this.view.getTransition('t0').play();
            }
        }
        let nextRefreshTime: number = GIns.leagueExploreMgr.getNextNightChangeTime();
        let nowTime: number = G.TimeManager.serverNow;
        if (isActive && nextRefreshTime > nowTime) {
            let delay = nextRefreshTime - nowTime;
            G.GameTimer.once(delay, this, this.updateUI);
        }
    }

    openUIForGVG() {
        G.UIManager.open(UILeagueKey.LeagueGameModeWin);
    }
}