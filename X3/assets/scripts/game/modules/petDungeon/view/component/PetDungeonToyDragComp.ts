import { Intersection2D, Rect } from "cc";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../../core/mvc/view/FguiNotificationGComponent";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { IPetDungeonToyDragContainer } from "../../const/IPetDungeonToyDragContainer";
import { IPetDungeonToyDragArgs, PetDungeonToyDragFrom } from "../../const/UIPetDungeonConfig";
import { PET_DUNGEON_TOY_CELL_CNT } from "../../model/vo/PetDungeonToyShapeVo";
import { PetDungeonToyIcon } from "./PetDungeonToyIcon";

/**拖动目标参数*/
export interface IPetDungeonToyDragTarget {
    contaier: IPetDungeonToyDragContainer;
    froms: PetDungeonToyDragFrom[];
    cellRect?: Rect;
    boxRect?: Rect;
    delRect?: Rect;
    cellW: number;
    cellGap: number;
}

/**玩具拖动组件*/
@bindFguiExtension('ui://petDungeon/PetDungeonToyDragComp')
export class PetDungeonToyDragComp extends FguiNotificationGComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyDragComp";

    protected _args: IPetDungeonToyDragArgs = null;
    /**拖动目标*/
    protected _target: IPetDungeonToyDragTarget = null;

    /**格子大小 默认值72*/
    protected _cellW: number = 72;
    /**格子间隔 默认值3*/
    protected _cellGap: number = 3;
    /**拖动图标区域*/
    protected _dragIconRect: Rect = null;
    /**拖动图标*/
    protected _dragIcon: PetDungeonToyIcon = null;
    /**是否碰撞删除区域*/
    protected _isCollideDel: boolean = false;
    /**碰撞格子区域*/
    protected _collideCellIdx: number = -1;
    /**是否可添加到格子中*/
    protected _isCanAddJoy: boolean = false;
    /**真实的格子数据 如果是格子内部需要剔除拖动数据*/
    protected _boxValue: number = 0;
    /**真实的格子数据 如果是格子内部需要剔除拖动数据*/
    protected _boxValues: number[] = [];

    public onDragComplete: () => void;

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_DRAG_TOY_STAR
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_DRAG_TOY_STAR:
                this.onDragToyStarHandler(args);
                break;
        }
    }

    private get view(): ui.petDungeon.component.PetDungeonToyDragComp {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    protected onDragToyStarHandler(args: IPetDungeonToyDragArgs): void {
        if (this._target && this._target.froms.indexOf(args.from) != -1) {
            this._args = args;

            //提前计算格子数值 减少判断是的计算量
            this._boxValue = GIns.petDungeonModel.toyBoxVo.boxValue;
            this._boxValues = GIns.petDungeonModel.toyBoxVo.boxValues;
            if (this._args.from == PetDungeonToyDragFrom.Main_Cell) {
                //如果是格子内部移动需要剔除移动玩具原有的位置
                let oldValue = GIns.petDungeonModel.toyBoxVo.toyMap.get(this._args.id)?.value;
                this._boxValue -= oldValue;
                this._boxValues = GIns.petDungeonModel.toyBoxVo.getValues(this._boxValue);
            }


            this._dragIcon = PetDungeonToyIcon.create();
            this._dragIcon.initCfg(this._cellW, this._cellGap);
            this._dragIcon.setToy(args.toyConfigId);
            this._dragIcon.draggable = true;
            this._dragIcon.x = Math.floor(args.mouseX - args.percentW * this._dragIcon.width);
            this._dragIcon.y = Math.floor(args.mouseY - args.percentH * this._dragIcon.height);
            this.view.addChild(this._dragIcon);
            this._dragIcon.startDrag();
            this._dragIcon.on(fgui.Event.DRAG_MOVE, this.onDragMove, this);
            this._dragIcon.on(fgui.Event.DRAG_END, this.onDragEnd, this);
            this._dragIconRect = new Rect(this._dragIcon.x, this._dragIcon.y, this._dragIcon.width, this._dragIcon.height);
        }
    }

    protected onDragMove(evt: fgui.Event): void {
        this._dragIconRect.x = this._dragIcon.x;
        this._dragIconRect.y = this._dragIcon.y;
        if (this._target.delRect) {
            //删除碰撞检测
            let isCollideDel: boolean = Intersection2D.rectRect(this._dragIconRect, this._target.delRect);
            if (this._isCollideDel != isCollideDel) {
                this._isCollideDel = isCollideDel;
                this.setDelOpen(isCollideDel);
            }
        }
        if (this._target.cellRect) {
            //格子碰撞检测
            let isCollideCell: boolean = Intersection2D.rectRect(this._dragIconRect, this._target.cellRect);
            let collideCellIdx: number = -1;
            if (isCollideCell) {
                //有碰撞到格子 就检测当前在第几个格子
                let cellX: number = Math.floor((this._dragIcon.x - this._target.cellRect.x + this._dragIcon.cellW * 0.5) / (this._cellW + this._cellGap));
                let cellY: number = Math.floor((this._dragIcon.y - this._target.cellRect.y + this._dragIcon.cellW * 0.5) / (this._cellW + this._cellGap));
                if (cellX >= 0
                    && cellY >= 0
                    && cellX + this._dragIcon.shapeVo.maxCol <= PET_DUNGEON_TOY_CELL_CNT
                    && cellY + this._dragIcon.shapeVo.maxRow <= PET_DUNGEON_TOY_CELL_CNT) {
                    //在格子范围内
                    collideCellIdx = cellX + cellY * PET_DUNGEON_TOY_CELL_CNT;
                }
            }
            if (this._collideCellIdx != collideCellIdx) {
                this._isCanAddJoy = false;
                this._collideCellIdx = collideCellIdx;
                if (collideCellIdx == -1) {
                    //重置显示
                    this.updateBoxCell(this._boxValues);
                } else {
                    //预设显示
                    this.updateTempBoxCell(collideCellIdx);
                }
            }
        }
    }

    protected onDragEnd(evt: fgui.Event): void {
        if (this.onDragComplete) {
            this.onDragComplete();
        }
        if (this._dragIcon) {
            this._dragIcon.dispose();
            this._dragIcon = null;
        }
        //清空拖动中记录的数据
        this._isCollideDel = false;
        this._collideCellIdx = -1;
        this._isCanAddJoy = false;

        this.setDelOpen(false);
        G.FacadeManager.emit(NotificationKey.PET_DUNGEON_DRAG_TOY_END, this._args);
    }

    protected updateTempBoxCell(index: number): void {
        let dragValue = this._dragIcon.shapeVo.cfgValue >> index;
        let dragValues = GIns.petDungeonModel.toyBoxVo.getValues(dragValue);
        this._isCanAddJoy = (dragValue & this._boxValue) == 0;
        this._target.contaier.updateTempBoxCell(dragValues, this._boxValues, this._isCanAddJoy);
    }

    protected setDelOpen(value: boolean): void {
        this._target.contaier?.setDelOpen(value);
    }

    protected updateBoxCell(values: number[] = null): void {
        this._target.contaier?.updateBoxCell(values);
    }

    /**设置拖动目标*/
    public setTarget(target: IPetDungeonToyDragTarget): void {
        this._target = target;
        if (target?.cellW) {
            this._cellW = target.cellW;
        }
        if (target?.cellGap) {
            this._cellGap = target.cellGap;
        }
    }

    /**拖动参数*/
    public get args(): IPetDungeonToyDragArgs {
        return this._args;
    }

    /**当前拖动图标*/
    public get dragIcon(): PetDungeonToyIcon {
        return this._dragIcon;
    }

    /**是否碰撞删除*/
    public get isCollideDel(): boolean {
        return this._isCollideDel;
    }

    /**是否可添加到格子*/
    public get isCanAddJoy(): boolean {
        return this._isCanAddJoy;
    }

    /**当前拖动格子所在位置*/
    public get collideCellIdx(): number {
        return this._collideCellIdx;
    }

    public get boxValues(): number[] {
        return this._boxValues;
    }
}