import { Color, Graphics, Node } from "cc";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { AreaUnit } from "../../../comm/battle/unit/AreaUnit";
import GIns from "../../../GIns";
import { IMapObject } from "../../../tiledMap/IMapObject";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { BuildingAreaState } from "../../../tiledMap/ui/BuildingAreaNode";
import { LeaugeExploreBuildingOccupyState } from "../../leagueExplore/const/LeagueExploreEnum";

@bindFguiExtension('ui://comm/MiniMapAreaItem')
export class MiniMapAreaItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "MiniMapAreaItem";

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

    protected _points: Array<{ x: number, y: number }> = [];

    protected _graphicsNode: Node = null;

    private get view(): ui.comm.miniMap.MiniMapAreaItem {
        return this as any;
    }

    onInit() {

    }

    protected onPreDispose() {

    }
    get buildingId() {
        return this._buildingId;
    }

    setData(buildingId: number, mapCfg: table.map.MapidConfig, mapGcomp:fgui.GObject) {
        if (this._buildingId != buildingId) {
            this._buildingId = buildingId;
            let mapObjects = GIns.mapMgr.curMap?.getObjectsByType(MapObjectType.factories_area);
            this._mapObject = mapObjects?.find((value) => value.factory_id == buildingId);
            if (this._mapObject == null) {
                return;
            }
            this._areaUnit = AreaUnit.createUnit(this._mapObject);

            this._points.length = 0;
            if (mapCfg?.scale?.length >= 2) {
                let offsetX: number = 0;
                let offsetY: number = 0;
                if (mapCfg?.offset?.length >= 2) {
                    offsetX = mapCfg?.offset[0];
                    offsetY = -mapCfg?.offset[1];
                }
                this._areaUnit.points.forEach((value) => {
                    let x: number = value.x / mapCfg.scale[0] + offsetX + mapGcomp.x;
                    let y: number = value.y / mapCfg.scale[1] + offsetY - mapGcomp.y - mapGcomp.height;
                    this._points.push({ x: x, y: y });
                })
            }

        }
        if (this._mapObject) {
            this.updateUI();
        }
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
            graphicsComp.lineWidth = 2;
            if (this._points.length > 0) {
                graphicsComp.moveTo(this._points[0].x, this._points[0].y);
                for (let i = 1; i < this._points.length; i++) {
                    graphicsComp.lineTo(this._points[i].x, this._points[i].y);
                }
                graphicsComp.close();
                graphicsComp.stroke();
                graphicsComp.fill();
            }

        }
    }
}