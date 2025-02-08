import * as fgui from "fairygui-cc";
import { UIView } from "../../../core/mvc/view/UIView";
import { MapManager } from "../../../game/tiledMap/MapManager";
import { IMapObject } from "../../../game/tiledMap/IMapObject";
import { math } from "cc";
import { TiledMap } from "cc";
import { UIGmKeys } from "../../const/UIGmKeys";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import GIns from "../../../game/GIns";


/**
 * GM 检查图片资源
 */
export class BuildingEditorView extends UIView {

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "BuildingEditorView";

    /**调整节点 */
    private _com: fgui.GComponent;

    private _mapInfo: { type: number, mapSize?: math.Size, tileSize?: math.Size};

    private _mapObject: IMapObject;

    private _offsetX: number;
    private _offsetY: number;

    // endregion
    private get view(): ui.gm.buildingEditor.BuildingEditorView {
        return this._view as any;
    }


    protected onInit() {
        this.view.upBtn.onClick(this.onUp, this);
        this.view.downBtn.onClick(this.onDown, this);
        this.view.leftBtn.onClick(this.onLeft, this);
        this.view.rightBtn.onClick(this.onRight, this);
        this.view.closeBtn.onClick(this.onCloseClick, this);
    }

    protected onOpen(args: { com: fgui.GComponent, mapObject: IMapObject, path: string }): void {
        this._mapObject = args.mapObject;
        this._mapInfo = GIns.mapMgr.curMap.getMapInfo();

        this.view.idTxt.setVar("id", args.mapObject.id + "").flushVars();
        this.view.pathTxt.setVar("path", args.path).flushVars();
        this._com = args.com;

        if (this._mapInfo.type === TiledMap.Orientation.ISO) {
            this._offsetX = this._mapObject.offset.x;
            this._offsetY = this._mapObject.offset.y;
        } else {
            this._offsetX = this._mapObject.x;
            this._offsetY = this._mapObject.y;
        }


        this.updatePosTxt();
    }

    private updateXY() {
        this._offsetX = Math.floor(this._offsetX);
        this._offsetY = Math.floor(this._offsetY);

        let mapInfo = this._mapInfo;
        if (this._mapInfo.type === TiledMap.Orientation.ISO) {
            if(GIns.mapMgr.curMap.isMultiMap()) {
                console.error(`多地图拼接，算不了 offset 的 xy  了， 后面再补全下面的功能`);
                return;
            }


            
            let tiledW = mapInfo.tileSize.width;
            let tiledH = mapInfo.tileSize.height;

            let halfTileW = tiledW * 0.5;
            let halfTileH = tiledH * 0.5;
            let mapH = mapInfo.mapSize.height;
            let mapWH = mapInfo.mapSize.width + mapH;

            let x = this._offsetX;
            let y = this._offsetY;
            /**地图坐标转渲染坐标 */
            let posIdxX = x / tiledH;
            let posIdxY = y / tiledH;
            x = halfTileW * (mapH + posIdxX - posIdxY);
            y = halfTileH * (mapWH - posIdxX - posIdxY);

            this._mapObject.offset.x = this._offsetX;
            this._mapObject.offset.y = this._offsetY;

            this._com.node.setPosition(x, y);
            this.updatePosTxt();
        } else {
            this._mapObject.x = this._offsetX;
            this._mapObject.y = this._offsetY;

            this._com.node.setPosition(this._offsetX, this._offsetY);
            this.updatePosTxt();
        }
    }

    updatePosTxt() {
        let x = this._offsetX;
        let y = this._mapInfo.type === TiledMap.Orientation.ISO ? this._offsetY : (this._mapInfo.mapSize.height * this._mapInfo.tileSize.height - this._offsetY);
        
        console.log("id:" + this._mapObject.id + " x:" + x + " y:" + y);
        this.view.posTxt.setVar("x", x + "").setVar("y", y + "").flushVars();
    }

    get stepSize(): number {
        let value = Number(this.view.inputTxt.text.trim());
        return value || 5;
    }

    setComPosition(dx: number, dy: number) {
        let pos = this._com.node.getPosition();
        let x = Math.round(pos.x);
        let y = Math.round(pos.y);

        this._com.node.setPosition(x + dx, y + dy);
        this.updatePosTxt();
    }

    private onUp() {
        if (this._mapInfo.type === TiledMap.Orientation.ISO) {
            this._offsetY -= this.stepSize;
        } else {
            this._offsetY += this.stepSize;
        }
        this.updateXY();
    }

    private onDown() {
        if (this._mapInfo.type === TiledMap.Orientation.ISO) {
            this._offsetY += this.stepSize;
        } else {
            this._offsetY -= this.stepSize;
        }
        this.updateXY();
    }

    private onLeft() {
        this._offsetX -= this.stepSize;
        this.updateXY();
    }

    private onRight() {
        this._offsetX += this.stepSize;
        this.updateXY();
    }

    private onCloseClick() {
        this.closeSelf();
    }
}

UIScriptManager.bindScript(UIGmKeys.BuildingEditorView, BuildingEditorView);