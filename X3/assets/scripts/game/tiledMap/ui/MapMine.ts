import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { LeaugeExploreBuildingOccupyState } from "../../modules/leagueExplore/const/LeagueExploreEnum";
import { ILeagueExploreBuildingVo } from "../../modules/leagueExplore/model/vo/ILeagueExploreBuildingVo";
import { MapBuildingUI } from "./MapBuildingUI";

/** 勘探矿建筑信息展示 */
@bindFguiExtension("ui://map/MapMine")
export class MapMine extends MapBuildingUI {
    static pkgName: string = "map";
    static viewName: string = "MapMine";

    /**建筑数据*/
    protected _buildingVo: ILeagueExploreBuildingVo = null;

    private get view(): ui.map.item.MapMine {
        return this as any;
    }

    constructor() {
        super();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR:
                if (args == this._buildingVo?.cfg.starConfigId) {
                    this.updateUI();
                }
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE:
                if (args == this.buildingId) {
                    this.updateUI();
                }
                break;
        }
    }

    protected onInit() {
        super.onInit();
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    protected initUI(): void {
        this._buildingVo = GIns.leagueExploreModel.getBuildingVo(this._buildingCfg.id);
        let pos = this._buildingCfg.namePos || [0, 0];
        //fgui和node的y坐标不一致
        this.view.gOccupyAni.y = - pos[1] -150;
    }

    protected updateUI(): void {
        if (this._buildingVo == null) {
            return;
        }
        this.view.lbLv.text = this._buildingVo.cfg.level + '';
        let stateIdx = 0;
        let state = GIns.leagueExploreModel.getBuildingOccupyState(this._buildingVo);
        if (state == LeaugeExploreBuildingOccupyState.Idle) {
            stateIdx = 0;
        } else if (state == LeaugeExploreBuildingOccupyState.Me) {
            stateIdx = 3;
        } else if (state == LeaugeExploreBuildingOccupyState.Enemy) {
            stateIdx = 2;
        } else {
            stateIdx = 1;
        }
        this.view.getController('state').selectedIndex = stateIdx;
        this.view.gOccupy.visible = state != 0;
        if (state == LeaugeExploreBuildingOccupyState.Me) {
            this.view.lbName.text = GIns.playerModel.playerName;
        } else {
            this.view.lbName.text = GIns.leagueExploreModel.getBuildingOccupyPlayerName(this._buildingVo);
        }
        this.view.bgName.alpha = this.view.lbName.text == '' ? 0 :1;
    }
}
