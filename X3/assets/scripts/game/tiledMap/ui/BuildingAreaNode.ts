import { Color, Graphics, Node } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";
import { INotification } from "../../../core/mvc/interface/INotification";
import { AreaUnit } from "../../comm/battle/unit/AreaUnit";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { LeaugeExploreBuildingOccupyState } from "../../modules/leagueExplore/const/LeagueExploreEnum";
import { IMapObject } from "../IMapObject";
import { MapObjectType } from "../MapEnum";

export enum BuildingAreaState {
    /**空闲*/
    Idle = 1,
    /**我方*/
    Mine = 2,
    /**敌方*/
    Enemy = 3,
}

/**
 * 地图建筑区域节点
 */
export class BuildingAreaNode extends FGUICocosNodeComponent implements INotification {

    static pkgName: string = "comm";
    static viewName: string = "BuildingAreaNode";

    /**空闲时的颜色*/
    public colorForIdle: Color = new Color('#FFFFFF');
    /**我方占领时的颜色*/
    public colorForMine: Color = new Color('#2EAEFF');
    /**敌方占领时的颜色*/
    public colorForEnemy: Color = new Color('#F65A5C');

    protected _mapObject: IMapObject;
    // 关联建筑id
    protected _buildingId: number;
    // 当前状态
    protected _state: number = 0;

    protected _areaUnit: AreaUnit = null;

    protected _graphicsNode: Node = null;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName, BuildingAreaNode) as BuildingAreaNode;
    }

    private get view(): ui.comm.building.BuildingAreaNode {
        return this as any;
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
                this.updateUI();
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE:
                if (args == this.buildingId) {
                    this.updateUI();
                }
                break;
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this);
    }

    protected onPreDispose(): void {
        if (this._graphicsNode) {
            this._graphicsNode.destroy();
            this._graphicsNode = null;
        }
        G.FacadeManager.removeNotification(this);
    }

    get buildingId() {
        return this._buildingId;
    }

    setData(mapObject: IMapObject) {
        this._mapObject = mapObject
        this._buildingId = mapObject.factory_id;
        this._areaUnit = AreaUnit.createUnit(mapObject);
        this.updateUI();
    }

    /**刷新UI*/
    protected updateUI(): void {
        if (this._mapObject.building_type == MapObjectType.factories_area) {
            //是工厂范围
            let buildingVo = GIns.leagueExploreModel.getBuildingVo(this._buildingId);
            if (buildingVo) {
                let buildingState = GIns.leagueExploreModel.getBuildingOccupyState(buildingVo);
                let state: BuildingAreaState = BuildingAreaState.Idle;
                if (buildingState == LeaugeExploreBuildingOccupyState.Idle) {
                    //空闲
                } else if (buildingState == LeaugeExploreBuildingOccupyState.Enemy) {
                    state = BuildingAreaState.Enemy;
                } else {
                    state = BuildingAreaState.Mine;
                }
                this.setAreaState(state);
            }
        }
    }

    protected setAreaState(state: number): void {
        if (this._state != state) {
            this._state = state;
            let color = this.colorForIdle;
            if (state == BuildingAreaState.Mine) {
                color = this.colorForMine;
            } else if (state == BuildingAreaState.Enemy) {
                color = this.colorForEnemy;
            }

            if (this._graphicsNode == null) {
                this._graphicsNode = new Node();
                this._graphicsNode.addComponent(Graphics);
                this.view.node.addChild(this._graphicsNode);
            }

            let graphicsComp = this._graphicsNode.getComponent(Graphics);
            let fillColor = color.clone();
            fillColor.a = 50;
            graphicsComp.clear();
            graphicsComp.strokeColor = color;
            graphicsComp.fillColor = fillColor;
            graphicsComp.lineWidth = 4;
            if (this._areaUnit.points.length > 0) {
                graphicsComp.moveTo(this._areaUnit.points[0].x, this._areaUnit.points[0].y);
                for (let i = 1; i < this._areaUnit.points.length; i++) {
                    graphicsComp.lineTo(this._areaUnit.points[i].x, this._areaUnit.points[i].y);
                }
                graphicsComp.close();
                graphicsComp.stroke();
                graphicsComp.fill();
            }

        }
    }
}