import * as fgui from "fairygui-cc";

export class GMSpineCheckerComboBox1_itemView extends fgui.GButton {


    static pkgName: string = "gm";
    static viewName: string = "GMSpineCheckerComboBox1_item";



    private get view(): ui.gm.spineChecker.GMSpineCheckerComboBox1_item {
        return this as any;
    }
    
    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }


    public onInit() {

    }
}