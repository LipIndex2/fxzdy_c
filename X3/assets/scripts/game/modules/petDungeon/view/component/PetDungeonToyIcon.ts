import { Vec2 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import GIns from "../../../../GIns";
import { IPetDungeonToyIconStarParam } from "../../const/UIPetDungeonConfig";
import { PET_DUNGEON_TOY_CELL_CNT, PetDungeonToyShapeVo } from "../../model/vo/PetDungeonToyShapeVo";

/**
 * 玩具图标类
*/
export class PetDungeonToyIcon extends fgui.GComponent {
    /**最大宽度 如果大于0 会找比例缩小图标*/
    protected _maxW: number = 0;
    /**最大高度 如果大于0 会找比例缩小图标*/
    protected _maxH: number = 0;
    /**默认格子大小 未缩放时的格子大小*/
    protected _defaultCellW: number = 0;
    /**默认格子间隔 未缩放时的格子间隔*/
    protected _defaultCellGap: number = 0;
    /**当前格子大小*/
    protected _curCellW: number;
    /**当前间隔大小*/
    protected _curCellGap: number;
    /**玩具配置id*/
    protected _toyConfigId: number;
    /**玩具配置*/
    protected _toyCfg: table.petdungeon.PetDungeonToyConfig = null;
    /**玩具形状id*/
    protected _toyShapeId: number;
    /**玩具形状vo*/
    protected _toyShapeVo: PetDungeonToyShapeVo = null;
    protected _lastCellIdx: number = -1;

    /**是否可拖动*/
    protected _isCanTouchDrag: boolean = false;
    /**拖动判断边界*/
    protected _touchDragSensitivity: number = 10;
    /**是否触摸的是有效格子*/
    protected _isTouchCell: boolean = false;
    /**触摸开始点*/
    protected _touchStartPos: Vec2 = null;
    /**触摸开始点相对于fgui的本地坐标*/
    protected _fguiTouchPos: Vec2 = new Vec2();
    protected _isMoving: boolean = false;
    /**开始拖动回调*/
    public onStartDragCallback: (param: IPetDungeonToyIconStarParam) => void;

    public static create(): PetDungeonToyIcon {
        return fgui.UIPackage.createObject('petDungeon', 'PetDungeonToyIcon', PetDungeonToyIcon) as PetDungeonToyIcon;
    }

    protected get view(): ui.petDungeon.component.PetDungeonToyIcon {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {
        this.view.off(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
        this.view.off(fgui.Event.TOUCH_END, this.onTouchEnd, this);
        this.view.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
    }

    protected onTouchStart(evt: fgui.Event): void {
        this._isMoving = false;
        // let pos = evt.getUILocation();
        //坐标系不同要计算y坐标
        this._fguiTouchPos.set(evt.pos.x, evt.pos.y);
        this._fguiTouchPos = this.view.globalToLocal(this._fguiTouchPos.x, this._fguiTouchPos.y);
        let cellX: number = Math.floor(this._fguiTouchPos.x / (this._curCellW + this._curCellGap));
        let cellY: number = Math.floor(this._fguiTouchPos.y / (this._curCellW + this._curCellGap));
        let cellIndex = cellX + cellY * PET_DUNGEON_TOY_CELL_CNT;
        if (this._toyShapeVo?.cfg?.values[cellIndex] == 1) {
            //代表点击在有效格子上
            if (this._touchStartPos == null)
                this._touchStartPos = new Vec2();
            this._touchStartPos.set(evt.pos.x, evt.pos.y);
            this._isTouchCell = true;
            this.view.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        } else {
            this._isTouchCell = false;
        }
        evt.captureTouch();
    }

    protected onTouchMove(evt: fgui.Event): void {
        if (this._isTouchCell && this._touchStartPos) {
            // let pos = evt.getUILocation();
            if (Math.abs(this._touchStartPos.x - evt.pos.x) >= this._touchDragSensitivity
                || Math.abs(this._touchStartPos.y - evt.pos.y) >= this._touchDragSensitivity) {
                //达到拖动条件
                if (this.onStartDragCallback) {
                    let percentW: number = this._fguiTouchPos.x / this.view.width;
                    let percentH: number = this._fguiTouchPos.y / this.view.height;
                    let param: IPetDungeonToyIconStarParam = {
                        mouseX: evt.pos.x,
                        mouseY: evt.pos.y,
                        percentW: percentW,
                        percentH: percentH
                    }
                    this.onStartDragCallback(param);
                }
                this._isMoving = true;
                this.onTouchEnd(evt);
            }
        }
    }

    protected onTouchEnd(evt: fgui.Event = null): void {
        this._isTouchCell = false;
        this.view.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        this._isMoving = false;
    }

    /**玩具形状更新处理*/
    protected onShapeChange(): void {
        this._curCellW = this._defaultCellW;
        this._curCellGap = this._defaultCellGap;

        if (this._maxW > 0 && this._maxH > 0) {
            //有最大尺寸限制
            let totalW = this._toyShapeVo.maxCol * (this._curCellW + this._curCellGap) - this._curCellGap;
            let totalH = this._toyShapeVo.maxRow * (this._curCellW + this._curCellGap) - this._curCellGap;
            if (totalW > this._maxW || totalH > this._maxH) {
                let percentW = Math.floor((this._maxW / totalW) * 100);
                let percentH = Math.floor((this._maxH / totalH) * 100);
                let percent = Math.min(percentW, percentH);
                this._curCellW = Math.floor(this._defaultCellW * percent / 100);
                this._curCellGap = Math.floor(this._defaultCellGap * percent / 100);
            }
        }

        let realW = this._toyShapeVo.maxCol * (this._curCellW + this._curCellGap) - this._curCellGap;
        let realH = this._toyShapeVo.maxRow * (this._curCellW + this._curCellGap) - this._curCellGap;
        this.view.iconLoader.width = this.view.iconLoader.height = Math.max(realH, realH);
        this.view.width = this.view.iconLoader.width = realW;
        this.view.height = this.view.iconLoader.height = realH;

        this._lastCellIdx = this.shapeVo.cfg.values.lastIndexOf(1);
    }

    /**玩具配置id*/
    public get toyConfigId(): number {
        return this._toyConfigId;
    }

    /**玩具配置*/
    public get cfg(): table.petdungeon.PetDungeonToyConfig {
        return this._toyCfg;
    }

    /**玩具形状vo*/
    public get shapeVo(): PetDungeonToyShapeVo {
        return this._toyShapeVo;
    }

    /**格子大小*/
    public get cellW(): number {
        return this._curCellW;
    }

    /**格子间隔*/
    public get cellGap(): number {
        return this._curCellGap;
    }

    /**最后一个格子的下标*/
    public get lastCellIdx(): number {
        return this._lastCellIdx;
    }

    /**初始化配置*/
    public initCfg(cellW: number, cellGap: number, maxW: number = 0, maxH: number = 0): void {
        this._defaultCellW = cellW;
        this._defaultCellGap = cellGap;
        this._maxW = maxW;
        this._maxH = maxH;
    }

    /**玩具是否可触摸拖动*/
    public get isCanTouchDrag(): boolean {
        return this._isCanTouchDrag;
    }

    /**玩具是否可触摸拖动*/
    public set isCanTouchDrag(value: boolean) {
        if (this._isCanTouchDrag != value) {
            this._isCanTouchDrag = value;
            if (value) {
                this.view.on(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
                this.view.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);
            } else {
                this.view.off(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
                this.view.off(fgui.Event.TOUCH_END, this.onTouchEnd, this);
            }
        }
    }

    /**设置玩具*/
    public setToy(toyConfigId: number): void {
        if (this._toyConfigId != toyConfigId) {
            this._toyConfigId = toyConfigId;
            this._toyCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, toyConfigId);
            if (this._toyCfg) {
                this.view.iconLoader.icon = this._toyCfg.icon;
                if (this._toyShapeId != this._toyCfg.shapeId) {
                    this._toyShapeId = this._toyCfg.shapeId;
                    this._toyShapeVo = GIns.petDungeonModel.getToyShapeVo(this._toyCfg.shapeId);
                    if (this._toyShapeVo) {
                        this.onShapeChange();
                    }
                }
            }
        }
    }
}