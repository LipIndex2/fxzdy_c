import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { IMapObject } from "../IMapObject";

/**地图建筑UI基类*/
export class MapBuildingUI extends FGUICocosNodeComponent {

    /**建筑配置*/
    protected _buildingCfg: table.map.MapBuildingConfig = null;
    /**地图对象*/
    protected _mapObject:IMapObject = null;
    /**是否展示*/
    protected _isActive:boolean = false;

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected onInit() {
        FacadeManager.ins().registerNotification(this);
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
    }

    protected initUI(): void {

    }


    protected updateUI(): void {

    }

    /**建筑id*/
    public get buildingId():number {
        return this._buildingCfg ? this._buildingCfg.id : 0;
    }

    /**设置建筑id*/
    public setBuildingCfg(buildingConfig: table.map.MapBuildingConfig, mapObject: IMapObject) {
        if (this._buildingCfg != buildingConfig || this._mapObject != mapObject) {
            this._buildingCfg = buildingConfig;
            this._mapObject = mapObject;
            this.initUI();
            this.updateUI();
        }
    }

    /**强制刷新UI*/
    public updateUIForce():void {
        if (this._buildingCfg && this._mapObject) {
            this.updateUI();
        }
    }

    public setAcive(isActive:boolean):void {
        this._isActive = isActive;
    }
}
