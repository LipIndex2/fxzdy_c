import * as fgui from "fairygui-cc";

export class GMSpineCheckerComboBox1_popupView extends fgui.GComponent {

    static pkgName: string = "gm";
    static viewName: string = "GMSpineCheckerComboBox1_popup";

    private get view(): ui.gm.spineChecker.GMSpineCheckerComboBox1_popup {
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