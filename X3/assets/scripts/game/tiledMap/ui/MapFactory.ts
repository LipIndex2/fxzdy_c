import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { LeaugeExploreBuildingOccupyState } from "../../modules/leagueExplore/const/LeagueExploreEnum";
import { ILeagueExploreBuildingVo } from "../../modules/leagueExplore/model/vo/ILeagueExploreBuildingVo";
import { MapBuildingUI } from "./MapBuildingUI";
import { MapOccupyHeroItem } from "./MapOccupyHeroItem";

/** 勘探工厂建筑信息展示 */
@bindFguiExtension("ui://map/MapFactory")
export class MapFactory extends MapBuildingUI {
    static pkgName: string = "map";
    static viewName: string = "MapFactory";

    /**建筑数据*/
    protected _buildingVo: ILeagueExploreBuildingVo = null;
    protected _heros: MapOccupyHeroItem[] = [];
    private get view(): ui.map.item.MapFactory {
        return this as any;
    }

    constructor() {
        super();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PLAYER_INFO_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PLAYER_INFO_CHANGE:
                if (this._buildingVo.cfg.id == GIns.leagueExploreModel.activityinfo?.playerInfoVo?.occupyBuildingConfigId) {
                    //是我占领的建筑 需要更新形象
                    this.updateHeros();
                }
                break;
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
        this.view.lbLv.text = this._buildingCfg.lv + '';
    }

    protected updateHeros(): void {
        let cnt = 0;
        if (this._buildingVo?.briefVo?.occupyPlayerBaseVos) {
            cnt = this._buildingVo.briefVo.occupyPlayerBaseVos.length;
        }
        let len = Math.max(cnt, this._buildingVo.cfg.defenderSeatCount);
        for (let i = 0; i < len; i++) {
            let hero = null
            if (i < this._heros.length) {
                hero = this._heros[i];
            } else {
                hero = fgui.UIPackage.createObject('map', 'MapOccupyHeroItem') as MapOccupyHeroItem;
                this.view.addChild(hero);
                if (i < this._buildingVo.cfg.defenderSeatPos?.length) {
                    hero.x = Number(this._buildingVo.cfg.defenderSeatPos[i].k);
                    hero.y = Number(this._buildingVo.cfg.defenderSeatPos[i].v);
                } else {
                    hero.x = 0;
                    hero.y = 0;
                }
                this._heros.push(hero);
            }
            if (i < cnt) {
                hero.setData(this._buildingVo.briefVo.occupyPlayerBaseVos[i]);
            } else {
                hero.setData(null);
            }
        }
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
        if (state == LeaugeExploreBuildingOccupyState.Me) {
            this.view.lbName.text = GIns.playerModel.playerName;
        } else {
            this.view.lbName.text = GIns.leagueExploreModel.getBuildingOccupyPlayerName(this._buildingVo);
        }
        this.view.bgName.alpha = this.view.lbName.text == '' ? 0 :1;
        this.updateHeros();
    }
}
