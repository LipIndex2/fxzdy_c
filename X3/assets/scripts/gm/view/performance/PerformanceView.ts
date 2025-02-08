import * as fgui from "fairygui-cc";
import { UIView } from "../../../core/mvc/view/UIView";
import { bindScript } from "../../../core/comm/UIScriptManager";
import { UIGmKeys } from "../../const/UIGmKeys";
import { game } from "cc";
import { profiler } from "cc";
import { Logger, LogType } from "../../../core/log/Logger";
import BattleTimer from "../../../core/timer/BattleTimer";
import GIns from "../../../game/GIns";
import { EnumUIViewLayer } from "../../../core/comm/LayerManager";
import { director } from "cc";
import MapVisibleManager from "../../../game/tiledMap/visible/MapVisibleManager";
import G from "../../../core/comm/G";
import { UIMainKey } from "../../../game/ui/main/const/UIMainConfig";
import { ResManager } from "../../../core/res/ResManager";
import MapResourceController from "../../../game/tiledMap/resource/MapResourceController";
import { GameTimer } from "../../../core/timer/GameTimer";
import { V2Quadtree } from "../../../game/comm/math/V2Quadtree";
import { RectQuadtree } from "../../../game/comm/math/RectQuadtree";


/**
 * 性能调试
 */
@bindScript(UIGmKeys.PerformanceView)
export class PerformanceView extends UIView {

    static pkgName: string = "gm";

    static viewName: string = "PerformanceView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.GUIDE;

    private get view(): ui.gm.performance.PerformanceView {
        return this._view as any;
    }

    protected onInit() {
        this.view.closeBtn.onClick(this.onCloseClick, this);
        this.view.frameRate30Btn.onClick(this.onFrameRate30Click, this);
        this.view.frameRate60Btn.onClick(this.onFrameRate60Click, this);
        this.view.showframeRateBtn.onClick(this.onShowFpsClick, this);
        this.view.logBtn.onClick(this.onLogClick, this);

        this.view.hideRoleBtn.onClick(this.onHideRoleClick, this);
        this.view.hideEffectBtn.onClick(this.onHideEffectClick, this);
        this.view.hideMapBtn.onClick(this.onHideMapClick, this);
        this.view.removeOrnamentBtn.onClick(this.onRemoveOrnamentClick, this);

        this.view.hideMainBtn.onClick(this.onHideMainClick, this);
        this.view.gcBtn.onClick(this.onNoGCClick, this);
        this.view.resourceBtn.onClick(this.onNoCreateUnit, this);
        this.view.aiBtn.onClick(this.onCloseFight, this);


        this.view.pointTreeBtn.onClick(this.onPonitTree, this);
        this.view.areaTreeBtn.onClick(this.onAreaTree, this);

    }

    protected onOpen(): void {
        //let isInBlock = UnitCollisionsManager.ins().isInBlock();
        //this.updatePosTxt();
    }

    private onFrameRate30Click() {
        BattleTimer.ins().setFrameRate(30);
    }

    private onFrameRate60Click() {
        BattleTimer.ins().setFrameRate(60);
    }

    private onShowFpsClick() {
        if (profiler.isShowingStats()) {
            profiler.hideStats();
        } else {
            profiler.showStats();
        }
    }

    private onLogClick() {
        if (Logger.isOpen(LogType.DEBUG)) {
            Logger.setOpen(0);
            GIns.floatingTextMgr.showTips("关闭log");
        } else {
            let level =
                LogType.SYSTEM |
                LogType.NET |
                LogType.ERROR |
                LogType.GAME |
                LogType.CONFIG |
                LogType.DEBUG |
                LogType.MODEL |
                LogType.FIGHT;
            Logger.setOpen(level);
            GIns.floatingTextMgr.showTips("打开log");
        }
    }

    private onHideRoleClick() {
        let roleLayer = GIns.worldMgr.roleLayer;
        if (roleLayer) {
            roleLayer.active = !roleLayer.active;
        }
    }

