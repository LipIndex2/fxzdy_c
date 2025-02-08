import * as fgui from "fairygui-cc";

export class GMSpineCheckerComboBox1View extends fgui.GComboBox {


    static pkgName: string = "gm";
    static viewName: string = "GMSpineCheckerComboBox1";


    private get view(): ui.gm.spineChecker. GMSpineCheckerComboBox1 {
        return this as any;
    }
    
}