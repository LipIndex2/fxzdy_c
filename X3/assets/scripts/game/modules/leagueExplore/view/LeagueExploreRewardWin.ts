import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { EventRankDataResp } from "../../rank/event/EventRankData";
import { ILeagueExploreRewardOpenArgs, UILeagueExploreConfig } from "../const/UILeagueExploreConfig";

@bindScript(UILeagueExploreConfig.LeagueExploreRewardWin)
export class LeagueExploreRewardWin extends UICommWin implements IContainer {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRewardWin";

    protected _args: ILeagueExploreRewardOpenArgs = null;
    protected _personCfgs: table.leagueexplore.LeagueExplorePersonalRankRewardConfig[] = null;
    protected _leagueCfgs: table.leagueexplore.LeagueExploreRankRewardConfig[] = null;
    protected _uiKeys: string[] = [
        UILeagueExploreConfig.LeagueExploreRewardSubView,
        UILeagueExploreConfig.LeagueExploreRewardSubView,
    ]
    private get view(): ui.leagueExplore.view.LeagueExploreRewardWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.RANK_ON_DATA_RESP,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.RANK_ON_DATA_RESP:
                let data = args  as EventRankDataResp;
                if (data?.rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE) {
                    this._args.myRank = data.myRankNum;
                } else if (data?.rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
                    this._args.leagueRank = data.myRankNum;
                }
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.viewContainer.bindByGList(this._uiKeys, this.view.listTab);
    }

    protected onPreDispose(): void {

    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as ILeagueExploreRewardOpenArgs;
        let defaultIndex = this._args.defaultIndex ? this._args.defaultIndex : 0;
        if (defaultIndex >= this._uiKeys.length) {
            defaultIndex = this._uiKeys.length - 1;
        }
        if (defaultIndex < 0) {
            defaultIndex = 0;
        }
        this.view.listTab.selectedIndex = defaultIndex;
        this.viewContainer.selectIndex = defaultIndex;
    }

    protected onClose(dontDispose?: boolean): void {

    }

    /**页签切换前
     * @returns 将打开界面的参数
     */
    public onPreChangeView?(subIndex: number): any {
        if (subIndex == 0) {
            if (this._personCfgs == null) {
                this._personCfgs = G.TableManager.getAllData(table.leagueexplore.LeagueExplorePersonalRankRewardConfig);
            }
            if (this._args.myRank == 0) {
                //未请求排行
                GIns.rankModel.sendRankList({type:ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE, subRankParam:null, page:1})
            }
            return { rank: this._args.myRank, cfgs: this._personCfgs, rankType:ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE };
        } else if (subIndex == 1) {
            if (this._leagueCfgs == null) {
                this._leagueCfgs = G.TableManager.getAllData(table.leagueexplore.LeagueExploreRankRewardConfig);
            }
            if (this._args.leagueRank == 0) {
                //未请求排行
                GIns.rankModel.sendRankList({type:ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE, subRankParam:null, page:1})
            }
            return { rank: this._args.leagueRank, cfgs: this._leagueCfgs, rankType:ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE };
        }
    }
}