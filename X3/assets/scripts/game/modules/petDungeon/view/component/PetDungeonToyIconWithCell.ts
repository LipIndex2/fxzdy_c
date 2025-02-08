import * as fgui from "fairygui-cc";
import { PET_DUNGEON_TOY_CELL_CNT } from "../../model/vo/PetDungeonToyShapeVo";
import { PetDungeonToyIcon } from "./PetDungeonToyIcon";

/**
 * 玩具图标类带格子背景
*/
export class PetDungeonToyIconWithCell extends PetDungeonToyIcon {

    protected _cellItems: ui.petDungeon.component.PetDungeonToyCellBg[] = [];
    /**最后一个格子*/
    protected _lastCell: ui.petDungeon.component.PetDungeonToyCellBg = null;

    public static create(): PetDungeonToyIconWithCell {
        return fgui.UIPackage.createObject('petDungeon', 'PetDungeonToyIcon', PetDungeonToyIconWithCell) as PetDungeonToyIconWithCell;
    }
    
    protected createCellBg(): ui.petDungeon.component.PetDungeonToyCellBg {
        return fgui.UIPackage.createObject('petDungeon', 'PetDungeonToyCellBg') as ui.petDungeon.component.PetDungeonToyCellBg;
    }

    /**玩具形状更新处理*/
    protected onShapeChange(): void {
        super.onShapeChange();
        let cfgValues: number[] = this._toyShapeVo.cfg.values;
        let curIdx: number = 0;
        for (let i = 0; i < cfgValues.length; i++) {
            if (cfgValues[i] > 0) {
                //代表有格子
                let item = null;
                if (curIdx < this._cellItems.length) {
                    item = this._cellItems[curIdx];
                    item.visible = true;
                } else {
                    item = this.createCellBg();
                    this.view.addChildAt(item, 0);
                    this._cellItems.push(item);
                }
                item.width = item.height = this._curCellW;
                let x = (i % PET_DUNGEON_TOY_CELL_CNT);
                let y = Math.floor(i / PET_DUNGEON_TOY_CELL_CNT);
                item.x = x * (this._curCellW + this._curCellGap);
                item.y = y * (this._curCellW + this._curCellGap);
                curIdx++;
                this._lastCell = item;
            }
        }
        if (curIdx < this._cellItems.length) {
            for (let i = curIdx; i < this._cellItems.length; i++) {
                this._cellItems[i].visible = false;
            }
        }
    }

    /**最后一个格子的坐标*/
    public get lastCell(): ui.petDungeon.component.PetDungeonToyCellBg {
        return this._lastCell;
    }
}