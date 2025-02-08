import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UILeagueExploreConfig } from "../const/UILeagueExploreConfig";

@bindScript(UILeagueExploreConfig.LeagueExploreIncomeWin)
export class LeagueExploreIncomeWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreIncomeWin";

    protected _uiKeys: string[] = [
        UILeagueExploreConfig.LeagueExploreIncomeSubView,
        UILeagueExploreConfig.LeagueExploreRecordSubView1,
        UILeagueExploreConfig.LeagueExploreRecordSubView2,
    ];

    private get view(): ui.leagueExplore.view.LeagueExploreIncomeWin {
        return this._view as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.viewContainer.bindByGList(this._uiKeys, this.view.listTab);
    }

    protected onPreDispose(): void {

    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.viewContainer.selectIndex = 0;
    }

    protected onClose(dontDispose?: boolean): void {

    }
}