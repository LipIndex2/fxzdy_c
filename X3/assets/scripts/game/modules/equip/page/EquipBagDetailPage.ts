import * as fgui from "fairygui-cc";
import { UIPage } from "../../../../core/mvc/view/UIPage";



/** 装备预览界面 */
export class EquipBagDetailPage extends UIPage{
    static pkgName: string = "equip";
    static viewName: string = "EquipBagDetailPage";


    private get view():ui.equip.page.EquipBagDetailPage{
        return this._view as any;
    }

    protected onInit(): void {
        
    }

    protected onOpen(args: any): void {
        
    }
}