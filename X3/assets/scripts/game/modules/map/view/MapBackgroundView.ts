import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { MapManager } from "../../../tiledMap/MapManager";
import NotificationKey from "../../../event/NotificationKey";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";
import GIns from "../../../GIns";
import { Node,  NodeEventType } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIMapKey } from "../const/UIMapConfig";

/** 地图背景 */
@bindScript(UIMapKey.MAP_BG_POPUP)
export class MapBackgroundView extends UIView {
    static pkgName: string = "map";
    static viewName: string = "MapBackgroundView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.BACKGROUND;

    private _tiledMapNode: Node;

    private _deltaW: number;
    private _deltaH: number;

    private get view(): ui.map.view.MapBackgroundView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.ENTER_WORLD

        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                if (this.view.bg.icon) {
                    this.setPos(args);
                }
                break;
            case NotificationKey.ENTER_WORLD:
                this.setBG(MapManager.ins().getMapID());
                break;
        }
    }

    protected onInit(): void {
        this._tiledMapNode = GIns.cameraAnimUtils.tiledMap;

        this._tiledMapNode.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onMapActiveChanged, this);

        this.view.bg.on(fgui.Event.SIZE_CHANGED, this.onBgChanged, this);
        this.view.sceneBg.setScale(ScreenAdaptManager.bgScale, ScreenAdaptManager.bgScale);
        //LayoutUtils.setScreenCenter(this.view.sceneBg);
    }

    private onBgChanged() {
        //显示界面
        this._deltaW = this.view.bg.width - this.view.width;
        this._deltaH = this.view.bg.height - this.view.height;

        if (this._deltaW < 0 || this._deltaH < 0) {
            let scaleX = (this.view.width + 200) / this.view.bg.width;
            let scaleY = (this.view.height + 200) / this.view.bg.height;
            this.view.bg.scaleX = this.view.bg.scaleY = Math.max(scaleX, scaleY);

            this._deltaW = 200; //保证能动
            this._deltaH = 200; //保证能动
        } else {
            this.view.bg.scaleX = this.view.bg.scaleY = 1;
        }

        this.setPos(MapManager.ins().getMapPos());
    }

    protected onOpen(args: any): void {
        this.setBG(args.id);
    }

    setBG(mapId: number) {
        //加载不了
        // this.view.bg.icon = "ui://unpack/map/mapbg_kongjianzhan";
        // this.view.bg.icon = "ui://ojwi06ia105pvz";
        // this.view.bg.icon = "image/unpack/map/mapbg_kongjianzhan.png";
        let cfg = TableManager.getDataById(table.map.MapidConfig, mapId);
        if (cfg && cfg.move_background) {
            this.view.bg.visible = true;
            this.view.bg.icon = cfg.move_background;
        } else {
            this.view.bg.visible = false;
            this.view.bg.icon = "";
        }


        if (cfg && cfg.static_background) {
            this.view.sceneBg.visible = true;
            this.view.sceneBg.icon = cfg.static_background;
        } else {
            this.view.sceneBg.visible = false;
            this.view.sceneBg.icon = "";
        }

        this.view.bg.x = 0;
        this.view.bg.y = 0;
    }

    private setPos(pos: { x: number, y: number }) {
        let mapSize = MapManager.ins().getMapSize();

        //位移百分比
        let percentumX = pos.x / mapSize.width;
        let percentumY = (1 - pos.y / mapSize.height);

        let _x = 0 - percentumX * this._deltaW;
        let _y = 0 - percentumY * this._deltaH;

        this.view.bg.setPosition(_x, _y);
    }

    private onMapActiveChanged() {
        let mapActive = this._tiledMapNode.active;

        this.view.bg.visible = this.view.bg.icon && mapActive;
        this.view.sceneBg.visible = this.view.sceneBg.icon && mapActive;
    }

}