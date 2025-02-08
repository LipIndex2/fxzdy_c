import * as fgui from "fairygui-cc";
import {GMOneKeyButtonConfig} from "db://assets/scripts/gm/view/oneKey/GMOneKeyButtonChildView";
import G from "db://assets/scripts/core/comm/G";
import {tween, v3} from "cc";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";


export class BtnGmView extends fgui.GButton {

    private _clickCallback: Function;

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "BtnGm";

    // endregion


    private get view(): ui.gm.common.BtnGm {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }


    public onInit() {

        this.view.on(fgui.Event.CLICK, this.onClick0, this);
    }


    private onClick0() {
        G.Logger.debug("BtnGmView:onClick0")
        
        tween(this.view.node)
            .call(() => {
                this.view.getController("button").selectedIndex = 1;
            })
            .to(0.08, {
                scale: v3(0.8, 0.8, 0.8)
            })
            .to(0.12, {
                scale: v3(1, 1, 1)
            })
            .call(() => {
                this.view.getController("button").selectedIndex = 0;
            })
            .start()

        if (!this._clickCallback) {
            return
        }
        this._clickCallback();
    }

    updateData(config: GMOneKeyButtonConfig) {
        this.view.labelTitle.text = config.name;
        this.view.labelTitle.color = config.fontColor || ColorUtils.COLOR_WHITE;
        this._clickCallback = config.clickCallback;
    }
}