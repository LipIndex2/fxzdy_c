import { FguiNotificationGComponent } from "db://assets/scripts/core/mvc/view/FguiNotificationGComponent";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { GVGManager } from "../../gvg/GVGManager";
import { GVGUtils } from "../../gvg/utils/GVGUtils";
import { UILeagueExploreConfig } from "../../leagueExplore/const/UILeagueExploreConfig";
import { LeagueGameMode } from "../const/UILeagueConst";

/**
 * 联盟玩法item
 */
@bindFguiExtension("ui://league/LeagueGameModeItem")
export class LeagueGameModeItem extends FguiNotificationGComponent {
    static pkgName: string = "league";

    static viewName: string = "LeagueGameModeItem";

    protected _cfg: table.league.LeagueGameModeConfig = null;

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
                if (this._cfg.moduleId == LeagueGameMode.LEAGUE_EXPLORE) {
                    this.onTimerExplore();
                }
                break;
        }
    }

    private get view(): ui.league.item.LeagueGameModeItem {
        return this as any;
    }

    protected onInit(): void {
        super.onInit();
        this.view.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
        super.onPreDispose();
    }

    protected onClickItem(): void {
        switch (this._cfg.moduleId) {
            case LeagueGameMode.LEAGUE_WAR:
                GVGManager.ins().tryOpenGVG();
                break;
            case LeagueGameMode.LEAGUE_EXPLORE:
                if (GIns.leagueExploreMgr.isActive && GIns.leagueExploreMgr.isUnlock()) {
                    G.UIManager.open(UILeagueExploreConfig.LeagueExploreMainView);
                }
                break;
        }
    }

    protected updateGVG(): void {
        this.onTimerGVG();
        this.view.exploreTip.visible = false;
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.gvg);
    }

    protected updateExplore(): void {
        this.onTimerExplore();
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.LeagueExplore);
    }

    protected onTimer(): void {
        switch (this._cfg.moduleId) {
            case LeagueGameMode.LEAGUE_WAR:
                //联盟对决计时
                this.onTimerGVG();
                break;
            case LeagueGameMode.LEAGUE_EXPLORE:
                //资源勘探计时
                this.onTimerExplore();
                break;
        }
    }

    protected onTimerGVG(): void {
        const context = GIns.GVGModel.context;
        if (!context.isLock()) {
            // 倒计时
            GVGUtils.getAllStatusTimeText(this.view.lbTime);
        } else {
            this.view.lbTime.text = '未解锁';
        }
    }

    protected onTimerExplore(): void {
        let nowTime: number = G.TimeManager.serverNow;
        if (GIns.leagueExploreMgr.isUnlock()) {
            if (GIns.leagueExploreMgr.isActive()) {
                // 倒计时
                let remainTime: number = GIns.leagueExploreModel.activityinfo.endTime - nowTime;
                remainTime = Math.max(0, remainTime);
                this.view.lbTime.text = '结束倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
            } else {
                let remainTime: number = GIns.leagueExploreModel.activityinfo.nextStartTime - nowTime;
                remainTime = Math.max(0, remainTime);
                this.view.lbTime.text = '开启倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
            }
        } else {
            let endTime = GIns.leagueExploreMgr.getModuleUnlockTime();
            if (endTime <= nowTime) {
                //没有倒计时 还是显示未解锁
                this.view.lbTime.text = GIns.leagueExploreMgr.unlockTip();
            } else {
                let remainTime: number = endTime - nowTime;
                remainTime = Math.max(0, remainTime);
                this.view.lbTime.text = '开启倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
            }
        }
        let isShowBubble: boolean = GIns.redDotMgr.isHaveRedDot(RedDotKeys.LeagueExplore_occupy);
        if (this.view.exploreTip.visible != isShowBubble) {
            this.view.exploreTip.visible = isShowBubble;
            if (isShowBubble) {
                this.view.getTransition('t0').play();
            }
        }
    }

    public updateItem(): void {
        switch (this._cfg.moduleId) {
            case LeagueGameMode.LEAGUE_WAR:
                //联盟对决
                this.updateGVG();
                break;
            case LeagueGameMode.LEAGUE_EXPLORE:
                //资源勘探
                this.updateExplore();
                break;
        }
    }

    public setData(cfg: table.league.LeagueGameModeConfig): void {
        this._cfg = cfg;
        this.view.lbName.text = cfg.title;
        this.view.lbDes.text = cfg.desc;
        this.view.iconLoader.icon = cfg.iconPath;
        G.GameTimer.clearAll(this);
        if (cfg.moduleId) {
            this.view.getController('state').selectedIndex = 0;
            this.updateItem();
            G.GameTimer.loop(1000, this, this.onTimer);
        } else {
            this.view.getController('state').selectedIndex = 1;
        }
    }
}