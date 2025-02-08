import * as fgui from "fairygui-cc";


/**
 * GM 检查图片资源
 */
export class GMAssetCheckerChildView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMAssetCheckerChildView";

    // endregion


    private get view(): ui.gm.assetChecker.GMAssetCheckerChildView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {


        this.view.btnCheck.on(fgui.Event.CLICK, this.onCheckClick, this)

    }


    private onCheckClick() {
        const bundleName = this.view.inputBundleName.text;
        const assetName = this.view.inputAssetName.text;
        
        this.view.imageCheck.icon = `${assetName}`

    }
}