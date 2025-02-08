import { Color } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import GIns from "../../../../GIns";
import { MapObjectType } from "../../../../tiledMap/MapEnum";
import { PlayerAvatar } from "../../../common/playerInfo/PlayerAvatar";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { LeagueExploreUtils } from "../../LeagueExploreUtils";
import { ILeagueExploreBuildingVo } from "../../model/vo/ILeagueExploreBuildingVo";
import { LeagueExplorePlanetItem } from "./LeagueExplorePlanetItem";

/**
 * 勘探小地图详细信息item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreMiniDetailItem')
export class LeagueExploreMiniDetailItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMiniDetailItem";

    protected _buildingVo: ILeagueExploreBuildingVo = null;
    protected _planets: LeagueExplorePlanetItem[] = []
    private get view(): ui.leagueExplore.item.LeagueExploreMiniDetailItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnGoto.onClick(this.onClickGoto, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickGoto(): void {
        if (GIns.leagueExploreMgr.gotoBuilding(this._buildingVo.cfg.id)) {
            G.UIManager.close(UILeagueExploreConfig.LeagueExploreMiniWin);
        }
    }

    public setData(data: ILeagueExploreBuildingVo, index: number): void {
        this._buildingVo = data;
        this.view.bg.visible = index % 2 == 0;
        let trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(MapObjectType.mine);
        let lbColor: Color = LeagueExploreUtils.colorForNone;
        let isOccupy: boolean = false;
        if (trunkCfg) {
            let buildingLeagueId = GIns.leagueExploreModel.getBuildingOccupyLeagueId(data);
            if (buildingLeagueId == 0) {
                //未被占领
                this.view.iconLoader.icon = trunkCfg.activeIconPath;
            } else if (buildingLeagueId == GIns.LeagueModel.getLeagueId()) {
                //我方占领
                this.view.iconLoader.icon = trunkCfg.myOccupyIconPath;
                lbColor = LeagueExploreUtils.colorForLeauge;
                isOccupy = true;
            } else {
                //敌方占领
                this.view.iconLoader.icon = trunkCfg.otherOccupyIconPath;
                lbColor = LeagueExploreUtils.colorForEnemy;
                isOccupy = true
            }
        }
        this.view.lbBuilding.color = this.view.lbLeague.color = this.view.lbPlayer.color = lbColor;
        this.view.lbBuilding.text = data.buildingCfg.name;
        this.view.lbLeague.text = GIns.leagueExploreModel.getBuildingOccupyLeagueName(data);
        if (isOccupy) {
            this.view.avatar.visible = true;
            let playerInfo = data.briefVo.occupyPlayerBaseVos?.length > 0 ? data.briefVo.occupyPlayerBaseVos[0] : null;
            FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar).resetByPlayerInfo(playerInfo);
            this.view.lbPlayer.text = playerInfo?.name;
        } else {
            this.view.avatar.visible = false;
            this.view.lbPlayer.text = '无';
        }
    }
}