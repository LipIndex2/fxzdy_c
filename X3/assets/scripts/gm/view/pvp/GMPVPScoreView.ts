import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import GIns from "../../../game/GIns";


/**
 * GM 邮件
 */
export class GMPVPScoreView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMPVPScoreView";

    // endregion


    private get view(): ui.gm.pvp.GMPVPScoreView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
        PVPModel.ins().sendLoadArenaInfo();

        this.view.inputScore.inputName.on(fgui.Event.TEXT_CHANGE, this.onTextScoreChange, this);
        this.view.inputScore.inputName.text = "0";


        this.view.inputScore.labelTitle.text = "增加/减少排位分:"
        // button
        this.view.btnOk.labelTitle.text = "修改";

        this.view.btnOk.onClick(this.onClickOk, this);

    }


    private onClickOk() {
        const changeScore = this.view.inputScore.inputName.text.toInt();
        if (changeScore == null) {
            GIns.floatingTextMgr.showTips(`请输入正确的数字！`);
            return;
        }
        console.log(`GM 增减排位分：${changeScore}`);

        GmModel.ins().sendArenaScoreChange({
            scoreChange: changeScore,
        })

    }

    private onTextScoreChange() {
        const changeScore = this.view.inputScore.inputName.text.toInt();
        if (changeScore == null) {
            this.view.labelTips.text = `请输入数字`;
            return;
        }
        const score = PVPModel.ins().getContext().score;

        const afterScore = score + changeScore;
        this.view.labelTips.text = `修改后的积分 = ${afterScore}`;

    }
}