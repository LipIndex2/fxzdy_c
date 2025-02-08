import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import { RankUtils } from "../../rank/utils/RankUtils";
import { LeagueModel } from "../LeagueModel";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueManager } from "../leagueManager";


/**
 * 联盟排行榜界面
 */
@bindScript(UILeagueKey.LeagueRankView)
export class LeagueRankView extends UIView {
    static pkgName: string = "league";

    static viewName: string = "leagueRankView";

    private get view(): ui.league.leagueRankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_RANK_RESP, NotificationKey.EVENT_LEAGUE_INFO_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_RANK_RESP:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
                this.myRender();
                break;



        }
    }
    private ranlLimit: number = 0;
    protected onInit(): void {
        let view = this.view;
        view.list.setVirtual();
        view.list.itemRenderer = this.listRender.bind(this);

        view.footCom.btnBack.onClick(this.closeSelf, this);


        view.list.on(fgui.Event.SCROLL, this.onPullDownToRefresh, this);

        const config = RankUtils.getRankTypeConfigByRankType(ServerEnums.RankingType.LEAGUE_FIGHT);
        this.ranlLimit = config.limit;
    }

    private onPullDownToRefresh(): void {
        let view = this.view;
        let scrollView = view.list;
        let index = Math.round(scrollView.scrollPane.posY / 150);
        //滚到最后一个
        if (index % 4 == 0) {
            if (LeagueManager.ins().mEventRankDataResp && this.rankPage < LeagueManager.ins().mEventRankDataResp.maxPage) {
                this.rankPage++;
                LeagueModel.ins().getLeagueRankList(this.rankPage);
            }
        }
    }

    private rankPage: number = 1;
    public onOpen(): void {
        this.rankPage = 1;
        LeagueModel.ins().getLeagueRankList(1);
        LeagueModel.ins().loadLeagueInfo();

        UiTweenMgr.ins().listShowEffect(this.view.list, this.view.bgList)

    }

    protected onClose(): void {
        UiTweenMgr.ins().removeTweenEffect(this.view.list, this.view.bgList)
    }

    private listDatas: Vo.league.LeagueFightRankItemVo[];
    private updateView(): void {
        let view = this.view;
        this.listDatas = LeagueManager.ins().mRankCommonData;
        if (this.listDatas) {

            //前三名
            this.threeRender(1, this.listDatas[0]);
            this.threeRender(2, this.listDatas[1]);
            this.threeRender(3, this.listDatas[2]);

            //前三名后
            // let list = this.listDatas.slice(3);

            // let len = this.ranlLimit;
            view.list.numItems = this.ranlLimit - 3;

        }




    }

    //前三名渲染
    private threeRender(index: number, data: Vo.league.LeagueFightRankItemVo): void {
        let view = this.view[`top${index}`] as ui.league.btn.leagueTop3;
        if (data) {


            view.nameLab.text = data.name;
            //总战力
            view.fightLab.text = `总战力：${data.fight}`;
            view.noRank.visible = false;
            view.flagCom.visible = true;

            //标识
            let flagCom = view.flagCom;
            let iconUrl = LeagueModel.ins().getLeagueIconUrl(data.icon);
            flagCom.iconLoader.url = iconUrl;

            let bannerUrl = LeagueModel.ins().getLeagueBannerUrl(data.banner);
            flagCom.flagLoader.url = bannerUrl;

            view.clearClick();
            view.onClick(() => {
                this.onOpenLeagueDetail(data.leagueId);
            }, this);



        }
        else {
            //虚位以待
            view.noRank.visible = true;
            view.nameLab.text = "";
            view.fightLab.text = "";
            view.flagCom.visible = false;
        }
        let state = view.getController("state");
        state.selectedIndex = index - 1;

    }



    private listRender(index: number, obj: ui.league.com.leagueRankCell): void {

        let data = this.listDatas;
        index = index + 3;
        //三名后的数据
        let vo = data[index];
        obj.rankLab.text = `${index + 1}`;
        obj.clearClick();
        if (vo) {

            obj.leagueName.text = vo.leaderName;
            obj.leaderName.text = vo.name;
            let flagCom = obj.flagCom;
            let iconUrl = LeagueModel.ins().getLeagueIconUrl(vo.icon);
            flagCom.iconLoader.url = iconUrl;
            let bannerUrl = LeagueModel.ins().getLeagueBannerUrl(vo.banner);
            flagCom.flagLoader.url = bannerUrl;


            obj.fightLab.text = `总战力：${vo.fight}`;


            obj.flagCom.visible = true;

            obj.onClick(() => {
                this.onOpenLeagueDetail(vo.leagueId);
            }, this);
            obj.getController("state").selectedIndex = 0;
        }
        else {
            //虚位以待
            obj.getController("state").selectedIndex = 2;
        }


    }
    /**我的联盟 */
    private myRender(): void {


        let rankVo = LeagueManager.ins().mEventRankDataResp;
        let leagueVo = LeagueManager.ins().mLeagueVo;
        if (!rankVo || !leagueVo)
            return;
        let obj = this.view.myLeague;


        obj.leagueName.text = leagueVo.name;
        obj.leaderName.text = leagueVo.leaderName;
        let flagCom = obj.flagCom;
        let iconUrl = LeagueModel.ins().getLeagueIconUrl(leagueVo.icon);
        flagCom.iconLoader.url = iconUrl;
        let bannerUrl = LeagueModel.ins().getLeagueBannerUrl(leagueVo.banner);
        flagCom.flagLoader.url = bannerUrl;
        if (rankVo.myRankNum > 0) {
            obj.rankLab.fontSize = 54;
            obj.rankLab.text = `${rankVo.myRankNum}`;
        }
        else {
            obj.rankLab.fontSize = 34;
            obj.rankLab.text = `未上榜`;
        }
        obj.fightLab.text = `总战力：${rankVo.myRankValue}`;

        obj.noRank.visible = false;
        obj.flagCom.visible = true;
        obj.getController("state").selectedIndex = 1;

    }

    /**打开联盟详情 */
    private onOpenLeagueDetail(leagueId: number): void {
        LeagueModel.ins().openLeagueDetailView(leagueId);
    }






}