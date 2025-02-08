import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UIMiniMapKey } from "../const/UIMiniMapConfig";
import { MiniMapManager } from "../MiniMapManager";
import { TableManager } from "../../../../core/table/TableManager";
import { MapManager } from "../../../tiledMap/MapManager";
import { MiniMapShowBuildingItem } from "./MiniMapShowBuildingItem";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { v2 } from "cc";
import GIns from "../../../GIns";

export class MiniMapItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "MiniMapItem";

    //地图表，单地图模式下
    private _mapCfg: table.map.MapidConfig;
    //地图表，多地图拼接模式下
    private _multiMapCfg: table.map.MapidConfig[];

    private _lastPos = v2();

    private get view(): ui.comm.miniMap.MiniMapItem {
        return this as any;
    }

    onInit(): void {
        //小地图
        this.view.on(fgui.Event.CLICK, this.onClickMiniMap, this);

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Map_enter);

        this.view.map.mapItem.map.on(fgui.Event.SIZE_CHANGED, this.onMapSizeChg, this);
    }

    /** 设置小地图 */
    setMiniMapIcon(): void {
        this.resetMiniMapData();
        let self = this;
        // 1s 后
        G.GameTimer.once(1000, this, () => {
            if (this.view.node?.isValid) {
                self.setMiniMapPosition(MapManager.ins().getMapPos());
            }
        });
    }

    /** 重置小地图数据 */
    resetMiniMapData(id?: number) {
        let isMultiMap = MapManager.ins().curMap.isMultiMap();
        // 背景
        this.view.map.mapBg.icon = MiniMapManager.ins().getMiniMapBgPath();

        // 地图
        if (!isMultiMap) {
            this._mapCfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
            this.view.map.mapItem.map.icon = MiniMapManager.ins().getMiniMapPath();
        } else {
            this._multiMapCfg = GIns.mapMgr.getMultiMapIDS().map(id => {
                return TableManager.getDataById(table.map.MapidConfig, id);
            });
            this._mapCfg = this._multiMapCfg[0];
        }

        // 1s 后
        let mapItem = this.view.map.mapItem as any as MiniMapShowBuildingItem;
        mapItem.clearMapShow();
        G.GameTimer.once(1000, this, () => {
            if (this.view.node?.isValid) {
                mapItem.updateData(false, id);
                mapItem.setScale(this._mapCfg.default_scale, this._mapCfg.default_scale);
            }
        });
    }

    /** 设置小地图位置 */
    setMiniMapPosition(pos: { x: number; y: number }) {
        this._lastPos.set(pos.x, pos.y);

        if (!this._mapCfg || !this._mapCfg.scale) return;
        let posX = -(pos.x / this._mapCfg.scale[0]) * this._mapCfg.default_scale + this.view.map.width / 2 - this._mapCfg.offset[0];
        let posY = -(this.view.map.mapItem.map.height - pos.y / this._mapCfg.scale[1]) * this._mapCfg.default_scale + this.view.map.height / 2 - this._mapCfg.offset[1] * 2; //不知道为什么需要2倍，暂时没时间找问题

        this.view.map.mapItem.setPosition(posX, posY);
        // if (this._mapCfg.offset) {
        //     this.view.map.mapItem.x += this._mapCfg.offset[0];
        //     this.view.map.mapItem.y -= this._mapCfg.offset[1];
        // }

        //@ts-ignore
        // this.view.map.mapItem.playerPos();
        // this.view.map.mapItem.setMiniMapPosition(pos);
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
    }

    //打开地图
    private onClickMiniMap() {
        G.UIManager.open(UIMiniMapKey.MiniMapMainView);
    }

    private onMapSizeChg() {
        //地图尺寸改变要重新设置地图显示位置
        this.setMiniMapPosition(this._lastPos);
    }
}
