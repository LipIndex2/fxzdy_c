import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";


/**
 * GM 邮件
 */
export class GMLevelView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMLevelView";

    // endregion


    private get view(): ui.gm.level.GMLevelView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {


        this.view.inputLevel.labelTitle.text = "挂机关卡id"
        // button
        this.view.btnOk.labelTitle.text = "修改关卡进度";

        this.view.btnOk.onClick(this.onClickOk, this);

    }


    private onClickOk() {
        const levelId = this.view.inputLevel.inputName.text.toInt();

        console.log(`GM set 挂机关卡id：${levelId}`)

        GmModel.ins().sendPassTrunkInstance({
            instanceId: levelId,
        })

    }
}