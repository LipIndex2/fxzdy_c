import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ILeagueExploreStarLevelVo } from "../../model/vo/ILeagueExploreStarLevelVo";
import { LeagueExploreMainTitleItem } from "./LeagueExploreMainTitleItem";
import { LeagueExplorePlanetItem } from "./LeagueExplorePlanetItem";

/**
 * 勘探星球item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreMainItem')
export class LeagueExploreMainItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMainItem";

    protected _levelVo: ILeagueExploreStarLevelVo = null;

    private get view(): ui.leagueExplore.item.LeagueExploreMainItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listPlanet.itemRenderer = this.itemRendererForPlanet.bind(this);
    }

    protected onPreDispose(): void {

    }

    /**标题*/
    protected get titleComp(): LeagueExploreMainTitleItem {
        return FguiScriptUtils.toMyScriptClass(this.view.itemTitle, LeagueExploreMainTitleItem);
    }

    protected itemRendererForPlanet(index: number, item: LeagueExplorePlanetItem): void {
        item.setData(this._levelVo.stars[index]);
        if (this._levelVo.stars.length == 1) {
            item.setStyle(0);
        } else {
            item.setStyle(index % 2 == 0 ? 2 : 1);
        }
    }

    public setData(data: ILeagueExploreStarLevelVo, isLock: boolean = false): void {
        this._levelVo = data;
        this.titleComp.setData(data, isLock);
        if (isLock) {
            //未解锁就不刷新星球了
            this.view.listPlanet.numItems = 0;
            this.view.maskLoader.visible = true;
            this.view.height = this.view.maskLoader.height;
        } else {
            this.view.maskLoader.visible = false;
            this.view.listPlanet.numItems = data.stars.length;
            this.view.listPlanet.resizeToFit();
            this.view.height = this.view.listPlanet.y + this.view.listPlanet.height;
        }
    }

}