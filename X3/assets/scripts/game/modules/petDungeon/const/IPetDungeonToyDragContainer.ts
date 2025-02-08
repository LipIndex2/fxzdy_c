import * as fgui from "fairygui-cc";

/**宠物玩具拖动UI*/
export interface IPetDungeonToyDragContainer {
    /**UI*/
    get view():fgui.GComponent,
    /**更新格子*/
    updateBoxCell(values:number[]):void;
    /**更新格子缓存*/
    updateTempBoxCell(dragValues:number[], boxValues:number[], isCanAdd:boolean):void;
    /**设置移除按钮打开状态*/
    setDelOpen(value:boolean):void;
}