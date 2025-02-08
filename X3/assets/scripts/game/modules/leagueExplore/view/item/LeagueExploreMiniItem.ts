import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";
import { LeagueExploreMiniDetailItem } from "./LeagueExploreMiniDetailItem";
import { ILeagueExploreBuildingFactoryVo } from "../../model/vo/ILeagueExploreBuildingFactoryVo";
import GIns from "../../../../GIns";
import { MapObjectType } from "../../../../tiledMap/MapEnum";
import { Color } from "cc";
import { LeagueExploreUtils } from "../../LeagueExploreUtils";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { Label } from "cc";

/**
 * 勘探小地图信息item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreMiniItem')
export class LeagueExploreMiniItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMiniItem";

    protected _index: number = 0;
    protected _factoryData:ILeagueExploreBuildingFactoryVo = null;

    private get view(): ui.leagueExplore.item.LeagueExploreMiniItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listDetail.setVirtual();
        this.view.listDetail.itemRenderer = this.itemRendererForDetail.bind(this);

        this.view.btnState.onClick(this.onClickItem, this);
        this.view.btnGoto.onClick(this.onClickGoto, this);
        this.view.lbName.node.getComponent(Label).underlineHeight = 4;
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForDetail(index: number, item: LeagueExploreMiniDetailItem): void {
        item.setData(this._factoryData.mines[index], index);
    }

    protected onClickItem(): void {
        G.FacadeManager.emit(NotificationKey.LEAGUE_EXPLORE_MINI_ITEM_CHANGE, this._index)
    }

    protected onClickGoto():void {
        GIns.leagueExploreMgr.gotoBuilding(this._factoryData.factory.cfg.id);
        G.UIManager.close(UILeagueExploreConfig.LeagueExploreMiniWin);
    }

    public setData(data: ILeagueExploreBuildingFactoryVo, index: number, isOpen: boolean): void {
        this._index = index;
        this._factoryData = data;
        let trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(MapObjectType.factories);
        let lbColor:Color = LeagueExploreUtils.colorForNone;
        if (trunkCfg) {
            let buildingLeagueId = GIns.leagueExploreModel.getBuildingOccupyLeagueId(data.factory);
            if (buildingLeagueId == 0) {
                //未被占领
                this.view.iconLoader.icon = trunkCfg.activeIconPath;
            } else if (buildingLeagueId == GIns.LeagueModel.getLeagueId()) {
                //我方占领
                this.view.iconLoader.icon = trunkCfg.myOccupyIconPath;
                lbColor = LeagueExploreUtils.colorForLeauge;
            } else {
                //敌方占领
                this.view.iconLoader.icon = trunkCfg.otherOccupyIconPath;
                lbColor = LeagueExploreUtils.colorForEnemy;
            }
        }
        this.view.line.color = lbColor;
        this.view.lbName.color = this.view.lbLeague.color = this.view.lbCnt.color = lbColor;
        this.view.lbName.text = data.factory ? data.factory.buildingCfg.name : '';
        this.view.lbLeague.text = GIns.leagueExploreModel.getBuildingOccupyLeagueName(data.factory);
        this.view.lbCnt.text = GIns.leagueExploreModel.getBuildingOccupyCntForList(data.mines) + '/' + data.mines.length;
        if (isOpen) {
            this.view.getController('state').selectedIndex = 1;
            this.view.listDetail.numItems = this._factoryData.mines.length;
            this.view.listDetail.resizeToFit();
            this.view.height = this.view.listDetail.y + this.view.listDetail.height;
        } else {
            this.view.getController('state').selectedIndex = 0;
            this.view.height = this.view.bg.height;
        }
    }
}