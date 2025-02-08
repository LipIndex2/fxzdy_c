import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import { ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueModel } from "../LeagueModel";
import { LeagueManager } from "../leagueManager";

/**
 * 联盟列表界面
 */
export class LeagueListView extends fgui.GComponent implements INotification {
    static pkgName: string = "league";

    static viewName: string = "leagueList";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.league.leagueList {
        return this as any;
    }

    protected onPreDispose() {
        G.FacadeManager.removeNotification(this);
    }

    protected onConstruct() {
        super.onConstruct();
        G.FacadeManager.registerNotification(this);
    }

    protected onEnable(): void {
        G.FacadeManager.registerNotification(this);
        this.onInit();

        this.onOpen();
    }

    protected onDisable(): void {
        G.FacadeManager.removeNotification(this);
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_LIST_CHANGE, NotificationKey.EVENT_LEAGUE_PUSH_APPROVAL];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_LIST_CHANGE:
                this.updateView();
                break;

            case NotificationKey.EVENT_LEAGUE_PUSH_APPROVAL:
                this.updateView();
                break;
        }
    }

    protected onInit(): void {
        let view = this.view;
        view.refreshBtn.clearClick();
        view.refreshBtn.onClick(this.onRefresh, this);
        view.searchBtn.clearClick();
        view.searchBtn.onClick(() => {
            this.onSearch(1)
        }, this);
        view.createBtn.clearClick();
        view.createBtn.onClick(this.createLeague, this);
        view.list.setVirtual();

        this.searchTime = Number(TableManager.getDataById(table.league.LeagueConstantConfig, "LEAGUE:LIST_REFRESH_COOL_DOWN").content) * 1000;

        view.list.itemRenderer = this.listRender.bind(this);
        //监听滚动事件
        view.list.on(fgui.Event.SCROLL, this.onPullDownToRefresh, this);

        //监听输入
        this.view.searchTxt.on(fgui.Event.TEXT_CHANGE, this.updateWords, this);

    }

    private updateWords(): void {
        let view = this.view;
        let name = view.searchTxt.text;

        ForbiddenManager.isForbidden(name, (content: string) => {
            if (!content) {
                FloatingTextManager.ins().showTips("内容含有敏感词");
                return;
            }

            if (!content) {
                LeagueModel.ins().loadLeagueList(1);
            }
        });
    }

    private onPullDownToRefresh(): void {
        if (!LeagueManager.ins().serverLeagueListPageRes) {
            //第一页数据都没 不知道总页数 就不处理了
            return;
        }
        if (this.page >= LeagueManager.ins().serverLeagueListPageRes.totalPage) {
            //已请求到了最大页数
            return;
        }
        let view = this.view;
        let scrollView = view.list;
        if ( scrollView.scrollPane.posY <= 0) {
            return;
        }
        let endPosY = scrollView.scrollPane.posY + scrollView.height;
        let showCount = Math.ceil(endPosY / (150 + scrollView.lineGap));
        let page = Math.ceil(showCount / 8);
        let needRefreshPage = Math.min(LeagueManager.ins().serverLeagueListPageRes.totalPage, page + 1);
        if (this.page < needRefreshPage) {
            this.page++;
            let name = view.searchTxt.text;
            if (name) {
                this.onSearch(this.page);
            } else {
                LeagueModel.ins().loadLeagueList(this.page);
            }
        }
    }

    private page = 0;

    public onOpen(): void {
        this.page = 1;
        LeagueModel.ins().loadLeagueList(1);

    }

    private listDatas: Vo.league.LeagueBriefVo[];

    private updateView(): void {
        let view = this.view;
        this.listDatas = LeagueManager.ins().serverLeagueList;
        if (this.listDatas && this.listDatas.length > 0) {
            view.list.numItems = this.listDatas.length;
            this.view.list.refreshVirtualList();
            view.noList.visible = false;
        } else {
            view.list.numItems = 0;
            view.noList.visible = true;
        }
    }

    private lastTime: number = 0;
    //间隔时间
    private searchTime: number = 0;

    private onRefresh(): void {

        if (Date.now() - this.lastTime < this.searchTime) {
            return;
        }

        let view = this.view;
        let name = view.searchTxt.text;
        this.page = 1;
        if (name) {
            this.onSearch(1);
        } else {

            LeagueModel.ins().loadLeagueList(1);
        }
        this.lastTime = Date.now();
        this.view.list.scrollToView(0, false, true);
    }

    private onSearch(page: number): void {
        if (Date.now() - this.lastTime < this.searchTime) {
            return;
        }
        this.lastTime = Date.now();
        let view = this.view;
        let name = view.searchTxt.text;
        LeagueModel.ins().searchLeague(name, page);
    }

    private listRender(index: number, obj: ui.league.com.joinListCell): void {

        let data = this.listDatas;
        if (data) {
            let vo = data[index];
            obj.nameLb.text = vo.name;
            obj.lvLb.text = `Lv.${vo.level}`;
            obj.activeLb.text = `${vo.active}`;
            let cfg = LeagueModel.ins().getLeagueLevelConfig(vo.level);
            obj.memberLab.text = `${vo.memberCount}/${cfg.memberCount}`;
            obj.joinBtn.clearClick();
            obj.joinBtn.onClick(() => {
                this.onJoin(0, vo);
            }, this);
            obj.apllyBtn.clearClick();
            obj.apllyBtn.onClick(() => {
                this.onJoin(1, vo);
            }, this);

            //按钮状态  0=自动加入 1=申请加入 2=已满员 3=已申请
            let stateCtr = obj.getController("state");
            let state = LeagueModel.ins().getLeagueState(vo.leagueId);
            stateCtr.selectedIndex = state;
            let iconUrl = LeagueModel.ins().getLeagueIconUrl(vo.icon);
            let flagUrl = LeagueModel.ins().getLeagueBannerUrl(vo.banner);

            obj.flagCom.iconLoader.url = iconUrl;
            obj.flagCom.flagLoader.url = flagUrl;
            obj.flagCom.clearClick();
            obj.flagCom.onClick(() => {
                LeagueModel.ins().openLeagueDetailView(vo.leagueId);
            }, this);
        }
    }

    private onJoin(type: number, vo: Vo.league.LeagueBriefVo): void {

        LeagueModel.ins().applyJoinLeague(type, vo.leagueId);
    }


    private createLeague(): void {
        LeagueModel.ins().openCreateLeagueView();
    }


}