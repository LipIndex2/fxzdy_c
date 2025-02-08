import * as fgui from "fairygui-cc";
import { WorldManager } from "../../comm/world/WorldManager";
import { IMapObject } from "../IMapObject";
import { MapObjectType } from "../MapEnum";
import { BuildingNode } from "./BuildingNode";
import { MapBuildingUI } from "./MapBuildingUI";

/**
 * 地图建筑节点包含建筑UI逻辑
 */
export class BuildingNodeWithUI extends BuildingNode {
    protected _buildingUI: MapBuildingUI;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName, BuildingNodeWithUI) as BuildingNodeWithUI;
    }

    /**创建UI对象*/
    protected createBuildingUI(buildingType: string): MapBuildingUI {
        let buildingUI: MapBuildingUI = null;
        switch (buildingType) {
            case MapObjectType.stimulation:
                //是经营类建筑需要展示额外UI
                buildingUI = fgui.UIPackage.createObject('map', 'MapStimulation') as MapBuildingUI;
                break;
            case MapObjectType.factories:
                //勘探工厂建筑
                buildingUI = fgui.UIPackage.createObject('map', 'MapFactory') as MapBuildingUI;
                break;
            case MapObjectType.mine:
                //勘探矿建筑
                buildingUI = fgui.UIPackage.createObject('map', 'MapMine') as MapBuildingUI;
                break;
        }
        return buildingUI;
    }

    /**初始化建筑ui*/
    protected initBuildingUI(buildingConfig: table.map.MapBuildingConfig, mapObject: IMapObject): void {
        let buildingUI: MapBuildingUI = this.createBuildingUI(mapObject.building_type)
        //移除旧的
        if (this._buildingUI) {
            this._buildingUI.dispose();
            this._buildingUI = null;
        }
        if (buildingUI) {
            this._buildingUI = buildingUI;
            this._buildingUI.node.name = 'buildingUI_' + this.buildingId;
            this._buildingUI.node.setPosition(this.mapObject.x, this.mapObject.y);
            WorldManager.ins().tipsLayer.addChild(this._buildingUI.node);
            this._buildingUI.setBuildingCfg(buildingConfig, mapObject);
            this._buildingUI.alpha = this.view.alpha;
        }
    }

    /**设置建筑UI展示*/
    protected setBuildingUIActive(active: boolean): void {
        if (active) {
            if (this._buildingUI == null || this._buildingUI.buildingId != this.cfg.id) {
                this.initBuildingUI(this.cfg, this.mapObject);
            }
        }
        if (this._buildingUI) {
            this._buildingUI.setAcive(active);
        }
    }

    setActive(active: boolean) {
        super.setActive(active);
        this.setBuildingUIActive(active);
    }

     /**设置透明度*/
     public setAlpha(alpha:number):void {
        super.setAlpha(alpha);
        if (this._buildingUI) {
            this._buildingUI.alpha = alpha;
        }
    }
}