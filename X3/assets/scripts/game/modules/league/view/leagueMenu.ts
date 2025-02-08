import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";
import { LeagueBargainManager } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainManager";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../core/mvc/view/FguiNotificationGComponent";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { LeagueBargainEnterBtn } from "../../leagueBargain/components/LeagueBargainEnterBtn";
import { leagueMenuItem1 } from "./leagueMenuItem1";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

@bindFguiExtension('ui://league/leagueMenu')
export class leagueMenu extends FguiNotificationGComponent {

    static pkgName: string = "league";

    static viewName: string = "leagueMenu";

    protected _pagePosY: number = 0
    protected _curPage: number = 1
    public pageChangeCallback: (page: number) => void

    private get view(): ui.league.leagueMain.com.leagueMenu {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.LEAGUE_BARGAIN_UPDATE,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_EXIT_LEAGUE: {
                this.closeLB();
                break;
            }
            case NotificationKey.LEAGUE_BARGAIN_UPDATE: {
                this.updateLB();
                break;
            }
        }
    }

    closeLB() {
        this.view.item1.btnLeagueBargain.visible = false;
    }

    updateLB() {
        let isOpen = LeagueModel.ins().bargainContext.isOpen();
        this.view.item1.btnLeagueBargain.visible = isOpen;
        if (isOpen) {
            FguiScriptUtils.toMyScriptClass(this.view.item1.btnLeagueBargain, LeagueBargainEnterBtn).updateUI();
        }
    }

    protected onInit(): void {
        super.onInit();

        this.view.on(fgui.Event.SCROLL, this.onScroll, this)
        this.view.on(fgui.Event.TOUCH_END, this.onScrollEnd, this)
        this.view.on(fgui.Event.SCROLL_END, this.onScrollEnd, this)


        this._pagePosY = this.view.height / 4;

        this.updateLB();
        FguiScriptUtils.toMyScriptClass(this.view.item1.btnLeagueBargain.redDot, RedDotCom).reset(RedDotKeys.leagueBargain);
        LeagueBargainManager.ins().sendLoadInit();
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    protected onScroll(): void {
        let page = this.view.scrollPane.posY >= this._pagePosY ? 2 : 1
        if (this._curPage != page) {
            this._curPage = page
            if (this.pageChangeCallback) {
                this.pageChangeCallback(page)
            }
        }
    }

    protected onScrollEnd(): void {
        if (this.view.scrollPane.posY < this._pagePosY) {
            this.view.scrollPane.scrollTop(true)
        } else {
            this.view.scrollPane.scrollBottom(true)
        }
    }

    /**播放入场动画*/
    public playEnterAni(defaultPage: number): void {
        this._curPage = defaultPage
        if (defaultPage == 1) {
            this.view.scrollPane.scrollTop(false)
        } else {
            this.view.scrollPane.scrollBottom(false)
        }
        this.view.item1.getTransition('enter')?.play();
        this.view.item2.getTransition('enter')?.play();
    }

    public updateChat(notice: string): void {
        //@ts-ignore
        let item = this.view.item1 as leagueMenuItem1
        item.updateChat(notice);
    }
}