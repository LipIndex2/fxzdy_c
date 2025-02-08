import * as fgui from "fairygui-cc";
import { UIView } from "../../../core/mvc/view/UIView";
import { MapManager } from "../../../game/tiledMap/MapManager";
import { IMapObject } from "../../../game/tiledMap/IMapObject";
import { math } from "cc";
import { Vec2 } from "cc";
import { FloatingTextManager } from "../../../game/modules/floatingText/FloatingTextManager";
import { BattleManager } from "../../../game/comm/battle/BattleManager";
import GIns from "../../../game/GIns";


/**
 * GM 导出地图碰撞
 */
export class MapBlockExportView extends UIView {

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "MapBlockExportView";

    /**调整节点 */
    private _com: fgui.GComponent;

    private _mapInfo: { mapSize: math.Size, tileSize: math.Size, type: number };

    private _mapObject: IMapObject;

    private _tempV2 = new Vec2();

    // endregion
    private get view(): ui.gm.buildingEditor.MapBlockExportView {
        return this._view as any;
    }

    protected onInit() {
        this.view.closeBtn.onClick(this.onCloseClick, this);
        this.view.saveBtn.onClick(this.onSaveClick, this);

    }

    protected onOpen(): void {

        //let isInBlock = UnitCollisionsManager.ins().isInBlock();
        //this.updatePosTxt();
    }

    private onSaveClick() {
        let step = Number(this.view.inputSizeTxt.text.trim());
        if (!step && Math.floor(step)) {
            GIns.floatingTextMgr.showTips("请输入尺寸");
            return;
        }
        step = Math.floor(step);

        let mapSize = MapManager.ins().getMapSize();
        let xNum = Math.ceil(mapSize.width / step);
        let yNum = Math.ceil(mapSize.height / step);

        let x = step / 2;
        let y = step / 2;
        let oldState;
        let changeTimes = 0;
        let count = 0;
        let arr: number[] = [];

        console.log("start " + Date.now());

        oldState = GIns.battleMgr.battleLogic.unitCollisionsManager.isInBlock(this._tempV2.set(x, y)); //先标记第一个状态
        for (let i = 0; i < yNum; i++) {
            x = step / 2;
            for (let j = 0; j < xNum; j++) {
                let isInBlock = GIns.battleMgr.battleLogic.unitCollisionsManager.isInBlock(this._tempV2.set(x, y));
                arr.push(isInBlock ? 0 : 1);
                if ((oldState != isInBlock) || count >= 127) {
                    if (oldState) {
                        count += 128;
                    }
                    arr.push(count);
                    count = 0;
                    changeTimes++;
                    oldState = isInBlock;
                }
                count++;
                x += step;
            }
            y += step;
        }

        console.log("end " + Date.now());
        console.log(arr);
        //console.log("changeTimes " + changeTimes);


        //MapManager.ins().getMapID();
    }

    private onCloseClick() {
        this.closeSelf();
    }

    /*
    private updateXY() {
        this._offsetX = Math.floor(this._offsetX);
        this._offsetY = Math.floor(this._offsetY);

        let mapInfo = this._mapInfo;
        if (this._mapInfo.type === TiledMap.Orientation.ISO) {
            let tiledW = mapInfo.tileSize.width;
            let tiledH = mapInfo.tileSize.height;

            let halfTileW = tiledW * 0.5;
            let halfTileH = tiledH * 0.5;
            let mapH = mapInfo.mapSize.height;
            let mapWH = mapInfo.mapSize.width + mapH;

            let x = this._offsetX;
            let y = this._offsetY;
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


    */
}