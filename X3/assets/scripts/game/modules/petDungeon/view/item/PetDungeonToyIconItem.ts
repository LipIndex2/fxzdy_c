import { FguiNotificationGComponent } from "db://assets/scripts/core/mvc/view/FguiNotificationGComponent";
import * as fgui from "fairygui-cc";
import { PET_DUNGEON_TOY_CELL_CNT } from "../../model/vo/PetDungeonToyShapeVo";
import { PetDungeonToyVo } from "../../model/vo/PetDungeonToyVo";
import { PetDungeonToyIcon } from "../component/PetDungeonToyIcon";

export class PetDungeonToyIconItem extends FguiNotificationGComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyIconItem";

    protected _toyIcon: PetDungeonToyIcon = null;
    protected _toyId: number = 0;
    protected _toyConfigId: number = 0;
    private get view(): ui.petDungeon.item.PetDungeonToyIconItem {
        return this as any;
    }

    public static create(): PetDungeonToyIconItem {
        return fgui.UIPackage.createObject('petDungeon', 'PetDungeonToyIconItem', PetDungeonToyIconItem) as PetDungeonToyIconItem;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();
        //初始化图标  
        this._toyIcon = PetDungeonToyIcon.create();
        this.view.addChildAt(this._toyIcon, 0);
        this._toyIcon.isCanTouchDrag = false;
        this._toyIcon.initCfg(72, 3);
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    public get toyIcon(): PetDungeonToyIcon {
        return this._toyIcon;
    }

    public setData(vo: PetDungeonToyVo): void {
        this._toyId = vo.id;
        if (this._toyConfigId != vo.configId) {
            this._toyConfigId = vo.configId;
            this._toyIcon.setToy(vo.configId);
            //居中显示
            this._toyIcon.x = 0;
            this._toyIcon.y = 0;

            let lastCellX: number = this._toyIcon.lastCellIdx % PET_DUNGEON_TOY_CELL_CNT;
            let lastCellY: number = Math.floor(this._toyIcon.lastCellIdx / PET_DUNGEON_TOY_CELL_CNT);
            let lastCellBottomY: number = lastCellY * (this._toyIcon.cellW + this._toyIcon.cellGap) + this._toyIcon.cellW;
            if (lastCellX < this._toyIcon.shapeVo.maxCol - 1) {
                //不在最右列 左对齐
                this.view.lbLv.setPivot(0, 1, true);
                this.view.lbLv.setPosition(this._toyIcon.x + lastCellX * (this._toyIcon.cellW + this._toyIcon.cellGap), lastCellBottomY);
            } else {
                //其他情况右对齐
                this.view.lbLv.setPivot(1, 1, true);
                this.view.lbLv.setPosition(this._toyIcon.x + lastCellX * (this._toyIcon.cellW + this._toyIcon.cellGap) + this._toyIcon.cellW, lastCellBottomY);
            }
            this.view.lbLv.text = 'Lv' + this._toyIcon.cfg.lv;
        }
    }
}