    private onHideEffectClick() {
        let effectLayer = GIns.worldMgr.effectLayer;
        let effect1Layer = GIns.worldMgr.effectSecondTopLayer;
        let effect2Layer = GIns.worldMgr.effectTopLayer;
        if (effectLayer) {
            effect1Layer.active = effect2Layer.active = effectLayer.active = !effectLayer.active;
            effectLayer.removeAllChildren();
            effect1Layer.removeAllChildren();
            effect2Layer.removeAllChildren();
        }
    }

    private onHideMapClick() {
        let map = GIns.mapMgr.curMap.mapNode();
        if (!map.active) {
            GIns.worldMgr.floatLayer?.removeAllChildren();
            GIns.worldMgr.effectLayer?.removeAllChildren();
            GIns.worldMgr.effectSecondTopLayer?.removeAllChildren();
            GIns.worldMgr.effectTopLayer?.removeAllChildren();
        }
        map.active = !map.active;
    }

    private _visibleFunc: any;
    private onRemoveOrnamentClick() {
        if (this._visibleFunc) {
            MapVisibleManager.prototype.inAreas = this._visibleFunc;
            this._visibleFunc = null;
        } else {
            this._visibleFunc = MapVisibleManager.prototype.inAreas;
            MapVisibleManager.prototype.inAreas = function () {
                return [];
            };
        }
    }

    private onHideMainClick() {
        let view = G.UIManager.getViewInstance(UIMainKey.MAIN_PAGE);
        if (view) {
            view._view.visible = !view._view.visible;
        }
    }

    private onNoGCClick() {
        ResManager.AUTO_GC = !ResManager.AUTO_GC;
        GIns.floatingTextMgr.showTips(ResManager.AUTO_GC ? "打开GC" : "关闭GC");
    }

    private _isFight = true;
    private onCloseFight() {
        if (this._isFight) {
            GIns.battleMgr.stopFightAi();
        } else {
            GIns.battleMgr.openFightAi();
        }
        this._isFight = !this._isFight;
        GIns.floatingTextMgr.showTips(this._isFight ? "打开战斗" : "关闭战斗");
    }

    private _isResource = true;
    private onNoCreateUnit() {
        if (this._isResource) {
            //@ts-ignore
            MapResourceController.ins().removeNotification();
            GameTimer.ins().clearAll(MapResourceController.ins());
        } else {
            //@ts-ignore
            MapResourceController.ins().addNotification();
            GameTimer.ins().loop(1200, MapResourceController.ins(), MapResourceController.ins().onUpdate);
        }

        this._isResource = !this._isResource;
        GIns.floatingTextMgr.showTips(this._isResource ? "打开刷怪" : "关闭刷怪");
    }

    private _pointFunc: any;
    private onPonitTree() {
        if (this._pointFunc) {
            V2Quadtree.prototype.query = this._pointFunc;
            this._pointFunc = null;
        } else {
            this._pointFunc = V2Quadtree.prototype.query;
            V2Quadtree.prototype.query = function () {
                return null;
            };
        }
        GIns.floatingTextMgr.showTips(!this._pointFunc ? "开启点树" : "关闭点树");
    }

    private _areaFunc: any;
    private _areaPointFunc: any;
    private _areaFindFunc: any;
    private onAreaTree() {
        if (this._areaFunc) {
            RectQuadtree.prototype.findInsidePolygonByPoint = this._areaFindFunc;
            RectQuadtree.prototype.queryByPoint = this._areaPointFunc;
            RectQuadtree.prototype.query = this._areaFunc;
            this._areaFunc = null;
            this._areaPointFunc = null;
            this._areaFindFunc = null;
        } else {
            this._areaFindFunc = RectQuadtree.prototype.findInsidePolygonByPoint;
            RectQuadtree.prototype.findInsidePolygonByPoint = function () {
                return null;
            };
            this._areaPointFunc = RectQuadtree.prototype.queryByPoint;
            RectQuadtree.prototype.queryByPoint = function () {
                return null;
            };
            this._areaFunc = RectQuadtree.prototype.query;
            RectQuadtree.prototype.query = function () {
                return null;
            };
        }

        GIns.floatingTextMgr.showTips(!this._areaFunc ? "开启矩树" : "关闭矩树");

    }

    private onCloseClick() {
        this.closeSelf();
    }
}