import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { ILeagueExploreBuildingVo } from "../model/vo/ILeagueExploreBuildingVo";
import { LeagueExploreQuickItem } from "./item/LeagueExploreQuickItem";

@bindScript(UILeagueExploreConfig.LeagueExploreQuickWin)
export class LeagueExploreQuickWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreQuickWin";

    protected _buildingId: number = -1;
    protected _buildingVo: ILeagueExploreBuildingVo = null;

    private get view(): ui.leagueExplore.view.LeagueExploreQuickWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE:
                let buildingId = GIns.leagueExploreModel.activityinfo?.playerInfoVo?.occupyBuildingConfigId;
                if (buildingId > 0) {
                    this.updateUI();
                } else {
                    GIns.floatingTextMgr.showTips('您的建筑被人占领');
                    this.closeSelf();
                }
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.itemRendererForList.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForList(index: number, item: LeagueExploreQuickItem): void {
        item.setData(GIns.leagueExploreModel.constCfg.hangUpVos[index], this._buildingVo);
    }

    protected updateUI(): void {
        let buildingId = GIns.leagueExploreModel.activityinfo?.playerInfoVo?.occupyBuildingConfigId;
        if (this._buildingId != buildingId) {
            this._buildingId = buildingId;
            this._buildingVo = GIns.leagueExploreModel.getBuildingVo(buildingId);
            this.view.list.numItems = GIns.leagueExploreModel.constCfg.hangUpVos.length;
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}