import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";


/**
 * GM 邮件
 */
export class GMAddItemTextView extends fgui.GComponent {


    private get view(): ui.gm.item.GMAddItemTextView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {

        this.view.btnOk.labelTitle.text = "获得道具!"
        this.view.inputItem.labelTitle.text = "道具文本";
        
        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this);

    }


    private onClickOk() {
        const rewardStr = this.view.inputItem.inputName.text;


        GmModel.ins().sendGmSendRewards({
            rewardStr: rewardStr
        })

    }
}