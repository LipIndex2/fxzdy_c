import * as fgui from "fairygui-cc";
import { GmModel } from "../model/GMModel";
import { GuideManager } from "../../game/modules/guide/GuideManager";
import { TableManager } from "../../core/table/TableManager";

/**
 * GM 引导
 */
export class GMGuideView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMGuideView";

    // endregion


    private get view(): ui.gm.GMGuideView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

        this.view.heroAttrInputBox.labelTitle.text = "引导组id";
        // button
        this.view.btnOk.labelTitle.text = "完 成"
    }


    private onClickOk() {
        // let allGuide = GuideManager.ins().getGuideGroupIdMap();
        const group = this.view.heroAttrInputBox.inputName.text.toInt();
        if (!group) return;
        GmModel.ins().sendUpdateGuide(group);
    }

}