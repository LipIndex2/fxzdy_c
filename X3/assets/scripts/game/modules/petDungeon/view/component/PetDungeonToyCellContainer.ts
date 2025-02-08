import { Vec2 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { Attribute } from "../../../attr/AttrEnum";
import { AttrConfigEffect } from "../../../attr/structs/AttrConfigEffect";
import { IPetDungeonToyDragArgs, PetDungeonToyDragFrom, UIPetDungeonConfig } from "../../const/UIPetDungeonConfig";
import { PET_DUNGEON_TOY_CELL_CNT } from "../../model/vo/PetDungeonToyShapeVo";
import { PetDungeonToyIconItem } from "../item/PetDungeonToyIconItem";

@bindFguiExtension('ui://petDungeon/PetDungeonToyCellContainer')
export class PetDungeonToyCellContainer extends fgui.GComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyCellContainer";

    /**当前格子大小*/
    protected _cellW: number = 72;
    /**当前间隔大小*/
    protected _cellGap: number = 3;

    /**是否可拖动*/
    protected _isCanTouchDrag: boolean = false;
    /**拖动判断边界*/
    protected _touchDragSensitivity: number = 10;
    /**点击玩具id*/
    protected _touchToyId: number = 0;
    /**触摸开始点*/
    protected _touchStartPos: Vec2 = null;
    /**触摸开始点相对于fgui的本地坐标*/
    protected _fguiTouchPos: Vec2 = new Vec2();
    protected _isMoving: boolean = false;
    /**缓存的id列表*/
    protected _ids: number[] = [];
    /**玩具列表*/
    protected _toyItems: PetDungeonToyIconItem[] = [];
    protected _toyItemMap: Map<number, PetDungeonToyIconItem> = new Map();
    /**总属性加成*/
    protected _attrs: { attrName: string, attrValue: string }[] = [];

    private get view(): ui.petDungeon.component.PetDungeonToyCellContainer {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.on(fgui.Event.TOUCH_BEGIN, this.onTouchStart, this);
        this.view.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);
        // this.view.on(fgui.Event.TOUCH_MOVE, this.onTouchCancel, this);
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
        let cellX: number = Math.floor(this._fguiTouchPos.x / (this._cellW + this._cellGap));
        let cellY: number = Math.floor(this._fguiTouchPos.y / (this._cellW + this._cellGap));
        let cellIndex = cellX + cellY * PET_DUNGEON_TOY_CELL_CNT;
        if (this._ids[cellIndex] > 0) {
            //代表点击在有效格子上
            if (this._touchStartPos == null)
                this._touchStartPos = new Vec2();
            this._touchStartPos.set(evt.pos.x, evt.pos.y);
            this._touchToyId = this._ids[cellIndex];
            this.view.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        } else {
            this._touchToyId = 0;
        }
        evt.captureTouch();
    }

    protected onTouchMove(evt: fgui.Event): void {
        if (this._touchToyId > 0 && this._touchStartPos) {
            // let pos = evt.getUILocation();
            if (Math.abs(this._touchStartPos.x - evt.pos.x) >= this._touchDragSensitivity
                || Math.abs(this._touchStartPos.y - evt.pos.y) >= this._touchDragSensitivity) {
                //达到拖动条件
                let vo = GIns.petDungeonModel.toyBoxVo.toyMap.get(this._touchToyId);
                let item = this._toyItemMap.get(this._touchToyId);
                if (vo && item) {
                    let percentW: number = (this._fguiTouchPos.x - item.x) / item.toyIcon.width;
                    let percentH: number = (this._fguiTouchPos.y - item.y) / item.toyIcon.height;
                    let args: IPetDungeonToyDragArgs = {
                        id: vo.id,
                        toyConfigId: vo.configId,
                        from: PetDungeonToyDragFrom.Main_Cell,
                        mouseX: evt.pos.x,
                        mouseY: evt.pos.y,
                        percentW: percentW,
                        percentH: percentH,
                        lastCellIdx: vo.posIdx,
                    }
                    G.FacadeManager.emitNow(NotificationKey.PET_DUNGEON_DRAG_TOY_STAR, args);
                }
                this._isMoving = true;
                this.onTouchCancel();
            }
        }
    }

    protected onTouchEnd(): void {
        if (this._isMoving == false && this._touchToyId > 0) {
            //算点击 弹出详情
            let vo = GIns.petDungeonModel.toyBoxVo.toyMap.get(this._touchToyId);
            if (vo) {
                G.UIManager.open(UIPetDungeonConfig.PetDungeonToyInfoWin, vo.configId);
            }
        }
        this.onTouchCancel();
    }

    protected onTouchCancel(): void {
        this._touchToyId = 0;
        this.view.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        this._isMoving = false;
    }

    public clearIds(): void {
        this._ids = new Array(PET_DUNGEON_TOY_CELL_CNT * PET_DUNGEON_TOY_CELL_CNT).fill(0);
    }

    /**更新所有玩具*/
    public updateToys(): void {
        this.clearIds();
        let toys = GIns.petDungeonModel.toyBoxVo.toys;
        this._attrs.length = 0;
        let oldItems = this._toyItems.concat();
        this._toyItems.length = 0;
        this._toyItemMap.clear();
        let attrs: Map<Attribute, number> = new Map();
        let skillIds: string[] = [];
        let toyTypeMap:Map<number, PetDungeonToyIconItem> = new Map();
        toys?.forEach((vo, index) => {
            let item: PetDungeonToyIconItem = null;
            if (index < oldItems?.length) {
                item = oldItems.shift();
            } else {
                item = PetDungeonToyIconItem.create();
                this.view.addChild(item);
            }
            item.setData(vo);
            let x = (vo.posIdx % PET_DUNGEON_TOY_CELL_CNT);
            let y = Math.floor(vo.posIdx / PET_DUNGEON_TOY_CELL_CNT);
            item.x = x * (this._cellW + this._cellGap);
            item.y = y * (this._cellW + this._cellGap);
            this._toyItems.push(item);
            this._toyItemMap.set(vo.id, item);
            //计算位置
            vo.values?.forEach((value, i) => {
                if (value > 0) {
                    this._ids[i] = vo.id;
                }
            })
            if (item.toyIcon.cfg) {
                if (toyTypeMap.has(item.toyIcon.cfg.toyType) == false 
                || toyTypeMap.get(item.toyIcon.cfg.toyType).toyIcon.cfg.lv < item.toyIcon.cfg.lv) {
                    //只取等级最高的一个玩具
                    toyTypeMap.set(item.toyIcon.cfg.toyType, item);
                }
            }
        })
        while (oldItems.length > 0) {
            let item = oldItems.shift();
            item.dispose();
        }

        //计算属性
        toyTypeMap.forEach((item) => {
            if (item.toyIcon.cfg.addAttrArray?.length > 0) {
                //有属性展示属性
                item.toyIcon.cfg.addAttrArray?.forEach((value) => {
                    let cnt = 0;
                    if (attrs.has(value.k)) {
                        cnt = attrs.get(value.k);
                    }
                    cnt += value.v;
                    attrs.set(value.k, cnt);
                })
            } else {
                //没有属性展示技能名称
                if (skillIds.indexOf(item.toyIcon.cfg.skillIds) == -1) {
                    skillIds.push(item.toyIcon.cfg.skillIds)
                }
            }
        });
        toyTypeMap.clear();

        //属性转化
        if (attrs.size > 0) {
            attrs.forEach((v, k) => {
                let attrData: { attrName: string, attrValue: string } = { attrName: '', attrValue: '' };
                attrData.attrName = GIns.attrMgr.getAttrNameByType(k);
                let attrEffect = AttrConfigEffect.create(k, v);
                attrData.attrValue = attrEffect.getShowValueTextWithSymbol();
                this._attrs.push(attrData);
            })
        }
        if (skillIds.length > 0) {
            skillIds.forEach((skillId) => {
                let attrData: { attrName: string, attrValue: string } = { attrName: '', attrValue: '' };
                let cfg = G.TableManager.getDataById(table.battle.SkillConfig, skillId);
                if (cfg) {
                    attrData.attrName = cfg.name;
                    this._attrs.push(attrData);
                }
            })
        }
    }

    /**所有属性加成*/
    public get attrs(): { attrName: string, attrValue: string }[] {
        return this._attrs;
    }
}